import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jadwalSchema } from "@/lib/validations";
import { recalculateQueueNumbers } from "@/lib/queue";

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

    if (tanggalParam) {
      // Cek apakah ada record yang jam-nya tidak berformat HH:mm (contoh: "9:00" bukan "09:00")
      const needsNormalize = antrian.some(a => !/^([01]\d|2[0-3]):([0-5]\d)$/.test(a.jam || ""));
      if (needsNormalize) {
        await recalculateQueueNumbers(tanggalParam);

        // Query ulang data yang sudah dinormalisasi dan diurutkan
        const cleanAntrian = await prisma.jadwal.findMany({
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

        return NextResponse.json({ success: true, data: cleanAntrian });
      }
    }

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
    const now = new Date();
    const wibNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const wibTodayStr = `${wibNow.getUTCFullYear()}-${String(wibNow.getUTCMonth() + 1).padStart(2, '0')}-${String(wibNow.getUTCDate()).padStart(2, '0')}`;

    const targetDateStr = body.tanggal 
      ? new Date(body.tanggal).toISOString().split('T')[0] 
      : wibTodayStr;

    const targetTanggal = new Date(`${targetDateStr}T00:00:00.000Z`);
    
    // Validasi tanggal tidak boleh di masa lalu
    if (targetDateStr < wibTodayStr) {
      return NextResponse.json({ success: false, error: "Tanggal tidak boleh di masa lalu" }, { status: 400 });
    }

    // Validasi jam jika tanggal hari ini
    if (targetDateStr === wibTodayStr && body.jam) {
      const [hour, minute] = body.jam.split(':').map(Number);
      if (isNaN(hour) || isNaN(minute)) {
        return NextResponse.json({ success: false, error: "Format jam tidak valid" }, { status: 400 });
      }
      
      const wibCurrentHour = wibNow.getUTCHours();
      const wibCurrentMinute = wibNow.getUTCMinutes();
      
      const scheduledMinutes = hour * 60 + minute;
      const currentMinutes = wibCurrentHour * 60 + wibCurrentMinute;
      
      // Jika jam terlewat, cek selisihnya.
      if (scheduledMinutes < currentMinutes) {
        const diffInMinutes = currentMinutes - scheduledMinutes;
        
        if (diffInMinutes <= 10) {
          // Masih dalam toleransi 10 menit, ubah jam ke jam sekarang agar valid
          body.jam = `${String(wibCurrentHour).padStart(2, '0')}:${String(wibCurrentMinute).padStart(2, '0')}`;
        } else {
          return NextResponse.json({ success: false, error: "Jam sudah terlewat" }, { status: 400 });
        }
      }
    }

    // Bikin batasan waktu pencarian dari 00:00 sampai 23:59 di tanggal yang DIPILIH
    const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);

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

    // 4. Hitung ulang nomor antrean secara kronologis
    await recalculateQueueNumbers(targetDateStr);

    // Ambil record yang sudah di-update nomor antreannya
    const finalJadwal = await prisma.jadwal.findUnique({
      where: { id: newJadwal.id },
    }) || newJadwal;

    return NextResponse.json({
      success: true,
      data: finalJadwal,
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