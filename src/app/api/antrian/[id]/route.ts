import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateStatusJadwalSchema } from "@/lib/validations";

// GET /api/antrian/[id] - UNTUK AMBIL DETAIL PASIEN SAAT MAU DIPERIKSA
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const antrian = await prisma.jadwal.findUnique({
      where: { id },
      include: {
        pasien: {
          select: { 
            id: true, 
            noRm: true, 
            nama: true, 
            noTelepon: true,
            jenisKelamin: true,
            tanggalLahir: true 
          },
        },
        dokter: { 
          select: { 
            namaLengkap: true, 
            spesialisasi: true 
          } 
        },
      },
    });

    if (!antrian) {
      return NextResponse.json(
        { success: false, error: "Antrean tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: antrian });
  } catch (error) {
    console.error("[GET /api/antrian/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/antrian/[id] - PUNYA ADIT YANG LAMA (JANGAN DIUBAH)
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
        { success: false, error: "Data tidak valid" },
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