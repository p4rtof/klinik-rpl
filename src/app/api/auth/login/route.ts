import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi input
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;

    // Cari user di database beserta data dokternya jika ada
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        dokter: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Buat token JWT
    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      namaLengkap: user.namaLengkap,
      dokterId: user.dokter?.id,
    });

    // Buat response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login berhasil',
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          namaLengkap: user.namaLengkap,
          dokterId: user.dokter?.id,
        }
      },
      { status: 200 }
    );

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 jam
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
