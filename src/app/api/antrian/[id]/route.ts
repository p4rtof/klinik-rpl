import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateStatusAntrianSchema } from '@/lib/validations';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get('x-user-role');
    const userDokterId = request.headers.get('x-dokter-id');
    
    // Boleh diakses Dokter atau Admin
    if (role !== 'ADMIN' && role !== 'DOKTER') {
       return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const parseResult = updateStatusAntrianSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    // Jika user adalah dokter, pastikan dia hanya bisa update antrian miliknya
    const antrian = await prisma.antrian.findUnique({ where: { id } });
    if (!antrian) {
      return NextResponse.json({ success: false, error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    if (role === 'DOKTER' && antrian.dokterId !== userDokterId) {
      return NextResponse.json({ success: false, error: 'Forbidden: Bukan pasien Anda' }, { status: 403 });
    }

    const updatedAntrian = await prisma.antrian.update({
      where: { id },
      data: { status: parseResult.data.status },
    });

    return NextResponse.json({ success: true, data: updatedAntrian, message: 'Status antrian diperbarui' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
