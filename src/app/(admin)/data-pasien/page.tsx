"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DataPasienPage() {
  const router = useRouter();
  const [pasienList, setPasienList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // State untuk Search dan Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id");

  // State untuk Hapus & Edit
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [notif, setNotif] = useState<string | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
const [notifData, setNotifData] = useState<{ type: "success" | "error"; message: string }>({ type: "success", message: "" });

const showNotif = (type: "success" | "error", message: string) => {
  setNotifData({ type, message });
  setShowNotifModal(true);
};
  // ==========================================
  // STATE & LOGIKA PAGINATION
  // ==========================================
  const [page, setPage] = useState(1);
  const pageSize = 10; // Menampilkan 8 baris per halaman

  // Kembalikan ke halaman 1 setiap kali user ngetik pencarian atau ngubah sorting
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(pasienList.length / pageSize));
  const safePage = Math.min(page, totalPages);

  // Potong data pasien sesuai halaman aktif
  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return pasienList.slice(start, start + pageSize);
  }, [pasienList, safePage]);

  // Render tombol angka 1, 2, 3, dst.
  const renderPageButtons = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 9);
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
  // ==========================================

  // State Form
  const [formData, setFormData] = useState({
    nama: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    noTelepon: "",
  });

  // Fetch API dengan parameter Search
  const fetchPasien = async () => {
    setIsTableLoading(true);
    try {
      const res = await fetch(`/api/pasien?search=${searchTerm}&sortBy=${sortBy}`, {
        headers: { "x-user-role": "ADMIN" },
      });
      const json = await res.json();
      if (json.success) setPasienList(json.data);
    } catch (err) {
      console.error("Gagal ambil data");
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPasien();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  // --- LOGIKA HAPUS ---
  const triggerDelete = (id: string) => setDeleteTarget(id);

  const executeDelete = async () => {
  if (!deleteTarget) return;
  try {
    const resAntrian = await fetch("/api/antrian");
    const jsonAntrian = await resAntrian.json();
    if (jsonAntrian.success) {
      const adaMenunggu = jsonAntrian.data.some(
        (a: any) => a.pasienId === deleteTarget && a.status === "MENUNGGU"
      );
      if (adaMenunggu) {
        setDeleteTarget(null);
        showNotif("error", "Pasien ini masih memiliki kunjungan yang menunggu. Selesaikan kunjungan terlebih dahulu.");
        return;
      }
    }

    const resPembayaran = await fetch(`/api/pembayaran?pasienId=${deleteTarget}&status=BELUM_BAYAR`, {
      headers: { "x-user-role": "ADMIN" },
    });
    const jsonPembayaran = await resPembayaran.json();
    if (jsonPembayaran.success && jsonPembayaran.data.length > 0) {
      setDeleteTarget(null);
      showNotif("error", "Pasien ini masih memiliki tagihan yang belum lunas. Selesaikan pembayaran terlebih dahulu.");
      return;
    }

    const res = await fetch(`/api/pasien/${deleteTarget}`, {
      method: "DELETE",
      headers: { "x-user-role": "ADMIN" },
    });
    if (res.ok) {
      setDeleteTarget(null);
      fetchPasien();
      showNotif("success", "Data pasien telah dihapus permanen.");
    } else {
      showNotif("error", "Gagal menghapus data pasien.");
    }
  } catch (err) {
    showNotif("error", "Terjadi kesalahan server.");
  }
};

  // --- LOGIKA EDIT ---
  const handleEdit = (pasien: any) => {
    setFormData({
      nama: pasien.nama,
      tanggalLahir: pasien.tanggalLahir ? new Date(pasien.tanggalLahir).toISOString().split("T")[0] : "",
      jenisKelamin: pasien.jenisKelamin,
      alamat: pasien.alamat || "",
      noTelepon: pasien.noTelepon || "",
    });
    setEditId(pasien.id);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleTambahBaru = () => {
    setFormData({ nama: "", tanggalLahir: "", jenisKelamin: "", alamat: "", noTelepon: "" });
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  // --- LOGIKA SIMPAN ---
  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    if (formData.tanggalLahir > today) {
      alert("Oops, tanggal lahir gak boleh lewat dari hari ini ya!");
      return;
    }
    setIsLoading(true);
    try {
      const dataToSend: any = {
        nama: formData.nama,
        jenisKelamin: formData.jenisKelamin,
        tanggalLahir: formData.tanggalLahir,
      };

      if (formData.noTelepon && formData.noTelepon.trim() !== "") {
        dataToSend.noTelepon = formData.noTelepon;
      }
      if (formData.alamat && formData.alamat.trim() !== "") {
        dataToSend.alamat = formData.alamat;
      }

      const url = isEdit ? `/api/pasien/${editId}` : "/api/pasien";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify(dataToSend),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowForm(false);
        fetchPasien();
        setNotif(isEdit ? "Mantap! Data pasien berhasil diperbarui." : "Berhasil! Pasien baru sukses ditambahkan.");
        setTimeout(() => setNotif(null), 3000);
      } else {
        const errorMsg = json.details?.[0]?.message || json.error || "Gagal menyimpan";
        alert(errorMsg);
      }
    } catch (err) {
      alert("Koneksi ke server gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black relative">
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold">Data Pasien</h1>
          <p className="text-gray-400 mt-1 text-lg">Kelola informasi lengkap seluruh pasien klinik</p>
        </div>
        <button
          onClick={handleTambahBaru}
          className="bg-green-theme hover:bg-green-theme-dark text-2xl text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
        >
          <span className="text-2xl">+</span> Registrasi Pasien Baru
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-primary font-semibold text-gray-600 bg-white shadow-sm"
        >
          <option value="id">Urutkan: ID Default</option>
          <option value="nama">Urutkan: Nama (A-Z)</option>
          <option value="tanggalLahir">Urutkan: Usia Termuda</option>
        </select>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari nama atau no. telp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-gray-100 p-3 pl-11 rounded-xl focus:border-primary outline-none shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-xl">ID Pasien</th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-xl">Nama Lengkap</th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-xl">Tanggal Lahir</th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-xl">Jenis Kelamin</th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-xl">Nomor Telepon</th>
              <th className="px-4 py-3 uppercase text-xl text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-center font-semibold">
            {isTableLoading ? (
              // --- SKELETON LOADING ---
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="h-6 bg-gray-100 rounded w-20 mx-auto"></div></td>
                  <td className="p-4"><div className="h-6 bg-gray-100 rounded w-40"></div></td>
                  <td className="p-4"><div className="h-6 bg-gray-100 rounded w-32 mx-auto"></div></td>
                  <td className="p-4"><div className="h-6 bg-gray-100 rounded w-24 mx-auto"></div></td>
                  <td className="p-4"><div className="h-6 bg-gray-100 rounded w-28 mx-auto"></div></td>
                  <td className="p-4"><div className="h-8 bg-gray-100 rounded w-32 mx-auto"></div></td>
                </tr>
              ))
            ) : pagedData.length > 0 ? (
              // MAP DATA PAKAI pagedData BUKAN pasienList
              pagedData.map((pasien: any) => (
                <tr key={pasien.id} className="hover:bg-blue-50/50 transition-colors text-lg">
                  <td className="px-4 py-2.5 text-primary font-bold">{pasien.id || "-"}</td>
                  <td className="px-4 py-2.5 text-left capitalize">{pasien.nama}</td>
                  <td className="px-4 py-2.5">{pasien.tanggalLahir ? new Date(pasien.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</td>
                  <td className="px-4 py-2.5">{pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</td>
                  <td className="px-4 py-2.5">{pasien.noTelepon || "-"}</td>
                  <td className="px-4 py-2.5 flex justify-center items-center gap-2">
                    <Link href={`/data-pasien/${pasien.id}`} className="p-2 hover:bg-blue-100 rounded-lg transition-colors inline-block" title="Detail">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button onClick={() => handleEdit(pasien)} className="p-2 hover:bg-yellow-100 rounded-lg transition-colors" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => triggerDelete(pasien.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-6 py-20 text-gray-400 italic">Belum ada data pasien yang ditemukan.</td></tr>
            )}
          </tbody>
        </table>

        {/* ========================================== */}
        {/* COMPONENT PAGINATION DI BAWAH TABEL */}
        {/* ========================================== */}
        {!isTableLoading && pasienList.length > 0 && (
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

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white text-center">
              <h2 className="text-2xl font-bold">{isEdit ? "Edit Data Pasien" : "Registrasi Pasien Baru"}</h2>
            </div>
            <form onSubmit={handleSimpan} className="p-8 space-y-4">
              <input type="text" placeholder="Nama Lengkap" required value={formData.nama} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-primary outline-none" onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              <div className="flex gap-4">
                <select className="w-1/2 border-2 border-gray-100 p-3 rounded-xl outline-none" value={formData.jenisKelamin} onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })} required>
                  <option value="" disabled>Pilih Jenis Kelamin</option>
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
                <input type="date" required value={formData.tanggalLahir} className="w-1/2 border-2 border-gray-100 p-3 rounded-xl outline-none" onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })} />
              </div>
              <input 
                type="text" 
                placeholder="Nomor Telepon (Opsional)" 
                value={formData.noTelepon} 
                maxLength={15}
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-primary outline-none" 
                onChange={(e) => {
                  // Replace otomatis menghapus semua huruf/simbol yang diketik, sisa angka aja
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, noTelepon: onlyNums });
                }} 
              />              
              <textarea placeholder="Alamat Lengkap (Opsional)" value={formData.alamat} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-primary outline-none h-24 resize-none" onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all">
                  {isLoading ? "Menyimpan..." : isEdit ? "Update Data" : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteTarget && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-center animate-in zoom-in duration-200">
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold mb-2 text-black">Hapus Data Pasien?</h3>
      <p className="text-gray-500 mb-3 leading-relaxed">Data pasien yang dihapus <span className="font-bold text-red-600">tidak dapat dikembalikan</span>.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 text-left">
        <p className="text-xs font-bold text-orange-700 uppercase mb-1">Yang ikut terhapus:</p>
        <ul className="text-sm text-orange-600 font-semibold space-y-1">
          <li>• Semua riwayat rekam medis</li>
          <li>• Semua data jadwal kunjungan</li>
          <li>• Semua data pembayaran</li>
        </ul>
      </div>
      <p className="text-gray-500 text-sm mb-6">Pastikan pasien tidak memiliki kunjungan aktif dan tagihan yang belum lunas.</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setDeleteTarget(null);
            setNotif("Aman! Data pasien tidak jadi dihapus.");
            setTimeout(() => setNotif(null), 3000);
          }}
          className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={executeDelete}
          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-white shadow-lg transition-colors active:scale-95"
        >
          Ya, Hapus
        </button>
      </div>
    </div>
  </div>
)}

      {showNotifModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
      <div className="p-8 flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${notifData.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
          {notifData.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h2 className={`text-2xl font-black mb-2 ${notifData.type === "success" ? "text-green-700" : "text-red-700"}`}>
          {notifData.type === "success" ? "Berhasil!" : "Gagal!"}
        </h2>
        <p className="text-gray-500 font-medium mb-6">{notifData.message}</p>
        <button
          onClick={() => setShowNotifModal(false)}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}