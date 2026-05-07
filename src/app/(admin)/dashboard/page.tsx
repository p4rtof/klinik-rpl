"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  // --- STATE DATA ---
  const [dataKunjungan, setDataKunjungan] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [ringkasan, setRingkasan] = useState({ belum: 0, sudah: 0 });
  const [antreanNext, setAntreanNext] = useState({ nama: "-", nomor: "-" });

  // State UI
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State Form Kunjungan
  const [formData, setFormData] = useState({
    pasienId: "",
    dokterId: "",
    keluhan: "", // Tetap ada untuk UI, tapi tidak dikirim ke backend
    jam: new Date()
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      .replace(".", ":"),
  });

  // --- 1. FUNGSI HITUNG USIA ---
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

  // --- 2. AMBIL DATA AWAL ---
  const fetchData = async () => {
    try {
      const resAntrean = await fetch("/api/antrian");
      const jsonAntrean = await resAntrean.json();
      if (jsonAntrean.success) {
        setDataKunjungan(jsonAntrean.data);

        const belum = jsonAntrean.data.filter(
          (a: any) => a.status === "MENUNGGU",
        ).length;
        const sudah = jsonAntrean.data.filter(
          (a: any) => a.status === "SELESAI",
        ).length;
        setRingkasan({ belum, sudah });

        const next = jsonAntrean.data.find((a: any) => a.status === "MENUNGGU");
        if (next)
          setAntreanNext({
            nama: next.pasien?.nama || "-",
            nomor: next.nomorAntrian || "-",
          });
      }

      const [resPasien, resDokter] = await Promise.all([
        fetch("/api/pasien", { headers: { "x-user-role": "ADMIN" } }),
        fetch("/api/dokter"), // Mengambil data dokter dari backend
      ]);

      const jsonPasien = await resPasien.json();
      const jsonDokter = await resDokter.json();

      if (jsonPasien.success) setPasienList(jsonPasien.data);

      if (jsonDokter.success && jsonDokter.data.length > 0) {
        setDokterList(jsonDokter.data);
        // PERBAIKAN: Karena hanya ada 1 dokter, kita jadikan dia dokter default (otomatis terpilih)
        setFormData((prev) => ({ ...prev, dokterId: jsonDokter.data[0].id }));
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 3. FUNGSI SIMPAN KUNJUNGAN ---
  const handleSimpanKunjungan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // PERBAIKAN: Hanya kirim data yang diminta oleh jadwalSchema di backend
      const payload = {
        pasienId: formData.pasienId,
        dokterId: formData.dokterId,
        jam: formData.jam,
      };

      const res = await fetch("/api/antrian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN", // Wajib ada
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowModal(false);
        // Reset form kembali ke kondisi awal
        setFormData({
          pasienId: "",
          dokterId: "",
          keluhan: "",
          jam: new Date()
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(".", ":"),
        });
        fetchData(); // Refresh data tabel & ringkasan
        alert("Antrean berhasil didaftarkan!");
      } else {
        // Tampilkan pesan error spesifik jika gagal
        const errorMsg =
          json.details?.[0]?.message || json.error || "Data tidak valid";
        alert("Gagal: " + errorMsg);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server");
    } finally {
      setIsLoading(false);
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

      {/* Ringkasan & Antrean Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="w-6 h-6 "
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
          <div className="flex items-center justify-between">
            <p className="text-primary text-xl font-bold uppercase truncate max-w-[150px]">
              {antreanNext.nama}
            </p>
            <p className="text-6xl font-black text-primary">
              {antreanNext.nomor}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Kunjungan */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-md">
                No RM
              </th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-md">
                Nama Pasien
              </th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-md">
                Jenis Kelamin
              </th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-md">
                Usia
              </th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-md">
                Jam
              </th>
              <th className="px-4 py-3 border-r border-white/20 uppercase text-md">
                Antrian
              </th>
              <th className="px-4 py-3 uppercase text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="text-black font-semibold text-center divide-y divide-gray-100">
            {dataKunjungan.length > 0 ? (
              dataKunjungan.map((item: any) => (
                <tr key={item.id} className="hover:bg-blue-50/30">
                  <td className="p-4">
                    {item.pasien?.noRm?.split("-")[0].toUpperCase() || "-"}
                  </td>
                  <td className="p-4 text-left">{item.pasien?.nama || "-"}</td>
                  <td className="p-4">
                    {item.pasien?.jenisKelamin === "LAKI_LAKI"
                      ? "Laki-laki"
                      : "Perempuan"}
                  </td>
                  <td className="p-4">
                    {item.pasien?.tanggalLahir
                      ? `${hitungUsia(item.pasien.tanggalLahir)} Tahun`
                      : "-"}
                  </td>
                  <td className="p-4">{item.jam}</td>
                  <td className="p-4 text-2xl font-black text-primary">
                    {item.nomorAntrian}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${item.status === "MENUNGGU" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-gray-400 italic">
                  Belum ada kunjungan hari ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH KUNJUNGAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-primary px-6 py-4 text-white text-center">
              <h2 className="text-2xl font-bold">Tambah Kunjungan Baru</h2>
            </div>
            <form onSubmit={handleSimpanKunjungan} className="py-4 px-8 space-y-4">
              {/* Pilih Pasien */}
              <div className="mb-0">
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
                    className="bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center shadow-sm"
                    title="Daftar Pasien Baru"
                  >
                    +
                  </Link>
                </div>
                <p className="text-[10px] mt-1 text-gray-400 italic text-right">
                  Pasien belum terdaftar? Klik tombol biru (+)
                </p>
              </div>

              {/* Pilih Dokter */}
              {/* Dokter Bertugas (Otomatis Terisi) */}
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
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString("id-ID")}
                    className="w-full border-2 border-gray-400 p-3 rounded-xl bg-gray-50 mt-1"
                  />
                </div>
              </div>

              {/* Keluhan: Di UI saja, tapi tidak diikutsertakan di payload ke backend */}
              <div className="mb-0">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Keluhan Awal
                </label>
                <textarea
                  value={formData.keluhan}
                  onChange={(e) =>
                    setFormData({ ...formData, keluhan: e.target.value })
                  }
                  className="w-full border-2 border-gray-400 p-3 rounded-xl mt-1 h-24 resize-none outline-none focus:border-primary"
                  placeholder="Keluhan pasien (Opsional)..."
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
                className="w-full text-gray-500 font-bold py-2 mt-2"
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

