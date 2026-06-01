"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function PembayaranPage() {
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  const [statsPembayaran, setStatsPembayaran] = useState({ total: 0, lunas: 0, pending: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [notif, setNotif] = useState<string | null>(null); 

  // Modal Rujukan (Bawaan)
  const [isRujukanOpen, setIsRujukanOpen] = useState(false);
  const [isRujukanEditing, setIsRujukanEditing] = useState(false);
  const [selectedRujukan, setSelectedRujukan] = useState<any>(null);
  const [rujukanForm, setRujukanForm] = useState({ tujuan: "", poliTujuan: "", diagnosa: "", keterangan: "" });
  const [isRujukanSaving, setIsRujukanSaving] = useState(false);

  // Modal Bayar (Baru)
  const [isBayarOpen, setIsBayarOpen] = useState(false);
  const [selectedBayar, setSelectedBayar] = useState<any>(null);
  const [metodeBayar, setMetodeBayar] = useState("");
  const [bankTerpilih, setBankTerpilih] = useState("");
  const [isBayarSaving, setIsBayarSaving] = useState(false);

  // Modal Detail & Edit
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: "", status: "", metode: "" });

  // Modal Konfirmasi & Notifikasi
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifData, setNotifData] = useState<{ type: "success" | "error"; message: string }>({ type: "success", message: "" });

  const showNotif = (type: "success" | "error", message: string) => {
    setNotifData({ type, message });
    setShowNotifModal(true);
  };

  const fetchPembayaran = async () => {
    setIsTableLoading(true);
    try {
      const res = await fetch("/api/pembayaran");
      const json = await res.json();
      if (json.success) {
        setTransaksiList(json.data);
        const totalTagihan = json.data.reduce((acc: number, curr: any) => acc + curr.jumlah, 0);
        const lunas = json.data.filter((t: any) => t.status === "LUNAS").length;
        const pending = json.data.filter((t: any) => t.status === "BELUM_BAYAR").length;
        setStatsPembayaran({ total: totalTagihan, lunas, pending });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => { fetchPembayaran(); }, []);

  const filteredList = transaksiList.filter((item) => {
  const matchSearch =
    item.pasien?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase());

  const tglItem = item.tanggal || item.rekamMedis?.tanggal || item.createdAt;
  const tglStr = tglItem ? new Date(tglItem).toISOString().split("T")[0] : "";

  const matchMulai = !filterTanggalMulai || tglStr >= filterTanggalMulai;
  const matchAkhir = !filterTanggalAkhir || tglStr <= filterTanggalAkhir;

  return matchSearch && matchMulai && matchAkhir;
});

  // ==========================================
  // STATE & LOGIKA PAGINATION (Sama seperti Data Pasien)
  // ==========================================
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

  // --- AKSI PEMBAYARAN ---
  const confirmHapus = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleHapus = async () => {
  if (!deleteTargetId) return;
  try {
    // Cek status transaksi yang mau dihapus
    const targetTransaksi = transaksiList.find((t) => t.id === deleteTargetId);
    if (targetTransaksi?.status === "BELUM_BAYAR") {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      showNotif("error", "Transaksi tidak dapat dihapus karena pembayaran belum lunas.");
      return;
    }

    const res = await fetch(`/api/pembayaran/${deleteTargetId}`, { method: "DELETE" });
    if (res.ok) {
      fetchPembayaran();
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setNotif("Transaksi berhasil dihapus.");
      setTimeout(() => setNotif(null), 3000);
    } else {
      showNotif("error", "Gagal menghapus data pembayaran.");
    }
  } catch (err) {
    showNotif("error", "Terjadi kesalahan.");
  } finally {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  }
};

  const submitPembayaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodeBayar) {
      showNotif("error", "Silakan pilih metode pembayaran (Tunai / Debit) terlebih dahulu!");
      
      return;
    }
    if (metodeBayar === "TRANSFER" && !bankTerpilih) {
      showNotif("error","Pilih rekening tujuan terlebih dahulu!"); 
      return;
    }

    setIsBayarSaving(true);
    try {
      const metodeKirim = metodeBayar === "TRANSFER" ? `TRANSFER_${bankTerpilih}` : metodeBayar;
      const res = await fetch(`/api/pembayaran/${selectedBayar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LUNAS", metode: metodeKirim }),
      });
      if (res.ok) {
        setIsBayarOpen(false);
        const paymentId = selectedBayar.id;
        setMetodeBayar("");
        setBankTerpilih("");
        fetchPembayaran();
        
        cetakStruk(paymentId);
      } else {
        const errJson = await res.json();
        showNotif("error", "Gagal memproses pembayaran: " + (errJson.error || "Unknown error"));
      }
    } catch (err) { 
      showNotif("error", "Terjadi kesalahan koneksi saat memproses pembayaran.");
    } finally { 
      setIsBayarSaving(false); 
    }
  };

  const openDetailModal = (item: any) => {
    setDetailData(item);
    setIsDetailOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditData({
      id: item.id,
      status: item.status,
      metode: item.metode || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pembayaran/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editData.status, metode: editData.metode || null }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        fetchPembayaran();
        setNotif("Mantap! Transaksi berhasil diperbarui.");
        setTimeout(() => setNotif(null), 3000);
      }
    } catch (err) { 
      showNotif("error", "Terjadi kesalahan saat update transaksi.");
    }
  };

  const cetakStruk = (id: string) => {
    window.open(`/pembayaran/print/${id}`, "_blank", "noopener,noreferrer");
  };

  // --- FUNGSI RUJUKAN (Bawaan) ---
  const openRujukanModal = (rm: any) => {
    const rujukan = rm.rujukan;
    setSelectedRujukan(rujukan);
    
    const diagnosaDokter = rm.diagnosis?.map((d: any) => d.diagnosis).join(", ") || "";
    const catatanDokter = rm.catatanTambahan || "";
    
    setRujukanForm({ 
      tujuan: rujukan?.tujuan ?? "", 
      poliTujuan: rujukan?.poliTujuan ?? "", 
      diagnosa: rujukan?.diagnosa || diagnosaDokter, 
      keterangan: (rujukan?.keterangan && rujukan.keterangan !== "Rujukan berdasarkan hasil pemeriksaan dokter") 
        ? rujukan.keterangan 
        : catatanDokter || "Rujukan berdasarkan hasil pemeriksaan dokter"
    });
    
    setIsRujukanEditing(false); 
    setIsRujukanOpen(true);
  };

  const saveRujukan = async () => {
    setIsRujukanSaving(true);
    try {
      const res = await fetch(`/api/rujukan/${selectedRujukan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rujukanForm),
      });
      if (res.ok) {
        setIsRujukanEditing(false);
        fetchPembayaran(); 
        showNotif("success", "Rujukan berhasil disimpan!");
      }
    } catch (err) { 
      showNotif("error", "Gagal menyimpan rujukan.");
    } finally { 
      setIsRujukanSaving(false); 
    }
  };

  const finalizeRujukan = async () => {
    setShowFinalizeModal(true);
  };

  const doFinalizeRujukan = async () => {
    setShowFinalizeModal(false);
    setIsRujukanSaving(true);
    try {
      const res = await fetch(`/api/rujukan/${selectedRujukan.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rujukanForm),
      });
      if (res.ok) {
        setIsRujukanOpen(false);
        fetchPembayaran();
        showNotif("success", "Rujukan berhasil difinalisasi!");
      }
    } catch (err) {
      showNotif("error", "Gagal memfinalisasi rujukan.");
    } finally {
      setIsRujukanSaving(false);
    }
  };

  const cetakRujukan = () => {
    const rujukanId = selectedRujukan?.id;
    if (!rujukanId) return;

    window.open(`/rujukan/print/${rujukanId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold">Data Transaksi</h1>
          <p className="text-gray-400 mt-1 text-lg">Kelola tagihan dan status pembayaran pasien</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img src="/componen-admin/kantong-uang.svg" className="w-15 h-15 opacity-180" alt="" />
          <div>
            <p className="text-gray-500 font-medium">Total Pendapatan</p>
            <p className="text-2xl font-bold text-primary">Rp {statsPembayaran.total.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img src="/componen-admin/lunas.svg" className="w-15 h-15 opacity-180" alt="" />
          <div>
            <p className="text-gray-500 font-medium">Sudah Lunas</p>
            <p className="text-2xl font-bold text-green-600">{statsPembayaran.lunas} Transaksi</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img src="/componen-admin/waiting.svg" className="w-15 h-15 opacity-180" alt="" />
          <div>
            <p className="text-gray-500 font-medium">Menunggu Pembayaran</p>
            <p className="text-2xl font-bold text-orange-500">{statsPembayaran.pending} Transaksi</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Cari ID Transaksi atau Nama Pasien"
    className="flex-1 min-w-[200px] border-2 border-gray-50 rounded-xl py-3 px-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50"
  />
  <div className="flex items-center gap-2">
    <label className="text-sm font-bold text-gray-400 whitespace-nowrap">Dari:</label>
    <input
      type="date"
      value={filterTanggalMulai}
      onChange={(e) => setFilterTanggalMulai(e.target.value)}
      className="border-2 border-gray-50 rounded-xl py-3 px-3 text-sm font-semibold outline-none text-gray-500 focus:border-primary bg-gray-50/50"
    />
  </div>
  <div className="flex items-center gap-2">
    <label className="text-sm font-bold text-gray-400 whitespace-nowrap">Sampai:</label>
    <input
      type="date"
      value={filterTanggalAkhir}
      onChange={(e) => setFilterTanggalAkhir(e.target.value)}
      className="border-2 border-gray-50 rounded-xl py-3 px-3 text-sm font-semibold outline-none  text-gray-500 focus:border-primary bg-gray-50/50"
    />
  </div>
  {(filterTanggalMulai || filterTanggalAkhir) && (
    <button
      onClick={() => { setFilterTanggalMulai(""); setFilterTanggalAkhir(""); }}
      className="px-4 py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
    >
      Reset Filter
    </button>
  )}
</div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">ID Transaksi</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nama Pasien</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Total Biaya</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Tgl Kunjungan</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Status</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Rujukan</th>
              <th className="px-4 py-3 text-lg font-bold border-2 border-white/50 text-center uppercase w-[20%]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isTableLoading ? (<tr><td colSpan={7} className="p-10 text-center">Memuat data...</td></tr>) : filteredList.length > 0 ? (
              paginatedList.map((item) => {
                const rujukan = item.rekamMedis?.rujukan ?? null;
                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors text-center text-lg font-semibold">
                    <td className="px-4 py-3 font-bold w-[12%] text-primary">{item.id.split("-")[0].toUpperCase()}</td>
                    <td className="px-4 py-3 text-left w-[18%] capitalize">{item.pasien?.nama}</td>
                    <td className="px-4 py-3">Rp {item.jumlah.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 font-bold">
                      {(() => {
    // Cari tanggal dari berbagai kemungkinan field di database kamu
    const tgl = item.tanggal || item.createdAt || item.antrian?.tanggal || item.rekamMedis?.tanggal;
    
    return tgl 
      ? new Date(tgl).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";
  })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.status === "LUNAS" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {item.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {rujukan ? (
                        <button onClick={() => openRujukanModal(item.rekamMedis)} className="bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/20">Cek Rujukan</button>
                      ) : <span className="text-gray-400">-</span>}
                    </td>

                    <td className="px-4 py-3 flex justify-center items-center gap-2">
                      <button onClick={() => openDetailModal(item)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 flex items-center" title="Detail Transaksi">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      
                      <button onClick={() => openEditModal(item)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 flex items-center" title="Edit Transaksi">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>

                      {item.status === "BELUM_BAYAR" ? (
                        <button onClick={() => { setSelectedBayar(item); setIsBayarOpen(true); }} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center" title="Proses Pembayaran">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                        </button>
                      ) : (
                        <button onClick={() => cetakStruk(item.id)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center" title="Cetak Struk">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        </button>
                      )}

                      <button onClick={() => confirmHapus(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center" title="Hapus Data">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (<tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">Belum ada transaksi.</td></tr>)}
          </tbody>
        </table>

        {/* PAGINATION UI SAMA PERSIS DENGAN DATA PASIEN */}
        {!isTableLoading && filteredList.length > 0 && (
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

      {/* --- MODAL PROSES PEMBAYARAN --- */}
      {isBayarOpen && selectedBayar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-primary text-white p-5 text-center">
              <h2 className="text-xl font-black">Proses Pembayaran</h2>
            </div>
            <form onSubmit={submitPembayaran} className="p-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase text-center">Total Tagihan</p>
                <p className="text-3xl font-black text-center text-primary mt-1">Rp {selectedBayar.jumlah.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setMetodeBayar("TUNAI")} className={`py-3 rounded-xl font-bold border-2 transition-all ${metodeBayar === "TUNAI" ? "bg-primary/10 border-primary text-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>💵 Tunai</button>
                  <button type="button" onClick={() => setMetodeBayar("TRANSFER")} className={`py-3 rounded-xl font-bold border-2 transition-all ${metodeBayar === "TRANSFER" ? "bg-primary/10 border-primary text-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>💳 Debit/Transfer</button>
                </div>
              </div>
              {metodeBayar === "TRANSFER" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-gray-600 mb-2 block">Pilih Rekening Klinik</label>
                  <select required value={bankTerpilih} onChange={(e) => setBankTerpilih(e.target.value)} className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary">
                    <option value="">-- Pilih Bank --</option>
                    <option value="BCA">BCA - 1234567890 (Klinik dr.Yofli)</option>
                    <option value="MANDIRI">Mandiri - 0987654321 (Klinik dr.Yofli)</option>
                    <option value="BRI">BRI - 1122334455 (Klinik dr.Yofli)</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsBayarOpen(false)} disabled={isBayarSaving} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isBayarSaving} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 disabled:opacity-50">
                  {isBayarSaving ? "Memproses..." : "Terima Dana & Cetak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL TRANSAKSI --- */}
      {isDetailOpen && detailData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white text-center">
              <h2 className="text-2xl font-black">Detail Transaksi</h2>
            </div>
            <div className="p-8 space-y-4 font-bold text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2"><p>ID Transaksi:</p><p className="text-indigo-600">{detailData.id.split("-")[0].toUpperCase()}</p></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><p>Pasien:</p><p className="uppercase">{detailData.pasien?.nama}</p></div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <p className="text-gray-700">Tanggal Kunjungan:</p>
                <p className="font-bold">
                  {detailData?.rekamMedis?.tanggal || detailData?.tanggal || detailData?.createdAt
                    ? new Date(detailData.rekamMedis?.tanggal || detailData.tanggal || detailData.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><p>Status:</p><p className={detailData.status === "LUNAS" ? "text-green-600" : "text-orange-500"}>{detailData.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}</p></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><p>Metode:</p><p>{detailData.metode || "-"}</p></div>
              <div className="flex justify-between pt-2"><p className="text-gray-500">Total Biaya:</p><p className="text-xl font-black text-black">Rp {detailData.jumlah.toLocaleString('id-ID')}</p></div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={() => setIsDetailOpen(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-black hover:bg-gray-300">TUTUP</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT TRANSAKSI --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden">
            <div className="bg-yellow-500 p-6 text-white text-center">
              <h2 className="text-2xl font-black">Edit Transaksi</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Status Pembayaran</label>
                <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none mt-1 focus:border-yellow-500 font-bold text-gray-700">
                  <option value="BELUM_BAYAR">BELUM BAYAR</option>
                  <option value="LUNAS">LUNAS</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Metode Pembayaran</label>
                <select value={editData.metode} onChange={(e) => setEditData({ ...editData, metode: e.target.value })} className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none mt-1 focus:border-yellow-500 font-bold text-gray-700">
                  <option value="">-- Belum Dipilih --</option>
                  <option value="TUNAI">TUNAI</option>
                  <option value="TRANSFER_BCA">TRANSFER BCA</option>
                  <option value="TRANSFER_MANDIRI">TRANSFER MANDIRI</option>
                  <option value="TRANSFER_BRI">TRANSFER BRI</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Batal</button>
                <button type="submit" className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-yellow-600 transition-colors">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL RUJUKAN BAWAAN --- */}
      {isRujukanOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Detail Rujukan</h2>
              <button
                onClick={() => setIsRujukanOpen(false)}
                className="text-white/90 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Status
                  </label>
                  <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                    {selectedRujukan?.status ?? "-"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    No Surat
                  </label>
                  <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                    {selectedRujukan?.nomorSurat ?? "-"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Tujuan
                </label>
                {isRujukanEditing ? (
                  <input
                    value={rujukanForm.tujuan}
                    onChange={(e) =>
                      setRujukanForm({ ...rujukanForm, tujuan: e.target.value })
                    }
                    className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                  />
                ) : (
                  <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                    {selectedRujukan?.tujuan || "-"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Diagnosa
                </label>
                {isRujukanEditing ? (
                  <input
                    value={rujukanForm.diagnosa}
                    onChange={(e) =>
                      setRujukanForm({
                        ...rujukanForm,
                        diagnosa: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                  />
                ) : (
                  <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                    {selectedRujukan?.diagnosa || rujukanForm.diagnosa || "-"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Keterangan
                </label>
                {isRujukanEditing ? (
                  <textarea
                    value={rujukanForm.keterangan}
                    onChange={(e) =>
                      setRujukanForm({
                        ...rujukanForm,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary min-h-[100px]"
                  />
                ) : (
                  <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold whitespace-pre-wrap">
                    {selectedRujukan?.keterangan || rujukanForm.keterangan || "-"}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-3">
              {!isRujukanEditing ? (
                <>
                  {selectedRujukan?.status !== "FINAL" ? (
                    <>
                      <button
                        onClick={() => setIsRujukanEditing(true)}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all"
                      >
                        Edit
                      </button>

                      <button
                        onClick={finalizeRujukan}
                        disabled={isRujukanSaving}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        {isRujukanSaving ? "Memproses..." : "Finalisasi"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={cetakRujukan}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Cetak
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsRujukanEditing(false)}
                    disabled={isRujukanSaving}
                    className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveRujukan}
                    disabled={isRujukanSaving}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    {isRujukanSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Hapus Transaksi?</h2>
              <p className="text-gray-500 font-medium mb-6">Data pembayaran ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
              <div className="flex gap-3 w-full">
              <button 
                onClick={() => { 
                  setShowDeleteModal(false); 
                  setDeleteTargetId(null); 
                  // Memanggil notif saat batal hapus
                  setNotif("Aman! Data transaksi tidak jadi dihapus.");
                  setTimeout(() => setNotif(null), 3000);
                }} 
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
                <button onClick={handleHapus} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors active:scale-95">Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI FINALISASI */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Finalisasi Rujukan?</h2>
              <p className="text-gray-500 font-medium mb-6">Setelah difinalisasi, rujukan <span className="font-bold text-gray-700">tidak dapat diedit lagi</span>. Pastikan semua data sudah benar.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowFinalizeModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Batal</button>
                <button onClick={doFinalizeRujukan} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors active:scale-95">Ya, Finalisasi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden">
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
              <button onClick={() => setShowNotifModal(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
      {notif && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-300 font-bold text-sm">
          <span className="text-lg">ℹ️</span>
          <span>{notif}</span>
        </div>
      )}
    </div>
  );
}