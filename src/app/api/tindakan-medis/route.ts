import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.tindakan.findMany({
      orderBy: { namaTindakan: "asc" }
    });
    
    // Map database columns to expected frontend names
    const data = list.map(t => ({
      id: t.id,
      label: t.namaTindakan,
      harga: t.harga
    }));

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data tindakan" },
      { status: 500 }
    );
  }
}
