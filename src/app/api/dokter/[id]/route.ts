import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dokter = await prisma.dokter.findUnique({
      where: { id },
      include: {
        user: { select: { username: true } },
        antrian: {
          where: { tanggal: { gte: new Date(new Date().setHours(0,0,0,0)) } }, // Antrian hari ini
          include: { pasien: true }
        }
      }
    });

    if (!dokter) {
      return NextResponse.json({ success: false, error: 'Dokter tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dokter });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
