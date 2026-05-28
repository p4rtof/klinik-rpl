"use client";

import React, { useState, useEffect, useMemo } from "react";

interface Tindakan {
  id: string;
  kodeTindakan: string;
  namaTindakan: string;
  harga: number;
}

export default function TindakanPage() {
  const [tindakanList, setTindakanList] = useState<Tindakan[]>([]);
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
    kodeTindakan: "",
    namaTindakan: "",
    harga: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const fetchTindakan = async () => {
    setIsTableLoading(true);
    try {
      const res = await fetch("/api/tindakan-medis", {
        headers: { "x-user-role": "ADMIN" },
      });
      const json = await res.json();
      if (json.success) {
        setTindakanList(json.data);
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Gagal mengambil data tindakan.");
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTindakan();
  }, []);

  // Client-side filtering
  const filteredList = useMemo(() => {
    return tindakanList.filter(
      (item) =>
        item.kodeTindakan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.namaTindakan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tindakanList, searchQuery]);

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, safePage]);

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
      kodeTindakan: "",
      namaTindakan: "",
      harga: 0,
    });
    setIsEditing(false);
    setSelectedId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tindakan: Tindakan) => {
    setFormData({
      kodeTindakan: tindakan.kodeTindakan,
      namaTindakan: tindakan.namaTindakan,
      harga: tindakan.harga,
    });
    setIsEditing(true);
    setSelectedId(tindakan.id);
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
      const url = isEditing ? `/api/tindakan-medis/${selectedId}` : "/api/tindakan-medis";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({
          kodeTindakan: formData.kodeTindakan.trim(),
          namaTindakan: formData.namaTindakan.trim(),
          harga: Number(formData.harga),
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotification("success", isEditing ? "Tindakan berhasil diperbarui." : "Tindakan berhasil ditambahkan.");
        setIsFormOpen(false);
        fetchTindakan();
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
      const res = await fetch(`/api/tindakan-medis/${deleteTargetId}`, {
        method: "DELETE",
        headers: { "x-user-role": "ADMIN" },
      });
      const json = await res.json();
      if (json.success) {
        showNotification("success", "Tindakan berhasil dihapus.");
        fetchTindakan();
      } else {
        showNotification("error", json.error || "Gagal menghapus tindakan.");
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
          <h1 className="text-3xl font-bold text-primary">Kelola Data Tindakan</h1>
          <p className="text-gray-500 mt-1">Daftar layanan medis, tarif konsultasi, dan tindakan klinis</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-primary/95 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Tindakan Baru
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
            placeholder="Cari kode tindakan atau nama tindakan..."
            className="w-full border-2 border-gray-50 rounded-xl py-3 pl-4 pr-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Kode Tindakan</th>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nama Tindakan / Layanan</th>
              <th className="px-6 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Tarif Layanan</th>
              <th className="px-6 py-3 text-lg font-bold border-2 border-white/50 text-center uppercase w-[15%]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isTableLoading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-500">Memuat data tindakan...</td>
              </tr>
            ) : paginatedList.length > 0 ? (
              paginatedList.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors text-center text-lg font-semibold">
                  <td className="px-6 py-4 font-bold text-primary">{item.kodeTindakan}</td>
                  <td className="px-6 py-4 text-left capitalize">{item.namaTindakan}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">Rp {item.harga.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 flex items-center transition-all active:scale-95"
                      title="Edit Tindakan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center transition-all active:scale-95"
                      title="Hapus Tindakan"
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
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Belum ada data tindakan medis.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!isTableLoading && filteredList.length > 0 && (
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
              <h2 className="text-xl font-black">{isEditing ? "Edit Tindakan Medis" : "Tambah Tindakan Baru"}</h2>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Kode Tindakan</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.kodeTindakan}
                  onChange={(e) => setFormData({ ...formData, kodeTindakan: e.target.value })}
                  placeholder="Contoh: TDK001"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Nama Tindakan / Layanan</label>
                <input
                  type="text"
                  required
                  value={formData.namaTindakan}
                  onChange={(e) => setFormData({ ...formData, namaTindakan: e.target.value })}
                  placeholder="Nama tindakan (misal: Cek darah, Hecting)"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Tarif Layanan (Rp)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.harga === 0 ? "" : formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
                  placeholder="Tarif tindakan medis"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary"
                />
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
                Apakah Anda yakin ingin menghapus tindakan medis ini? Tindakan ini tidak dapat dibatalkan.
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
