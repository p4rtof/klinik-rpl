"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RiwayatPasienPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const antreanId = searchParams.get("id");

  const [pasien, setPasien] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk menyimpan ID riwayat mana yang sedang dibuka detailnya
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!antreanId) {
        setIsLoading(false);
        return;
      }
        
      setIsLoading(true);
      try {
        const resAntrean = await fetch(`/api/antrian/${antreanId}`);
        const jsonAntrean = await resAntrean.json();

        if (jsonAntrean.success && jsonAntrean.data) {
          const dataPasien = jsonAntrean.data.pasien;
          setPasien(dataPasien);

          const resRiwayat = await fetch(`/api/rekam-medis/pasien/${dataPasien.id}`);
          const jsonRiwayat = await resRiwayat.json();
          
          if (jsonRiwayat.success) {
            setRiwayat(jsonRiwayat.data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [antreanId]);

  const formatTanggal = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const toggleDetail = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) return <div className="p-10 text-center font-bold animate-pulse text-primary">Memuat riwayat kesehatan...</div>;
  if (!pasien) return <div className="p-10 text-center text-red-500 font-bold">Data pasien tidak ditemukan.</div>;

  return (
    <div className="w-full space-y-6 text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-primary">Riwayat Pemeriksaan</h1>
          <p className="text-gray-400 font-bold">Arsip rekam medis lengkap pasien</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-black hover:bg-gray-200 transition"
        >
          Kembali
        </button>
      </div>

      {/* INFORMASI PASIEN (READ-ONLY) */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 flex flex-col items-center justify-center border-r border-gray-50 pr-6">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-3xl font-black mb-2 uppercase">
              {pasien.nama?.charAt(0) || "?"}
            </div>
            <p className="text-md font-black text-primary uppercase tracking-widest">{pasien.noRm}</p>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-md font-black text-gray-400 uppercase">Nama Pasien</p>
              <p className="font-bold text-gray-800 uppercase">{pasien.nama}</p>
            </div>
            <div>
              <p className="text-md font-black text-gray-400 uppercase">Jenis Kelamin</p>
              <p className="font-bold text-gray-800">{pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki": "Perempuan"}</p>
            </div>
            <div>
              <p className="text-md font-black text-gray-400 uppercase">Kontak</p>
              <p className="font-bold text-gray-800">{pasien.noTelepon || "-"}</p>
            </div>
            <div className="lg:col-span-3">
              <p className="text-md font-black text-gray-400 uppercase">Alamat Pasien</p>
              <p className="font-bold text-gray-800 italic">{pasien.alamat || "Alamat belum diisi"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE RIWAYAT */}
      <div className="space-y-4 px-2">
        <h2 className="text-xl font-black flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full"></span>
          Timeline Pemeriksaan
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {riwayat.length > 0 ? (
            riwayat.map((h) => (
              <div key={h.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4 hover:border-primary/30 transition">
                
                {/* HEADER KARTU */}
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white text-md font-black px-3 py-1 rounded-full uppercase">
                      {formatTanggal(h.tanggal)}
                    </div>
                    <span className="text-md font-bold text-gray-400 uppercase">ID: {h.id.split('-')[0]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-md font-black text-gray-400">Dokter: <span className="text-gray-800">{h.dokter?.namaLengkap}</span></div>
                    <button 
                      onClick={() => toggleDetail(h.id)}
                      className="text-md font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                      {expandedId === h.id ? "Tutup Detail" : "Lihat Detail"}
                    </button>
                  </div>
                </div>

                {/* RINGKASAN (Selalu Tampil) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-md font-black text-gray-400 uppercase tracking-widest">Diagnosis Utama</p>
                      <p className="font-extrabold text-gray-800 text-lg">
                        {Array.isArray(h.diagnosis) && h.diagnosis.length > 0
                          ? h.diagnosis.map((d: any) => d.diagnosis).join(", ")
                          : "Tidak ada diagnosis"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keluhan / Tindakan</p>
                      <p className="text-sm font-bold text-gray-600 leading-relaxed">
                        <span className="italic">"{h.keluhan || "Tidak ada catatan keluhan"}"</span>
                        <br />
                        <span className="text-gray-500 mt-1 block">Tindakan: {h.tindakan || "-"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Resep Obat</p>
                      <div className="text-sm font-black text-blue-900 leading-relaxed">
                        {Array.isArray(h.resep) && h.resep.length > 0 ? (
                          <ul className="list-disc ml-4 font-medium text-md">
                            {h.resep.map((r: any) => (
                              <li key={r.id}>
                                <span className="font-bold">{r.obatId}</span> {r.dosis ? `- ${r.dosis}` : ""} <span className="italic text-blue-700">({r.aturan})</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-md">Tidak ada resep obat</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-md font-black text-gray-400 uppercase tracking-widest">Tujuan Rujukan</p>
                        <p className="text-md font-bold text-gray-700">
                           {h.rujukan ? h.rujukan.tujuan : "-"}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-md font-black uppercase ${Array.isArray(h.rujukan) && h.rujukan.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {h.rujukan ? 'DIRUJUK' : 'TANPA RUJUKAN'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE DETAIL (Tampil jika tombol ditekan) */}
                {expandedId === h.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    
                    {/* Kolom Kiri: Anamnesis & TTV */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-md font-bold text-primary border-b border-primary/10 pb-1 mb-2 uppercase tracking-wide">Anamnesis</p>
                        <div className="grid grid-cols-2 gap-2 text-md">
                          <div><span className="text-gray-500 font-semibold block">Keluhan Utama:</span> <span className="font-bold">{h.anamnesisKeluhanUtama || h.keluhan || "-"}</span></div>
                          <div><span className="text-gray-500 font-semibold block">Riw. Penyakit Sekarang (RPS):</span> <span className="font-bold">{h.anamnesisRps || "-"}</span></div>
                          <div><span className="text-gray-500 font-semibold block">Riw. Penyakit Dahulu (RPD):</span> <span className="font-bold">{h.anamnesisRpd || "-"}</span></div>
                          <div><span className="text-gray-500 font-semibold block">Riw. Obat / Alergi:</span> <span className="font-bold">{h.anamnesisRiwayatObat || "-"}</span></div>
                        </div>
                      </div>

                      <div>
                        <p className="text-md font-bold text-primary border-b border-primary/10 pb-1 mb-2 uppercase tracking-wide">Tanda-tanda Vital</p>
                        <div className="grid grid-cols-3 gap-2 text-md bg-gray-50 p-3 rounded-xl">
                          <div><span className="text-gray-500 font-semibold block">Tekanan Darah:</span> <span className="font-bold">{h.tdSistolik ? `${h.tdSistolik}/${h.tdDiastolik}` : "-"} mmHg</span></div>
                          <div><span className="text-gray-500 font-semibold block">Nadi:</span> <span className="font-bold">{h.nadi || "-"} x/mnt</span></div>
                          <div><span className="text-gray-500 font-semibold block">Suhu:</span> <span className="font-bold">{h.suhu || "-"} °C</span></div>
                          <div><span className="text-gray-500 font-semibold block">Resp. Rate:</span> <span className="font-bold">{h.rr || "-"} x/mnt</span></div>
                          <div><span className="text-gray-500 font-semibold block">SpO2:</span> <span className="font-bold">{h.spo2 || "-"} %</span></div>
                          <div><span className="text-gray-500 font-semibold block">BB / TB:</span> <span className="font-bold">{h.bb || "-"}/{h.tb || "-"}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Kolom Kanan: Fisik, Tindakan, Obat */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-md font-bold text-primary border-b border-primary/10 pb-1 mb-2 uppercase tracking-wide">Pemeriksaan Fisik & Tindakan</p>
                        <div className="text-md space-y-2">
                          <p><span className="text-gray-500 font-semibold block">Pemeriksaan Fisik:</span> <span className="font-bold">{h.pemeriksaanFisik || "-"}</span></p>
                          <p><span className="text-gray-500 font-semibold block">Tindakan Medis:</span> <span className="font-bold">{h.tindakan || "-"}</span></p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                        <p className="text-md font-black text-blue-700 uppercase tracking-widest mb-1">Resep Obat yang Diberikan</p>
                        <div className="text-md font-black text-blue-900 leading-relaxed">
                          {Array.isArray(h.resep) && h.resep.length > 0 ? (
                            <ul className="list-disc ml-4 font-medium text-md">
                              {h.resep.map((r: any) => (
                                <li key={r.id}>
                                  <span className="font-bold">{r.obatId}</span> {r.dosis ? `- ${r.dosis}` : ""} <span className="italic text-blue-700">({r.aturan})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="italic text-md">Tidak ada resep obat</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-400 font-bold italic">Belum ada riwayat rekam medis untuk pasien ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiwayatPasienPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-bold">
        Memuat Halaman...
      </div>
    }>
      <RiwayatPasienPageContent />
    </React.Suspense>
  );
}