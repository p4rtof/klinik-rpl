import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET_KEY } from "@/lib/auth";

const key = new TextEncoder().encode(JWT_SECRET_KEY);

// Route yang hanya bisa diakses ADMIN
const ADMIN_ROUTES = ["/dashboard", "/data-pasien", "/pembayaran"];
// Route yang hanya bisa diakses DOKTER
const DOCTOR_ROUTES = ["/dashboard-dokter", "/jadwal-saya", "/periksa", "/rekam-medis", "/profile", "/edit-rekam-medis"];

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function isDoctorRoute(pathname: string) {
  return DOCTOR_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // ============================================================
  // API Routes: Injeksi x-user-id dan x-user-role dari JWT
  // ============================================================
  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(request.headers);
    if (token) {
      try {
        const { payload } = await jwtVerify(token, key);
        if (payload) {
          requestHeaders.set("x-user-id", payload.id as string);
          requestHeaders.set("x-user-role", payload.role as string);
        }
      } catch {
        // Token basi/invalid
      }
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ============================================================
  // Page Routes: Proteksi role-based
  // ============================================================
  const isAuthPage = pathname === "/login" || pathname.startsWith("/login/");
  const isProtectedRoute = isAdminRoute(pathname) || isDoctorRoute(pathname);

  // Belum login → redirect ke /login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      const role = payload.role as string;

      // Sudah login tapi buka /login → redirect ke dashboard sesuai role
      if (isAuthPage) {
        const dest = role === "ADMIN" ? "/dashboard" : "/dashboard-dokter";
        return NextResponse.redirect(new URL(dest, request.url));
      }

      // ADMIN mencoba akses route DOKTER → redirect ke /dashboard
      if (role === "ADMIN" && isDoctorRoute(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // DOKTER mencoba akses route ADMIN → redirect ke /dashboard-dokter
      if (role === "DOKTER" && isAdminRoute(pathname)) {
        return NextResponse.redirect(new URL("/dashboard-dokter", request.url));
      }
    } catch {
      // Token invalid → hapus cookie & redirect ke login jika halaman protected
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/dashboard-dokter/:path*",
    "/data-pasien/:path*",
    "/pembayaran/:path*",
    "/jadwal-saya/:path*",
    "/periksa/:path*",
    "/rekam-medis/:path*",
    "/profile",
    "/profile/:path*",
    "/login",
    "/edit-rekam-medis/:path*",
  ],
};
