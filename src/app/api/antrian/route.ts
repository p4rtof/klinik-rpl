import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { antrianSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalParam = searchParams.get('tanggal');
    const dokterId = searchParams.get('dokterId'); // Berguna untuk dashboard dokter

    // Default ke hari ini jika tidak ada parameter tanggal
    const targetDate = tanggalParam ? new Date(tanggalParam) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const antrian = await prisma.antrian.findMany({
      where: {
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(dokterId ? { dokterId } : {}),
      },
      include: {
        pasien: { select: { nama: true, nik: true } },
        dokter: { select: { nama: true, spesialisasi: true } },
      },
      orderBy: { nomorAntrian: 'asc' },
    });

    return NextResponse.json({ success: true, data: antrian });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN') {
       return NextResponse.json({ success: false, error: 'Forbidden: Hanya Admin' }, { status: 403 });
    }

    const body = await request.json();
    
    const parseResult = antrianSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { pasienId, dokterId } = parseResult.data;

    // Set tanggal antrian untuk hari ini
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Hitung nomor antrian terakhir untuk dokter tersebut di hari ini
    const lastAntrian = await prisma.antrian.findFirst({
      where: {
        dokterId,
        tanggal: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { nomorAntrian: 'desc' },
    });

    const nextNomor = lastAntrian ? lastAntrian.nomorAntrian + 1 : 1;

    const newAntrian = await prisma.antrian.create({
      data: {
        pasienId,
        dokterId,
        tanggal: new Date(),
        nomorAntrian: nextNomor,
        status: 'MENUNGGU',
      },
      include: {
        pasien: { select: { nama: true } },
        dokter: { select: { nama: true } },
      }
    });

    return NextResponse.json({ success: true, data: newAntrian, message: 'Antrian berhasil dibuat' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
