"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardDokterPage() {
  const [antreanList, setAntreanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ringkasan, setRingkasan] = useState({
    total: 0,
    menunggu: 0,
    selesai: 0,
  });

  // Ambil pasien pertama yang statusnya "MENUNGGU" untuk ditampilkan di kartu kanan
  const pasienSaatIni: any = antreanList.find((a: any) => a.status === "MENUNGGU");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resAntrean = await fetch("/api/antrian");
      const json = await resAntrean.json();
      if (json.success) {
        setAntreanList(json.data);
        setRingkasan({
          total: json.data.length,
          menunggu: json.data.filter((a: any) => a.status === "MENUNGGU").length,
          selesai: json.data.filter((a: any) => a.status === "SELESAI").length,
        });
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format Tanggal Hari Ini
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="w-full space-y-6 text-black">
      <div className="px-2 mb-3">
        <h1 className="text-3xl font-bold">Dashboard Pemeriksaan</h1>
        <p className="text-gray-400 mt-1 text-lg">
          Kelola antrean dan rekam medis pasien hari ini.
        </p>
      </div>

      {/* Grid Kartu Atas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
        
        {/* KARTU KIRI: Ringkasan & Tanggal */}
        <div className="bg-white p-6 border shadow-sm border-gray-100 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl font-bold">Ringkasan Pasien</p>
              <p className="text-sm text-gray-400">Data pasien Anda hari ini</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold">
              {tanggalHariIni}
            </div>
          </div>
          
          <div className="flex gap-4">
            <StatCard
              title="Belum Diperiksa"
              value={ringkasan.menunggu}
              icon="/componen-admin/waiting.svg"
              color="bg-red-50"
              textColor="text-red-600"
            />
            <StatCard
              title="Sudah Diperiksa"
              value={ringkasan.selesai}
              icon="/componen-admin/lunas.svg"
              color="bg-green-50"
              textColor="text-green-600"
            />
          </div>
        </div>

        {/* KARTU KANAN: Pasien Saat Ini / Aksi Cepat */}
        <div className="bg-white p-6 border shadow-sm border-gray-100 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <p className="text-xl font-bold">Pasien Saat Ini</p>
            <p className="text-sm text-gray-400">Pasien urutan teratas yang menunggu</p>
          </div>

          {pasienSaatIni ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="text-lg font-bold">{pasienSaatIni.pasien?.nama}</p>
                <p className="text-xs text-primary font-bold tracking-widest">{pasienSaatIni.pasien?.noRm}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/rekam-medis?id=${pasienSaatIni.id}`}
                  className="bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-200 transition-all"
                >
                  Lihat Riwayat
                </Link>
                <Link
                  href={`/periksa?id=${pasienSaatIni.id}`}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  Periksa
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-2xl italic text-gray-400">
              Tidak ada pasien dalam antrean menunggu.
            </div>
          )}
        </div>
      </div>

      {/* Tabel Antrean */}
      <div className="bg-white rounded-3xl mx-2 shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold">Daftar Antrean Hari Ini</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-4 text-center">No</th>
              <th className="px-6 py-4">Pasien</th>
              <th className="px-6 py-4 text-center">Jam</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-bold">
            {antreanList.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-5 text-center text-2xl text-primary font-black">
                  {String(item.nomorAntrian).padStart(2, '0')}
                </td>
                <td className="px-6 py-5">
                  <p className="text-lg text-gray-800">{item.pasien?.nama}</p>
                  <p className="text-xs text-gray-400 font-medium tracking-tighter">
                    {item.pasien?.noRm}
                  </p>
                </td>
                <td className="px-6 py-5 text-center text-gray-500 font-medium">
                  {item.jam}
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black ${
                      item.status === "MENUNGGU" 
                      ? "bg-yellow-100 text-yellow-700" 
                      : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/rekam-medis?id=${item.id}`}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                      title="Riwayat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </Link>
                    {item.status === "MENUNGGU" && (
                      <Link
                        href={`/periksa?id=${item.id}`}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                      >
                        Periksa
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, textColor }: any) {
  return (
    <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-50 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <img src={icon} className="w-6 h-6" alt="icon" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{title}</p>
        <p className={`text-2xl font-black ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}