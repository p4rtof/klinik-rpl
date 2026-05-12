import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jadwalSchema } from "@/lib/validations";

// GET /api/antrian?tanggal=YYYY-MM-DD&dokterId=xxx
// GET /api/antrian?tanggal=YYYY-MM-DD&dokterId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalParam = searchParams.get("tanggal");
    const dokterId = searchParams.get("dokterId");

    // Kalau ada parameter tanggal, filter harinya. Kalau nggak ada, ambil semua!
    let dateFilter = {};
    if (tanggalParam) {
      const targetDate = new Date(tanggalParam);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { tanggal: { gte: startOfDay, lte: endOfDay } };
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
      orderBy: { nomorAntrian: "asc" },
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
// Body: { pasienId, dokterId, jam }
// nomorAntrian dihitung otomatis
// POST /api/antrian
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // 1. Tentukan tanggal (Ambil dari form Frontend, kalau kosong baru pakai hari ini)
    const targetTanggal = body.tanggal ? new Date(body.tanggal) : new Date();
    
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
        tanggal: targetTanggal, // ✅ Sekarang backend nurut sama form!
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