import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rekam-medis/pasien/[id]
// Riwayat lengkap rekam medis seorang pasien, urut terbaru dulu
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "DOKTER" && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const rekamMedis = await prisma.rekamMedis.findMany({
      where: { pasienId: id },
      include: {
        dokter: {
          select: {
            namaLengkap: true,
            poli: { select: { namaPoli: true } }
          }
        },
        diagnosis: {
          include: { penyakit: true }
        },
        resep: {
          include: { obat: true }
        },
        rekamMedisTindakan: {
          include: { tindakan: true }
        },
        rujukan: true,
      },
      orderBy: { tanggal: "desc" },
    });

    // Adapt for frontend backward-compatibility where 'spesialisasi' and flat strings are expected
    const mapped = rekamMedis.map((rm: any) => {
      const flatRm = { ...rm };
      if (flatRm.dokter) {
        flatRm.dokter.spesialisasi = flatRm.dokter.poli?.namaPoli || "Umum";
      }
      
      // Map diagnosis to old flat structure for views that expect a raw string list
      if (flatRm.diagnosis) {
        flatRm.diagnosis = flatRm.diagnosis.map((d: any) => ({
          ...d,
          diagnosis: d.penyakit?.namaPenyakit || d.catatan || ""
        }));
      }

      // Map resep to old structure
      if (flatRm.resep) {
        flatRm.resep = flatRm.resep.map((r: any) => ({
          ...r,
          obatId: r.obat?.namaObat || r.obatId
        }));
      }

      // Map tindakan to old comma-separated list
      if (flatRm.rekamMedisTindakan) {
        flatRm.tindakan = flatRm.rekamMedisTindakan.map((rt: any) => rt.tindakan?.namaTindakan).join(", ");
      }

      return flatRm;
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error("[GET /api/rekam-medis/pasien/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}