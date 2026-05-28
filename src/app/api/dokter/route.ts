import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dokter
// Mengembalikan semua dokter dari profile Dokter
// Gunakan untuk dropdown pilihan dokter saat mendaftarkan antrian
export async function GET() {
  try {
    const dokterList = await prisma.dokter.findMany({
      include: {
        poli: true
      },
      orderBy: { namaLengkap: "asc" },
    });

    const data = dokterList.map(d => ({
      id: d.id, // Dokter.id
      namaLengkap: d.namaLengkap,
      spesialisasi: d.poli.namaPoli,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/dokter]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}