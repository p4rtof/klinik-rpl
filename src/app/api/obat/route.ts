import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obatSchema } from "@/lib/validations";

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
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data obat" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = obatSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Check uniqueness
    const exists = await prisma.obat.findUnique({
      where: { kodeObat: data.kodeObat }
    });
    if (exists) {
      return NextResponse.json({ success: false, error: "Kode obat sudah terdaftar" }, { status: 400 });
    }

    const newObat = await prisma.obat.create({ data });
    return NextResponse.json({ success: true, data: newObat, message: "Obat berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/obat] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
