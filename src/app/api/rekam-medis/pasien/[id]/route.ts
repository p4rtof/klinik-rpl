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
        dokter: { select: { namaLengkap: true, spesialisasi: true } },
        diagnosis: true,
        resep: true,
        rujukan: true,
      },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json({ success: true, data: rekamMedis });
  } catch (error) {
    console.error("[GET /api/rekam-medis/pasien/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
