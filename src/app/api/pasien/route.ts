import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pasienSchema } from "@/lib/validations";
import { generatePasienIds } from "@/lib/id-generator";

// GET /api/pasien?search=nama&searchType=nama|noRm|id
export async function GET(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const searchType = searchParams.get("searchType") || "nama"; // default: cari by nama

    let whereCondition: any = undefined;

    if (search) {
      if (searchType === "noRm") {
        // Cari by noRm (format: R0001)
        whereCondition = { noRm: { contains: search } };
      } else if (searchType === "id") {
        // Cari by id (format: P0001)
        whereCondition = { id: { contains: search } };
      } else {
        // Default: cari by nama
        whereCondition = { nama: { contains: search } };
      }
    }

    const pasien = await prisma.pasien.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: pasien });
  } catch (error) {
    console.error("[GET /api/pasien]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/pasien
// Body: { nama, jenisKelamin, tanggalLahir, noTelepon?, alamat? }
// id & noRm di-generate otomatis oleh server dengan format P0001, R0001, dst
export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parseResult = pasienSchema.safeParse(body);
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

    // Generate formatted IDs
    const { id, noRm } = await generatePasienIds();

    const newPasien = await prisma.pasien.create({
      data: {
        ...parseResult.data,
        id,      // Format: P0001, P0002, ...
        noRm,    // Format: R0001, R0002, ...
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newPasien,
        message: "Pasien berhasil ditambahkan",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/pasien]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
