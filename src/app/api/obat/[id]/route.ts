import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obatSchema } from "@/lib/validations";

// PUT /api/obat/[id] - Update obat details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const parseResult = obatSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Check unique kodeObat if changing it
    if (data.kodeObat) {
      const exists = await prisma.obat.findFirst({
        where: {
          kodeObat: data.kodeObat,
          NOT: { id }
        }
      });
      if (exists) {
        return NextResponse.json({ success: false, error: "Kode obat sudah digunakan oleh obat lain" }, { status: 400 });
      }
    }

    const updated = await prisma.obat.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated, message: "Obat berhasil diperbarui" });
  } catch (error) {
    console.error("[PUT /api/obat/[id]] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/obat/[id] - Delete obat
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if obat is used in prescriptions
    const isUsed = await prisma.resep.findFirst({
      where: { obatId: id }
    });
    if (isUsed) {
      return NextResponse.json({
        success: false,
        error: "Obat tidak bisa dihapus karena sudah pernah digunakan dalam resep pasien"
      }, { status: 400 });
    }

    await prisma.obat.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Obat berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/obat/[id]] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
