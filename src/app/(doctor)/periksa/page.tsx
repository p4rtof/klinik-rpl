"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PeriksaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const antreanId = searchParams.get("id");

  const [antrean, setAntrean] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    diagnosis: "",
    resep: "",
    biayaLayanan: 50000,
    perluRujukan: false,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/antrian/${antreanId}`);
        const json = await res.json();
        
        if (json.success) {
          setAntrean(json.data);
          
          // Ambil Riwayat Rekam Medis Pasien
          const resHistory = await fetch(`/api/rekam-medis/pasien/${json.data.pasienId}`);
          const jsonHistory = await resHistory.json();
          if (jsonHistory.success) setHistory(jsonHistory.data);
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (antreanId) fetchAllData();
  }, [antreanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rekam-medis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pasienId: antrean.pasienId,
          dokterId: antrean.dokterId,
          keluhan: antrean.keluhan || "Tidak ada keluhan",
          diagnosis: formData.diagnosis,
          resep: formData.resep,
          biayaLayanan: formData.biayaLayanan,
          statusRujukan: formData.perluRujukan ? "PERLU_RUJUKAN" : "TIDAK_PERLU",
          antreanId: antrean.id,
        }),
      });

      if (res.ok) {
        alert("Pemeriksaan Selesai!");
        router.push("/dashboard-dokter");
      }
    } catch (err) {
      alert("Gagal memproses data.");
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold animate-pulse">Memuat data pemeriksaan...</div>;
  if (!antrean) return <div className="p-10 text-center text-red-500 font-bold">Data tidak ditemukan.</div>;

  return (
    <div className="w-full space-y-6 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KIRI: Data Pasien */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold">Data Pasien Yang Sedang Anda Tangani</h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pasien</p>
              <p className="text-xl font-extrabold text-gray-800">{antrean.pasien?.nama}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                <p className="font-bold text-gray-700">{antrean.pasien?.jenisKelamin  === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Lahir</p>
                <p className="font-bold text-gray-700">
                  {antrean.pasien?.tanggalLahir ? new Date(antrean.pasien.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: Rekam Medis Terakhir */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Rekam Medis Terakhir</h2>
          </div>

          <div className="overflow-auto max-h-[180px]">
            {history.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-50">
                    <th className="pb-2 font-bold uppercase text-[10px]">Tanggal</th>
                    <th className="pb-2 font-bold uppercase text-[10px]">Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.slice(0, 3).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-gray-500">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 font-semibold text-gray-700">
                        {/* INI YANG DIPERBAIKI */}
                        {Array.isArray(item.diagnosis) 
                          ? item.diagnosis.map((d: any) => d.deskripsi).join(", ") 
                          : (item.diagnosis?.deskripsi || "-")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-10 text-gray-400 italic text-sm">Belum ada riwayat pemeriksaan.</p>
            )}
          </div>
        </div>
      </div>

      {/* BAWAH: Hasil Pemeriksaan */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Hasil Pemeriksaan</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnosis Dokter</label>
            <textarea 
              required 
              value={formData.diagnosis} 
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} 
              className="w-full border-2 border-gray-100 p-4 rounded-2xl h-32 focus:border-primary outline-none transition-all font-medium" 
              placeholder="Tuliskan diagnosis lengkap hasil pemeriksaan fisik..." 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resep Obat & Aturan Pakai</label>
            <textarea 
              required 
              value={formData.resep} 
              onChange={(e) => setFormData({...formData, resep: e.target.value})} 
              className="w-full border-2 border-gray-100 p-4 rounded-2xl h-32 focus:border-primary outline-none transition-all font-medium" 
              placeholder="Contoh: Paracetamol 500mg (3x1 sesudah makan)..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Biaya Layanan (Rp)</label>
              <input 
                type="number" 
                value={formData.biayaLayanan} 
                onChange={(e) => setFormData({...formData, biayaLayanan: parseInt(e.target.value)})} 
                className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-primary outline-none font-bold text-lg" 
              />
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <input 
                type="checkbox" 
                id="rujukan" 
                checked={formData.perluRujukan} 
                onChange={(e) => setFormData({...formData, perluRujukan: e.target.checked})} 
                className="w-5 h-5 accent-primary cursor-pointer" 
              />
              <label htmlFor="rujukan" className="font-bold text-primary cursor-pointer select-none">Pasien Butuh Rujukan Spesialis</label>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              Kembali
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98]"
            >
              Simpan & Selesai Pemeriksaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}