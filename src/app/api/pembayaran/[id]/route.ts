import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStatusPembayaranSchema } from "@/lib/validations";

// PUT /api/pembayaran/[id]
// Body: { status: "BELUM_BAYAR" | "LUNAS" }
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parseResult = updateStatusPembayaranSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error.errors,
        },
        { status: 400 },
      );
    }

    const pembayaran = await prisma.pembayaran.findUnique({ where: { id } });
    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Data pembayaran tidak ditemukan" },
        { status: 404 },
      );
    }

    const updated = await prisma.pembayaran.update({
      where: { id },
      data: { status: parseResult.data.status },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Status pembayaran diperbarui",
    });
  } catch (error) {
    console.error("[PUT /api/pembayaran/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
