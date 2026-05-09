import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/rujukan/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.rujukan.update({
      where: { id },
      data: {
        tujuan: body.tujuan ?? undefined,
        keterangan: body.keterangan ?? undefined,
      },
      select: {
        id: true,
        tujuan: true,
        keterangan: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/rujukan/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}