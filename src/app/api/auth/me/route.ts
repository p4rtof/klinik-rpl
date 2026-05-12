import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/auth/me
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        role: true,
        namaLengkap: true,
        spesialisasi: true,
        noTelepon: true,
        fotoUrl: true,
        sip: true,
        str: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/me
export async function PATCH(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const data = {
      namaLengkap: body.namaLengkap ?? undefined,
      spesialisasi: body.spesialisasi ?? undefined,
      noTelepon: body.noTelepon ?? undefined,
      fotoUrl: body.fotoUrl ?? undefined,
      sip: body.sip ?? undefined,
      str: body.str ?? undefined,
    };

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        namaLengkap: true,
        spesialisasi: true,
        noTelepon: true,
        fotoUrl: true,
        sip: true,
        str: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/auth/me]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}