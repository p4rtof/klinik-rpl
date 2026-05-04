import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Rute yang tidak perlu dicek tokennya
const publicApiRoutes = ['/api/auth/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya proteksi rute API (opsional: proteksi rute halaman juga bisa ditambah di sini)
  if (pathname.startsWith('/api/')) {
    if (publicApiRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // Otorisasi Role Berdasarkan Path (Contoh Sederhana)
    // - /api/pasien (POST, PUT, DELETE) sebaiknya Admin, GET bisa Admin/Dokter
    // - /api/rekam-medis sebaiknya Dokter
    
    // Set user info di header agar bisa diakses oleh rute API tujuan
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-role', payload.role);
    if (payload.dokterId) {
      requestHeaders.set('x-dokter-id', payload.dokterId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    // Tambahkan matcher untuk (admin) dan (dokter) jika ingin middleware juga memproteksi halaman frontend
  ],
};
