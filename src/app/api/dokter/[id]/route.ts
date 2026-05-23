import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDokterSchema } from "@/lib/validations";

// GET /api/dokter/[id]
// Detail dokter beserta jadwal (untuk kalender dokter)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const dokter = await prisma.user.findFirst({
      where: { id, role: "DOKTER" },
      select: {
        id: true,
        namaLengkap: true,
        spesialisasi: true,
        noTelepon: true,
        sip: true,
        str: true,
        fotoUrl: true,
        jadwal: {
          include: { pasien: { select: { id: true, noRm: true, nama: true } } },
          orderBy: [{ tanggal: "asc" }, { nomorAntrian: "asc" }],
        },
      },
    });

    if (!dokter) {
      return NextResponse.json(
        { success: false, error: "Dokter tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: dokter });
  } catch (error) {
    console.error("[GET /api/dokter/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT /api/dokter/[id] - Update Profil Dokter
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = request.headers.get("x-user-id");
    const { id } = await params;

    // Hanya dokter yang bersangkutan yang bisa update profilnya
    if (userId !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = updateDokterSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parseResult.data,
      select: {
        id: true,
        namaLengkap: true,
        spesialisasi: true,
        noTelepon: true,
        sip: true,
        str: true,
        fotoUrl: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: "Profil berhasil diperbarui" 
    });
  } catch (error) {
    console.error("[PUT /api/dokter/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}