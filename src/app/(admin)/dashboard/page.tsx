import React from 'react';

export default function DashboardPage() {
  const stats = [
    { label: "Total Pasien", value: "1,250", trend: "+12%", color: "bg-blue-500" },
    { label: "Dokter Aktif", value: "12", trend: "Tetap", color: "bg-teal-500" },
    { label: "Antrean Hari Ini", value: "45", trend: "+5", color: "bg-orange-500" },
    { label: "Selesai", value: "32", trend: "+8", color: "bg-green-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary to-primary-dark p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Selamat Datang, Admin! 👋</h1>
          <p className="mt-2 text-blue-50 opacity-90">Sistem manajemen klinik sudah siap. Pantau aktivitas hari ini di sini.</p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🏥</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white ${item.color}`}>{item.trend}</span>
            </div>
            <h3 className="text-3xl font-bold mt-2 text-gray-800">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Activity / Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Antrean Pemeriksaan Terbaru</h3>
          <button className="text-primary text-sm font-bold hover:underline">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4">Pasien</th>
                <th className="px-6 py-4">Keluhan</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"></div>
                      <span className="font-bold text-gray-700">Pasien #{i + 101}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Pemeriksaan rutin mingguan</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Sedang Antre</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}