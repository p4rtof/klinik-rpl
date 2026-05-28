"use client";

import React, { useState, useEffect, useMemo } from "react";

interface Obat {
  id: string;
  kodeObat: string;
  namaObat: string;
  satuan: string;
  hargaJual: number;
  stok: number;
  createdAt: string;
}

export default function ObatPage() {
  const [obatList, setObatList] = useState<Obat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [notif, setNotif] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    kodeObat: "",
    namaObat: "",
    satuan: "tablet",
    hargaJual: 0,
    stok: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const fetchObat = async () => {
    setIsTableLoading(true);
    try {
      const res = await fetch(`/api/obat?q=${searchQuery}`, {
        headers: { "x-user-role": "ADMIN" },
      });
      const json = await res.json();
      if (json.success) {
        setObatList(json.data);
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Gagal mengambil data obat.");
    } finally {
      setIsTableLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchObat();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(obatList.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return obatList.slice(start, start + pageSize);
  }, [obatList, safePage]);

  const renderPageButtons = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 9);
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

  const handleOpenAdd = () => {
    setFormData({
      kodeObat: "",
      namaObat: "",
      satuan: "tablet",
      hargaJual: 0,
      stok: 0,
    });
    setIsEditing(false);
    setSelectedId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (obat: Obat) => {
    setFormData({
      kodeObat: obat.kodeObat,
      namaObat: obat.namaObat,
      satuan: obat.satuan,
      hargaJual: obat.hargaJual,
      stok: obat.stok,
    });
    setIsEditing(true);
    setSelectedId(obat.id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = isEditing ? `/api/obat/${selectedId}` : "/api/obat";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({
          kodeObat: formData.kodeObat.trim(),
          namaObat: formData.namaObat.trim(),
          satuan: formData.satuan,
          hargaJual: Number(formData.hargaJual),
          stok: Number(formData.stok),
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotification("success", isEditing ? "Obat berhasil diperbarui." : "Obat berhasil ditambahkan.");
        setIsFormOpen(false);
        fetchObat();
      } else {
        showNotification("error", json.error || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/obat/${deleteTargetId}`, {
        method: "DELETE",
        headers: { "x-user-role": "ADMIN" },
      });
      const json = await res.json();
      if (json.success) {
        showNotification("success", "Obat berhasil dihapus.");
        fetchObat();
      } else {
        showNotification("error", json.error || "Gagal menghapus obat.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Terjadi kesalahan saat menghapus data.");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Kelola Data Obat</h1>
          <p className="text-gray-500 mt-1">Daftar obat-obatan, stok, dan harga jual apotek</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-primary/95 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Obat Baru
        </button>
      </div>

      {/* Floating Notification */}
      {notif && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 font-bold ${
            notif.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {notif.type === "success" ? "✅ " : "❌ "}
          {notif.message}
        </div>
      )}

      {/* Filter & Cari */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center">
        <div className="relative flex items-center w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode obat atau nama obat..."
            className="w-full border-2 border-gray-50 rounded-xl py-3 pl-4 pr-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Kode Obat</th>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nama Obat</th>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Satuan</th>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Harga Jual</th>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Stok</th>
              <th className="px-6 py-3 text-lg font-bold border-2 border-white/50 text-center uppercase w-[15%]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isTableLoading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">Memuat data obat...</td>
              </tr>
            ) : paginatedList.length > 0 ? (
              paginatedList.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors text-center text-lg font-semibold">
                  <td className="px-6 py-4 font-bold text-primary">{item.kodeObat}</td>
                  <td className="px-6 py-4 text-left capitalize">{item.namaObat}</td>
                  <td className="px-6 py-4 capitalize">{item.satuan}</td>
                  <td className="px-6 py-4 text-right">Rp {item.hargaJual.toLocaleString("id-ID")}</td>
                  <td className={`px-6 py-4 font-bold ${item.stok <= 10 ? "text-red-500" : "text-gray-800"}`}>
                    {item.stok}
                  </td>
                  <td className="px-6 py-4 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 flex items-center transition-all active:scale-95"
                      title="Edit Obat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center transition-all active:scale-95"
                      title="Hapus Obat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Belum ada data obat.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!isTableLoading && obatList.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2 py-1 text-primary font-bold disabled:opacity-30 transition-all"
            >
              &lt;
            </button>
            {renderPageButtons()}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2 py-1 text-primary font-bold disabled:opacity-30 transition-all"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* --- FORM MODAL (ADD & EDIT) --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary text-white p-5 text-center">
              <h2 className="text-xl font-black">{isEditing ? "Edit Data Obat" : "Tambah Obat Baru"}</h2>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Kode Obat</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.kodeObat}
                  onChange={(e) => setFormData({ ...formData, kodeObat: e.target.value })}
                  placeholder="Contoh: OBT001"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Nama Obat</label>
                <input
                  type="text"
                  required
                  value={formData.namaObat}
                  onChange={(e) => setFormData({ ...formData, namaObat: e.target.value })}
                  placeholder="Nama Obat (misal: Paracetamol 500mg)"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Satuan</label>
                <select
                  required
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary"
                >
                  <option value="tablet">Tablet</option>
                  <option value="botol">Botol</option>
                  <option value="capsul">Capsul</option>
                  <option value="ampul">Ampul</option>
                  <option value="tube">Tube</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-1 block">Harga Jual</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.hargaJual === 0 ? "" : formData.hargaJual}
                    onChange={(e) => setFormData({ ...formData, hargaJual: Number(e.target.value) })}
                    placeholder="Rp"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-1 block">Stok awal</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stok === 0 ? "" : formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
                    placeholder="Stok"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-500 text-white p-5 text-center">
              <h2 className="text-xl font-black">Konfirmasi Hapus</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-lg font-bold text-gray-700 text-center">
                Apakah Anda yakin ingin menghapus data obat ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteExecute}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-md"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
