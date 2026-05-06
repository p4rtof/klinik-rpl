"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DetailPasienPage() {
  const params = useParams(); // Ini akan menangkap "P0001" dari URL
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid"); // Ini menangkap UUID rahasia kita

  const [pasien, setPasien] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      // Pastikan ada UUID sebelum menembak API
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        // Tembak API menggunakan UUID asli agar backend Adit tidak error
        const res = await fetch(`/api/pasien/${uid}`);
        const json = await res.json();
        if (json.success) {
          setPasien(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil detail pasien");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [uid]);

  if (loading) return <div className="p-10 text-center font-bold text-gray-500 text-xl mt-10 animate-pulse">Memuat data pasien...</div>;
  if (!pasien) return <div className="p-10 text-center font-bold text-red-500 text-xl mt-10">Data pasien tidak ditemukan atau URL tidak valid.</div>;

  return (
    <div className="w-full mx-auto space-y-6 text-black relative pt-4">
      {/* Tombol Kembali */}
      <Link 
        href="/data-pasien"
        className="inline-flex items-center gap-2 text-primary font-bold hover:underline bg-blue-50 px-5 py-2.5 rounded-xl transition-all hover:bg-blue-100 w-fit"
      >
        <span className="text-xl">←</span> Kembali ke Data Pasien
      </Link>
      
      {/* Header Detail */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profil Detail Pasien</h1>
          <p className="text-gray-400">Menampilkan informasi medis dan data diri pasien</p>
        </div>
        <div className="bg-primary text-white px-6 py-3 rounded-2xl text-2xl font-extrabold shadow-md">
          {params.id} {/* Ini akan menampilkan "P0001" */}
        </div>
      </div>
      
      {/* Kartu Informasi */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-primary-dark mb-6 border-b pb-4">Informasi Pribadi</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
          <div>
            <p className="text-sm text-gray-400 uppercase font-bold mb-1 tracking-wider">Nama Lengkap</p>
            <p className="font-semibold text-xl">{pasien.nama}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 uppercase font-bold mb-1 tracking-wider">Nomor Induk Kependudukan (NIK)</p>
            <p className="font-semibold text-xl">{pasien.nik}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 uppercase font-bold mb-1 tracking-wider">Tanggal Lahir</p>
            <p className="font-semibold text-xl">
              {new Date(pasien.tanggalLahir).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 uppercase font-bold mb-1 tracking-wider">Jenis Kelamin</p>
            <p className="font-semibold text-xl">{pasien.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 uppercase font-bold mb-1 tracking-wider">Nomor Telepon</p>
            <p className="font-semibold text-xl">{pasien.noTelepon || "-"}</p>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400 uppercase font-bold mb-1 tracking-wider">Alamat Lengkap</p>
            <p className="font-semibold text-xl bg-gray-50 p-4 rounded-xl border border-gray-100">
              {pasien.alamat || "Alamat belum diisi oleh petugas."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}