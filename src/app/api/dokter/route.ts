import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const dokter = await prisma.dokter.findMany({
      where: search ? {
        nama: {
          contains: search,
          mode: 'insensitive',
        }
      } : undefined,
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json({ success: true, data: dokter });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
