import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Untuk tarik data cetak struk
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pasien: true,
        rekamMedis: {
          include: {
            dokter: { select: { namaLengkap: true } },
            diagnosis: true,
            resep: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT: Untuk update status LUNAS & Metode Pembayaran
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.pembayaran.update({
      where: { id },
      data: {
        status: body.status,
        metode: body.metode || undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: Untuk hapus pembayaran
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.pembayaran.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pembayaran dihapus" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}