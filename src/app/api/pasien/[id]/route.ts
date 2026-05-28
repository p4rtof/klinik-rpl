import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePasienSchema } from "@/lib/validations";

// GET /api/pasien/[id]
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
    const pasien = await prisma.pasien.findUnique({
      where: { id },
      include: {
        rekamMedis: {
          orderBy: { tanggal: "desc" },
          include: { 
            dokter: {
              select: {
                namaLengkap: true,
                poli: { select: { namaPoli: true } }
              }
            },
            diagnosis: {
              include: { penyakit: true }
            },
            resep: {
              include: { obat: true }
            },
            rekamMedisTindakan: {
              include: { tindakan: true }
            },
            rujukan: true,
          },
        },
        pembayaran: { orderBy: { tanggal: "desc" } },
      },
    });

    if (!pasien) {
      return NextResponse.json(
        { success: false, error: "Pasien tidak ditemukan" },
        { status: 404 },
      );
    }

    // Map relations to expected flat properties for frontend backward-compatibility
    const mappedRekamMedis = pasien.rekamMedis.map((rm) => {
      return {
        ...rm,
        dokter: rm.dokter
          ? {
              ...rm.dokter,
              spesialisasi: rm.dokter.poli?.namaPoli || "Umum",
            }
          : null,
        diagnosis: rm.diagnosis.map((d) => ({
          ...d,
          diagnosis: d.penyakit?.namaPenyakit || d.catatan || ""
        })),
        resep: rm.resep.map((r) => ({
          ...r,
          obatId: r.obat?.namaObat || r.obatId
        })),
        tindakan: rm.rekamMedisTindakan.map((rt) => rt.tindakan?.namaTindakan).join(", ")
      };
    });

    // Also map pembayaran fields (jumlah to totalJumlah mapping if needed on client)
    const mappedPembayaran = pasien.pembayaran.map((p) => ({
      ...p,
      jumlah: p.totalJumlah
    }));

    const mappedPasien = {
      ...pasien,
      rekamMedis: mappedRekamMedis,
      pembayaran: mappedPembayaran
    };

    return NextResponse.json({ success: true, data: mappedPasien });
  } catch (error) {
    console.error("[GET /api/pasien/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT /api/pasien/[id]
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
    const parseResult = updatePasienSchema.safeParse(body);
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

    const updated = await prisma.pasien.update({
      where: { id },
      data: parseResult.data,
    });
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Data pasien berhasil diperbarui",
    });
  } catch (error) {
    console.error("[PUT /api/pasien/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE /api/pasien/[id]
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
    await prisma.pasien.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Data pasien berhasil dihapus",
    });
  } catch (error) {
    console.error("[DELETE /api/pasien/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}