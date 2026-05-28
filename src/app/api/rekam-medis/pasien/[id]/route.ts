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
    const mapped = rekamMedis.map((rm) => {
      return {
        ...rm,
        dokter: rm.dokter
          ? {
              ...rm.dokter,
              spesialisasi: rm.dokter.poli?.namaPoli || "Umum",
            }
          : null,
        diagnosis: rm.diagnosis.map((d) => ({
          ...d,
          diagnosis: d.penyakit?.namaPenyakit || d.catatan || ""
        })),
        resep: rm.resep.map((r) => ({
          ...r,
          obatId: r.obat?.namaObat || r.obatId
        })),
        tindakan: rm.rekamMedisTindakan.map((rt) => rt.tindakan?.namaTindakan).join(", ")
      };
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