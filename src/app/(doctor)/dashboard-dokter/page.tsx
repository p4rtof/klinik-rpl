"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardDokterPage() {
  const [antreanList, setAntreanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ringkasan, setRingkasan] = useState({ total: 0, menunggu: 0, selesai: 0 });

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

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      <div className="px-2">
        <h1 className="text-3xl font-bold">Dashboard Pemeriksaan</h1>
        <p className="text-gray-400 mt-1 text-lg">Kelola antrean dan rekam medis pasien hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pasien" value={ringkasan.total} icon="/component-doctor/pasien.svg" color="bg-blue-100" />
        <StatCard title="Menunggu" value={ringkasan.menunggu} icon="/componen-admin/waiting.svg" color="bg-yellow-100" textColor="text-yellow-600" />
        <StatCard title="Selesai Diperiksa" value={ringkasan.selesai} icon="/componen-admin/lunas.svg" color="bg-green-100" textColor="text-green-600" />
      </div>

      {/* Tabel Antrean */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-primary text-white uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4 text-center">No. Antrean</th>
              <th className="px-6 py-4">Nama Pasien</th>
              <th className="px-6 py-4 text-center">Jam</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-bold">
            {antreanList.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-5 text-center text-2xl text-primary font-black">{item.nomorAntrian}</td>
                <td className="px-6 py-5">
                  <p className="text-lg">{item.pasien?.nama}</p>
                  <p className="text-xs text-gray-400 font-medium">{item.pasien?.noRm}</p>
                </td>
                <td className="px-6 py-5 text-center text-gray-500">{item.jam}</td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-xs ${item.status === "MENUNGGU" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-center flex justify-center gap-2 mt-2">
                  <Link href={`/rekam-medis?search=${item.pasien?.nama}`} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition-all">
                    Riwayat
                  </Link>
                  {item.status === "MENUNGGU" && (
                    <Link href={`/periksa?id=${item.id}`} className="bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-dark transition-all">
                      Periksa
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, textColor = "text-black" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center`}>
        <img src={icon} className="w-8 h-8" alt="icon" />
      </div>
      <div>
        <p className="text-gray-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}