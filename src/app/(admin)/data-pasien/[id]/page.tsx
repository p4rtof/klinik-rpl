"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DetailPasienPage() {
  const params = useParams(); // Menangkap ID tampilan (P0001)
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid"); // Menangkap UUID asli untuk fetch API

  const [pasien, setPasien] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!uid) return;
      try {
        // Mengambil data detail pasien dari backend
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

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500 font-bold">Memuat data pasien...</div>;
  if (!pasien) return <div className="p-10 text-center text-red-500 font-bold">Data pasien tidak ditemukan.</div>;

  // Menghitung jumlah riwayat berobat
  const jumlahBerobat = pasien.rekamMedis?.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-black pb-10">
      {/* Navigasi Kembali */}
      <Link 
        href="/data-pasien"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"
      >
        <span>←</span> Kembali ke Daftar
      </Link>

      {/* Card Profil Utama */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
            {pasien.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">{pasien.nama}</h1>
            <p className="text-gray-400 font-bold">ID Tampilan: {params.id}</p>
            <p className="text-xs text-gray-300">No. RM: {pasien.noRm || "-"}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-6 py-4 rounded-2xl text-center flex flex-col justify-center">
          <p className="text-xs text-blue-400 font-black uppercase tracking-widest">Total Berobat</p>
          <p className="text-4xl font-black text-primary">{jumlahBerobat}x</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DATA DIRI */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Informasi Pasien</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-black">Jenis Kelamin</p>
                <p className="font-bold text-gray-700">{pasien.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-black">Tanggal Lahir</p>
                <p className="font-bold text-gray-700">
                  {new Date(pasien.tanggalLahir).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-black">Telepon</p>
                <p className="font-bold text-gray-700">{pasien.noTelepon || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-black">Alamat</p>
                <p className="text-sm font-medium text-gray-600 leading-relaxed">{pasien.alamat || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIWAYAT PEMERIKSAAN */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
              Riwayat Rekam Medis
            </h2>
            
            {pasien.rekamMedis && pasien.rekamMedis.length > 0 ? (
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                {pasien.rekamMedis.map((rm: any) => (
                  <div key={rm.id} className="relative pl-8">
                    {/* Dot Timeline */}
                    <div className="absolute left-0 top-1 w-4 h-4 bg-white border-4 border-primary rounded-full"></div>
                    
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-xs text-primary font-black mb-2">
                        {new Date(rm.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase">Keluhan Utama</p>
                          <p className="text-sm font-bold text-gray-700">{rm.keluhan}</p>
                        </div>
                        
                        {/* Data Diagnosis */}
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Diagnosis</p>
                          <div className="flex flex-wrap gap-2">
                            {rm.diagnosis?.map((d: any) => (
                              <span key={d.id} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full font-bold text-gray-600">
                                {d.deskripsi}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Data Resep */}
                        {rm.resep?.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-2">Resep Obat</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {rm.resep.map((r: any) => (
                                <li key={r.id} className="text-xs bg-green-50 text-green-700 p-2 rounded-lg border border-green-100">
                                  <span className="font-black block">{r.namaObat}</span>
                                  <span className="opacity-80">{r.dosis} - {r.aturanPakai}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300 italic">
                Belum ada catatan medis untuk pasien ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}