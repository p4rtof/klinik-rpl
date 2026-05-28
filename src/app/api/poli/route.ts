import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { poliSchema } from "@/lib/validations";

// GET /api/poli - Get all clinics
export async function GET() {
  try {
    const list = await prisma.poli.findMany({
      orderBy: { namaPoli: "asc" }
    });
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("[GET /api/poli] Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data poliklinik" },
      { status: 500 }
    );
  }
}

// POST /api/poli - Create a new clinic
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = poliSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Check unique namaPoli
    const exists = await prisma.poli.findUnique({
      where: { namaPoli: data.namaPoli }
    });
    if (exists) {
      return NextResponse.json({ success: false, error: "Nama poliklinik sudah terdaftar" }, { status: 400 });
    }

    const newPoli = await prisma.poli.create({ data });
    return NextResponse.json({ success: true, data: newPoli, message: "Poliklinik berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/poli] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
