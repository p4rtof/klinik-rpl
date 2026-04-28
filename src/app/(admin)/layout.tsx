"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/dashboard" },
    { name: "Data Pasien", icon: "img/pasien.png", path: "#" },
    { name: "Pembayaran", icon: "💳", path: "#" },
  ];

  return (
    <div className="flex h-screen bg-blue-50/30">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm ${isOpen ? "w-64" : "w-20"}`}>
        <div className="p-4 h-16 border-b border-gray-100 flex items-center justify-between overflow-hidden">
          {isOpen && <span className="text-xl font-bold text-primary italic whitespace-nowrap">🏥 Klinik Sehat</span>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-blue-50 rounded-lg text-primary transition-colors">
            {isOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-all group ${
                item.name === "Dashboard" 
                ? "bg-primary text-white shadow-lg shadow-blue-200" 
                : "text-gray-500 hover:bg-primary hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.name}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 border-b border-gray-100 flex justify-between items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700">Panel Admin</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">Admin Utama</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold border-2 border-primary">A</div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}