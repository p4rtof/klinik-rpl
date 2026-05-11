import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePembayaranSchema } from "@/lib/validations";

// GET /api/pembayaran/[id]
// Mendapatkan detail pembayaran beserta data pasien dan rekam medis lengkap
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pasien: true,
        rekamMedis: {
          include: {
            tindakan: true,
            diagnosis: true,
            resep: true,
            rujukan: true,
            dokter: { select: { namaLengkap: true, spesialisasi: true } },
          },
        },
      },
    });

    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Data pembayaran tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: pembayaran,
    });
  } catch (error) {
    console.error("[GET /api/pembayaran/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

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
    const parseResult = updatePembayaranSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error.format(),
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
      data: parseResult.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Data pembayaran diperbarui",
    });
  } catch (error) {
    console.error("[PUT /api/pembayaran/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE /api/pembayaran/[id]
export async function DELETE(
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

    const pembayaran = await prisma.pembayaran.findUnique({ where: { id } });
    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Data pembayaran tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.pembayaran.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Data pembayaran berhasil dihapus",
    });
  } catch (error) {
    console.error("[DELETE /api/pembayaran/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
