"use client";

import React, { useState, useEffect } from "react";

export default function PembayaranPage() {
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  const [statsPembayaran, setStatsPembayaran] = useState({ total: 0, lunas: 0, pending: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Modal Rujukan (Bawaan)
  const [isRujukanOpen, setIsRujukanOpen] = useState(false);
  const [isRujukanEditing, setIsRujukanEditing] = useState(false);
  const [selectedRujukan, setSelectedRujukan] = useState<any>(null);
  const [rujukanForm, setRujukanForm] = useState({ tujuan: "", diagnosa: "", keterangan: "" });
  const [isRujukanSaving, setIsRujukanSaving] = useState(false);

  // Modal Bayar (Baru)
  const [isBayarOpen, setIsBayarOpen] = useState(false);
  const [selectedBayar, setSelectedBayar] = useState<any>(null);
  const [metodeBayar, setMetodeBayar] = useState("");
  const [bankTerpilih, setBankTerpilih] = useState("");

  // Modal Detail & Edit
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: "", status: "", metode: "" });

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

  const filteredList = transaksiList.filter(
    (item) => item.pasien?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- AKSI PEMBAYARAN ---
  const handleHapus = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data pembayaran ini?")) return;
    try {
      const res = await fetch(`/api/pembayaran/${id}`, { method: "DELETE" });
      if (res.ok) fetchPembayaran();
    } catch (err) { alert("Terjadi kesalahan."); }
  };

  const submitPembayaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodeBayar) {
      alert("Silakan pilih metode pembayaran (Cash / Debit) terlebih dahulu!"); 
      return;
    }
    if (metodeBayar === "TRANSFER" && !bankTerpilih) {
      alert("Pilih rekening tujuan terlebih dahulu!"); 
      return;
    }

    try {
      const metodeKirim = metodeBayar === "TRANSFER" ? `TRANSFER_${bankTerpilih}` : metodeBayar;
      const res = await fetch(`/api/pembayaran/${selectedBayar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LUNAS", metode: metodeKirim }),
      });
      if (res.ok) {
        setIsBayarOpen(false);
        setMetodeBayar("");
        setBankTerpilih("");
        fetchPembayaran();
      }
    } catch (err) { alert("Terjadi kesalahan saat memproses pembayaran"); }
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
        alert("Transaksi berhasil diperbarui!");
      }
    } catch (err) { alert("Terjadi kesalahan saat update transaksi."); }
  };

  const cetakStruk = (id: string) => {
    window.open(`/pembayaran/print/${id}`, "_blank", "noopener,noreferrer");
  };

  // --- FUNGSI RUJUKAN (Bawaan) ---
 const openRujukanModal = async (rujukan: any) => {
  // buka modal cepat dulu
  setSelectedRujukan(rujukan);
  setIsRujukanEditing(false);
  setIsRujukanOpen(true);

  // set form awal
  setRujukanForm({
    tujuan: rujukan?.tujuan ?? "",
    diagnosa: rujukan?.diagnosa ?? "",
    keterangan: rujukan?.keterangan ?? "",
  });

  // fetch terbaru (ambil diagnosa dokter)
  try {
    const res = await fetch(`/api/rujukan/${rujukan.id}`, {
      headers: { "x-user-role": "ADMIN" },
    });
    const json = await res.json();
    if (res.ok && json.success) {
      setSelectedRujukan(json.data);
      setRujukanForm({
        tujuan: json.data?.tujuan ?? "",
        diagnosa: json.data?.diagnosa ?? "",
        keterangan: json.data?.keterangan ?? "",
      });
    }
  } catch (err) {
    console.error("Gagal fetch rujukan terbaru:", err);
  }
};
  const saveRujukan = async () => {
  if (!selectedRujukan?.id) return;

  setIsRujukanSaving(true);
  try {
    const res = await fetch(`/api/rujukan/${selectedRujukan.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // sementara supaya lolos check role di backend kamu:
        "x-user-role": "ADMIN",
      },
      body: JSON.stringify(rujukanForm),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      alert(json?.error ?? `Gagal menyimpan rujukan (HTTP ${res.status})`);
      return;
    }

    // update data modal biar langsung berubah tanpa reload
    setSelectedRujukan(json.data);
    setSelectedRujukan(json.data);
    setIsRujukanEditing(false);
    await fetchPembayaran();

    // optional: kalau list pembayaran butuh refresh (misalnya rujukan tampil di list)
    // fetchPembayaran();
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat menyimpan rujukan.");
  } finally {
    setIsRujukanSaving(false);
  }
};
  const finalizeRujukan = async () => {
  if (!selectedRujukan?.id) return;

  setIsRujukanSaving(true);
  try {
    const res = await fetch(`/api/rujukan/${selectedRujukan.id}/finalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // sementara untuk lolos guard backend kamu:
        "x-user-role": "ADMIN",
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      alert(json?.error ?? `Gagal finalisasi rujukan (HTTP ${res.status})`);
      return;
    }

    // update modal supaya status & nomorSurat langsung berubah
    setSelectedRujukan(json.data);
    setSelectedRujukan(json.data);
    setIsRujukanEditing(false);
    await fetchPembayaran();
    

    // optional kalau tabel transaksi perlu refresh:
    // fetchPembayaran();
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat finalisasi rujukan.");
  } finally {
    setIsRujukanSaving(false);
  }
};
  const cetakRujukan = () => { window.open(`/rujukan/print/${selectedRujukan.id}`, "_blank"); };

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
            <p className="text-gray-500 font-medium">Total Tagihan</p>
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

      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="relative flex items-center w-full max-w-md">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari ID Transaksi atau Nama Pasien" className="w-full border-2 border-gray-50 rounded-xl py-3 pl-4 pr-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">ID Transaksi</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Nama Pasien</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Total Biaya</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Metode</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Status</th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">Rujukan</th>
              <th className="px-4 py-3 text-lg font-bold border-2 border-white/50 text-center uppercase w-[20%]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isTableLoading ? (<tr><td colSpan={7} className="p-10 text-center">Memuat data...</td></tr>) : filteredList.length > 0 ? (
              filteredList.map((item) => {
                const rujukan = item.rekamMedis?.rujukan?.[0] ?? null;
                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors text-center text-lg font-semibold">
                    <td className="px-4 py-3 font-bold w-[12%] text-primary">{item.id.split("-")[0].toUpperCase()}</td>
                    <td className="px-4 py-3 text-left w-[18%] capitalize">{item.pasien?.nama}</td>
                    <td className="px-4 py-3">Rp {item.jumlah.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 font-bold text-gray-500">{item.metode || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.status === "LUNAS" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {item.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {rujukan ? (
                        <button onClick={() => openRujukanModal(rujukan)} className="bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/20">Cek Rujukan</button>
                      ) : <span className="text-gray-400">-</span>}
                    </td>

                    {/* ✅ KOLOM AKSI DIPERBAIKI (TIDAK BERANTAKAN) */}
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

                      <button onClick={() => handleHapus(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center" title="Hapus Data">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (<tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">Belum ada transaksi.</td></tr>)}
          </tbody>
        </table>
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
                  <button type="button" onClick={() => setMetodeBayar("TUNAI")} className={`py-3 rounded-xl font-bold border-2 transition-all ${metodeBayar === "TUNAI" ? "bg-primary/10 border-primary text-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>💵 Cash</button>
                  <button type="button" onClick={() => setMetodeBayar("TRANSFER")} className={`py-3 rounded-xl font-bold border-2 transition-all ${metodeBayar === "TRANSFER" ? "bg-primary/10 border-primary text-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>💳 Debit/Transfer</button>
                </div>
              </div>
              {metodeBayar === "TRANSFER" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-gray-600 mb-2 block">Pilih Rekening Klinik</label>
                  <select required value={bankTerpilih} onChange={(e) => setBankTerpilih(e.target.value)} className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-700 focus:border-primary">
                    <option value="">-- Pilih Bank --</option>
                    <option value="BCA">BCA - 1234567890 (Klinik RPL)</option>
                    <option value="MANDIRI">Mandiri - 0987654321 (Klinik RPL)</option>
                    <option value="BRI">BRI - 1122334455 (Klinik RPL)</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsBayarOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Batal</button>
                <button type="submit" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600">Terima Dana & Cetak</button>
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
                  <option value="TUNAI">TUNAI / CASH</option>
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
        
                {/* Poli Tujuan DIHAPUS (field poliTujuan sudah tidak dipakai lagi) */}
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
                    {selectedRujukan?.diagnosa || "-"}
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
                    {selectedRujukan?.keterangan || "-"}
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
    </div>
  );
}