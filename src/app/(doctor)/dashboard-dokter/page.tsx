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
    besok: 0, // Tambahan state buat ngitung pasien besok/nanti
  });

  // FILTER / SORT / PAGINATION
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Dapatkan string tanggal lokal hari ini (Format YYYY-MM-DD)
  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const tanggalHariIniText = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resAntrean = await fetch("/api/antrian");
      const json = await resAntrean.json();

      if (json.success) {
        const semuaData = json.data;

        // Pisahkan data yang tanggalnya HARI INI (termasuk yg terlewat & MENUNGGU) dan BESOK
        const dataHariIni = semuaData.filter((a: any) => {
          const tglAntrean = a.tanggal
            ? new Date(a.tanggal).toISOString().split("T")[0]
            : "";
          return tglAntrean === todayString || (tglAntrean < todayString && a.status === "MENUNGGU");
        });

        const dataBesok = semuaData.filter((a: any) => {
          const tglAntrean = a.tanggal
            ? new Date(a.tanggal).toISOString().split("T")[0]
            : "";
          return tglAntrean > todayString;
        });

        setAntreanList(semuaData);

        // Hitung ringkasan cuma dari data HARI INI (kecuali untuk info 'besok')
        setRingkasan({
          total: dataHariIni.length,
          menunggu: dataHariIni.filter((a: any) => a.status === "MENUNGGU")
            .length,
          selesai: dataHariIni.filter((a: any) => a.status === "SELESAI")
            .length,
          besok: dataBesok.length, // Simpan jumlah pasien besok
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

  // Filter HANYA UNTUK HARI INI
  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = antreanList.filter((item: any) => {
      // 1. FILTER TANGGAL: Pastikan hanya data HARI INI yang masuk tabel
      const itemDate = item.tanggal
        ? new Date(item.tanggal).toISOString().split("T")[0]
        : "";
      const isToday = itemDate === todayString;
      const isPastWaiting = itemDate < todayString && item.status === "MENUNGGU";

      // Kalau bukan hari ini DAN bukan antrean lama yang nunggu, sembunyikan!
      if (!isToday && !isPastWaiting) return false;

      // 2. FILTER PENCARIAN
      const nama = (item.pasien?.nama || "").toLowerCase();
      const rm = (item.pasien?.noRm || "").toLowerCase();
      const keluhan = (item.keluhan || "").toLowerCase();
      return !q || nama.includes(q) || rm.includes(q) || keluhan.includes(q);
    });

    const sorted = [...filtered].sort((a: any, b: any) => {
      // DEFAULT: MENUNGGU DI ATAS, lalu urutkan antrean
      if (sortBy === "default") {
        if (a.status === "MENUNGGU" && b.status !== "MENUNGGU") return -1;
        if (a.status !== "MENUNGGU" && b.status === "MENUNGGU") return 1;
        
        // 1. Urutkan berdasarkan tanggal terlama lebih dulu (pasien kemarin dipanggil duluan)
        const dateA = new Date(a.tanggal || 0).getTime();
        const dateB = new Date(b.tanggal || 0).getTime();
        
        if (dateA !== dateB) {
          return dateA - dateB; 
        }

        // 2. Jika tanggalnya sama (sama-sama hari ini), urutkan dari nomor antrean terkecil
        return (a.nomorAntrian || 0) - (b.nomorAntrian || 0);
      }
      if (sortBy === "rm")
        return (a.pasien?.noRm || "").localeCompare(b.pasien?.noRm || "");
      if (sortBy === "nama")
        return (a.pasien?.nama || "").localeCompare(b.pasien?.nama || "");
      if (sortBy === "usia")
        return (
          hitungUsia(a.pasien?.tanggalLahir) -
          hitungUsia(b.pasien?.tanggalLahir)
        );
      if (sortBy === "keluhan")
        return (a.keluhan || "").localeCompare(b.keluhan || "");

      return 0;
    });

    return sorted;
  }, [antreanList, search, sortBy, todayString]);

  // Pasien Saat Ini diambil dari tabel yang udah difilter (Pasti hari ini)
  const pasienSaatIni = useMemo(() => {
    return filteredSorted.find((a: any) => a.status === "MENUNGGU");
  }, [filteredSorted]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, safePage]);

  const renderPageButtons = () => {
    const maxButtons = 9;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
      0,
      maxButtons,
    );

    return pages.map((p) => (
      <button
        key={p}
        onClick={() => setPage(p)}
        className={`px-3 py-1 rounded-md font-bold ${
          p === safePage
            ? "bg-primary text-white"
            : "text-primary hover:bg-blue-50"
        }`}
      >
        {p}
      </button>
    ));
  };

  return (
    <div className="w-full space-y-6 text-black">
      <div className="flex justify-between">
        <div className="px-2 mb-3">
          <h1 className="text-3xl font-bold">Dashboard Pemeriksaan</h1>
          <p className="text-gray-400 mt-1 text-lg">
            Kelola antrean dan rekam medis pasien hari ini.
          </p>
        </div>

        {/* BANNER NOTIFIKASI PASIEN BESOK */}
        {!isLoading && ringkasan.besok > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-amber-200 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-amber-800 text-md">
                Info Antrean Mendatang
              </p>
              <p className="text-xs font-semibold text-amber-700">
                Terdapat{" "}
                <span className="font-bold text-red-theme">
                  {ringkasan.besok} pasien
                </span>{" "}
                yang sudah terdaftar untuk hari besok/kedepan.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid Kartu Atas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
        {/* KARTU KIRI: Ringkasan Pasien */}
        <div className="bg-white p-6 border shadow-sm border-gray-100 rounded-xl space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl font-bold">Ringkasan Pasien Hari Ini</p>
              <p className="text-sm text-gray-400">Data pasien Anda hari ini</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-bold">
              {tanggalHariIniText}
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
              Pasien urutan teratas yang menunggu (Hari Ini)
            </p>
          </div>

          {isLoading ? (
            <div className="h-20 mt-2 bg-gray-50 animate-pulse rounded-2xl"></div>
          ) : pasienSaatIni ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 mt-4 rounded-2xl border border-gray-100">
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
            <div className="text-center py-4 mt-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-400 font-medium">
              Tidak ada pasien yang menunggu untuk diperiksa hari ini.
            </div>
          )}
        </div>
      </div>

      {/* Title + Filter bar */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold">Daftar Antrean Anda Hari Ini</h2>

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
              placeholder="Cari Pasien HARI INI..."
              className="border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm w-64 focus:border-primary outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <img src="/componen-admin/cari.svg" alt="cari" />
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Antrean Hari Ini */}
      <div className="bg-white rounded-xl mx-2 shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary text-white uppercase text-lg font-black">
            <tr>
              <th className="px-2 py-3 text-center w-[10%]">Nomor RM</th>
              <th className="px-2 py-3 text-left w-[17%]">Nama Pasien</th>
              <th className="px-2 py-3 text-center w-[12%]">Jenis Kelamin</th>
              <th className="px-4 py-3 text-center w-[14%]">Tgl Kunjungan</th>
              {/* <th className="px-4 py-3 text-center">Jam</th> */}
              <th className="px-2 py-3 text-center w-[12%]">Usia</th>
              <th className="px-2 py-3 text-left w-[15%]">Keluhan</th>
              <th className="px-2 py-3 text-center w-[12%]">Status</th>
              <th className="px-2 py-3 text-center ">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 font-bold">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-6">
                    <div className="h-8 bg-gray-100 rounded-md w-8 mx-auto"></div>
                  </td>
                  <td className="p-6">
                    <div className="h-6 bg-gray-100 rounded-md w-40"></div>
                  </td>
                  <td className="p-6">
                    <div className="h-6 bg-gray-100 rounded-md w-16 mx-auto"></div>
                  </td>
                  <td className="p-6">
                    <div className="h-6 bg-gray-100 rounded-md w-24 mx-auto"></div>
                  </td>
                  <td className="p-6">
                    <div className="h-6 bg-gray-100 rounded-md w-32 mx-auto"></div>
                  </td>
                  <td className="p-6">
                    <div className="h-6 bg-gray-100 rounded-md w-24 mx-auto"></div>
                  </td>
                  <td className="p-6">
                    <div className="h-6 bg-gray-100 rounded-md w-24 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : pagedData.length > 0 ? (
              pagedData.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/30 transition-colors"
                >
                  <td className="text-center w-fit text-lg font-bold text-primary">
                    {item.pasien?.noRm}
                  </td>
                  <td className="">
                    <p className="text-lg px-2 text-black capitalize my-4">
                      {item.pasien?.nama}
                    </p>
                  </td>
                  <td className="text-lg text-black text-center font-bold">
                    {item.pasien?.jenisKelamin === "LAKI_LAKI"
                      ? "Laki-laki"
                      : "Perempuan"}
                  </td>
                  <td className="px-4 py-3 text-md font-bold text-center">
        {item.tanggal
          ? new Date(item.tanggal).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </td>
                  <td className="text-center">
                    {item.pasien?.tanggalLahir
                      ? `${hitungUsia(item.pasien.tanggalLahir)} Tahun`
                      : "-"}
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
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
                <td
                  colSpan={7}
                  className="p-10 text-gray-400 text-center italic"
                >
                  Data antrean hari ini tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
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
    <div className="flex-1 bg-white px-2 py-3 rounded-2xl border border-gray-50 flex items-center gap-4">
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}
      >
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
