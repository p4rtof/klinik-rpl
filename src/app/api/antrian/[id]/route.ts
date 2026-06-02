import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateJadwalFullSchema } from "@/lib/validations";
import { recalculateQueueNumbers } from "@/lib/queue";

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

    // Validasi input
    const parseResult = updateJadwalFullSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Data tidak valid", details: parseResult.error.format() }, { status: 400 });
    }

    const oldJadwal = await prisma.jadwal.findUnique({ where: { id } });
    if (!oldJadwal) {
      return NextResponse.json({ success: false, error: "Antrean tidak ditemukan" }, { status: 404 });
    }

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

    const oldDateStr = oldJadwal.tanggal.toISOString().split('T')[0];
    const newDateStr = updated.tanggal.toISOString().split('T')[0];

    // Kalkulasi ulang nomor antrean untuk tanggal terkait
    await recalculateQueueNumbers(oldDateStr);
    if (newDateStr !== oldDateStr) {
      await recalculateQueueNumbers(newDateStr);
    }

    // Ambil data ter-update dengan nomor antrean baru
    const finalUpdated = await prisma.jadwal.findUnique({ where: { id } }) || updated;

    return NextResponse.json({ success: true, data: finalUpdated });
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

    // Kalkulasi ulang nomor antrean setelah dihapus
    const deletedDateStr = exist.tanggal.toISOString().split('T')[0];
    await recalculateQueueNumbers(deletedDateStr);

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