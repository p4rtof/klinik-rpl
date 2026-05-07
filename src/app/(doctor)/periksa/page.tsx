"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TabKey = "pilih-tindakan" | "diagnosis" | "keterangan" | "resep-obat" | "rujukan";

type Pasien = {
  nama: string;
  usiaText: string;
  jenisKelamin: string;
  nomorRM: string;
  telepon: string;
  keluhan: string;
  alamat: string;
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "pilih-tindakan", label: "Pilih Tindakan" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "keterangan", label: "Keterangan" },
  { key: "resep-obat", label: "Resep Obat" },
  { key: "rujukan", label: "Rujukan" },
];

function InfoRow({
  iconSrc,
  label,
  value,
}: {
  iconSrc: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <img src={iconSrc} className="w-5 h-5 mt-0.5" alt="" />
      <div className="flex gap-3">
        <span className="w-28 font-bold text-gray-900">{label}</span>
        <span className="font-bold text-gray-500">:</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

export default function PeriksaDokterPage() {
  const router = useRouter();

  // Dummy pasien (nanti bisa diganti dari API / params)
  const pasien: Pasien = useMemo(
    () => ({
      nama: "Troye Sivan",
      usiaText: "27 Tahun 2 Bulan 12 Hari",
      jenisKelamin: "Laki-Laki",
      nomorRM: "R0121",
      telepon: "0898416269",
      keluhan: "Rheumatoid Arthritis",
      alamat: "Jl. Manggis No 33, Tebet, Jakarta selatan, DKI Jakarta",
    }),
    []
  );

  const [activeTab, setActiveTab] = useState<TabKey>("pilih-tindakan");

  const [tindakan, setTindakan] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [resepObat, setResepObat] = useState("");
  const [rujukan, setRujukan] = useState("");

  const handleSelesai = () => {
    // TODO: POST ke API /api/doctor/periksa atau sejenisnya
    console.log("submit:", { tindakan, diagnosis, keterangan, resepObat, rujukan });
    alert("Sementara: data tersimpan di console. Nanti sambungkan ke API.");
  };

  const handleBuatRujukan = () => {
    setActiveTab("rujukan");
    // Bisa juga buka modal / route lain
  };

  return (
    <div className="space-y-4 text-black">
      {/* Kartu info pasien */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-blue-600 font-extrabold text-lg mb-4">
          Pasien yang Sedang Anda Tangani:
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* kiri */}
          <div className="space-y-3">
            <InfoRow iconSrc="/componen-admin/pasien.svg" label="Nama" value={pasien.nama} />
            <InfoRow iconSrc="/componen-admin/pasien.svg" label="Usia" value={pasien.usiaText} />
            <InfoRow
              iconSrc="/componen-admin/pasien.svg"
              label="Jenis Kelamin"
              value={pasien.jenisKelamin}
            />
            <InfoRow iconSrc="/componen-admin/pasien.svg" label="Nomor RM" value={pasien.nomorRM} />
          </div>

          {/* kanan */}
          <div className="space-y-3">
            <InfoRow iconSrc="/component-doctor/tele.svg" label="Nomor Telepon" value={pasien.telepon} />
            <InfoRow iconSrc="/componen-admin/pasien.svg" label="Keluhan" value={pasien.keluhan} />
            <InfoRow iconSrc="/component-doctor/home.svg" label="Alamat" value={pasien.alamat} />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <img src="/component-doctor/riwayat.svg" className="w-5 h-5" alt="" />
                <span className="font-bold text-gray-900">Lihat Riwayat Berobat</span>
              </div>

              <button
                type="button"
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-extrabold text-sm shadow-sm transition"
                onClick={() => router.push(`/rekam-medis?nomorRM=${pasien.nomorRM}`)}
              >
                Lihat Riwayat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Area utama: sidebar + form */}
      <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-4">
        {/* Sidebar tindakan */}
        <div className="space-y-3">
          <div className="bg-blue-600 rounded-lg overflow-hidden shadow-sm border border-blue-700">
            {TABS.map((t) => {
              const active = t.key === activeTab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "w-full text-left px-4 py-3 font-extrabold text-sm border-b border-white/20",
                    active ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-extrabold text-sm shadow-sm transition"
          >
            ← Kembali
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="space-y-3">
            {/* Pilih tindakan */}
            <div className="relative">
              <select
                value={tindakan}
                onChange={(e) => setTindakan(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none shadow-sm"
              >
                <option value="">Pilih Tindakan yang dilakukan</option>
                <option value="pemeriksaan-umum">Pemeriksaan Umum</option>
                <option value="konsultasi">Konsultasi</option>
                <option value="tindakan-medis">Tindakan Medis</option>
              </select>

              {/* caret (biar mirip figma) */}
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                ˅
              </div>
            </div>

            {/* Diagnosis */}
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ketik disini"
              className={[
                "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none shadow-sm",
                activeTab === "diagnosis" ? "ring-2 ring-blue-200" : "",
              ].join(" ")}
            />

            {/* Keterangan */}
            <input
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Ketik disini"
              className={[
                "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none shadow-sm",
                activeTab === "keterangan" ? "ring-2 ring-blue-200" : "",
              ].join(" ")}
            />

            {/* Resep obat */}
            <input
              value={resepObat}
              onChange={(e) => setResepObat(e.target.value)}
              placeholder="Ketik disini"
              className={[
                "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none shadow-sm",
                activeTab === "resep-obat" ? "ring-2 ring-blue-200" : "",
              ].join(" ")}
            />

            {/* Rujukan */}
            <input
              value={rujukan}
              onChange={(e) => setRujukan(e.target.value)}
              placeholder="Ketik disini"
              className={[
                "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none shadow-sm",
                activeTab === "rujukan" ? "ring-2 ring-blue-200" : "",
              ].join(" ")}
            />
          </div>

          {/* Tombol bawah */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleBuatRujukan}
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg font-extrabold shadow-sm transition"
            >
              Buat Rujukan
            </button>
            <button
              type="button"
              onClick={handleSelesai}
              className="bg-green-500 hover:bg-green-600 text-white px-10 py-2 rounded-lg font-extrabold shadow-sm transition"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}