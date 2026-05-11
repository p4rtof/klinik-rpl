import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET_KEY } from "@/lib/auth";

const key = new TextEncoder().encode(JWT_SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // LOGIKA UNTUK API (Agar Backend Adit tidak 401/Unauthorized)
  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(request.headers);
    
    if (token) {
      try {
        // Kita verifikasi token langsung di sini tanpa panggil file lain
        const { payload } = await jwtVerify(token, key);
        if (payload) {
          // Suntikkan headers yang diminta Backend Adit
          requestHeaders.set("x-user-id", payload.id as string);
          requestHeaders.set("x-user-role", payload.role as string);
        }
      } catch {
        // Jika token basi, biarkan saja
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // PROTEKSI HALAMAN (Mencegah masuk dashboard kalau belum login)
  const isAuthPage = pathname.startsWith("/login");
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/profile") || 
    pathname.startsWith("/data-pasien");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    // Kalau sudah login tapi mau ke /login, lempar ke dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*", 
    "/dashboard/:path*", 
    "/dashboard-dokter/:path*", 
    "/profile/:path*", 
    "/data-pasien/:path*"
  ],
};