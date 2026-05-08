"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilDokterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    namaLengkap: "",
    spesialisasi: "",
    noTelepon: "", 
    username: "", 
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const resMe = await fetch("/api/auth/me", { cache: "no-store" }); // Tambah no-store
      const jsonMe = await resMe.json();

      if (!resMe.ok) {
        // Jika gagal, jangan langsung tendang ke login, tapi kasih instruksi
        console.error("Auth gagal");
        return;
      }

      if (jsonMe.success && jsonMe.data) {
        setFormData({
          id: jsonMe.data.id,
          namaLengkap: jsonMe.data.namaLengkap || "",
          spesialisasi: jsonMe.data.spesialisasi || "",
          noTelepon: jsonMe.data.noTelepon || "",
          username: jsonMe.data.username,
        });
      }
    } catch (err) {
      console.error("Koneksi terputus");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return alert("ID Kosong, silakan login ulang!");

    setIsSaving(true);
    try {
      const res = await fetch(`/api/dokter/${formData.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": "ADMIN" // Tetap pakai ini agar backend temanmu mengizinkan
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          spesialisasi: formData.spesialisasi,
          noTelepon: formData.noTelepon,
        }),
      });

      if (res.ok) {
        alert("Profil Berhasil Diperbarui!");
        fetchProfile();
      }
    } catch (err) {
      alert("Gagal simpan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold animate-pulse">Memuat Profil...</div>;

  return (
    <div className="w-full mx-auto space-y-6 text-black">
      <div className="px-2">
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-gray-400 mt-1">Kelola informasi identitas dokter yang bertugas.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <span className="text-3xl font-bold">{formData.namaLengkap ? formData.namaLengkap.charAt(0) : "?"}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{formData.namaLengkap || "Belum ada nama"}</h2>
            <p className="opacity-80">@{formData.username} • Dokter Bertugas</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap & Gelar</label>
              <input 
                required
                type="text" 
                value={formData.namaLengkap}
                onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-primary outline-none font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Spesialisasi</label>
              <input 
                type="text" 
                value={formData.spesialisasi}
                onChange={(e) => setFormData({...formData, spesialisasi: e.target.value})}
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-primary outline-none font-semibold"
                placeholder="Contoh: Dokter Umum / Spesialis Anak"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nomor Telepon</label>
              <input 
                type="text" 
                value={formData.noTelepon}
                onChange={(e) => setFormData({...formData, noTelepon: e.target.value})}
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-primary outline-none font-semibold"
                placeholder="0812..."
              />
            </div>
            <div className="space-y-1 opacity-50">
              <label className="text-xs font-bold text-gray-400 uppercase">Username (Read Only)</label>
              <input 
                disabled
                type="text" 
                value={formData.username}
                className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving || !formData.id}
              className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
        <div className="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-blue-700 font-medium leading-relaxed">
          Informasi yang Anda perbarui di sini akan otomatis muncul pada pilihan <b>Dokter Bertugas</b> saat Admin mendaftarkan kunjungan pasien baru.
        </p>
      </div>
    </div>
  );
}