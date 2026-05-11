"use client";

import React, { useState, useEffect } from "react";

export default function PembayaranPage() {
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  const [statsPembayaran, setStatsPembayaran] = useState({
    total: 0,
    lunas: 0,
    pending: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Modal Rujukan
  const [isRujukanOpen, setIsRujukanOpen] = useState(false);
  const [isRujukanEditing, setIsRujukanEditing] = useState(false);
  const [selectedRujukan, setSelectedRujukan] = useState<any>(null);
  const [rujukanForm, setRujukanForm] = useState({
    tujuan: "",
    poliTujuan: "",
    diagnosa: "",
    keterangan: "",
  });
  const [isRujukanSaving, setIsRujukanSaving] = useState(false);

  const fetchPembayaran = async () => {
    setIsTableLoading(true);
    try {
      const res = await fetch("/api/pembayaran");
      const json = await res.json();
      if (json.success) {
        setTransaksiList(json.data);

        const totalTagihan = json.data.reduce(
          (acc: number, curr: any) => acc + curr.jumlah,
          0
        );
        const lunas = json.data.filter((t: any) => t.status === "LUNAS").length;
        const pending = json.data.filter(
          (t: any) => t.status === "BELUM_BAYAR"
        ).length;

        setStatsPembayaran({ total: totalTagihan, lunas, pending });
      }
    } catch (err) {
      console.error("Gagal memuat pembayaran", err);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const handleLunas = async (id: string) => {
    if (!confirm("Tandai transaksi ini sebagai LUNAS?")) return;
    try {
      const res = await fetch(`/api/pembayaran/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LUNAS" }),
      });
      if (res.ok) fetchPembayaran();
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const filteredList = transaksiList.filter(
    (item) =>
      item.pasien?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRujukanModal = (rujukan: any) => {
    setSelectedRujukan(rujukan);
    setRujukanForm({
      tujuan: rujukan?.tujuan ?? "",
      poliTujuan: rujukan?.poliTujuan ?? "",
      diagnosa: rujukan?.diagnosa ?? "",
      keterangan: rujukan?.keterangan ?? "",
    });
    setIsRujukanEditing(false);
    setIsRujukanOpen(true);
  };

  const saveRujukan = async () => {
    if (!selectedRujukan?.id) return;

    setIsRujukanSaving(true);
    try {
      const res = await fetch(`/api/rujukan/${selectedRujukan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tujuan: rujukanForm.tujuan,
          poliTujuan: rujukanForm.poliTujuan,
          diagnosa: rujukanForm.diagnosa,
          keterangan: rujukanForm.keterangan,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.error || "Gagal menyimpan rujukan");
        return;
      }

      setIsRujukanOpen(false);
      await fetchPembayaran(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan rujukan");
    } finally {
      setIsRujukanSaving(false);
    }
  };

  const finalizeRujukan = async () => {
    if (!selectedRujukan?.id) return;

    if (
      !confirm(
        "Finalisasi rujukan? Setelah FINAL rujukan tidak bisa diedit lagi."
      )
    )
      return;

    setIsRujukanSaving(true);
    try {
      const res = await fetch(`/api/rujukan/${selectedRujukan.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.error || "Gagal finalisasi rujukan");
        return;
      }

      setSelectedRujukan(json.data);
      await fetchPembayaran();
      alert("Rujukan berhasil difinalisasi");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat finalisasi rujukan");
    } finally {
      setIsRujukanSaving(false);
    }
  };

  const cetakRujukan = () => {
    if (!selectedRujukan?.id) return;
    window.open(
      `/rujukan/print/${selectedRujukan.id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black">
      {/* Header Halaman */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold">Data Transaksi</h1>
          <p className="text-gray-400 mt-1 text-lg">
            Kelola tagihan dan status pembayaran pasien
          </p>
        </div>
      </div>

      {/* Ringkasan Status Pembayaran */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img
            src="/componen-admin/kantong-uang.svg"
            className="w-15 h-15 opacity-180"
            alt=""
          />
          <div>
            <p className="text-gray-500 font-medium">Total Tagihan</p>
            {isTableLoading ? (
              <div className="h-8 bg-gray-100 animate-pulse w-32 rounded-lg mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-primary">
                Rp {statsPembayaran.total.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img
            src="/componen-admin/lunas.svg"
            className="w-15 h-15 opacity-180"
            alt=""
          />
          <div>
            <p className="text-gray-500 font-medium">Sudah Lunas</p>
            {isTableLoading ? (
              <div className="h-8 bg-gray-100 animate-pulse w-24 rounded-lg mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {statsPembayaran.lunas} Transaksi
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <img
            src="/componen-admin/waiting.svg"
            className="w-15 h-15 opacity-180"
            alt=""
          />
          <div>
            <p className="text-gray-500 font-medium">Menunggu Pembayaran</p>
            {isTableLoading ? (
              <div className="h-8 bg-gray-100 animate-pulse w-24 rounded-lg mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-orange-500">
                {statsPembayaran.pending} Transaksi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="relative flex items-center w-full max-w-md">
          <img
            src="/componen-admin/cari.svg"
            alt="cari"
            className="absolute left-4 w-5 h-5 opacity-40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Transaksi atau Nama Pasien"
            className="w-full border-2 border-gray-50 rounded-xl py-3 pl-12 pr-4 text-lg outline-none focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Tabel Pembayaran */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">
                ID Transaksi
              </th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">
                Nomor RM
              </th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">
                Nama Pasien
              </th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">
                Total Biaya
              </th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-lg font-bold border-r border-2 border-white/50 text-center uppercase">
                Rujukan
              </th>
              <th className="px-4 py-3 text-lg font-bold text-center uppercase">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isTableLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4">
                    <div className="h-6 bg-gray-100 rounded w-20 mx-auto"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 bg-gray-100 rounded w-16 mx-auto"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 bg-gray-100 rounded w-40 mx-auto"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 bg-gray-100 rounded w-24 mx-auto"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-8 bg-gray-100 rounded-full w-24 mx-auto"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-8 bg-gray-100 rounded-lg w-24 mx-auto"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-8 bg-gray-100 rounded-lg w-28 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredList.length > 0 ? (
              filteredList.map((item) => {
                const rujukan = item.rekamMedis?.rujukan?.[0] ?? null;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50 transition-colors text-center"
                  >
                    <td className="px-4 py-3 w-[12%]  font-bold text-primary">
                      {item.id.split("-")[0].toUpperCase()}
                    </td>
                    <td className="px-4 py-3 w-[12%] font-bold">
                      {item.pasien?.noRm?.split("-")[0]}
                    </td>
                    <td className="px-4 py-3 w-[25%] font-semibold text-left capitalize">
                      {item.pasien?.nama}
                    </td>
                    <td className="px-4 py-3 w-[15%] font-bold">
                      Rp {item.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          item.status === "LUNAS"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </td>

                    {/* Rujukan */}
                    <td className="px-4 py-3 w-[10%]">
                      {rujukan ? (
                        <button
                          onClick={() => openRujukanModal(rujukan)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-md font-bold transition-all shadow-sm active:scale-95"
                        >
                          Detail
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic font-semibold">
                          -
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 w-[14%]">
                      {item.status === "BELUM_BAYAR" ? (
                        <button
                          onClick={() => handleLunas(item.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-md font-bold transition-all shadow-sm active:scale-95"
                        >
                          ✔ Terima Dana
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic font-semibold">
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-gray-400 text-lg font-bold italic"
                >
                  Belum ada riwayat pembayaran yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail/Edit Rujukan */}
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
                  Poli Tujuan
                </label>
                {isRujukanEditing ? (
                  <input
                    value={rujukanForm.poliTujuan}
                    onChange={(e) =>
                      setRujukanForm({
                        ...rujukanForm,
                        poliTujuan: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                  />
                ) : (
                  <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                    {selectedRujukan?.poliTujuan || "-"}
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