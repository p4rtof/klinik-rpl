"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PeriksaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const antreanId = searchParams.get("id");

  const [antrean, setAntrean] = useState<any>(null);
  const [formData, setFormData] = useState({
    diagnosis: "",
    resep: "",
    biayaLayanan: 50000,
    perluRujukan: false,
  });

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await fetch(`/api/antrian/${antreanId}`);
      const json = await res.json();
      if (json.success) setAntrean(json.data);
    };
    if (antreanId) fetchDetail();
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
        alert("Pemeriksaan Selesai! Data dikirim ke Admin untuk cetak transaksi.");
        router.push("/dashboard-dokter");
      }
    } catch (err) {
      alert("Gagal memproses data.");
    }
  };

  if (!antrean) return <div className="p-10 text-center font-bold">Memuat data pasien...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Pemeriksaan Pasien</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Identitas Pasien */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Nama Pasien</p>
              <p className="text-lg font-bold">{antrean.pasien?.nama}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">No. Rekam Medis</p>
              <p className="text-lg font-bold text-primary">{antrean.pasien?.noRm}</p>
            </div>
          </div>

          {/* Form Medis */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Diagnosis Dokter</label>
              <textarea required value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} className="w-full border-2 p-3 rounded-xl h-24 focus:border-primary outline-none" placeholder="Tulis diagnosis hasil pemeriksaan..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Resep Obat & Dosis</label>
              <textarea required value={formData.resep} onChange={(e) => setFormData({...formData, resep: e.target.value})} className="w-full border-2 p-3 rounded-xl h-24 focus:border-primary outline-none" placeholder="Contoh: Paracetamol 500mg 3x1..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Biaya Layanan (Rp)</label>
              <input type="number" value={formData.biayaLayanan} onChange={(e) => setFormData({...formData, biayaLayanan: parseInt(e.target.value)})} className="w-full border-2 p-3 rounded-xl focus:border-primary outline-none" />
            </div>
          </div>

          {/* Opsi Rujukan */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <input type="checkbox" id="rujukan" checked={formData.perluRujukan} onChange={(e) => setFormData({...formData, perluRujukan: e.target.checked})} className="w-5 h-5 accent-primary" />
            <label htmlFor="rujukan" className="font-bold text-primary cursor-pointer">Pasien Membutuhkan Surat Rujukan</label>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => router.back()} className="flex-1 py-4 font-bold text-gray-400">Batal</button>
            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-dark transition-all">Selesai & Serahkan ke Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
}