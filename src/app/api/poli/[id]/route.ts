import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { poliSchema } from "@/lib/validations";

// PUT /api/poli/[id] - Update poliklinik details
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

    const parseResult = poliSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Data tidak valid",
        details: parseResult.error.format(),
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Check unique namaPoli if changing it
    if (data.namaPoli) {
      const exists = await prisma.poli.findFirst({
        where: {
          namaPoli: data.namaPoli,
          NOT: { id }
        }
      });
      if (exists) {
        return NextResponse.json({ success: false, error: "Nama poliklinik sudah digunakan oleh poli lain" }, { status: 400 });
      }
    }

    const updated = await prisma.poli.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated, message: "Poliklinik berhasil diperbarui" });
  } catch (error) {
    console.error("[PUT /api/poli/[id]] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/poli/[id] - Delete poliklinik
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

    // Check if poli is used in doctors or queues
    const isUsedInDoctor = await prisma.dokter.findFirst({
      where: { poliId: id }
    });
    if (isUsedInDoctor) {
      return NextResponse.json({
        success: false,
        error: "Poliklinik tidak bisa dihapus karena masih ada dokter yang bertugas di poli ini"
      }, { status: 400 });
    }

    const isUsedInJadwal = await prisma.jadwal.findFirst({
      where: { poliId: id }
    });
    if (isUsedInJadwal) {
      return NextResponse.json({
        success: false,
        error: "Poliklinik tidak bisa dihapus karena masih ada jadwal antrean pasien di poli ini"
      }, { status: 400 });
    }

    await prisma.poli.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Poliklinik berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/poli/[id]] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
