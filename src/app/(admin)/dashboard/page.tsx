"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SortBy =
  | "default"
  | "tanggal"
  | "rm"
  | "nama"
  | "usia"
  | "antrian"
  | "status";

export default function DashboardPage() {
  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [notif, setNotif] = useState<string | null>(null);
  // --- STATE DATA ---
  const [dataKunjungan, setDataKunjungan] = useState<any[]>([]);
  const [pasienList, setPasienList] = useState<any[]>([]);
  const [dokterList, setDokterList] = useState<any[]>([]);
  const [ringkasan, setRingkasan] = useState({ belum: 0, sudah: 0 });
  const [antreanNext, setAntreanNext] = useState({ nama: "-", nomor: "-" });

  // State UI
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // State Aksi (Detail, Edit, Hapus)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKunjungan, setSelectedKunjungan] = useState<any>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    keluhan: "",
    status: "",
    tanggal: "",
    jam: "",
  });

  // FILTER / SORT / PAGINATION
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // State Form Kunjungan
  const [formData, setFormData] = useState({
    pasienId: "",
    dokterId: "",
    keluhan: "",
    tanggal: todayDate,
    jam: new Date()
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      .replace(".", ":"),
  });

  const hitungUsia = (tanggalLahir: string) => {
    if (!tanggalLahir) return "-";
    const hariIni = new Date();
    const tglLahir = new Date(tanggalLahir);
    let usia = hariIni.getFullYear() - tglLahir.getFullYear();
    const m = hariIni.getMonth() - tglLahir.getMonth();
    if (m < 0 || (m === 0 && hariIni.getDate() < tglLahir.getDate())) {
      usia--;
    }
    return usia;
  };

  const usiaSort = (tanggalLahir: string) => {
    const u = hitungUsia(tanggalLahir);
    return typeof u === "number" ? u : Number(u);
  };

  const fetchData = async () => {
    setIsTableLoading(true);
    try {
      const resAntrean = await fetch("/api/antrian");
      const jsonAntrean = await resAntrean.json();
      if (jsonAntrean.success) {
        setDataKunjungan(jsonAntrean.data);

        // Ringkasan ambil dari hari ini ATAU yang terlewat tapi masih MENUNGGU
        const dataHariIni = jsonAntrean.data.filter((a: any) => {
          const tgl = a.tanggal
            ? new Date(a.tanggal).toISOString().split("T")[0]
            : "";
          return (
            tgl === todayDate || (tgl < todayDate && a.status === "MENUNGGU")
          );
        });

        const belum = dataHariIni.filter(
          (a: any) => a.status === "MENUNGGU",
        ).length;
        const sudah = dataHariIni.filter(
          (a: any) => a.status === "SELESAI",
        ).length;
        setRingkasan({ belum, sudah });

        // Filter yang menunggu, lalu urutkan dari nomor terkecil
        const next = dataHariIni
          .filter((a: any) => a.status === "MENUNGGU")
          .sort((a: any, b: any) => {
            // Ambil waktu dari tanggal antrean
            const dateA = new Date(a.tanggal || 0).getTime();
            const dateB = new Date(b.tanggal || 0).getTime();

            // 1. Urutkan berdasarkan tanggal lebih dulu (yang kemarin/terlewat dipanggil duluan)
            if (dateA !== dateB) {
              return dateA - dateB;
            }

            // 2. Kalau tanggalnya sama (misal sama-sama hari ini), baru urutkan dari nomor antrean terkecil
            return (a.nomorAntrian || 0) - (b.nomorAntrian || 0);
          })[0];

        if (next) {
          setAntreanNext({
            nama: next.pasien?.nama || "-",
            nomor: next.nomorAntrian || "-",
          });
        } else {
          setAntreanNext({ nama: "-", nomor: "-" });
        }
      }

      const [resPasien, resDokter] = await Promise.all([
        fetch("/api/pasien", { headers: { "x-user-role": "ADMIN" } }),
        fetch("/api/dokter"),
      ]);

      const jsonPasien = await resPasien.json();
      const jsonDokter = await resDokter.json();

      if (jsonPasien.success) setPasienList(jsonPasien.data);
      if (jsonDokter.success && jsonDokter.data.length > 0) {
        setDokterList(jsonDokter.data);
        setFormData((prev) => ({ ...prev, dokterId: jsonDokter.data[0].id }));
      }
    } catch (err) {
      console.error("Gagal memuat data", err);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  // FILTER + SORT (Sembunyikan tanggal lewat, urutkan Hari Ini -> Besok -> Lusa)
  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = dataKunjungan.filter((item: any) => {
      const itemDate = item.tanggal
        ? new Date(item.tanggal).toISOString().split("T")[0]
        : "";

      if (itemDate < todayDate && item.status !== "MENUNGGU") return false;

      const nama = (item.pasien?.nama || "").toLowerCase();
      const rm = (item.pasien?.noRm || "").toLowerCase();
      const nomor = String(item.nomorAntrian ?? "").toLowerCase();
      const keluhan = (item.keluhan || "").toLowerCase();
      return (
        !q ||
        nama.includes(q) ||
        rm.includes(q) ||
        nomor.includes(q) ||
        keluhan.includes(q)
      );
    });

    const sorted = [...filtered].sort((a: any, b: any) => {
      if (sortBy === "rm")
        return (a.pasien?.noRm || "").localeCompare(b.pasien?.noRm || "");
      if (sortBy === "nama")
        return (a.pasien?.nama || "").localeCompare(b.pasien?.nama || "");
      if (sortBy === "usia")
        return (
          usiaSort(a.pasien?.tanggalLahir) - usiaSort(b.pasien?.tanggalLahir)
        );
      if (sortBy === "antrian")
        return (a.nomorAntrian ?? 0) - (b.nomorAntrian ?? 0);
      if (sortBy === "status")
        return (a.status || "").localeCompare(b.status || "");

      if (sortBy === "default" && a.status !== b.status) {
        return a.status === "MENUNGGU" ? -1 : 1;
      }

      const dateA = new Date(a.tanggal || 0).getTime();
      const dateB = new Date(b.tanggal || 0).getTime();

      if (dateA !== dateB) return dateA - dateB;

      return (a.nomorAntrian ?? 0) - (b.nomorAntrian ?? 0);
    });

    return sorted;
  }, [dataKunjungan, search, sortBy, todayDate]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, safePage]);

  const renderPageButtons = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
      0,
      9,
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

  const handleSimpanKunjungan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tanggal < todayDate) {
      alert("Oops, gak bisa daftar untuk tanggal yang udah lewat!");
      return;
    }
    if (!formData.pasienId || !formData.dokterId) {
      alert("Pastikan Pasien dan Dokter sudah dipilih!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        pasienId: formData.pasienId,
        dokterId: formData.dokterId,
        jam: formData.jam,
        tanggal: new Date(formData.tanggal).toISOString(),
        keluhan: formData.keluhan,
      };

      const res = await fetch("/api/antrian", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowModal(false);
        setFormData((prev) => ({
          ...prev,
          pasienId: "",
          keluhan: "",
          tanggal: todayDate,
          jam: new Date()
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(".", ":"),
        }));
        fetchData();
        // TAMBAHKAN 2 BARIS INI:
        setNotif("Berhasil! Kunjungan baru sukses ditambahkan.");
        setTimeout(() => setNotif(null), 3000);
      } else {
        alert("Gagal: " + (json.issues?.[0]?.message || json.error));
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmHapus = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleHapusKunjungan = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/antrian/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
        setNotif("Kunjungan dihapus");
        setTimeout(() => setNotif(null), 3000);
      } else alert("Gagal menghapus kunjungan.");
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus.");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const openEditModal = (item: any) => {
    const tgl = item.tanggal
      ? new Date(item.tanggal).toISOString().split("T")[0]
      : "";
    setEditFormData({
      id: item.id,
      keluhan: item.keluhan || "",
      status: item.status,
      tanggal: tgl,
      jam: item.jam || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateKunjungan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/antrian/${editFormData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keluhan: editFormData.keluhan,
          status: editFormData.status,
          jam: editFormData.jam,
          tanggal: editFormData.tanggal
            ? new Date(editFormData.tanggal).toISOString()
            : undefined,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchData();
        setNotif("Mantap! Data kunjungan berhasil diperbarui.");
        setTimeout(() => setNotif(null), 3000);
      } else alert("Gagal memperbarui kunjungan.");
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      {/* Header */}
      <div className="flex justify-between px-3 items-center mb-4">
        <h1 className="text-3xl font-bold">Selamat Datang, Admin</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-theme hover:bg-green-theme-dark text-2xl text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <span>+</span> Tambah Kunjungan
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-3">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-2xl">
            Ringkasan Pasien Hari Ini :{" "}
            <span className="text-primary font-semibold">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </h3>
          <div className="flex gap-12 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-xl">
                <img
                  src="/componen-admin/pasien-red.svg"
                  className="w-6 h-6"
                  alt="icon"
                />
              </div>
              <div>
                <p className="text-lg font-medium text-red-700">
                  Belum Diperiksa
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {ringkasan.belum}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded-xl">
                <img
                  src="/componen-admin/pasien-green.svg"
                  className="w-6 h-6"
                  alt="icon"
                />
              </div>
              <div>
                <p className="text-lg font-medium text-green-700">
                  Sudah Diperiksa
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {ringkasan.sudah}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="font-bold text-gray-800 text-xl mb-2">
            Antrean Berikutnya:
          </h3>
          <div className="flex items-center justify-between gap-4">
            <p className="text-primary text-2xl font-bold uppercase break-words leading-snug">
              {antreanNext.nama}
            </p>
            <p className="text-6xl font-black text-primary flex-shrink-0">
              {antreanNext.nomor}
            </p>
          </div>
        </div>
      </div>

      {/* Title + Filter */}
      <div className="flex items-center justify-between px-3">
        <h2 className="text-2xl font-bold">Data Semua Kunjungan</h2>
        <div className="flex gap-3 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 bg-white"
          >
            <option value="default">Urutkan Berdasarkan</option>
            <option value="tanggal">Tanggal Terdekat</option>
            <option value="rm">Nomor RM</option>
            <option value="nama">Nama Pasien</option>
            <option value="usia">Usia</option>
            <option value="antrian">Nomor Antrian</option>
            <option value="status">Status</option>
          </select>

          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Pasien ..."
              className="border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm w-64"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <img src="/componen-admin/cari.svg" alt="" />
            </span>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mx-3">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="px-3 py-2 border-r border-white/20 uppercase text-lg">
                No RM
              </th>
              <th className="px-3 py-2 border-r  border-white/20 uppercase text-lg">
                Nama Pasien
              </th>
              <th className="px-3 py-2 border-r border-white/20 uppercase text-lg">
                Usia
              </th>
              <th className="px-3 py-2 border-r border-white/20 uppercase text-lg">
                Tanggal
              </th>
              <th className="px-3 py-2 border-r border-white/20 uppercase text-lg">
                Jam
              </th>
              <th className="px-3 py-2 border-r border-white/20 uppercase text-lg">
                Antrian
              </th>
              <th className="px-3 py-2 border-r border-white/20 uppercase text-lg">
                Status
              </th>
              <th className="px-3 py-2 uppercase text-lg w-[10%]">Aksi</th>
            </tr>
          </thead>

          <tbody className="text-black font-semibold text-center divide-y divide-gray-100">
            {isTableLoading ? (
              <tr>
                <td colSpan={8} className="p-10 text-gray-400 italic">
                  Memuat data...
                </td>
              </tr>
            ) : pagedData.length > 0 ? (
              pagedData.map((item: any) => (
                <tr key={item.id} className="hover:bg-blue-50/30 text-lg">
                  <td className="p-3 w-[10%]">
                    {item.pasien?.noRm?.split("-")[0].toUpperCase() || "-"}
                  </td>
                  <td className="p-3 text-left capitalize">
                    {item.pasien?.nama || "-"}
                  </td>
                  <td className="p-3 w-[10%]">
                    {item.pasien?.tanggalLahir
                      ? `${hitungUsia(item.pasien.tanggalLahir)} Tahun`
                      : "-"}
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
                  <td className="p-3 w-[10%]">{item.jam}</td>
                  <td className="p-3 w-[10%] text-lg font-black text-primary">
                    {item.nomorAntrian}
                  </td>
                  <td className="p-3 w-[12%]">
                    <span
                      className={`px-2 py-1 rounded-full text-sm uppercase ${item.status === "MENUNGGU" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 w-[13%]">
                    <div className="flex justify-center  gap-2">
                      <button
                        onClick={() => {
                          setSelectedKunjungan(item);
                          setShowDetailModal(true);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmHapus(item.id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-10 text-gray-400 italic">
                  Data tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {!isTableLoading && filteredSorted.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100">
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

      {/* MODAL TAMBAH KUNJUNGAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-primary px-6 py-4 text-white text-center">
              <h2 className="text-2xl font-bold">Tambah Kunjungan Baru</h2>
            </div>
            <form
              onSubmit={handleSimpanKunjungan}
              className="py-4 px-8 space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Pilih Pasien
                </label>
                <div className="flex gap-2 mt-1">
                  <select
                    required
                    value={formData.pasienId}
                    onChange={(e) =>
                      setFormData({ ...formData, pasienId: e.target.value })
                    }
                    className="flex-1 border-2 border-gray-400 p-3 rounded-xl outline-none focus:border-primary"
                  >
                    <option value="">-- Pilih Pasien Terdaftar --</option>
                    {pasienList.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                  <Link
                    href="/data-pasien"
                    className="bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm flex items-center"
                  >
                    +
                  </Link>
                </div>
                <p className="text-xs font-medium text-orange-600 italic mt-2 bg-orange-50 p-2 rounded-lg border border-orange-100">
                  * Pasien belum terdaftar? Silahkan daftar pasien baru terlebih
                  dahulu melalui tombol (+)
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Dokter Bertugas
                </label>
                <select
                  required
                  value={formData.dokterId}
                  onChange={(e) =>
                    setFormData({ ...formData, dokterId: e.target.value })
                  }
                  className="w-full border-2 border-gray-400 p-3 rounded-xl mt-1 outline-none bg-gray-50 cursor-default"
                >
                  {dokterList.length === 0 ? (
                    <option value="">-- Memuat Data Dokter... --</option>
                  ) : (
                    dokterList.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.namaLengkap} ({d.spesialisasi || "Umum"})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Jam Datang
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.jam}
                    onChange={(e) =>
                      setFormData({ ...formData, jam: e.target.value })
                    }
                    className="w-full border-2 border-gray-400 p-3 rounded-xl mt-1"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full border-2 border-gray-400 p-3 rounded-xl mt-1 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Keluhan Awal
                </label>
                <textarea
                  required
                  value={formData.keluhan}
                  onChange={(e) =>
                    setFormData({ ...formData, keluhan: e.target.value })
                  }
                  className="w-full border-2 border-gray-400 p-3 rounded-xl mt-1 h-24 resize-none outline-none focus:border-primary"
                  placeholder="Keluhan pasien (Wajib)..."
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 shadow-md active:scale-95 transition-all"
              >
                {isLoading ? "Memproses..." : "Daftarkan Antrean"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full text-gray-500 font-bold py-2 mt-2 hover:text-gray-700"
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedKunjungan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-primary p-6 text-white text-center">
              <h2 className="text-2xl font-black">Detail Kunjungan</h2>
            </div>
            <div className="p-8 space-y-4 font-bold text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <p>Pasien:</p>
                <p className="uppercase">{selectedKunjungan.pasien?.nama}</p>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <p>No RM:</p>
                <p>{selectedKunjungan.pasien?.noRm}</p>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <p>Tanggal:</p>
                <p className="text-right">
                  {selectedKunjungan.tanggal
                    ? new Date(selectedKunjungan.tanggal).toLocaleDateString(
                        "id-ID",
                      )
                    : "-"}
                  {selectedKunjungan.jam ? ` • ${selectedKunjungan.jam}` : ""}
                </p>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <p>Antrean:</p>
                <p className="text-primary">{selectedKunjungan.nomorAntrian}</p>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <p>Status:</p>
                <p>{selectedKunjungan.status}</p>
              </div>

              <div className="mt-4">
                <p className="text-gray-400 text-sm">Keluhan:</p>
                <p className="bg-gray-50 p-3 rounded-xl italic mt-1">
                  {selectedKunjungan.keluhan || "Tidak ada keluhan"}
                </p>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-black hover:bg-gray-300"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-yellow-500 p-6 text-white text-center">
              <h2 className="text-2xl font-black">Edit Kunjungan</h2>
            </div>
            <form onSubmit={handleUpdateKunjungan} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Tanggal Kunjungan
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.tanggal}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      tanggal: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none mt-1 focus:border-yellow-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Jam Kunjungan
                </label>
                <input
                  type="time"
                  value={editFormData.jam}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      jam: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-200 p-3 rounded-xl mt-1 outline-none focus:border-yellow-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Keluhan
                </label>
                <textarea
                  required
                  value={editFormData.keluhan}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      keluhan: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-200 p-3 rounded-xl mt-1 h-24 resize-none outline-none focus:border-yellow-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Status Antrean
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none mt-1 focus:border-yellow-500 font-bold text-gray-700"
                >
                  <option value="MENUNGGU">MENUNGGU</option>
                  <option value="SELESAI">SELESAI</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-8 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-black text-gray-800 mb-2">
                Hapus Kunjungan?
              </h2>
              <p className="text-gray-500 font-medium mb-6">
                Data kunjungan ini akan dihapus permanen dan tidak bisa
                dikembalikan.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTargetId(null);
                    setNotif(
                      "Kunjungan tidak jadi dihapus and tetap berada pada antrean.",
                    );
                    setTimeout(() => setNotif(null), 3500);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleHapusKunjungan}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {notif && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-300 font-bold text-sm">
          {" "}
          <span className="text-lg">ℹ️</span>
          <span>{notif}</span>
        </div>
      )}
    </div>
  );
}