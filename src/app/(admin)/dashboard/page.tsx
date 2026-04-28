"use client";

import React, { useState } from "react";

export default function DashboardPage() {
  // State data kosong untuk simulasi sebelum ada data dari backend
  const [dataKunjungan, setDataKunjungan] = useState([]);
  const [ringkasan, setRingkasan] = useState({ belum: 0, sudah: 0 });
  const [antreanNext, setAntreanNext] = useState({ nama: "-", nomor: "-" });

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      {/* Header & Button Tambah */}
      <div className="flex justify-between px-3 items-center mb-4">
          <h1 className="text-3xl font-bold my-auto">Selamat Datang, Admin</h1>
        <button className="bg-green-theme hover:bg-green-theme-dark text-2xl text-white px-6 py-3 rounded-xl font-bold flex hover:cursor-pointer items-center gap-2 transition-all active:scale-95 shadow-md">
          <span className="text-2xl">+</span> Tambah Kunjungan
        </button>
      </div>

      {/* Ringkasan & Antrean Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ringkasan Pasien */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h3 className="font-bold text-2xl">
              Ringkasan Pasien Hari Ini : {" "}
              <span className="text-primary font-semibold">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </h3>
            <p className="text-lg text-gray-400  mt-1">
              Data pasien anda berdasarkan kategori kunjungan
            </p>
          </div>
          <div className="flex gap-12 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl">
                <img
                  src="/componen-admin/pasien.svg"
                  className="w-6 h-6"
                  alt="icon"
                />
              </div>
              <div>
                <p className="text-lg font-medium text-black">
                  Pasien Belum Diperiksa
                </p>
                <p className="text-3xl font-bold text-primary">
                  {ringkasan.belum}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl">
                <img
                  src="/componen-admin/pasien.svg"
                  className="w-6 h-6"
                  alt="icon"
                />
              </div>
              <div>
                <p className="text-lg font-medium text-black  ">
                  Pasien Sudah Diperiksa
                </p>
                <p className="text-3xl font-bold text-primary">
                  {ringkasan.sudah}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nomor Antrean Berikutnya */}
        <div className="bg-white p-6  rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <h3 className="font-bold text-gray-800 text-2xl">
            Nomor Antrean Berikutnya:
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <img
                src="/componen-admin/pasien.svg"
                className="w-8 h-8 text-center"
                alt="icon"
              /> */}
              <p className="text-primary  text-xl font-semibold  uppercase">
                {antreanNext.nama}
              </p>
            </div>
            <p className="text-6xl font-bold text-primary">
              {antreanNext.nomor}
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Tabel */}
      <div className="mt-">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Data Kunjungan Pasien</h2>
          <div className="flex gap-3">
            <div className="relative flex items-center">
              {/* Ikon di-set absolute dan ukurannya disesuaikan */}
              <img
                src="/componen-admin/cari.svg"
                alt="cari"
                className="absolute left-3 w-5 h-5 opacity-50 pointer-events-none"
              />

              {/* Input text */}
              <input
                type="text"
                placeholder="Cari Pasien ..."
                className="border border-gray-200 rounded-lg py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary w-80 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-2 text-lg font-bold border-r border-white/50 border-2 text-center uppercase">
                    Nomor RM
                  </th>
                  <th className="px-4 py-2 text-lg font-bold border-r border-white/50 border-2 text-center uppercase">
                    Nama Pasien
                  </th>
                  <th className="px-4 py-2 text-lg font-bold border-r border-white/50 border-2 text-center uppercase">
                    Jenis Kelamin
                  </th>
                  <th className="px-4 py-2 text-lg font-bold border-r border-white/50 border-2 text-center uppercase">
                    Usia
                  </th>
                  <th className="px-4 py-2 text-lg font-bold border-r border-white/50 border-2 text-center uppercase">
                    Nomor Antrian
                  </th>
                  <th className="px-4 py-2 text-lg font-bold text-center uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-black font-bold">
                {dataKunjungan.length > 0 ? (
                  dataKunjungan.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Mapping data di sini nanti */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-400 italic font-medium bg-gray-50/30"
                    >
                      Belum ada data kunjungan hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
