import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dokter
// Mengembalikan semua dokter (user dengan role DOKTER)
// Gunakan untuk dropdown pilihan dokter saat mendaftarkan antrian
export async function GET() {
  try {
    const dokter = await prisma.user.findMany({
      where: { role: "DOKTER" },
      select: { id: true, namaLengkap: true, spesialisasi: true },
      orderBy: { namaLengkap: "asc" },
    });

    return NextResponse.json({ success: true, data: dokter });
  } catch (error) {
    console.error("[GET /api/dokter]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
