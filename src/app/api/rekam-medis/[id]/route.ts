import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const editRekamMedisSchema = z.object({
  // Anamnesis
  anamnesisKeluhanUtama: z.string().optional(),
  anamnesisRps: z.string().optional(),
  anamnesisRpd: z.string().optional(),
  anamnesisRiwayatObat: z.string().optional(),
  anamnesisRiwayatKeluarga: z.string().optional(),
  anamnesisKebiasaan: z.string().optional(),

  // TTV
  tdSistolik: z.number().int().min(0).max(400).optional().nullable(),
  tdDiastolik: z.number().int().min(0).max(300).optional().nullable(),
  nadi: z.number().int().min(0).max(300).optional().nullable(),
  rr: z.number().int().min(0).max(100).optional().nullable(),
  suhu: z.number().min(30).max(50).optional().nullable(),
  spo2: z.number().min(0).max(100).optional().nullable(),
  bb: z.number().min(0).max(700).optional().nullable(),
  tb: z.number().min(0).max(300).optional().nullable(),
  bmi: z.number().min(0).max(200).optional().nullable(),
  pemeriksaanFisik: z.string().optional(),

  // Klinis
  keluhan: z.string().min(1).optional(),
  tindakan: z.string().optional(),
  diagnosis: z.array(z.object({ diagnosis: z.string().min(1) })).min(1).optional(),
  resep: z.array(z.object({
    obatId: z.string().min(1),
    dosis: z.string().min(1),
    aturan: z.string().min(1),
    jumlah: z.string().optional(),
  })).optional(),

  // Edukasi & catatan
  edukasiPasien: z.string().optional(),
  catatanTambahan: z.string().optional(),
  rujukanCatatan: z.string().optional(),
});

// GET /api/rekam-medis/[id] — ambil detail satu rekam medis
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "DOKTER" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const rm = await prisma.rekamMedis.findUnique({
      where: { id },
      include: {
        pasien: true,
        dokter: { select: { id: true, namaLengkap: true } },
        diagnosis: true,
        resep: true,
        rujukan: true,
        pembayaran: true,
      },
    });

    if (!rm) {
      return NextResponse.json({ success: false, error: "Rekam medis tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rm });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/rekam-medis/[id] — edit rekam medis (dokter saja)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    const userId = request.headers.get("x-user-id");

    if (role !== "DOKTER") {
      return NextResponse.json({ success: false, error: "Hanya dokter yang dapat mengedit rekam medis" }, { status: 403 });
    }

    const { id } = await params;

    // Cek rekam medis ada
    const existing = await prisma.rekamMedis.findUnique({
      where: { id },
      include: { pembayaran: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Rekam medis tidak ditemukan" }, { status: 404 });
    }

    // Hanya dokter yang membuat rekam medis ini yang boleh edit
    if (existing.dokterId !== userId) {
      return NextResponse.json({ success: false, error: "Anda tidak memiliki akses untuk mengedit rekam medis ini" }, { status: 403 });
    }

    // Blokir edit jika pembayaran sudah LUNAS
    const sudahLunas = existing.pembayaran.some((p: any) => p.status === "LUNAS");
    if (sudahLunas) {
      return NextResponse.json({
        success: false,
        error: "Rekam medis tidak dapat diedit karena pembayaran sudah LUNAS"
      }, { status: 400 });
    }

    const body = await request.json();
    const parseResult = editRekamMedisSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    const result = await prisma.$transaction(async (tx: any) => {
      // Update field utama rekam medis
      const updated = await tx.rekamMedis.update({
        where: { id },
        data: {
          keluhan: data.keluhan,
          tindakan: data.tindakan,
          anamnesisKeluhanUtama: data.anamnesisKeluhanUtama,
          anamnesisRps: data.anamnesisRps,
          anamnesisRpd: data.anamnesisRpd,
          anamnesisRiwayatObat: data.anamnesisRiwayatObat,
          anamnesisRiwayatKeluarga: data.anamnesisRiwayatKeluarga,
          anamnesisKebiasaan: data.anamnesisKebiasaan,
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
          edukasiPasien: data.edukasiPasien,
          catatanTambahan: data.catatanTambahan,
          rujukanCatatan: data.rujukanCatatan,
        },
      });

      // Update diagnosis: hapus lama, buat baru
      if (data.diagnosis) {
        await tx.diagnosis.deleteMany({ where: { rekamMedisId: id } });
        await tx.diagnosis.createMany({
          data: data.diagnosis.map((d: any) => ({
            rekamMedisId: id,
            diagnosis: d.diagnosis,
          })),
        });
      }

      // Update resep: hapus lama, buat baru
      if (data.resep !== undefined) {
        await tx.resep.deleteMany({ where: { rekamMedisId: id } });
        if (data.resep.length > 0) {
          await tx.resep.createMany({
            data: data.resep.map((r: any) => ({
              rekamMedisId: id,
              obatId: r.obatId,
              dosis: r.dosis,
              aturan: r.aturan,
              jumlah: r.jumlah,
            })),
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: result, message: "Rekam medis berhasil diperbarui" });
  } catch (error: any) {
    console.error("[PATCH /api/rekam-medis/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}