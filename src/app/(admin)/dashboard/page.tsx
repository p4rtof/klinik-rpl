import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Overview Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan data klinik dan jadwal hari ini.</p>
      </div>

      {/* Grid Statistik (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Pasien */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Pasien</p>
            <h3 className="text-2xl font-bold text-gray-800">1,245</h3>
            <p className="text-xs text-green-500 mt-2 font-medium">+12% dari bulan lalu</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
            🏥
          </div>
        </div>

        {/* Card 2: Dokter Aktif */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Dokter Aktif</p>
            <h3 className="text-2xl font-bold text-gray-800">24</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">4 Dokter sedang praktik</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-xl">
            👨‍⚕️
          </div>
        </div>

        {/* Card 3: Jadwal Hari Ini */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Jadwal Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-800">48</h3>
            <p className="text-xs text-orange-500 mt-2 font-medium">12 menunggu antrean</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xl">
            📅
          </div>
        </div>

        {/* Card 4: Pendapatan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Pendapatan Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-800">Rp 4.5M</h3>
            <p className="text-xs text-green-500 mt-2 font-medium">+5% dari kemarin</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl">
            💰
          </div>
        </div>
      </div>

      {/* Tabel Jadwal Terdekat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Antrean Pemeriksaan Terdekat</h2>
          <button className="text-teal-600 text-sm font-medium hover:underline">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">No. Antrean</th>
                <th className="p-4 font-medium">Nama Pasien</th>
                <th className="p-4 font-medium">Dokter Tujuan</th>
                <th className="p-4 font-medium">Poli</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">A-001</td>
                <td className="p-4 text-gray-600">Budi Santoso</td>
                <td className="p-4 text-gray-600">dr. Sarah Wijaya</td>
                <td className="p-4 text-gray-600">Poli Umum</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                    Menunggu
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">B-012</td>
                <td className="p-4 text-gray-600">Siti Aminah</td>
                <td className="p-4 text-gray-600">dr. Andi Pratama</td>
                <td className="p-4 text-gray-600">Poli Gigi</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">A-002</td>
                <td className="p-4 text-gray-600">Ahmad Dahlan</td>
                <td className="p-4 text-gray-600">dr. Sarah Wijaya</td>
                <td className="p-4 text-gray-600">Poli Umum</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    Diperiksa
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}