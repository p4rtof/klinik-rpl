"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type ResepRow = {
  obatId: string;
  aturan: string;  // e.g. "3x1 Sesudah Makan"
  jumlah: string;  // quantity as string for input binding
};

type TindakanRow = {
  label: string;
  harga: number;
};

function PeriksaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const antreanId = searchParams.get("id");

  const [antrean, setAntrean] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [pilihanTindakan, setPilihanTindakan] = useState<
    { id: string; label: string; harga: number }[]
  >([]);
  const [pilihanObat, setPilihanObat] = useState<
    { id: string; kodeObat: string; namaObat: string; satuan: string; hargaJual: number }[]
  >([]);
  const [pilihanPenyakit, setPilihanPenyakit] = useState<
    { id: string; kodeIcd10: string; namaPenyakit: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE MULTIPLE TINDAKAN
  const [tindakanItems, setTindakanItems] = useState<TindakanRow[]>([
    { label: "", harga: 0 },
  ]);

  const [formData, setFormData] = useState({
    diagnosis: "", // will hold selected penyakitId
    keluhanUtama: "",
    rps: "",
    rpd: "",
    riwayatObat: "",
    riwayatKeluarga: "",
    kebiasaan: "",
    tdSistolik: "" as string | number,
    tdDiastolik: "" as string | number,
    nadi: "" as string | number,
    rr: "" as string | number,
    suhu: "" as string | number,
    spo2: "" as string | number,
    bb: "" as string | number,
    tb: "" as string | number,
    pemeriksaanFisik: "",
    edukasiPasien: "",
    perluRujukan: false,
    tujuanRujukan: "",
    rujukanCatatan: "",
    catatanTambahan: "",
  });

  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [resepItems, setResepItems] = useState<ResepRow[]>([]);

  const bmi = useMemo(() => {
    const bb = Number(formData.bb);
    const tbCm = Number(formData.tb);
    if (!bb || !tbCm) return null;
    const tbM = tbCm / 100;
    if (!tbM) return null;
    const v = bb / (tbM * tbM);
    if (!Number.isFinite(v)) return null;
    return Math.round(v * 10) / 10;
  }, [formData.bb, formData.tb]);

  const totalBiayaTindakan = useMemo(() => {
    return tindakanItems.reduce((acc, curr) => acc + curr.harga, 0);
  }, [tindakanItems]);

  // FETCH MASTER DATA DARI BACKEND
  useEffect(() => {
    const fetchTindakan = async () => {
      try {
        const res = await fetch("/api/tindakan-medis");
        const json = await res.json();
        if (json.success) setPilihanTindakan(json.data);
      } catch (err) {
        console.error("Gagal mengambil data tindakan medis:", err);
      }
    };
    const fetchObat = async () => {
      try {
        const res = await fetch("/api/obat");
        const json = await res.json();
        if (json.success) setPilihanObat(json.data);
      } catch (err) {
        console.error("Gagal mengambil data obat:", err);
      }
    };
    const fetchPenyakit = async () => {
      try {
        const res = await fetch("/api/penyakit");
        const json = await res.json();
        if (json.success) setPilihanPenyakit(json.data);
      } catch (err) {
        console.error("Gagal mengambil data penyakit:", err);
      }
    };
    fetchTindakan();
    fetchObat();
    fetchPenyakit();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/antrian/${antreanId}`);
        const json = await res.json();

        if (json.success) {
          setAntrean(json.data);
          setFormData((prev) => ({
            ...prev,
            keluhanUtama: json.data.keluhan || "",
          }));

          const resHistory = await fetch(
            `/api/rekam-medis/pasien/${json.data.pasienId}`,
          );
          const jsonHistory = await resHistory.json();
          if (jsonHistory.success) setHistory(jsonHistory.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (antreanId) fetchAllData();
  }, [antreanId]);

  // --- LOGIKA MULTIPLE TINDAKAN ---
  const addTindakanRow = () => {
    setTindakanItems((prev) => [...prev, { label: "", harga: 0 }]);
  };

  const removeTindakanRow = (idx: number) => {
    setTindakanItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTindakanRow = (idx: number, val: string) => {
    const terpilih = pilihanTindakan.find((t) => t.label === val);
    setTindakanItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { label: val, harga: terpilih ? terpilih.harga : 0 }
          : item,
      ),
    );
  };

  // --- LOGIKA MULTIPLE RESEP ---
  const addResepRow = () => {
    setResepItems((prev) => [...prev, { obatId: "", aturan: "", jumlah: "" }]);
  };

  const clearResep = () => setResepItems([]);

  const removeResepRow = (idx: number) => {
    setResepItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateResepRow = (idx: number, patch: Partial<ResepRow>) => {
    setResepItems((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        e.preventDefault();
      }
    }

    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        try {
          const inputTarget = target as HTMLInputElement;
          const isAtEnd = inputTarget.selectionStart === inputTarget.value?.length;
          const isAtStart = inputTarget.selectionStart === 0;
          
          if (e.key === "ArrowRight" && !isAtEnd) return;
          if (e.key === "ArrowLeft" && !isAtStart) return;
        } catch(err) {
          // Safe
        }
      }

      const form = e.currentTarget;
      const focusable = Array.from(
        form.querySelectorAll("input:not([disabled]), select:not([disabled]), textarea:not([disabled])")
      ) as HTMLElement[];

      const index = focusable.indexOf(target);
      if (index > -1) {
        if (e.key === "ArrowRight" && index < focusable.length - 1) {
          e.preventDefault();
          focusable[index + 1].focus();
        } else if (e.key === "ArrowLeft" && index > 0) {
          e.preventDefault();
          focusable[index - 1].focus();
        }
      }
    }
  };

  const handleValidasi = async (e: React.FormEvent) => {
    e.preventDefault();

    const validTindakan = tindakanItems.filter((t) => t.label.trim() !== "");
    if (validTindakan.length === 0 || !formData.diagnosis) {
      alert("Minimal 1 Tindakan dan Diagnosis wajib diisi!");
      return;
    }

    setShowKonfirmasi(true);
  };

  const handleSubmit = async () => {
    const validTindakan = tindakanItems.filter((t) => t.label.trim() !== "");
    
    // Map selected tindakan labels to database UUIDs
    const tindakanIds = validTindakan.map(t => {
      const matched = pilihanTindakan.find(pt => pt.label === t.label);
      return matched ? matched.id : "";
    }).filter(Boolean);

    // Map prescriptions — filter hanya butuh obatId dan jumlah valid
    const resepValid = resepItems
      .filter((r) => r.obatId && Number(r.jumlah) > 0)
      .map((r) => ({
        obatId: r.obatId,
        dosis: r.aturan.trim() || "Sesuai Petunjuk",
        aturan: "Sesuai Petunjuk",
        jumlah: parseInt(r.jumlah, 10),
      }));

    setIsSubmitting(true);
    setShowKonfirmasi(false);
    try {
      const payload: any = {
        pasienId: antrean.pasienId,
        jadwalId: antrean.id,
        keluhan: (formData.keluhanUtama || "Pemeriksaan rutin").trim(),
        tindakan: tindakanIds,
        diagnosis: [{ penyakitId: formData.diagnosis, catatan: "Diagnosis Utama" }],
        resep: resepValid,
        anamnesisKeluhanUtama: formData.keluhanUtama?.trim() || undefined,
        anamnesisRps: formData.rps?.trim() || undefined,
        anamnesisRpd: formData.rpd?.trim() || undefined,
        anamnesisRiwayatObat: formData.riwayatObat?.trim() || undefined,
        anamnesisRiwayatKeluarga: formData.riwayatKeluarga?.trim() || undefined,
        anamnesisKebiasaan: formData.kebiasaan?.trim() || undefined,
        tdSistolik: formData.tdSistolik === "" ? undefined : Number(formData.tdSistolik),
        tdDiastolik: formData.tdDiastolik === "" ? undefined : Number(formData.tdDiastolik),
        nadi: formData.nadi === "" ? undefined : Number(formData.nadi),
        rr: formData.rr === "" ? undefined : Number(formData.rr),
        suhu: formData.suhu === "" ? undefined : Number(formData.suhu),
        spo2: formData.spo2 === "" ? undefined : Number(formData.spo2),
        bb: formData.bb === "" ? undefined : Number(formData.bb),
        tb: formData.tb === "" ? undefined : Number(formData.tb),
        bmi: bmi ?? undefined,
        pemeriksaanFisik: formData.pemeriksaanFisik?.trim() || undefined,
        edukasiPasien: formData.edukasiPasien?.trim() || undefined,
        catatanTambahan: formData.catatanTambahan?.trim() || undefined,
        rujukanCatatan: formData.rujukanCatatan?.trim() || undefined,
      };

      if (formData.perluRujukan && formData.tujuanRujukan.trim()) {
        payload.rujukan = {
          tujuan: formData.tujuanRujukan.trim(),
          keterangan: formData.rujukanCatatan?.trim() || undefined,
        };
      }

      const res = await fetch("/api/rekam-medis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const jsonRM = await res.json().catch(() => null);
      if (!res.ok || !jsonRM?.success) {
        alert(jsonRM?.error ?? "Gagal menyimpan pemeriksaan.");
        return;
      }

      router.push("/dashboard-dokter");
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center font-bold animate-pulse text-primary">
        Memuat Data Pasien...
      </div>
    );
  }

  if (!antrean) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Pasien tidak ditemukan.
      </div>
    );
  }

  const selectedPenyakit = pilihanPenyakit.find(p => p.id === formData.diagnosis);
  const namaPenyakitTerpilih = selectedPenyakit ? `${selectedPenyakit.kodeIcd10} - ${selectedPenyakit.namaPenyakit}` : "";

  return (
    <div className="w-full space-y-6 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DATA PASIEN */}
        <div className="bg-white h-fit rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-2xl font-bold border-b text-primary border-gray-50 mb-2">
            Pasien yang Sedang Anda Tangani:
          </h2>
          <div>
            <div className="flex gap-10">
              <div className="mb-2 w-1/3">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Nama Pasien
                </p>
                <p className="text-xl font-extrabold capitalize">
                  {antrean.pasien?.nama}
                </p>
                <p className="text-xs text-primary font-bold">
                  {antrean.pasien?.noRm}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Usia
                </p>
                <p className="font-bold mb-7">
                  {antrean.pasien?.tanggalLahir
                    ? new Date().getFullYear() -
                      new Date(antrean.pasien.tanggalLahir).getFullYear()
                    : "-"}{" "}
                  Tahun
                </p>
              </div>
            </div>
            <div className="flex gap-10">
              <div className="w-1/3">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Jenis Kelamin
                </p>
                <p className="font-bold">
                  {antrean.pasien?.jenisKelamin === "LAKI_LAKI"
                    ? "Laki-laki"
                    : "Perempuan"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Keluhan (Antrian)
                </p>
                <p className="font-bold">
                  {antrean.keluhan || "Tidak ada catatan keluhan awal"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIWAYAT TERAKHIR */}
        <div className="bg-white h-fit rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-2xl font-bold border-b border-gray-50 pb-2 mb-0 text-orange-500">
            Riwayat Terakhir
          </h2>

          <div className="overflow-auto max-h-[180px]">
            {history.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-50">
                    <th className="pb-1 font-bold uppercase text-[10px]">
                      Tanggal
                    </th>
                    <th className="pb-2 font-bold uppercase text-[10px]">
                      Diagnosis
                    </th>
                    <th className="pb-2 font-bold uppercase text-[10px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 3).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 text-gray-500">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-1.5 font-semibold">
                        {Array.isArray(item.diagnosis) &&
                        item.diagnosis.length > 0
                          ? item.diagnosis
                              .map((d: any) => d.diagnosis)
                              .join(", ")
                          : "-"}
                      </td>
                      <td className="py-1.5">
                        <Link
                          href={`/rekam-medis?id=${antreanId}`}
                          className="text-primary text-[11px] font-bold hover:underline whitespace-nowrap"
                        >
                          Lihat Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-10 text-gray-400 italic text-sm font-medium">
                Belum ada riwayat pemeriksaan sebelumnya.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FORM PEMERIKSAAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary py-2 px-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase">Form Pemeriksaan</h2>
          <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
            Total Biaya Layanan: Rp {totalBiayaTindakan.toLocaleString("id-ID")}
          </div>
        </div>

        <form onSubmit={handleValidasi} onKeyDown={handleKeyDown} className="p-8 space-y-8">
          {/* TINDAKAN + DIAGNOSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MULTIPLE TINDAKAN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tindakan Medis
                </label>
                <button
                  type="button"
                  onClick={addTindakanRow}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  + Tambah Tindakan
                </button>
              </div>

              {tindakanItems.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    required={idx === 0}
                    value={row.label}
                    onChange={(e) => updateTindakanRow(idx, e.target.value)}
                    className="w-full border-2 border-gray-100 p-3.5 rounded-2xl focus:border-primary outline-none font-bold bg-white cursor-pointer"
                  >
                    <option value="">-- Pilih Tindakan --</option>
                    {pilihanTindakan.map((t, index) => (
                      <option key={index} value={t.label}>
                        {t.label} (Rp {t.harga.toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                  {tindakanItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTindakanRow(idx)}
                      className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* DIAGNOSIS ICD-10 SELECT */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Diagnosis Utama (Wajib)
              </label>
              <select
                required
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, diagnosis: e.target.value }))
                }
                className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-primary outline-none font-bold bg-white cursor-pointer"
              >
                <option value="">-- Pilih Diagnosis (ICD-10) --</option>
                {pilihanPenyakit.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kodeIcd10} - {p.namaPenyakit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ANAMNESIS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-primary">Anamnesis</h3>
                <p className="text-xs text-gray-400 font-semibold">
                  Keluhan & riwayat pasien
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Keluhan Utama
                </label>
                <textarea
                  value={formData.keluhanUtama}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, keluhanUtama: e.target.value }))
                  }
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                  placeholder="Nyeri sendi sejak 2 minggu..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Riwayat Penyakit Sekarang (RPS)
                </label>
                <textarea
                  value={formData.rps}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, rps: e.target.value }))
                  }
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Riwayat Penyakit Dahulu (RPD)
                </label>
                <textarea
                  value={formData.rpd}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, rpd: e.target.value }))
                  }
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Riwayat Obat
                </label>
                <textarea
                  value={formData.riwayatObat}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, riwayatObat: e.target.value }))
                  }
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Riwayat Keluarga
                </label>
                <textarea
                  value={formData.riwayatKeluarga}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      riwayatKeluarga: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Kebiasaan (Merokok/Alkohol/dll)
                </label>
                <textarea
                  value={formData.kebiasaan}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, kebiasaan: e.target.value }))
                  }
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                />
              </div>
            </div>
          </div>

          {/* PEMERIKSAAN / TTV */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-primary">Pemeriksaan</h3>
                <p className="text-xs text-gray-400 font-semibold">
                  TTV & pemeriksaan fisik
                </p>
              </div>
              <div className="border border-gray-100 rounded-2xl px-4 py-2 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  BMI
                </p>
                <p className="font-black text-gray-800">{bmi ?? "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputNumber
                label="TD Sistolik"
                value={formData.tdSistolik}
                onChange={(v) => setFormData((p) => ({ ...p, tdSistolik: v }))}
              />
              <InputNumber
                label="TD Diastolik"
                value={formData.tdDiastolik}
                onChange={(v) => setFormData((p) => ({ ...p, tdDiastolik: v }))}
              />
              <InputNumber
                label="Nadi"
                value={formData.nadi}
                onChange={(v) => setFormData((p) => ({ ...p, nadi: v }))}
              />
              <InputNumber
                label="RR"
                value={formData.rr}
                onChange={(v) => setFormData((p) => ({ ...p, rr: v }))}
              />
              <InputNumber
                label="Suhu"
                value={formData.suhu}
                onChange={(v) => setFormData((p) => ({ ...p, suhu: v }))}
              />
              <InputNumber
                label="SpO2"
                value={formData.spo2}
                onChange={(v) => setFormData((p) => ({ ...p, spo2: v }))}
              />
              <InputNumber
                label="BB"
                value={formData.bb}
                onChange={(v) => setFormData((p) => ({ ...p, bb: v }))}
              />
              <InputNumber
                label="TB"
                value={formData.tb}
                onChange={(v) => setFormData((p) => ({ ...p, tb: v }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Pemeriksaan Fisik
              </label>
              <textarea
                value={formData.pemeriksaanFisik}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    pemeriksaanFisik: e.target.value,
                  }))
                }
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-28 focus:border-primary outline-none font-bold resize-none"
                placeholder="Keadaan umum baik, nyeri tekan..."
              />
            </div>
          </div>

          {/* RESEP OBAT DENGAN SELECT DROPDOWN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-primary">Resep Obat</h3>
                <p className="text-xs text-gray-400 font-semibold">
                  Tambah / hapus obat
                </p>
              </div>
              <button
                type="button"
                onClick={addResepRow}
                className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/20"
              >
                + Tambah Obat
              </button>
            </div>

            <div className="space-y-3">
              {resepItems.length === 0 ? (
                <div className="text-sm text-gray-400 italic">
                  Belum ada obat.
                </div>
              ) : (
                resepItems.map((row, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-100 rounded-2xl p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Nama Obat
                        </label>
                        <select
                          value={row.obatId}
                          onChange={(e) =>
                            updateResepRow(idx, { obatId: e.target.value })
                          }
                          className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white cursor-pointer"
                        >
                          <option value="">-- Pilih Obat --</option>
                          {pilihanObat.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.namaObat} ({o.satuan}) - Rp {o.hargaJual.toLocaleString("id-ID")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Aturan Pakai
                        </label>
                        <input
                          value={row.aturan}
                          onChange={(e) =>
                            updateResepRow(idx, { aturan: e.target.value })
                          }
                          className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white"
                          placeholder="3x1 sesudah makan"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Jumlah (pcs)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={row.jumlah}
                          onChange={(e) =>
                            updateResepRow(idx, { jumlah: e.target.value })
                          }
                          className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => removeResepRow(idx)}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EDUKASI / RUJUKAN / CATATAN */}
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-primary">
                Edukasi, Rujukan, Catatan
              </h3>
              <p className="text-xs text-gray-400 font-semibold">Opsional</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Edukasi Pasien
              </label>
              <textarea
                value={formData.edukasiPasien}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, edukasiPasien: e.target.value }))
                }
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
                placeholder="Istirahat cukup, kompres hangat..."
              />
            </div>

            <div className="space-y-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rujukan"
                  checked={formData.perluRujukan}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      perluRujukan: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <label
                  htmlFor="rujukan"
                  className="font-bold text-primary cursor-pointer"
                >
                  Rujukan (bila perlu)
                </label>
              </div>

              {formData.perluRujukan && (
                <div className="pt-3 space-y-2">
                  <input
                    type="text"
                    required
                    value={formData.tujuanRujukan}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        tujuanRujukan: e.target.value,
                      }))
                    }
                    placeholder="Masukkan RS/Poli tujuan (contoh: RS Hermina / Poli Mata)"
                    className="w-full border-2 border-primary/20 p-3 rounded-xl focus:border-primary outline-none font-bold bg-white"
                  />

                  <textarea
                    value={formData.rujukanCatatan}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        rujukanCatatan: e.target.value,
                      }))
                    }
                    placeholder="Catatan rujukan (opsional)"
                    className="w-full border-2 border-primary/20 p-3 rounded-xl focus:border-primary outline-none font-bold bg-white h-24 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Catatan Tambahan
              </label>
              <textarea
                value={formData.catatanTambahan}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    catatanTambahan: e.target.value,
                  }))
                }
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-10 py-4 font-bold text-gray-400 hover:text-gray-600 transition-all uppercase text-sm tracking-widest"
              disabled={isSubmitting}
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] uppercase text-sm tracking-widest disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL KONFIRMASI SIMPAN */}
      {showKonfirmasi && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black">Simpan Rekam Medis?</h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex gap-3 items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-black text-red-800 text-sm">Perhatian!</p>
                    <p className="text-red-700 text-sm font-medium mt-0.5">
                      Data rekam medis yang sudah disimpan <span className="font-black">tidak dapat diubah</span>. Pastikan semua data sudah benar sebelum melanjutkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pasien</span>
                  <span className="text-gray-800 font-bold uppercase">{antrean?.pasien?.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Diagnosis</span>
                  <span className="text-gray-800 font-bold">{namaPenyakitTerpilih}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Biaya</span>
                  <span className="text-primary font-black">Rp {totalBiayaTindakan.toLocaleString("id-ID")}</span>
                </div>
                {formData.perluRujukan && formData.tujuanRujukan && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rujukan ke</span>
                    <span className="text-orange-600 font-bold">{formData.tujuanRujukan}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowKonfirmasi(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? "Menyimpan..." : "Ya, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputNumber(props: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase">
        {props.label}
      </label>
      <input
        inputMode="numeric"
        value={props.value as any}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white focus:border-primary"
      />
    </div>
  );
}

export default function PeriksaPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-bold">
        Memuat Halaman...
      </div>
    }>
      <PeriksaPageContent />
    </React.Suspense>
  );
}