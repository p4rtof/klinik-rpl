"use client";

import React, { useState } from "react";

export default function PembayaranPage() {
  // --- STATE UNTUK BACKEND (Hubungkan ke API Adit nanti) ---
  const [transaksiList, setTransaksiList] = useState([]);
  const [statsPembayaran, setStatsPembayaran] = useState({ total: 0, lunas: 0, pending: 0 });

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      
      {/* Header Halaman */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold">Data Transaksi</h1>
          <p className="text-gray-400 mt-1 text-lg">Kelola tagihan dan status pembayaran pasien</p>
        </div>
      </div>

      {/* Ringkasan Status Pembayaran */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img src="/componen-admin/kantong-uang.svg" className="w-15 h-15 opacity-180" alt="" />
          <div>
            <p className="text-gray-500 font-medium">Total Tagihan</p>
            <p className="text-2xl font-bold text-primary">Rp {statsPembayaran.total.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img src="/componen-admin/lunas.svg" className="w-15 h-15 opacity-180" alt="" />
          <div>
            <p className="text-gray-500 font-medium">Sudah Lunas</p>
            <p className="text-2xl font-bold text-green-600">{statsPembayaran.lunas} Transaksi</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img src="/componen-admin/waiting.svg" className="w-15 h-15 opacity-180" alt="" />
          <div>
            <p className="text-gray-500 font-medium">Menunggu Pembayaran</p>
            <p className="text-2xl font-bold text-orange-500">{statsPembayaran.pending} Transaksi</p>
          </div>
        </div>
      </div>

      {/* Bar Pencarian */}
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
            placeholder="Cari ID Transaksi atau Nama Pasien"
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


      {/* Tabel Pembayaran */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">ID Transaksi</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nomor RM</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nama Pasien</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Total Biaya</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Tanggal</th>
              <th className="px-4 py-2 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Status</th>
              <th className="px-4 py-2 text-lg font-bold text-center uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transaksiList.length > 0 ? (
              transaksiList.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Data akan di-map di sini */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl opacity-20">🧾</div>
                    <p className="text-gray-400 text-xl italic font-medium">
                      Belum ada riwayat pembayaran hari ini.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}