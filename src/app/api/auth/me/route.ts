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
      include: {
        dokter: {
          include: { poli: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = {
      id: user.id,
      username: user.username,
      role: user.role,
      namaLengkap: user.namaLengkap,
      noTelepon: user.dokter?.noTelepon || user.noTelepon,
      fotoUrl: user.dokter?.fotoUrl || user.fotoUrl,
      spesialisasi: user.dokter?.poli?.namaPoli || null,
      sip: user.dokter?.sip || null,
      str: user.dokter?.str || null,
    };

    return NextResponse.json({ success: true, data });
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
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User tidak ditemukan" }, { status: 404 });
    }

    // Update User first
    await prisma.user.update({
      where: { id: payload.id },
      data: {
        namaLengkap: body.namaLengkap ?? undefined,
        noTelepon: body.noTelepon ?? undefined,
        fotoUrl: body.fotoUrl ?? undefined,
      }
    });

    // Update Dokter profile if role is DOKTER
    if (user.role === "DOKTER") {
      await prisma.dokter.update({
        where: { userId: payload.id },
        data: {
          namaLengkap: body.namaLengkap ?? undefined,
          noTelepon: body.noTelepon ?? undefined,
          fotoUrl: body.fotoUrl ?? undefined,
          sip: body.sip ?? undefined,
          str: body.str ?? undefined,
          ...(body.spesialisasi ? {
            poli: {
              connectOrCreate: {
                where: { namaPoli: body.spesialisasi },
                create: { namaPoli: body.spesialisasi }
              }
            }
          } : {})
        }
      });
    }

    const finalUser = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        dokter: {
          include: { poli: true }
        }
      }
    });

    if (!finalUser) {
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }

    const data = {
      id: finalUser.id,
      username: finalUser.username,
      role: finalUser.role,
      namaLengkap: finalUser.namaLengkap,
      noTelepon: finalUser.dokter?.noTelepon || finalUser.noTelepon,
      fotoUrl: finalUser.dokter?.fotoUrl || finalUser.fotoUrl,
      spesialisasi: finalUser.dokter?.poli?.namaPoli || null,
      sip: finalUser.dokter?.sip || null,
      str: finalUser.dokter?.str || null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[PATCH /api/auth/me]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}