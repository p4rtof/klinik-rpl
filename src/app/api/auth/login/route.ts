import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

// POST /api/auth/login
// Body: { username, password }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role as 'ADMIN' | 'DOKTER',
      namaLengkap: user.namaLengkap,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,          // "ADMIN" atau "DOKTER"
        namaLengkap: user.namaLengkap,
        spesialisasi: user.spesialisasi,
      },
    });

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
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
