import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStatusJadwalSchema } from "@/lib/validations";

// PUT /api/antrian/[id]
// Body: { status: "MENUNGGU" | "DIPERIKSA" | "SELESAI" | "BATAL" }
export async function PUT(
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
    const body = await request.json();
    const parseResult = updateStatusJadwalSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error,
        },
        { status: 400 },
      );
    }

    const jadwal = await prisma.jadwal.findUnique({ where: { id } });
    if (!jadwal) {
      return NextResponse.json(
        { success: false, error: "Jadwal tidak ditemukan" },
        { status: 404 },
      );
    }

    // Dokter hanya bisa ubah antrian yang ditugaskan ke dia
    const userId = request.headers.get("x-user-id");
    if (role === "DOKTER" && jadwal.dokterId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const updated = await prisma.jadwal.update({
      where: { id },
      data: { status: parseResult.data.status },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Status antrian diperbarui",
    });
  } catch (error) {
    console.error("[PUT /api/antrian/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// GET /api/antrian/[id]
// Mengambil detail 1 antrean spesifik beserta data pasiennya
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

    // Cari antrean berdasarkan ID, dan include data pasien & dokter
    const jadwal = await prisma.jadwal.findUnique({
      where: { id },
      include: {
        pasien: true, // Ambil semua data pasien (nama, umur, kelamin, dll)
        dokter: { select: { namaLengkap: true, spesialisasi: true } },
      },
    });

    if (!jadwal) {
      return NextResponse.json(
        { success: false, error: "Antrean tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: jadwal,
    });
  } catch (error) {
    console.error("[GET /api/antrian/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
