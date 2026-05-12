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
        pasien: { select: { noRm: true, nama: true } },

        // >>> tambahan: ikutkan rekamMedis + rujukan
        rekamMedis: {
          select: {
            id: true,
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

    return NextResponse.json({ success: true, data: pembayaran });
  } catch (error) {
    console.error("[GET /api/pembayaran]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/pembayaran
// Body: { pasienId, rekamMedisId?, jumlah, metode }
// status default = "BELUM_BAYAR"
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
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
          // FIX Zod: bukan .errors, tapi .issues
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const newPembayaran = await prisma.pembayaran.create({
      data: parseResult.data,
      include: {
        pasien: { select: { noRm: true, nama: true } },
        rekamMedis: {
          select: {
            id: true,
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

    return NextResponse.json(
      {
        success: true,
        data: newPembayaran,
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