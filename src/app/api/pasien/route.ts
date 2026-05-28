import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pasienSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { generatePasienIds } from "@/lib/id-generator";

// GET /api/pasien?search=...&searchType=nama|noRm|id|noTelepon&sortBy=id|nama|usia
export async function GET(request: Request) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "id";

    let whereCondition: Prisma.PasienWhereInput | undefined = undefined;

    if (search) {
      whereCondition = {
        OR: [
          { nama: { contains: search } },
          { id: { contains: search } },
          { noTelepon: { contains: search } },
        ],
      };
    }

    let orderBy: Prisma.PasienOrderByWithRelationInput = { id: "desc" };
    if (sortBy === "nama") {
      orderBy = { nama: "asc" };
    } else if (sortBy === "tanggalLahir") {
      // Usia ASC = Tanggal Lahir DESC (paling muda dulu)
      orderBy = { tanggalLahir: "desc" };
    } else if (sortBy === "id") {
      orderBy = { id: "desc" };
    }

    const pasien = await prisma.pasien.findMany({
      where: whereCondition,
      orderBy,
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
        id,
        noRm,
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