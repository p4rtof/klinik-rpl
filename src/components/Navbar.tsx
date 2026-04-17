"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Tambahkan usePathname
import { getSession, clearSession } from "@/lib/storage";
import type { Session } from "@/types/klinik";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Ambil rute saat ini

  useEffect(() => {
    setSession(getSession());
  }, [pathname]); // Refresh session setiap kali pindah halaman

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  // Logika: Jangan tampilkan Navbar jika di halaman login atau belum login
  if (pathname === "/login" || !session) {
    return null; 
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg p-4 text-white flex gap-6 font-semibold items-center">
      <div className="text-xl font-bold">Klinik Umum</div>
      {/* ... sisa kode menu Navbar kamu ... */}
      <div className="flex gap-6">
        {session.role === "ADMIN" && (
          <>
            <Link href="/admin" className="hover:text-blue-200 transition-colors">Dashboard</Link>
            <Link href="/admin/pasien" className="hover:text-blue-200 transition-colors">Pasien</Link>
            <Link href="/admin/jadwal" className="hover:text-blue-200 transition-colors">Jadwal</Link>
            <Link href="/admin/kasir" className="hover:text-blue-200 transition-colors">Kasir</Link>
          </>
        )}
        {session.role === "DOKTER" && (
          <>
            <Link href="/dokter" className="hover:text-blue-200 transition-colors">Jadwal Harian</Link>
            <Link href="/dokter/pemeriksaan" className="hover:text-blue-200 transition-colors">Pemeriksaan</Link>
          </>   
        )}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{session.username}</span>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          Keluar
        </button>
      </div>
    </nav>
  );
}