import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rekamMedisSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    const userId = request.headers.get("x-user-id");

    if (role !== "DOKTER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = rekamMedisSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    const dokter = await prisma.user.findUnique({
      where: { id: userId! },
      select: { namaLengkap: true },
    });

    if (!dokter) {
      return NextResponse.json({ success: false, error: "Dokter tidak ditemukan" }, { status: 404 });
    }

    let tindakanString = "";
    if (data.tindakan) {
      tindakanString = Array.isArray(data.tindakan) ? data.tindakan.join(", ") : data.tindakan;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Buat rekam medis
      const rm = await tx.rekamMedis.create({
        data: {
          pasienId: data.pasienId,
          dokterId: userId!,
          namaDokter: dokter.namaLengkap,
          jadwalId: data.jadwalId,
          keluhan: data.keluhan,
          tindakan: tindakanString,
          
          anamnesisKeluhanUtama: data.anamnesisKeluhanUtama || data.keluhan,
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

          diagnosis: {
            create: data.diagnosis.map((d: any) => ({
              diagnosis: d.diagnosis,
            })),
          },
          resep: {
            create: data.resep.map((r: any) => ({
              obatId: r.obatId,
              dosis: r.dosis,
              aturan: r.aturan,
              jumlah: r.jumlah,
            })),
          },
        },
      });

      // 2. Buat rujukan (Jika ada) secara terpisah untuk menghindari error relasi 1-to-1
      if (data.rujukan) {
        await tx.rujukan.create({
          data: {
            rekamMedisId: rm.id,
            tujuan: data.rujukan.tujuan,
            poliTujuan: data.rujukan.poliTujuan,
            diagnosa: data.rujukan.diagnosa,
            keterangan: data.rujukan.keterangan,
          }
        });
      }

      // 3. Update status jadwal
      if (data.jadwalId) {
        await tx.jadwal.update({
          where: { id: data.jadwalId },
          data: { status: "SELESAI" },
        });
      }

      // 4. Buat Pembayaran
      await tx.pembayaran.create({
        data: {
          pasienId: data.pasienId,
          rekamMedisId: rm.id,
          jumlah: data.biayaTindakan ?? 0,
          metode: "TUNAI",
          status: "BELUM_BAYAR",
        },
      });

      return rm;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/rekam-medis] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
