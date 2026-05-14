import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rekamMedisSchema } from "@/lib/validations";

// POST /api/rekam-medis
// Body: { pasienId, jadwalId?, keluhan, tindakan?, diagnosis: [{diagnosis, kode?}], resep: [{obatId, dosis, aturan}], rujukan?: {tujuan, keterangan?}, biayaTindakan? }
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
          details: parseResult.error.issues,
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
      // 1. Buat rekam medis
      const rm = await tx.rekamMedis.create({
        data: {
          pasienId: data.pasienId,
          dokterId: userId!,
          jadwalId: data.jadwalId,

          // tetap
          keluhan: data.keluhan,
          tindakan: data.tindakan,

          // === Opsi 2: Anamnesis ===
          anamnesisKeluhanUtama: data.anamnesisKeluhanUtama,
          anamnesisRps: data.anamnesisRps,
          anamnesisRpd: data.anamnesisRpd,
          anamnesisRiwayatObat: data.anamnesisRiwayatObat,
          anamnesisRiwayatKeluarga: data.anamnesisRiwayatKeluarga,
          anamnesisKebiasaan: data.anamnesisKebiasaan,

          // === Opsi 2: Pemeriksaan / TTV ===
          tdSistolik: data.tdSistolik,
          tdDiastolik: data.tdDiastolik,
          nadi: data.nadi,
          rr: data.rr,
          suhu: data.suhu,
          spo2: data.spo2,
          bb: data.bb,
          tb: data.tb,
          bmi: data.bmi,
          pemeriksaanFisik: data.pemeriksaanFisik,

          // === Opsi 2: Edukasi & Catatan ===
          edukasiPasien: data.edukasiPasien,
          catatanTambahan: data.catatanTambahan,
          rujukanCatatan: data.rujukanCatatan,

          // relasi
          diagnosis: {
            create: data.diagnosis.map((item) => ({
              deskripsi: item.diagnosis,
            })),
          },
          resep: {
            create: data.resep.map((item) => ({
              namaObat: item.obatId,
              dosis: item.dosis,
              aturanPakai: item.aturan,
            })),
          },

          ...(data.rujukan ? { rujukan: { create: [data.rujukan] } } : {}),
        },
        include: { diagnosis: true, resep: true, rujukan: true },
      });

      // 2. Tandai jadwal SELESAI
      if (data.jadwalId) {
        await tx.jadwal.update({
          where: { id: data.jadwalId },
          data: { status: "SELESAI" },
        });
      }

      // 3. Auto buat tagihan pembayaran
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