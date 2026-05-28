import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rekamMedisSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

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

    // Cari Dokter berdasarkan userId
    const dokter = await prisma.dokter.findUnique({
      where: { userId: userId! }
    });

    if (!dokter) {
      return NextResponse.json({ success: false, error: "Dokter tidak ditemukan" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Fetch harga obat untuk snapshot
      const obatIds = data.resep.map((r) => r.obatId);
      const obatList = await tx.obat.findMany({
        where: { id: { in: obatIds } }
      });

      // Fetch harga tindakan untuk snapshot
      const tindakanIds = data.tindakan || [];
      const tindakanList = await tx.tindakan.findMany({
        where: { id: { in: tindakanIds } }
      });

      // 1. Buat rekam medis
      const rm = await tx.rekamMedis.create({
        data: {
          pasienId: data.pasienId,
          dokterId: dokter.id,
          namaDokter: dokter.namaLengkap,
          jadwalId: data.jadwalId,
          keluhan: data.keluhan,
          
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
            create: data.diagnosis.map((d) => ({
              penyakitId: d.penyakitId,
              catatan: d.catatan
            })),
          },
          resep: {
            create: data.resep.map((r) => {
              const o = obatList.find((ob) => ob.id === r.obatId);
              return {
                obatId: r.obatId,
                dosis: r.dosis,
                aturan: r.aturan,
                jumlah: r.jumlah,
                hargaSnapshot: o ? o.hargaJual : 0,
              };
            }),
          },
          rekamMedisTindakan: {
            create: tindakanList.map((t) => ({
              tindakanId: t.id,
              hargaSnapshot: t.harga,
              kuantitas: 1
            }))
          }
        },
      });

      // 2. Buat rujukan (Jika ada)
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

      // Hitung total biaya
      const totalTindakan = tindakanList.reduce((acc, t) => acc + t.harga, 0);
      const totalObat = data.resep.reduce((acc, r) => {
        const o = obatList.find((ob) => ob.id === r.obatId);
        return acc + (o ? o.hargaJual * r.jumlah : 0);
      }, 0);
      const grandTotal = 50000 + totalTindakan + totalObat; // 50000 adalah biaya konsultasi dasar

      // 4. Buat Pembayaran
      const pembayaran = await tx.pembayaran.create({
        data: {
          pasienId: data.pasienId,
          rekamMedisId: rm.id,
          totalJumlah: grandTotal,
          metode: "TUNAI",
          status: "BELUM_BAYAR",
        },
      });

      // 5. Buat Detail Pembayaran (Ledger)
      // a. Konsultasi
      await tx.detailPembayaran.create({
        data: {
          pembayaranId: pembayaran.id,
          tipeItem: "KONSULTASI",
          namaItem: "Konsultasi Dokter & Pemeriksaan Umum",
          hargaSatuan: 50000,
          kuantitas: 1,
          subtotal: 50000
        }
      });

      // b. Tindakan
      for (const t of tindakanList) {
        await tx.detailPembayaran.create({
          data: {
            pembayaranId: pembayaran.id,
            tipeItem: "TINDAKAN",
            namaItem: t.namaTindakan,
            hargaSatuan: t.harga,
            kuantitas: 1,
            subtotal: t.harga
          }
        });
      }

      // c. Obat — validasi stok lalu kurangi
      for (const r of data.resep) {
        const o = obatList.find((ob) => ob.id === r.obatId);
        if (o) {
          // Validasi: stok harus mencukupi
          if (o.stok < r.jumlah) {
            throw new Error(
              `Stok obat "${o.namaObat}" tidak mencukupi. Stok tersedia: ${o.stok}, diminta: ${r.jumlah}.`
            );
          }

          const sub = o.hargaJual * r.jumlah;
          await tx.detailPembayaran.create({
            data: {
              pembayaranId: pembayaran.id,
              tipeItem: "OBAT",
              namaItem: o.namaObat,
              hargaSatuan: o.hargaJual,
              kuantitas: r.jumlah,
              subtotal: sub
            }
          });

          // Kurangi stok obat
          await tx.obat.update({
            where: { id: o.id },
            data: { stok: { decrement: r.jumlah } }
          });
        }
      }

      return rm;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/rekam-medis] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
