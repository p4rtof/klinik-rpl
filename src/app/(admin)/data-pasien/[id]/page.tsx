"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DetailPasienPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [pasien, setPasien] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]); // State untuk menyimpan riwayat
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Detail Pasien
        const resPasien = await fetch(`/api/pasien/${id}`, {
          headers: { "x-user-role": "ADMIN" },
        });
        const jsonPasien = await resPasien.json();
        
        if (jsonPasien.success) {
          setPasien(jsonPasien.data);

          // 2. Ambil Riwayat Rekam Medis Pasien
          const resRiwayat = await fetch(`/api/rekam-medis/pasien/${id}`, {
            headers: { "x-user-role": "ADMIN" },
          });
          const jsonRiwayat = await resRiwayat.json();
          if (jsonRiwayat.success) {
            setRiwayat(jsonRiwayat.data);
          }
        } else {
          alert("Gagal memuat detail pasien");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="text-center mt-20 text-xl font-bold text-gray-500 font-sans">Memuat data...</div>;
  }

  if (!pasien) {
    return <div className="text-center mt-20 text-xl font-bold text-red-500 font-sans">Pasien tidak ditemukan.</div>;
  }

  return (
    <div className="w-full mx-auto space-y-6 text-black">
      {/* HEADER & TOMBOL KEMBALI */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold">Detail Pasien</h1>
          <p className="text-gray-400 mt-1">Informasi lengkap dan riwayat rekam medis</p>
        </div>
      </div>

      {/* KARTU INFORMASI PASIEN */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{pasien.nama}</h2>
              <p className="text-primary font-bold text-lg mt-1">{pasien.noRm || "Belum ada No. RM"}</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl text-sm">
              Pasien Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-lg">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase mb-1">Tanggal Lahir</p>
              <p className="font-semibold">
                {new Date(pasien.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase mb-1">Jenis Kelamin</p>
              <p className="font-semibold">{pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase mb-1">Nomor Telepon</p>
              <p className="font-semibold">{pasien.noTelepon || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase mb-1">Alamat Lengkap</p>
              <p className="font-semibold">{pasien.alamat || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT REKAM MEDIS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Riwayat Rekam Medis</h3>
        
        {riwayat.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-50 uppercase font-black">
                  <th className="pb-4">Tanggal</th>
                  <th className="pb-4">Diagnosis</th>
                  <th className="pb-4 ">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {riwayat.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-4 font-medium text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-red-500  text-md">
                        {item.diagnosis?.[0]?.diagnosis || "Diagnosis Umum"}
                      </p>
                    </td>
                    <td className="py-4 text-left font-bold text-primary">
                      {item.tindakan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <p className="text-gray-400 italic">Data riwayat medis belum tersedia untuk pasien ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}