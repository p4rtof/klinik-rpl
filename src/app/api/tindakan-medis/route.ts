import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tindakanSchema } from "@/lib/validations";

export async function GET() {
  try {
    const list = await prisma.tindakan.findMany({
      orderBy: { namaTindakan: "asc" }
    });
    
    // Map database columns to expected frontend names, including code and name
    const data = list.map(t => ({
      id: t.id,
      label: t.namaTindakan,
      namaTindakan: t.namaTindakan,
      kodeTindakan: t.kodeTindakan,
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

export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = tindakanSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Check uniqueness of kodeTindakan
    const exists = await prisma.tindakan.findUnique({
      where: { kodeTindakan: data.kodeTindakan }
    });
    if (exists) {
      return NextResponse.json({ success: false, error: "Kode tindakan sudah terdaftar" }, { status: 400 });
    }

    const newTindakan = await prisma.tindakan.create({ data });
    return NextResponse.json({ success: true, data: newTindakan, message: "Tindakan berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tindakan-medis] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
