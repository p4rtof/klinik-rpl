"use client";

import React, { useState, useEffect } from "react";

export default function PembayaranPage() {
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  const [statsPembayaran, setStatsPembayaran] = useState({ total: 0, lunas: 0, pending: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPembayaran = async () => {
    try {
      const res = await fetch("/api/pembayaran");
      const json = await res.json();
      if (json.success) {
        setTransaksiList(json.data);
        
        // Hitung total uang dan jumlah transaksi otomatis
        const totalTagihan = json.data.reduce((acc: number, curr: any) => acc + curr.jumlah, 0);
        const lunas = json.data.filter((t: any) => t.status === "LUNAS").length;
        const pending = json.data.filter((t: any) => t.status === "BELUM_BAYAR").length;
        
        setStatsPembayaran({ total: totalTagihan, lunas, pending });
      }
    } catch (err) {
      console.error("Gagal memuat pembayaran", err);
    }
  };

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const handleLunas = async (id: string) => {
    if (!confirm("Tandai transaksi ini sebagai LUNAS?")) return;
    try {
      const res = await fetch(`/api/pembayaran/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LUNAS" })
      });
      if (res.ok) fetchPembayaran(); // Refresh tabel biar langsung update!
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  // Logika bar pencarian
  const filteredList = transaksiList.filter((item) => 
    item.pasien?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="relative flex items-center w-full max-w-md">
          <img src="/componen-admin/cari.svg" alt="cari" className="absolute left-4 w-5 h-5 opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Transaksi atau Nama Pasien"
            className="w-full border-2 border-gray-50 rounded-xl py-3 pl-12 pr-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Tabel Pembayaran */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-sm font-bold border-r border-2 border-white/50 text-center uppercase">ID Transaksi</th>
              <th className="px-4 py-3 text-sm font-bold border-r border-2 border-white/50 text-center uppercase">Nomor RM</th>
              <th className="px-4 py-3 text-sm font-bold border-r border-2 border-white/50 text-center uppercase">Nama Pasien</th>
              <th className="px-4 py-3 text-sm font-bold border-r border-2 border-white/50 text-center uppercase">Total Biaya</th>
              <th className="px-4 py-3 text-sm font-bold border-r border-2 border-white/50 text-center uppercase">Status</th>
              <th className="px-4 py-3 text-sm font-bold text-center uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors text-center">
                  <td className="px-4 py-3 text-xs text-gray-500">{item.id.split("-")[0].toUpperCase()}</td>
                  <td className="px-4 py-3 font-bold">{item.pasien?.noRm?.split("-")[0]}</td>
                  <td className="px-4 py-3 font-semibold text-left">{item.pasien?.nama}</td>
                  <td className="px-4 py-3 font-bold text-primary">Rp {item.jumlah.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === "LUNAS" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {item.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "BELUM_BAYAR" ? (
                      <button 
                        onClick={() => handleLunas(item.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        ✔ Terima Dana
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic font-semibold">Selesai</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-lg font-bold italic">
                  Belum ada riwayat pembayaran yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}