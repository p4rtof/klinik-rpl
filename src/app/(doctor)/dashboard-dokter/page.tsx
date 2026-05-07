"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AntreanItem = {
  nomorRM?: string;
  pasien?: {
    nama?: string;
    jenisKelamin?: "LAKI_LAKI" | "PEREMPUAN" | string;
    usia?: number;
  };
  keluhan?: string;
};

function formatTanggalID(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const DUMMY: AntreanItem[] = [
  {
    nomorRM: "R9113",
    pasien: { nama: "Fikky Hartanto", jenisKelamin: "LAKI_LAKI", usia: 24 },
    keluhan: "Rheumatoid Arthritis",
  },
  {
    nomorRM: "R1026",
    pasien: { nama: "Kusuma Dewi", jenisKelamin: "PEREMPUAN", usia: 6 },
    keluhan: "Migraine",
  },
  {
    nomorRM: "R5074",
    pasien: { nama: "Sulistyo Budi", jenisKelamin: "LAKI_LAKI", usia: 7 },
    keluhan: "Gastroesophageal Reflux Disease",
  },
  {
    nomorRM: "R2046",
    pasien: { nama: "Dwiyana Abitya", jenisKelamin: "LAKI_LAKI", usia: 11 },
    keluhan: "Asthma",
  },
  {
    nomorRM: "R5072",
    pasien: { nama: "Muhammad Satrio Nugroho", jenisKelamin: "LAKI_LAKI", usia: 12 },
    keluhan: "Osteoarthritis",
  },
];

function genderLabel(v?: string) {
  if (v === "LAKI_LAKI") return "Laki-laki";
  if (v === "PEREMPUAN") return "Perempuan";
  return v ?? "-";
}

export default function DashboardDokterPage() {
  const today = useMemo(() => new Date(), []);
  const [items, setItems] = useState<AntreanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortBy, setSortBy] = useState<"rm" | "nama">("rm");
  const [q, setQ] = useState("");

  // Ringkasan (sementara dummy)
  const pasienBelum = 8;
  const pasienSudah = 16;

  // Pasien aktif (sementara dummy)
  const pasienAktif = {
    nama: "Troye Sivan",
    keluhan: "Rheumatoid Arthritis",
  };

  const fetchAntreanDokter = async () => {
    try {
      // TODO: ganti endpoint sesuai backend
      const res = await fetch("/api/antrian", { cache: "no-store" });
      const json = await res.json();

      // asumsi response: { success: true, data: [...] }
      if (json?.success && Array.isArray(json?.data)) {
        setItems(json.data);
      } else {
        // fallback dummy
        setItems(DUMMY);
      }
    } catch {
      setItems(DUMMY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAntreanDokter();
  }, []);

  const filtered = useMemo(() => {
    const normalized = q.trim().toLowerCase();

    let arr = [...items];

    if (normalized) {
      arr = arr.filter((it) => {
        const nama = it.pasien?.nama?.toLowerCase() ?? "";
        const rm = it.nomorRM?.toLowerCase() ?? "";
        const kel = (it.keluhan ?? "").toLowerCase();
        return nama.includes(normalized) || rm.includes(normalized) || kel.includes(normalized);
      });
    }

    arr.sort((a, b) => {
      if (sortBy === "nama") {
        return (a.pasien?.nama ?? "").localeCompare(b.pasien?.nama ?? "");
      }
      return (a.nomorRM ?? "").localeCompare(b.nomorRM ?? "");
    });

    return arr;
  }, [items, q, sortBy]);

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Selamat Datang, <span className="font-extrabold">dr. Yofli</span>
        </h1>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-extrabold">Ringkasan Pasien Hari Ini</h2>
                <p className="text-xs text-gray-500">Data berdasarkan pasien anda hari ini</p>
              </div>
              <div className="text-sm font-bold text-blue-600">{formatTanggalID(today)}</div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <img src="/componen-admin/pasien.svg" className="w-6 h-6" alt="pasien" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pasien Belum Diperiksa</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-extrabold text-blue-600">{pasienBelum}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <img src="/componen-admin/pasien.svg" className="w-6 h-6" alt="pasien" />
              </div>
              <div>
                <h3 className="text-xs text-gray-600">Pasien Sudah Diperiksa</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-extrabold text-blue-600">{pasienSudah}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pasien yang sedang ditangani */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-extrabold text-blue-700">Pasien yang Sedang Anda Tangani:</h3>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img src="/componen-admin/pasien.svg" className="w-6 h-6" alt="icon" />
                <p className="text-xl sm:text-2xl font-extrabold">{pasienAktif.nama}</p>
              </div>
              <div className="flex items-center gap-3">
                <img src="/componen-admin/waiting.svg" className="w-6 h-6" alt="icon" />
                <p className="text-sm sm:text-base text-gray-700 font-semibold">
                  Keluhan: <span className="font-extrabold">{pasienAktif.keluhan}</span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 sm:items-end">
              <Link href="/rekam-medis"
                 className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition text-center">
                Lihat Riwayat
                </Link>
              <Link
                href="/periksa"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition text-center"
              >
                Periksa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Title + Tools */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-extrabold">Pasien Anda yang sedang mengantri</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rm" | "nama")}
            className="w-full sm:w-52 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none"
          >
            <option value="rm">Urutkan: Nomor RM</option>
            <option value="nama">Urutkan: Nama</option>
          </select>

          <div className="relative w-full sm:w-72">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari Pasien ..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm shadow-sm outline-none"
            />
            <img
              src="/componen-admin/cari.svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              alt="search"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white text-center font-bold">
            <tr>
              <th className="px-4 py-3 border-r border-white/20">Nomor RM</th>
              <th className="px-4 py-3 border-r border-white/20">Nama Pasien</th>
              <th className="px-4 py-3 border-r border-white/20">Jenis Kelamin</th>
              <th className="px-4 py-3 border-r border-white/20">Usia</th>
              <th className="px-4 py-3 border-r border-white/20">Keluhan</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>

          <tbody className="text-center font-semibold">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-gray-600">
                  Memuat data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-gray-600">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4 font-extrabold">{item.nomorRM ?? `R${9113 + i}`}</td>
                  <td className="px-4 py-4 text-left font-extrabold">
                    {item.pasien?.nama ?? "Nama Pasien"}
                  </td>
                  <td className="px-4 py-4">{genderLabel(item.pasien?.jenisKelamin)}</td>
                  <td className="px-4 py-4">{item.pasien?.usia ?? "-"}</td>
                  <td className="px-4 py-4 text-left text-sm text-gray-700">
                    {item.keluhan ?? "Keluhan"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit (hijau) */}
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-green-50"
                        title="Edit"
                        onClick={() => console.log("edit", item)}
                      >
                        <img
                          src="/component-doctor/edit.svg"
                          className="w-5 h-5"
                          style={{
                            filter:
                              "invert(37%) sepia(86%) saturate(1129%) hue-rotate(87deg) brightness(96%) contrast(96%)",
                          }}
                          alt="edit"
                        />
                      </button>

                      {/* Delete (merah) */}
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-red-50"
                        title="Hapus"
                        onClick={() => console.log("delete", item)}
                      >
                        <img
                          src="/component-doctor/delete.svg"
                          className="w-5 h-5"
                          style={{
                            filter:
                              "invert(16%) sepia(89%) saturate(6054%) hue-rotate(358deg) brightness(97%) contrast(113%)",
                          }}
                          alt="delete"
                        />
                      </button>

                      {/* View (biru) */}
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-blue-50"
                        title="Lihat"
                        onClick={() => console.log("view", item)}
                      >
                        <img
                          src="/component-doctor/mata.svg"
                          className="w-5 h-5"
                          style={{
                            filter:
                              "invert(37%) sepia(93%) saturate(1421%) hue-rotate(187deg) brightness(91%) contrast(101%)",
                          }}
                          alt="view"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination (dummy UI) */}
        <div className="flex justify-center items-center gap-3 p-4 bg-white border-t border-gray-100 text-blue-600 font-bold">
          <button className="px-2 hover:underline">{"<"}</button>
          <button className="bg-blue-600 text-white w-8 h-8 rounded-md flex items-center justify-center">
            1
          </button>
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100">
            2
          </button>
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100">
            3
          </button>
          <span className="text-gray-500">...</span>
          <button className="px-2 hover:underline">{">"}</button>
        </div>
      </div>
    </div>
  );
}