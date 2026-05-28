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

    const dokterProfile = await prisma.dokter.findUnique({
      where: { userId: id },
      include: {
        poli: true,
        jadwal: {
          include: { pasien: { select: { id: true, noRm: true, nama: true } } },
          orderBy: [{ tanggal: "asc" }, { nomorAntrian: "asc" }],
        },
      },
    });

    if (!dokterProfile) {
      return NextResponse.json(
        { success: false, error: "Dokter tidak ditemukan" },
        { status: 404 },
      );
    }

    const data = {
      id: dokterProfile.userId, // keep user id for client-side routing compatibility
      dokterProfileId: dokterProfile.id,
      namaLengkap: dokterProfile.namaLengkap,
      spesialisasi: dokterProfile.poli.namaPoli,
      noTelepon: dokterProfile.noTelepon,
      sip: dokterProfile.sip,
      str: dokterProfile.str,
      fotoUrl: dokterProfile.fotoUrl,
      jadwal: dokterProfile.jadwal,
    };

    return NextResponse.json({ success: true, data });
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

    const updated = await prisma.dokter.update({
      where: { userId: id },
      data: {
        namaLengkap: parseResult.data.namaLengkap,
        noTelepon: parseResult.data.noTelepon,
        sip: parseResult.data.sip,
        str: parseResult.data.str,
        fotoUrl: parseResult.data.fotoUrl,
        poliId: parseResult.data.poliId,
      },
      include: {
        poli: true
      }
    });

    const data = {
      id: updated.userId,
      namaLengkap: updated.namaLengkap,
      spesialisasi: updated.poli.namaPoli,
      noTelepon: updated.noTelepon,
      sip: updated.sip,
      str: updated.str,
      fotoUrl: updated.fotoUrl,
    };

    return NextResponse.json({ 
      success: true, 
      data,
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
