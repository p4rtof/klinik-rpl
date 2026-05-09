"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SortBy = "default" | "rm" | "nama" | "usia" | "keluhan";

export default function DashboardDokterPage() {
  const [antreanList, setAntreanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ringkasan, setRingkasan] = useState({
    total: 0,
    menunggu: 0,
    selesai: 0,
  });

  // FILTER / SORT / PAGINATION (FIGMA)
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [page, setPage] = useState(1);
  const pageSize = 8;

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

  // Reset page kalau filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // HITUNG USIA
  const hitungUsia = (tanggalLahir: string | undefined | null): number => {
    if (!tanggalLahir) return 0;
    const hariIni = new Date();
    const tglLahir = new Date(tanggalLahir);
    let usia = hariIni.getFullYear() - tglLahir.getFullYear();
    const m = hariIni.getMonth() - tglLahir.getMonth();
    if (m < 0 || (m === 0 && hariIni.getDate() < tglLahir.getDate())) usia--;
    return usia;
  };

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = antreanList.filter((item: any) => {
      const nama = (item.pasien?.nama || "").toLowerCase();
      const rm = (item.pasien?.noRm || "").toLowerCase();
      const keluhan = (item.keluhan || "").toLowerCase();
      return !q || nama.includes(q) || rm.includes(q) || keluhan.includes(q);
    });

    const sorted = [...filtered].sort((a: any, b: any) => {
      if (sortBy === "rm") return (a.pasien?.noRm || "").localeCompare(b.pasien?.noRm || "");
      if (sortBy === "nama") return (a.pasien?.nama || "").localeCompare(b.pasien?.nama || "");
      if (sortBy === "usia") return hitungUsia(a.pasien?.tanggalLahir) - hitungUsia(b.pasien?.tanggalLahir);
      if (sortBy === "keluhan") return (a.keluhan || "").localeCompare(b.keluhan || "");
      return 0;
    });

    return sorted;
  }, [antreanList, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, safePage]);

  const renderPageButtons = () => {
    const maxButtons = 9;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, maxButtons);

    return pages.map((p) => (
      <button
        key={p}
        onClick={() => setPage(p)}
        className={`px-3 py-1 rounded-md font-bold ${
          p === safePage ? "bg-primary text-white" : "text-primary hover:bg-blue-50"
        }`}
      >
        {p}
      </button>
    ));
  };

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
        {/* KARTU KIRI: Ringkasan Pasien */}
        <div className="bg-white p-6 border shadow-sm border-gray-100 rounded-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl font-bold">Ringkasan Pasien Hari Ini</p>
              <p className="text-sm text-gray-400">Data pasien Anda hari ini</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-bold">
              {tanggalHariIni}
            </div>
          </div>

          <div className="flex gap-4 text-lg">
            <StatCard
              title="Belum Diperiksa"
              value={ringkasan.menunggu}
              icon="/componen-admin/waiting.svg"
              color="bg-red-50"
              textColor="text-red-600"
              titleColor="text-red-700"
              isLoading={isLoading}
            />
            <StatCard
              title="Sudah Diperiksa"
              value={ringkasan.selesai}
              icon="/componen-admin/lunas.svg"
              color="bg-green-50"
              textColor="text-green-600"
              titleColor="text-green-700"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* KARTU KANAN: Pasien Saat Ini */}
        <div className="bg-white p-6 border shadow-sm border-gray-100 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-xl font-bold">Pasien Saat Ini</p>
            <p className="text-sm text-gray-400">
              Pasien urutan teratas yang menunggu
            </p>
          </div>

          {isLoading ? (
            <div className="h-20 mt-2 bg-gray-50 animate-pulse rounded-2xl"></div>
          ) : pasienSaatIni ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 mt-4 rounded-2xl">
              <div>
                <p className="text-xl font-bold text-primary capitalize">
                  {pasienSaatIni.pasien?.nama}
                </p>
                <p className="text-lg text-black font-bold mt-1">
                  {pasienSaatIni.keluhan || "Tidak ada keluhan"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/rekam-medis?id=${pasienSaatIni.id}`}
                  className="bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl text-md font-bold hover:bg-blue-200 transition-all"
                >
                  Lihat Riwayat
                </Link>
                <Link
                  href={`/periksa?id=${pasienSaatIni.id}`}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  Periksa
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 mt-4 bg-gray-50 rounded-2xl italic text-gray-400">
              Tidak ada pasien dalam antrean menunggu.
            </div>
          )}
        </div>
      </div>

      {/* Title + Filter bar (FIGMA) */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold">Pasien Anda yang sedang mengantri</h2>

        <div className="flex gap-3 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 bg-white"
          >
            <option value="default">Urutkan Berdasarkan</option>
            <option value="rm">Nomor RM</option>
            <option value="nama">Nama Pasien</option>
            <option value="usia">Usia</option>
            <option value="keluhan">Keluhan</option>
          </select>

          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Pasien ..."
              className="border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm w-64"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Tabel Antrean Hari Ini */}
      <div className="bg-white rounded-xl mx-2 shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary text-white uppercase text-lg font-black">
            <tr>
              <th className="px-2 py-3 text-center w-[12%]">Nomor RM</th>
              <th className="px-2 py-3 text-left w-[20%]">Nama Pasien</th>
              <th className="px-2 py-3 text-center w-[12%]">Jenis Kelamin</th>
              <th className="px-2 py-3 text-center w-[12%]">Usia</th>
              <th className="px-2 py-3 text-left w-[20%]">Keluhan</th>
              <th className="px-2 py-3 text-center w-[12%]">Status</th>
              <th className="px-2 py-3 text-center w-[12%]">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 font-bold">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-6"><div className="h-8 bg-gray-100 rounded-md w-8 mx-auto"></div></td>
                  <td className="p-6"><div className="h-6 bg-gray-100 rounded-md w-40"></div></td>
                  <td className="p-6"><div className="h-6 bg-gray-100 rounded-md w-16 mx-auto"></div></td>
                  <td className="p-6"><div className="h-6 bg-gray-100 rounded-md w-24 mx-auto"></div></td>
                  <td className="p-6"><div className="h-6 bg-gray-100 rounded-md w-32 mx-auto"></div></td>
                  <td className="p-6"><div className="h-6 bg-gray-100 rounded-md w-24 mx-auto"></div></td>
                  <td className="p-6"><div className="h-6 bg-gray-100 rounded-md w-24 mx-auto"></div></td>
                </tr>
              ))
            ) : pagedData.length > 0 ? (
              pagedData.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="text-center w-fit text-lg font-bold text-primary">
                    {item.pasien?.noRm}
                  </td>

                  <td className="">
                    <p className="text-lg px-2 text-black capitalize my-4">
                      {item.pasien?.nama}
                    </p>
                  </td>

                  <td className="text-lg text-black text-center font-bold">
                    {item.pasien?.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                  </td>

                  <td className="text-center">
                    {item.pasien?.tanggalLahir ? `${hitungUsia(item.pasien.tanggalLahir)} Tahun` : "-"}
                  </td>

                  <td className="text-left my-3 pl-2">{item.keluhan || "-"}</td>

                  <td className="text-center my-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm uppercase font-black ${
                        item.status === "MENUNGGU"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="">
                    <div className="flex justify-center gap-2 items-center">
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
                          className="bg-primary text-white px-5 py-2.5 rounded-xl text-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                        >
                          Periksa
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-gray-400 text-center italic">
                  Data tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination (FIGMA) */}
        {!isLoading && filteredSorted.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2 py-1 text-primary font-bold disabled:opacity-30"
            >
              &lt;
            </button>

            {renderPageButtons()}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2 py-1 text-primary font-bold disabled:opacity-30"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  textColor,
  titleColor,
  isLoading,
}: any) {
  return (
    <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-50 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <img src={icon} className="w-6 h-6" alt="icon" />
      </div>
      <div>
        <p className={`text-lg font-bold uppercase ${titleColor}`}>{title}</p>
        {isLoading ? (
          <div className="h-7 bg-gray-100 animate-pulse w-8 rounded mt-1"></div>
        ) : (
          <p className={`text-2xl font-black ${textColor}`}>{value}</p>
        )}
      </div>
    </div>
  );
}