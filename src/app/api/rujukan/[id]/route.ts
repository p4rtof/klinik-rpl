import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rujukan/[id]  (opsional tapi sangat membantu untuk modal)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const rujukan = await prisma.rujukan.findUnique({
      where: { id },
      select: {
        id: true,
        tujuan: true,
        poliTujuan: true,
        diagnosa: true,
        keterangan: true,
        status: true,
        nomorSurat: true,
        tanggalRujukan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!rujukan) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rujukan });
  } catch (error) {
    console.error("[GET /api/rujukan/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/rujukan/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "DOKTER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Cek data rujukan yang ada
    const existing = await prisma.rujukan.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    // Jika sudah FINAL, tidak boleh diedit kecuali oleh ADMIN
    if (existing.status === "FINAL" && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Rujukan sudah FINAL dan tidak bisa diedit" },
        { status: 400 }
      );
    }

    const isFinalizing = body.status === "FINAL" && existing.status === "DRAFT";
    let nomorSurat = existing.nomorSurat;

    if (isFinalizing && !nomorSurat) {
      const timestamp = Date.now();
      nomorSurat = `SURAT/RUJUKAN/${existing.id.substring(0, 8)}/${timestamp}`;
    }

    const updated = await prisma.rujukan.update({
      where: { id },
      data: {
        tujuan: body.tujuan ?? undefined,
        poliTujuan: body.poliTujuan ?? undefined,
        diagnosa: body.diagnosa ?? undefined,
        keterangan: body.keterangan ?? undefined,
        status: body.status ?? undefined,
        nomorSurat: nomorSurat ?? undefined,
        tanggalRujukan: body.tanggalRujukan ? new Date(body.tanggalRujukan) : undefined,
      },
      select: {
        id: true,
        tujuan: true,
        poliTujuan: true,
        diagnosa: true,
        keterangan: true,
        status: true,
        nomorSurat: true,
        tanggalRujukan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: isFinalizing ? "Rujukan berhasil difinalisasi" : "Rujukan berhasil diperbarui"
    });
  } catch (error) {
    console.error("[PATCH /api/rujukan/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}