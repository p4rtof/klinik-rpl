import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pembayaran/[id] - Untuk tarik data cetak struk
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const data = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pasien: {
          select: {
            id: true,
            noRm: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            noTelepon: true,
            alamat: true,
          }
        },
        rekamMedis: {
          include: {
            dokter: { select: { namaLengkap: true, spesialisasi: true } },
            diagnosis: true,
            resep: true,
            rujukan: true,
          },
        },
      },
    });

    if (!data) {
      return NextResponse.json({ success: false, error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/pembayaran/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT /api/pembayaran/[id] - Update status & Metode Pembayaran
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.pembayaran.update({
      where: { id },
      data: {
        status: body.status,
        metode: body.metode || undefined,
        jumlah: body.jumlah !== undefined ? Number(body.jumlah) : undefined,
      },
      include: {
        pasien: { select: { id: true, noRm: true, nama: true } },
        rekamMedis: {
          include: {
            diagnosis: true,
            rujukan: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: "Data pembayaran berhasil diperbarui"
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
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.pembayaran.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pembayaran berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/pembayaran/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
