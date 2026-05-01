"use client";

import React, { useState } from "react";

export default function DataPasienPage() {
  // --- STATE UNTUK BACKEND (Hubungkan ke API Adit nanti) ---
  const [pasienList, setPasienList] = useState([]); // Array kosong untuk menampung data dari backend

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      
      {/* Header Halaman */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold">Data Pasien</h1>
          <p className="text-gray-400 mt-1 text-lg">Kelola informasi lengkap seluruh pasien klinik</p>
        </div>
        <button className="bg-green-theme hover:bg-green-theme-dark text-2xl text-white px-6 py-3 rounded-xl font-bold flex hover:cursor-pointer items-center gap-2 transition-all active:scale-95 shadow-md">
          <span className="text-2xl">+</span> Registrasi Pasien Baru
        </button>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="relative flex items-center w-full max-w-md">
          <img 
            src="/componen-admin/cari.svg" 
            alt="cari" 
            className="absolute left-4 w-5 h-5 opacity-40" 
          />
          <input
            type="text"
            placeholder="Cari berdasarkan Nama atau Nomor RM..."
            className="w-full border-2 border-gray-50 rounded-xl py-3 pl-12 pr-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
        
        <div className="flex gap-3">
          {/* Tombol Filter Opsional */}
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Tabel Data Pasien */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">ID pasien</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nama Lengkap</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Jenis Kelamin</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Tgl Lahir</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">nomor telepon</th>
              <th className="px-4 py-2 text-lg font-bold text-center uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pasienList.length > 0 ? (
              pasienList.map((pasien, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Mapping data pasien akan ada di sini nanti */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                      <img src="/componen-admin/pasien.svg" className="w-10 h-10 opacity-20" alt="" />
                    </div>
                    <p className="text-gray-400 text-xl italic font-medium">
                      Belum ada data pasien yang terdaftar.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Simple */}
      <div className="flex justify-between items-center px-4 py-2 text-gray-500 font-medium text-lg">
        <p>Menampilkan 0 data pasien</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-30" disabled>Sebelumnya</button>
          <button className="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-30" disabled>Selanjutnya</button>
        </div>
      </div>
    </div>
  );
}