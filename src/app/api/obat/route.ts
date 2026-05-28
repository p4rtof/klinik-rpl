import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const data = await prisma.obat.findMany({
      where: q
        ? {
            OR: [
              { kodeObat: { contains: q } },
              { namaObat: { contains: q } },
            ],
          }
        : {},
      take: 50,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data obat" },
      { status: 500 }
    );
  }
}
