import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dokter/[id]
// Detail dokter beserta jadwal hari ini
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const dokter = await prisma.user.findFirst({
      where: { id, role: "DOKTER" },
      select: {
        id: true,
        namaLengkap: true,
        spesialisasi: true,
        jadwal: {
          where: {
            tanggal: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          include: { pasien: { select: { noRm: true, nama: true } } },
          orderBy: { nomorAntrian: "asc" },
        },
      },
    });

    if (!dokter) {
      return NextResponse.json(
        { success: false, error: "Dokter tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: dokter });
  } catch (error) {
    console.error("[GET /api/dokter/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
