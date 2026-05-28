import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jadwalSchema } from "@/lib/validations";

// GET /api/antrian?tanggal=YYYY-MM-DD&dokterId=xxx&tanggalMulai=...&tanggalAkhir=...&sortBy=status
export async function GET(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    const userId = request.headers.get("x-user-id");

    const { searchParams } = new URL(request.url);
    const tanggalParam = searchParams.get("tanggal");
    const tanggalMulai = searchParams.get("tanggalMulai");
    const tanggalAkhir = searchParams.get("tanggalAkhir");
    const sortBy = searchParams.get("sortBy");
    
    // Auto-filter dokterId jika login sebagai DOKTER
    let dokterId = searchParams.get("dokterId");
    if (role === "DOKTER" && !dokterId) {
      const docProfile = await prisma.dokter.findUnique({
        where: { userId: userId! }
      });
      dokterId = docProfile ? docProfile.id : "";
    }

    let dateFilter = {};
    if (tanggalParam) {
      const targetDate = new Date(tanggalParam);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        OR: [
          { tanggal: { gte: startOfDay, lte: endOfDay } },
          { 
            tanggal: { lt: startOfDay },
            status: "MENUNGGU" 
          }
        ]
      };
    } else if (tanggalMulai && tanggalAkhir) {
      const start = new Date(tanggalMulai);
      start.setHours(0, 0, 0, 0);
      const end = new Date(tanggalAkhir);
      end.setHours(23, 59, 59, 999);
      dateFilter = { tanggal: { gte: start, lte: end } };
    }

    // Tentukan order by
    let orderBy: any = [{ tanggal: "asc" }, { nomorAntrian: "asc" }];
    if (sortBy === "status") {
      orderBy = [{ status: "asc" }, { tanggal: "asc" }, { nomorAntrian: "asc" }];
    }

    const antrian = await prisma.jadwal.findMany({
      where: {
        ...dateFilter,
        ...(dokterId ? { dokterId } : {}),
      },
      include: {
        pasien: {
          select: {
            id: true,
            noRm: true,
            nama: true,
            noTelepon: true,
            jenisKelamin: true,
            tanggalLahir: true,
          },
        },
        dokter: {
          select: {
            id: true,
            namaLengkap: true,
            poli: { select: { namaPoli: true } }
          }
        },
      },
      orderBy,
    });

    // Remap spesialisasi field for compatibility with older frontend components
    const mappedAntrian = antrian.map((a: any) => {
      if (a.dokter) {
        a.dokter.spesialisasi = a.dokter.poli?.namaPoli || "Umum";
      }
      return a;
    });

    return NextResponse.json({ success: true, data: mappedAntrian });
  } catch (error) {
    console.error("[GET /api/antrian]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/antrian
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validasi input
    const parseResult = jadwalSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Data tidak valid", details: parseResult.error.format() }, { status: 400 });
    }

    // 1. Tentukan tanggal
    const targetTanggal = body.tanggal ? new Date(body.tanggal) : new Date();
    
    // Validasi tanggal tidak boleh di masa lalu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkTanggal = new Date(targetTanggal);
    checkTanggal.setHours(0, 0, 0, 0);
    
    if (checkTanggal < today) {
      return NextResponse.json({ success: false, error: "Tanggal tidak boleh di masa lalu" }, { status: 400 });
    }

    // Validasi jam jika tanggal hari ini
    if (checkTanggal.getTime() === today.getTime() && body.jam) {
      const now = new Date();
      now.setSeconds(0, 0);
      const [hour, minute] = body.jam.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);
      
      if (scheduledTime < now) {
        const diffInMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
        
        if (diffInMinutes <= 10) {
          const currentHour = now.getHours().toString().padStart(2, '0');
          const currentMinute = now.getMinutes().toString().padStart(2, '0');
          body.jam = `${currentHour}:${currentMinute}`;
        } else {
          return NextResponse.json({ success: false, error: "Jam sudah terlewat" }, { status: 400 });
        }
      }
    }

    const startOfDay = new Date(targetTanggal);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetTanggal);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.jadwal.count({
      where: {
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const nomorAntrian = count + 1;

    // Cari poliId dari Dokter
    const docProfile = await prisma.dokter.findUnique({
      where: { id: body.dokterId }
    });

    // 3. Simpan ke database dengan tanggal yang benar
    const newJadwal = await prisma.jadwal.create({
      data: {
        pasienId: body.pasienId,
        dokterId: body.dokterId,
        poliId: docProfile?.poliId || null,
        keluhan: body.keluhan,
        jam: body.jam,
        tanggal: targetTanggal,
        nomorAntrian: nomorAntrian,
      },
    });

    return NextResponse.json({
      success: true,
      data: newJadwal,
      message: "Kunjungan berhasil dibuat",
    });
  } catch (error) {
    console.error("[POST /api/antrian]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}