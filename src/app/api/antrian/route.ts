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
      dokterId = userId;
    }

    let dateFilter = {};
    if (tanggalParam) {
      const targetDate = new Date(tanggalParam);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { tanggal: { gte: startOfDay, lte: endOfDay } };
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
      // Prisma tidak support custom sort order secara native di orderBy untuk SQLite dengan mudah tanpa raw query
      // Kita lakukan di aplikasi atau gunakan multiple fields
      // Untuk kemudahan, kita prioritaskan status tertentu jika dibutuhkan, tapi sementara kita sort by status string ASC
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
        dokter: { select: { id: true, namaLengkap: true, spesialisasi: true } },
      },
      orderBy,
    });

    return NextResponse.json({ success: true, data: antrian });
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
      const [hour, minute] = body.jam.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);
      
      if (scheduledTime < now) {
        return NextResponse.json({ success: false, error: "Jam sudah terlewat" }, { status: 400 });
      }
    }

    // Bikin batasan waktu pencarian dari 00:00 sampai 23:59 di tanggal yang DIPILIH
    const startOfDay = new Date(targetTanggal);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetTanggal);
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Hitung jumlah antrean HANYA pada tanggal yang dipilih supaya nomornya akurat
    const count = await prisma.jadwal.count({
      where: {
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const nomorAntrian = count + 1;

    // 3. Simpan ke database dengan tanggal yang benar
    const newJadwal = await prisma.jadwal.create({
      data: {
        pasienId: body.pasienId,
        dokterId: body.dokterId,
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