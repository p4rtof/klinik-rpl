import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const data = await prisma.penyakit.findMany({
      where: q
        ? {
            OR: [
              { kodeIcd10: { contains: q } },
              { namaPenyakit: { contains: q } },
            ],
          }
        : {},
      take: 20,
    });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data penyakit" },
      { status: 500 }
    );
  }
}
