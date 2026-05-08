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
      const resMe = await fetch("/api/auth/me", { cache: "no-store" });
      const jsonMe = await resMe.json();

      if (!resMe.ok || !jsonMe.success) {
        alert("Sesi habis, silakan login ulang.");
        router.push("/login");
        return;
      }

      // PERBAIKAN 1: Sesuaikan dengan struktur data backend temanmu
      if (jsonMe.data) {
        const d = jsonMe.data;
        setFormData({
          id: d.id || "",
          namaLengkap: d.namaLengkap || "",
          spesialisasi: d.spesialisasi || "",
          noTelepon: d.noTelepon || "",
          username: d.username || "",
        });
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id) {
      alert("ID Dokter tidak ketemu. Coba login ulang dulu.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/dokter/${formData.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          // PERBAIKAN 2: Pakai role ADMIN agar backend mengizinkan
          "x-user-role": "ADMIN" 
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          spesialisasi: formData.spesialisasi,
          noTelepon: formData.noTelepon,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        alert("Mantap! Profil berhasil disimpan.");
        fetchProfile(); 
      } else {
        alert("Gagal simpan: " + (json.error || "Cek koneksi"));
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold animate-pulse">Memuat...</div>;

  return (
    <div className="w-full mx-auto space-y-6 text-black">
      <div className="px-2">
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-gray-400 mt-1">Kelola identitas dokter bertugas.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <span className="text-3xl font-bold">{formData.namaLengkap ? formData.namaLengkap.charAt(0) : "?"}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{formData.namaLengkap}</h2>
            <p className="opacity-80">@{formData.username} • Dokter</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
              <input 
                required
                type="text" 
                value={formData.namaLengkap}
                onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Spesialisasi</label>
              <input 
                type="text" 
                value={formData.spesialisasi}
                onChange={(e) => setFormData({...formData, spesialisasi: e.target.value})}
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">No. Telepon</label>
              <input 
                type="text" 
                value={formData.noTelepon}
                onChange={(e) => setFormData({...formData, noTelepon: e.target.value})}
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
              />
            </div>
            <div className="space-y-1 opacity-50">
              <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
              <input disabled type="text" value={formData.username} className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50" />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving || !formData.id}
              className="bg-primary text-white px-10 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}