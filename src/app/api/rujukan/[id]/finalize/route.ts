import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function nomorSuratTimestamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  // praktis tidak mungkin bentrok
  return `RJ-${y}${m}${day}-${hh}${mm}${ss}`;
}

// POST /api/rujukan/:id/finalize
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const rujukan = await prisma.rujukan.findUnique({ where: { id } });
    if (!rujukan) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    if (rujukan.status === "FINAL") {
      return NextResponse.json({ success: true, data: rujukan });
    }

    const body = await request.json().catch(() => ({}));

    const updated = await prisma.rujukan.update({
      where: { id },
      data: {
        status: "FINAL",
        nomorSurat: rujukan.nomorSurat ?? nomorSuratTimestamp(),
        tujuan: body.tujuan ?? undefined,
        poliTujuan: body.poliTujuan ?? undefined,
        diagnosa: body.diagnosa ?? undefined,
        keterangan: body.keterangan ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[POST /api/rujukan/[id]/finalize]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}