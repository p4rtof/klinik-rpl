import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Bisa diakses Admin atau Dokter
    const rekamMedis = await prisma.rekamMedis.findMany({
      where: { pasienId: id },
      include: {
        dokter: { select: { nama: true, spesialisasi: true } }
      },
      orderBy: { tanggalPeriksa: 'desc' }
    });

    return NextResponse.json({ success: true, data: rekamMedis });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
