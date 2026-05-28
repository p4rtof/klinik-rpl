import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tindakanSchema } from "@/lib/validations";

// PUT /api/tindakan-medis/[id] - Update tindakan details
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

    const parseResult = tindakanSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Check unique kodeTindakan if changing it
    if (data.kodeTindakan) {
      const exists = await prisma.tindakan.findFirst({
        where: {
          kodeTindakan: data.kodeTindakan,
          NOT: { id }
        }
      });
      if (exists) {
        return NextResponse.json({ success: false, error: "Kode tindakan sudah digunakan oleh tindakan lain" }, { status: 400 });
      }
    }

    const updated = await prisma.tindakan.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated, message: "Tindakan berhasil diperbarui" });
  } catch (error) {
    console.error("[PUT /api/tindakan-medis/[id]] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/tindakan-medis/[id] - Delete tindakan
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

    // Check if tindakan is used in rekam medis
    const isUsed = await prisma.rekamMedisTindakan.findFirst({
      where: { tindakanId: id }
    });
    if (isUsed) {
      return NextResponse.json({
        success: false,
        error: "Tindakan tidak bisa dihapus karena sudah pernah diberikan kepada pasien"
      }, { status: 400 });
    }

    await prisma.tindakan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Tindakan berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/tindakan-medis/[id]] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
