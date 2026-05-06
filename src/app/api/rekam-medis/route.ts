import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rekamMedisSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    const userDokterId = request.headers.get('x-dokter-id');

    if (role !== 'DOKTER') {
       return NextResponse.json({ success: false, error: 'Forbidden: Hanya Dokter yang dapat menambah rekam medis' }, { status: 403 });
    }

    const body = await request.json();
    
    const parseResult = rekamMedisSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Pastikan antrian valid dan milik dokter ini
    const antrian = await prisma.antrian.findUnique({ where: { id: data.antrianId } });
    if (!antrian) {
      return NextResponse.json({ success: false, error: 'Antrian tidak ditemukan' }, { status: 404 });
    }
    
    if (antrian.dokterId !== userDokterId) {
      return NextResponse.json({ success: false, error: 'Forbidden: Bukan pasien Anda' }, { status: 403 });
    }

    // Gunakan Prisma Transaction untuk atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Rekam Medis
      const newRM = await tx.rekamMedis.create({
        data: {
          pasienId: data.pasienId,
          dokterId: userDokterId,
          tanggalPeriksa: new Date(),
          keluhan: data.keluhan,
          diagnosa: data.diagnosa,
          tindakan: data.tindakan,
          resepObat: data.resepObat,
          catatan: data.catatan,
        }
      });

      // 2. Update status antrian menjadi SELESAI
      await tx.antrian.update({
        where: { id: data.antrianId },
        data: { status: 'SELESAI' }
      });

      return newRM;
    });

    return NextResponse.json({ success: true, data: result, message: 'Rekam medis berhasil disimpan' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
