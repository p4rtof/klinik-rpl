import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pasienSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const pasien = await prisma.pasien.findMany({
      where: search ? {
        nama: {
          contains: search,
          mode: 'insensitive',
        }
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: pasien });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    // Jika butuh proteksi, pastikan admin
    if (role !== 'ADMIN') {
       return NextResponse.json({ success: false, error: 'Forbidden: Hanya Admin' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validasi input
    const parseResult = pasienSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    // Cek NIK unik
    const existing = await prisma.pasien.findUnique({
      where: { nik: parseResult.data.nik }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'NIK sudah terdaftar' }, { status: 400 });
    }

    const newPasien = await prisma.pasien.create({
      data: parseResult.data,
    });

    return NextResponse.json({ success: true, data: newPasien, message: 'Pasien berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
