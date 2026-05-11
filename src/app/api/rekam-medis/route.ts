import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rekamMedisSchema } from "@/lib/validations";

// POST /api/rekam-medis
// Body: { pasienId, jadwalId?, keluhan, tindakan?, diagnosis: [{deskripsi}], resep: [{namaObat, dosis, aturanPakai}], rujukan?: {tujuan, keterangan?} }
// Jika jadwalId diisi, status jadwal otomatis menjadi SELESAI
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    const userId = request.headers.get("x-user-id");

    if (role !== "DOKTER") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parseResult = rekamMedisSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error.errors,
        },
        { status: 400 },
      );
    }

    const data = parseResult.data;

    // Jika jadwalId diberikan, validasi bahwa jadwal tersebut milik dokter ini
    if (data.jadwalId) {
      const jadwal = await prisma.jadwal.findUnique({
        where: { id: data.jadwalId },
      });
      if (!jadwal) {
        return NextResponse.json(
          { success: false, error: "Jadwal tidak ditemukan" },
          { status: 404 },
        );
      }
      if (jadwal.dokterId !== userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    // Simpan semua data secara atomik dalam satu transaction
    const result = await prisma.$transaction(async (tx) => {
  // 1. Buat rekam medis (TIDAK BERUBAH)
  const rm = await tx.rekamMedis.create({
    data: {
      pasienId: data.pasienId,
      dokterId: userId!,
      jadwalId: data.jadwalId,
      keluhan: data.keluhan,
      tindakan: data.tindakan,
      diagnosis: { create: data.diagnosis },
      resep: { create: data.resep },
      ...(data.rujukan ? { rujukan: { create: [data.rujukan] } } : {}),
    },
    include: { diagnosis: true, resep: true, rujukan: true },
  });

  // 2. Tandai jadwal SELESAI (TIDAK BERUBAH)
  if (data.jadwalId) {
    await tx.jadwal.update({
      where: { id: data.jadwalId },
      data: { status: "SELESAI" },
    });
  }

  // 3. ✅ TAMBAH INI — Auto buat tagihan pembayaran
  await tx.pembayaran.create({
    data: {
      pasienId: data.pasienId,
      rekamMedisId: rm.id,
      jumlah: data.biayaTindakan ?? 0,
      metode: "TUNAI",
      status: "BELUM_BAYAR",
      tanggal: new Date(),
    },
  });

  return rm;
});

    return NextResponse.json(
      { success: true, data: result, message: "Rekam medis berhasil disimpan" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/rekam-medis]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
