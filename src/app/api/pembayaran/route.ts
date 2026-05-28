import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pembayaranSchema } from "@/lib/validations";

// GET /api/pembayaran?pasienId=xxx&status=BELUM_BAYAR
export async function GET(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pasienId = searchParams.get("pasienId");
    const status = searchParams.get("status");

    const pembayaran = await prisma.pembayaran.findMany({
      where: {
        ...(pasienId ? { pasienId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        pasien: { select: { id: true, noRm: true, nama: true } },
        rekamMedis: {
          select: {
            id: true,
            diagnosis: {
              include: { penyakit: true }
            },
            catatanTambahan: true,
            rujukan: {
              select: {
                id: true,
                tujuan: true,
                keterangan: true,
                createdAt: true,
                poliTujuan: true,
                diagnosa: true,
                tanggalRujukan: true,
                status: true,
                nomorSurat: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    // Map for frontend compatibility
    const mapped = pembayaran.map((p: any) => {
      const flatRm = p.rekamMedis ? { ...p.rekamMedis } : null;
      if (flatRm && flatRm.diagnosis) {
        flatRm.diagnosis = flatRm.diagnosis.map((d: any) => ({
          ...d,
          diagnosis: d.penyakit?.namaPenyakit || d.catatan || ""
        }));
      }
      return {
        ...p,
        jumlah: p.totalJumlah,
        rekamMedis: flatRm
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error("[GET /api/pembayaran]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/pembayaran
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = pembayaranSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const newPembayaran = await prisma.pembayaran.create({
      data: {
        pasienId: parseResult.data.pasienId,
        rekamMedisId: parseResult.data.rekamMedisId,
        totalJumlah: parseResult.data.totalJumlah,
        metode: parseResult.data.metode,
        status: "BELUM_BAYAR",
      },
      include: {
        pasien: { select: { id: true, noRm: true, nama: true } },
        rekamMedis: {
          select: {
            id: true,
            diagnosis: {
              include: { penyakit: true }
            },
            catatanTambahan: true,
            rujukan: {
              select: {
                id: true,
                tujuan: true,
                keterangan: true,
                createdAt: true,
                poliTujuan: true,
                diagnosa: true,
                tanggalRujukan: true,
                status: true,
                nomorSurat: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    const flatRm = newPembayaran.rekamMedis ? { ...newPembayaran.rekamMedis } : null;
    if (flatRm && flatRm.diagnosis) {
      flatRm.diagnosis = flatRm.diagnosis.map((d: any) => ({
        ...d,
        diagnosis: d.penyakit?.namaPenyakit || d.catatan || ""
      }));
    }

    const data = {
      ...newPembayaran,
      jumlah: newPembayaran.totalJumlah,
      rekamMedis: flatRm
    };

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Data pembayaran berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/pembayaran]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}