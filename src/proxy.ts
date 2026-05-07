import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const publicApiRoutes = ["/api/auth/login"];
const publicPageRoutes = ["/login"];

// Prefix halaman berdasarkan role
const adminPagePrefixes = ["/dashboard", "/data-pasien", "/pembayaran"];
const doctorPagePrefixes = ["/patients"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ================================================================
  // API ROUTES — hanya /api/* yang masuk sini
  // ================================================================
  if (pathname.startsWith("/api/")) {
    // Login tidak butuh token
    if (publicApiRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: token tidak valid" },
        { status: 401 },
      );
    }

    // Teruskan info user ke route handler via header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ================================================================
  // PAGE ROUTES — proteksi halaman non-API
  // ================================================================

  // Jika mengakses /login dan sudah punya token valid → redirect ke dashboard
  if (publicPageRoutes.includes(pathname)) {
    const token = request.cookies.get("token")?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        if (payload.role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (payload.role === "DOKTER") {
          return NextResponse.redirect(new URL("/patients", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Semua halaman selain /login wajib punya token
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Token ada tapi tidak valid → hapus cookie dan redirect ke login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // Role-based access: DOKTER tidak bisa akses halaman admin, dan sebaliknya
  const isAdminPage = adminPagePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isDoctorPage = doctorPagePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isAdminPage && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/patients", request.url));
  }

  if (isDoctorPage && payload.role !== "DOKTER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API routes
    "/api/:path*",
    // Halaman login (untuk redirect jika sudah login)
    "/login",
    // Halaman admin
    "/dashboard",
    "/dashboard/:path*",
    "/data-pasien",
    "/data-pasien/:path*",
    "/pembayaran",
    "/pembayaran/:path*",
    // Halaman dokter
    "/patients",
    "/patients/:path*",
  ],
};
