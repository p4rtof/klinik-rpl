"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      icon: "/componen-admin/dashboard.svg",
      path: "/dashboard-dokter",
      // Tambahkan route terkait yang juga dianggap sebagai "Dashboard"
      activePaths: ["/dashboard-dokter", "/periksa", "/rekam-medis", "/edit-rekam-medis"],
    },
    {
      name: "Jadwal Saya",
      icon: "/component-doctor/kalender.svg",
      path: "/jadwal-saya",
      activePaths: ["/jadwal-saya"],
    },
    {
      name: "Profile",
      icon: "/component-doctor/pasien.svg",
      path: "/profile",
      activePaths: ["/profile"],
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Gagal logout:", err);
      // Fallback tetap redirect
      router.push("/login");
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm ${isOpen ? "w-64" : "w-20"}`}
      >
        {/* Header Sidebar - Hamburger Menu */}
        <div className="p-4 h-16 border-b border-gray-100 flex items-center justify-between overflow-hidden">
          {isOpen && (
            <span className="text-2xl font-bold text-primary whitespace-nowrap">
              Menu Utama
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-blue-50 rounded-lg text-primary transition-colors flex items-center justify-center"
          >
            {/* Ikon Hamburger */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 p-3 space-y-1 mt-4">
          {menuItems.map((item, index) => {
            // Cek apakah pathname saat ini ada di dalam array activePaths
            const isActive = item.activePaths.includes(pathname);
            return (
              <Link
                key={index}
                href={item.path}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-all group font-bold
          ${isActive ? "bg-primary text-white" : "bg-white text-primary hover:bg-primary hover:text-white"}
          ${!isOpen ? "justify-center" : ""}`}
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className={`w-6 h-6 object-contain transition-all flex-shrink-0
            ${isActive ? "brightness-0 invert" : "group-hover:brightness-0 group-hover:invert"}`}
                />
                {/* Label hanya muncul jika isOpen true */}
                {isOpen && (
                  <span className="font-medium text-xl whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Logout */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className={`flex items-center border-3 border-red-theme gap-3 py-2.5 px-3 w-full rounded-xl text-red-theme font-bold hover:bg-red-theme hover:text-white transition-all shadow-sm active:scale-95 group ${!isOpen && "justify-center"}`}
          >
            <img
              src="/componen-admin/keluar.svg"
              alt="logout"
              className="w-6 h-6 object-contain transition-all group-hover:brightness-0 group-hover:invert flex-shrink-0"
            />
            {isOpen && (
              <span className="text-lg whitespace-nowrap">Keluar</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden text-black">
        <header className="bg-white h-20 border-b border-gray-100 flex gap-5 items-center px-10 shadow-sm">
          <img
            src="/logo.svg"
            alt="logo"
            className="w-10 h-10 object-contain transition-all flex-shrink-0"
          />
          <h2 className="text-3xl font-semibold text-primary">
            Klinik dr.Yofli
          </h2>
        </header>

        <main className="flex-1 p-1 md:p-4 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}