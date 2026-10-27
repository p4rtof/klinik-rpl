import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStatusJadwalSchema } from "@/lib/validations";

// 1. GET: Ambil detail antrian
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jadwal = await prisma.jadwal.findUnique({
      where: { id },
      include: {
        pasien: true,
        dokter: { select: { namaLengkap: true, spesialisasi: true } },
      },
    });

    if (!jadwal) {
      return NextResponse.json({ success: false, error: "Antrean tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: jadwal });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PATCH: Untuk Edit Keluhan, Status, Tanggal, dan Jam
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.jadwal.update({
      where: { id },
      data: {
        keluhan: body.keluhan,
        status: body.status,
        jam: body.jam,
        // Jika body.tanggal ada, ubah jadi format Date
        tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ success: false, error: "Gagal update data" }, { status: 500 });
  }
}

// 3. DELETE: Fungsi untuk HAPUS Kunjungan (Ini yang tadi bikin error)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    // Hanya Admin yang boleh hapus
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Cek apakah data ada sebelum dihapus
    const exist = await prisma.jadwal.findUnique({ where: { id } });
    if (!exist) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }

    await prisma.jadwal.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Kunjungan berhasil dihapus",
    });
  } catch (error) {
    console.error("[DELETE /api/antrian/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// 4. PUT: Untuk update status saja (bawaan kodinganmu sebelumnya)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.jadwal.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal update status" }, { status: 500 });
  }
}