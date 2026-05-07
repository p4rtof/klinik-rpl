import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jadwalSchema } from "@/lib/validations";

// GET /api/antrian?tanggal=YYYY-MM-DD&dokterId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalParam = searchParams.get("tanggal");
    const dokterId = searchParams.get("dokterId");

    const targetDate = tanggalParam ? new Date(tanggalParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const antrian = await prisma.jadwal.findMany({
      where: {
        tanggal: { gte: startOfDay, lte: endOfDay },
        ...(dokterId ? { dokterId } : {}),
      },
      include: {
        pasien: {
          select: { id: true, noRm: true, nama: true, noTelepon: true },
        },
        dokter: { select: { id: true, namaLengkap: true, spesialisasi: true } },
      },
      orderBy: { nomorAntrian: "asc" },
    });

    return NextResponse.json({ success: true, data: antrian });
  } catch (error) {
    console.error("[GET /api/antrian]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/antrian
// Body: { pasienId, dokterId, jam }
// nomorAntrian dihitung otomatis
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
    const parseResult = jadwalSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { pasienId, dokterId, jam } = parseResult.data;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const lastJadwal = await prisma.jadwal.findFirst({
      where: { dokterId, tanggal: { gte: startOfDay, lte: endOfDay } },
      orderBy: { nomorAntrian: "desc" },
    });
    const nextNomor = lastJadwal ? lastJadwal.nomorAntrian + 1 : 1;

    const newJadwal = await prisma.jadwal.create({
      data: {
        pasienId,
        dokterId,
        tanggal: new Date(),
        jam,
        nomorAntrian: nextNomor,
        status: "MENUNGGU",
      },
      include: {
        pasien: { select: { noRm: true, nama: true } },
        dokter: { select: { namaLengkap: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: newJadwal, message: "Antrian berhasil dibuat" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/antrian]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
