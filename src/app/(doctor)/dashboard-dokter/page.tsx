"use client";

import React, { useState, useEffect } from "react";

export default function DashboardDokterPage() {
  const [dataAntrean, setDataAntrean] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi ambil data antrean khusus dokter
  const fetchAntreanDokter = async () => {
    try {
      const res = await fetch("/api/antrian"); // Sesuaikan endpoint API Adit
      const json = await res.json();
      if (json.success) {
        setDataAntrean(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data antrean");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAntreanDokter();
  }, []);

  return (
    <div className="space-y-6 text-black">
      <h1 className="text-3xl font-bold">Selamat Datang, dr. Yofli</h1>

      {/* Top Cards: Ringkasan & Pasien Aktif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Ringkasan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl">Ringkasan Pasien Hari Ini</h3>
              <p className="text-primary font-semibold">14/10/2026</p>
              <p className="text-xs text-gray-400">Data berdasarkan pasien anda hari ini</p>
            </div>
          </div>
          <div className="flex gap-10 mt-6">
            <div className="flex items-center gap-4">
              <div className="text-blue-500 bg-blue-50 p-3 rounded-xl">
                 <img src="/componen-admin/pasien.svg" className="w-8 h-8" alt="icon" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pasien Belum Diperiksa</p>
                <p className="text-3xl font-bold text-primary">8</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-blue-500 bg-blue-50 p-3 rounded-xl">
                 <img src="/componen-admin/pasien.svg" className="w-8 h-8" alt="icon" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pasien Sudah Diperiksa</p>
                <p className="text-3xl font-bold text-primary">16</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Pasien Sedang Ditangani */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-xl text-primary mb-4">Pasien yang Sedang Anda Tangani:</h3>
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src="/componen-admin/pasien.svg" className="w-6 h-6" alt="icon" />
                <p className="text-2xl font-extrabold">Troye Sivan</p>
              </div>
              <div className="flex items-center gap-3">
                <img src="/componen-admin/waiting.svg" className="w-6 h-6" alt="icon" />
                <p className="text-gray-600 font-medium text-lg">Keluhan: Rheumatoid Arthritis</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all">
                Lihat Riwayat
              </button>
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all">
                Periksa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Pasien Mengantri */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Pasien Anda yang sedang mengantri</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="border border-gray-200 p-2 rounded-lg text-sm bg-white outline-none">
              <option>Urutkan Berdasarkan</option>
            </select>
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Cari Pasien ..." 
                className="w-full border border-gray-200 p-2 pl-8 rounded-lg text-sm outline-none"
              />
              <img src="/componen-admin/cari.svg" className="w-4 h-4 absolute left-2 top-2.5 opacity-40" alt="search" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary text-white text-center">
              <tr>
                <th className="px-4 py-3 border-r border-white/20">Nomor RM</th>
                <th className="px-4 py-3 border-r border-white/20">Nama Pasien</th>
                <th className="px-4 py-3 border-r border-white/20">Jenis Kelamin</th>
                <th className="px-4 py-3 border-r border-white/20">Usia</th>
                <th className="px-4 py-3 border-r border-white/20 text-center">Keluhan</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-center font-bold">
              {isLoading ? (
                <tr><td colSpan={6} className="py-10">Memuat data...</td></tr>
              ) : (
                dataAntrean.map((item: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">R{9113 + i}</td>
                    <td className="px-4 py-4 text-left">{item.pasien?.nama || "Nama Pasien"}</td>
                    <td className="px-4 py-4">{item.pasien?.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="px-4 py-4">24</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-600 text-left">Rheumatoid Arthritis</td>
                    <td className="px-4 py-4 flex justify-center gap-2">
                      <button className="p-1 hover:bg-green-50 rounded"><img src="/componen-admin/lunas.svg" className="w-5 h-5 invert-0 sepia-0 saturate-100 hue-rotate-0" style={{filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)'}} alt="edit" /></button>
                      <button className="p-1 hover:bg-red-50 rounded"><img src="/componen-admin/waiting.svg" className="w-5 h-5" style={{filter: 'invert(16%) sepia(89%) saturate(6054%) hue-rotate(358deg) brightness(97%) contrast(113%)'}} alt="delete" /></button>
                      <button className="p-1 hover:bg-blue-50 rounded"><img src="/componen-admin/cari.svg" className="w-5 h-5" style={{filter: 'invert(37%) sepia(93%) saturate(1421%) hue-rotate(187deg) brightness(91%) contrast(101%)'}} alt="view" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 p-4 bg-white border-t border-gray-100">
            <button className="text-primary font-bold">{"<"}</button>
            <button className="bg-primary text-white w-8 h-8 rounded-md flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100">2</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100">3</button>
            <button className="text-primary font-bold">{">"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}