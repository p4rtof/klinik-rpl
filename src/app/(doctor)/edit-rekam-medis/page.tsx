"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ResepRow = { obatId: string; aturan: string; dosis: string };
type TindakanRow = { label: string; harga: number };

function EditRekamMedisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rekamMedisId = searchParams.get("id");

  const [rekamMedis, setRekamMedis] = useState<any>(null);
  const [pilihanTindakan, setPilihanTindakan] = useState<{ id: string; label: string; harga: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [tindakanItems, setTindakanItems] = useState<TindakanRow[]>([{ label: "", harga: 0 }]);
  const [resepItems, setResepItems] = useState<ResepRow[]>([{ obatId: "", aturan: "", dosis: "" }]);

  const [formData, setFormData] = useState({
    diagnosis: "",
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
    catatanTambahan: "",
    rujukanCatatan: "",
  });

  const bmi = useMemo(() => {
    const bb = Number(formData.bb);
    const tbCm = Number(formData.tb);
    if (!bb || !tbCm) return null;
    const tbM = tbCm / 100;
    const v = bb / (tbM * tbM);
    if (!Number.isFinite(v)) return null;
    return Math.round(v * 10) / 10;
  }, [formData.bb, formData.tb]);

  const totalBiaya = useMemo(() => {
    return tindakanItems.reduce((acc, curr) => acc + curr.harga, 0);
  }, [tindakanItems]);

  // Fetch tindakan medis
  useEffect(() => {
    fetch("/api/tindakan-medis")
      .then((r) => r.json())
      .then((j) => { if (j.success) setPilihanTindakan(j.data); });
  }, []);

  // Fetch rekam medis yang akan diedit
  useEffect(() => {
    if (!rekamMedisId) return;
    setIsLoading(true);

    fetch(`/api/rekam-medis/${rekamMedisId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) {
          setErrorMsg(j.error || "Gagal memuat data");
          return;
        }

        const rm = j.data;
        setRekamMedis(rm);

        // Cek apakah pembayaran sudah LUNAS
        const sudahLunas = rm.pembayaran?.some((p: any) => p.status === "LUNAS");
        if (sudahLunas) {
          setErrorMsg("Rekam medis ini tidak dapat diedit karena pembayaran sudah LUNAS.");
          return;
        }

        // Pre-fill form dari data yang ada
        setFormData({
          diagnosis: rm.diagnosis?.[0]?.diagnosis || "",
          keluhanUtama: rm.anamnesisKeluhanUtama || rm.keluhan || "",
          rps: rm.anamnesisRps || "",
          rpd: rm.anamnesisRpd || "",
          riwayatObat: rm.anamnesisRiwayatObat || "",
          riwayatKeluarga: rm.anamnesisRiwayatKeluarga || "",
          kebiasaan: rm.anamnesisKebiasaan || "",
          tdSistolik: rm.tdSistolik ?? "",
          tdDiastolik: rm.tdDiastolik ?? "",
          nadi: rm.nadi ?? "",
          rr: rm.rr ?? "",
          suhu: rm.suhu ?? "",
          spo2: rm.spo2 ?? "",
          bb: rm.bb ?? "",
          tb: rm.tb ?? "",
          pemeriksaanFisik: rm.pemeriksaanFisik || "",
          edukasiPasien: rm.edukasiPasien || "",
          catatanTambahan: rm.catatanTambahan || "",
          rujukanCatatan: rm.rujukanCatatan || "",
        });

        // Pre-fill tindakan
        if (rm.tindakan) {
          const tindakanArr = rm.tindakan.split(", ").filter(Boolean);
          // harga akan diisi setelah pilihanTindakan tersedia
          setTindakanItems(
            tindakanArr.length > 0
              ? tindakanArr.map((label: string) => ({ label, harga: 0 }))
              : [{ label: "", harga: 0 }]
          );
        }

        // Pre-fill resep
        if (rm.resep && rm.resep.length > 0) {
          setResepItems(
            rm.resep.map((r: any) => ({
              obatId: r.obatId || "",
              aturan: r.aturan || "",
              dosis: r.dosis || "",
            }))
          );
        }
      })
      .catch(() => setErrorMsg("Gagal terhubung ke server"))
      .finally(() => setIsLoading(false));
  }, [rekamMedisId]);

  // Setelah pilihanTindakan tersedia, cocokkan harga dengan tindakan yang sudah di-prefill
  useEffect(() => {
    if (pilihanTindakan.length === 0) return;
    setTindakanItems((prev) =>
      prev.map((item) => {
        if (!item.label) return item;
        const found = pilihanTindakan.find((t) => t.label === item.label);
        return found ? { ...item, harga: found.harga } : item;
      })
    );
  }, [pilihanTindakan]);

  // --- LOGIKA TINDAKAN ---
  const addTindakanRow = () => setTindakanItems((p) => [...p, { label: "", harga: 0 }]);
  const removeTindakanRow = (idx: number) => setTindakanItems((p) => p.filter((_, i) => i !== idx));
  const updateTindakanRow = (idx: number, val: string) => {
    const found = pilihanTindakan.find((t) => t.label === val);
    setTindakanItems((p) =>
      p.map((item, i) => (i === idx ? { label: val, harga: found?.harga || 0 } : item))
    );
  };

  // --- LOGIKA RESEP ---
  const addResepRow = () => setResepItems((p) => [...p, { obatId: "", aturan: "", dosis: "" }]);
  const removeResepRow = (idx: number) => setResepItems((p) => p.filter((_, i) => i !== idx));
  const updateResepRow = (idx: number, patch: Partial<ResepRow>) =>
    setResepItems((p) => p.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const handleValidasi = (e: React.FormEvent) => {
    e.preventDefault();
    const validTindakan = tindakanItems.filter((t) => t.label.trim() !== "");
    if (validTindakan.length === 0 || !formData.diagnosis.trim()) {
      alert("Minimal 1 Tindakan dan Diagnosis wajib diisi!");
      return;
    }
    setShowKonfirmasi(true);
  };

  const handleSubmit = async () => {
    const validTindakan = tindakanItems.filter((t) => t.label.trim() !== "");
    const resepValid = resepItems
      .map((r) => ({ obatId: r.obatId.trim(), aturan: r.aturan.trim(), dosis: r.dosis.trim() }))
      .filter((r) => r.obatId && r.aturan && r.dosis);

    setIsSubmitting(true);
    setShowKonfirmasi(false);

    try {
      const payload = {
        keluhan: formData.keluhanUtama.trim() || rekamMedis?.keluhan,
        tindakan: validTindakan.map((t) => t.label).join(", "),
        diagnosis: [{ diagnosis: formData.diagnosis.trim() }],
        resep: resepValid,
        anamnesisKeluhanUtama: formData.keluhanUtama.trim() || undefined,
        anamnesisRps: formData.rps.trim() || undefined,
        anamnesisRpd: formData.rpd.trim() || undefined,
        anamnesisRiwayatObat: formData.riwayatObat.trim() || undefined,
        anamnesisRiwayatKeluarga: formData.riwayatKeluarga.trim() || undefined,
        anamnesisKebiasaan: formData.kebiasaan.trim() || undefined,
        tdSistolik: formData.tdSistolik === "" ? null : Number(formData.tdSistolik),
        tdDiastolik: formData.tdDiastolik === "" ? null : Number(formData.tdDiastolik),
        nadi: formData.nadi === "" ? null : Number(formData.nadi),
        rr: formData.rr === "" ? null : Number(formData.rr),
        suhu: formData.suhu === "" ? null : Number(formData.suhu),
        spo2: formData.spo2 === "" ? null : Number(formData.spo2),
        bb: formData.bb === "" ? null : Number(formData.bb),
        tb: formData.tb === "" ? null : Number(formData.tb),
        bmi: bmi ?? null,
        pemeriksaanFisik: formData.pemeriksaanFisik.trim() || undefined,
        edukasiPasien: formData.edukasiPasien.trim() || undefined,
        catatanTambahan: formData.catatanTambahan.trim() || undefined,
        rujukanCatatan: formData.rujukanCatatan.trim() || undefined,
      };

      const res = await fetch(`/api/rekam-medis/${rekamMedisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error ?? "Gagal menyimpan perubahan.");
        return;
      }

      router.back();
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER STATES ---
  if (isLoading) {
    return (
      <div className="p-10 text-center font-bold animate-pulse text-primary">
        Memuat Data Rekam Medis...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-bold text-lg">{errorMsg}</p>
        <button
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!rekamMedis) return null;

  return (
    <div className="w-full space-y-6 text-black">
      {/* HEADER */}
      <div className="flex justify-between items-start px-2">
        <div>
          <h1 className="text-3xl font-bold text-primary">Edit Rekam Medis</h1>
          <p className="text-gray-400 font-semibold mt-1">
            Pasien:{" "}
            <span className="text-gray-700 font-bold uppercase">
              {rekamMedis.pasien?.nama}
            </span>{" "}
            •{" "}
            <span className="text-gray-500">
              {new Date(rekamMedis.tanggal).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-bold text-amber-700">
            Edit hanya tersedia selama pembayaran belum LUNAS.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-amber-500 py-2 px-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase">Form Edit Rekam Medis</h2>
          <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
            Total Biaya: Rp {totalBiaya.toLocaleString("id-ID")}
          </div>
        </div>

        <form onSubmit={handleValidasi} className="p-8 space-y-8">

          {/* TINDAKAN + DIAGNOSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tindakan Medis
                </label>
                <button
                  type="button"
                  onClick={addTindakanRow}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20"
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
                    className="flex-1 border-2 border-gray-100 p-3.5 rounded-2xl focus:border-amber-400 outline-none font-bold bg-white"
                  >
                    <option value="">-- Pilih Tindakan --</option>
                    {pilihanTindakan.map((t) => (
                      <option key={t.id} value={t.label}>
                        {t.label} (Rp {t.harga.toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                  {tindakanItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTindakanRow(idx)}
                      className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Diagnosis Utama (Wajib)
              </label>
              <input
                required
                value={formData.diagnosis}
                onChange={(e) => setFormData((p) => ({ ...p, diagnosis: e.target.value }))}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-amber-400 outline-none font-bold placeholder:text-gray-200"
                placeholder="Misal: Gastritis / Demam Akut..."
              />
            </div>
          </div>

          {/* ANAMNESIS */}
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-amber-500">Anamnesis</h3>
              <p className="text-xs text-gray-400 font-semibold">Keluhan & riwayat pasien</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Keluhan Utama</label>
                <textarea
                  value={formData.keluhanUtama}
                  onChange={(e) => setFormData((p) => ({ ...p, keluhanUtama: e.target.value }))}
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Riwayat Penyakit Sekarang (RPS)</label>
                <textarea
                  value={formData.rps}
                  onChange={(e) => setFormData((p) => ({ ...p, rps: e.target.value }))}
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Riwayat Penyakit Dahulu (RPD)</label>
                <textarea
                  value={formData.rpd}
                  onChange={(e) => setFormData((p) => ({ ...p, rpd: e.target.value }))}
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Riwayat Obat</label>
                <textarea
                  value={formData.riwayatObat}
                  onChange={(e) => setFormData((p) => ({ ...p, riwayatObat: e.target.value }))}
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Riwayat Keluarga</label>
                <textarea
                  value={formData.riwayatKeluarga}
                  onChange={(e) => setFormData((p) => ({ ...p, riwayatKeluarga: e.target.value }))}
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Kebiasaan</label>
                <textarea
                  value={formData.kebiasaan}
                  onChange={(e) => setFormData((p) => ({ ...p, kebiasaan: e.target.value }))}
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
                />
              </div>
            </div>
          </div>

          {/* TTV */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-amber-500">Pemeriksaan</h3>
                <p className="text-xs text-gray-400 font-semibold">TTV & pemeriksaan fisik</p>
              </div>
              <div className="border border-gray-100 rounded-2xl px-4 py-2 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase">BMI</p>
                <p className="font-black text-gray-800">{bmi ?? "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "TD Sistolik", key: "tdSistolik" },
                { label: "TD Diastolik", key: "tdDiastolik" },
                { label: "Nadi", key: "nadi" },
                { label: "RR", key: "rr" },
                { label: "Suhu", key: "suhu" },
                { label: "SpO2", key: "spo2" },
                { label: "BB", key: "bb" },
                { label: "TB", key: "tb" },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
                  <input
                    inputMode="numeric"
                    value={(formData as any)[key]}
                    onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white focus:border-amber-400"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Pemeriksaan Fisik</label>
              <textarea
                value={formData.pemeriksaanFisik}
                onChange={(e) => setFormData((p) => ({ ...p, pemeriksaanFisik: e.target.value }))}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-28 focus:border-amber-400 outline-none font-bold resize-none"
              />
            </div>
          </div>

          {/* RESEP */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-amber-500">Resep Obat</h3>
                <p className="text-xs text-gray-400 font-semibold">Tambah / hapus obat</p>
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
              {resepItems.map((row, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Obat</label>
                      <input
                        value={row.obatId}
                        onChange={(e) => updateResepRow(idx, { obatId: e.target.value })}
                        className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white"
                        placeholder="Paracetamol 500mg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Aturan Pakai</label>
                      <input
                        value={row.aturan}
                        onChange={(e) => updateResepRow(idx, { aturan: e.target.value })}
                        className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white"
                        placeholder="3x1 sesudah makan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Jumlah</label>
                      <input
                        value={row.dosis}
                        onChange={(e) => updateResepRow(idx, { dosis: e.target.value })}
                        className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-bold bg-white"
                        placeholder="10 tablet"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => removeResepRow(idx)}
                      className="text-red-600 font-bold hover:underline text-sm"
                      disabled={resepItems.length === 1}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EDUKASI & CATATAN */}
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-amber-500">Edukasi & Catatan</h3>
              <p className="text-xs text-gray-400 font-semibold">Opsional</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Edukasi Pasien</label>
              <textarea
                value={formData.edukasiPasien}
                onChange={(e) => setFormData((p) => ({ ...p, edukasiPasien: e.target.value }))}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Catatan Tambahan</label>
              <textarea
                value={formData.catatanTambahan}
                onChange={(e) => setFormData((p) => ({ ...p, catatanTambahan: e.target.value }))}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Catatan Rujukan</label>
              <textarea
                value={formData.rujukanCatatan}
                onChange={(e) => setFormData((p) => ({ ...p, rujukanCatatan: e.target.value }))}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-amber-400 outline-none font-bold resize-none"
              />
            </div>
          </div>

          {/* TOMBOL */}
          <div className="flex gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-10 py-4 font-bold text-gray-400 hover:text-gray-600 transition-all uppercase text-sm tracking-widest"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-all active:scale-[0.98] uppercase text-sm tracking-widest disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL KONFIRMASI */}
      {showKonfirmasi && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-amber-500 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black">Simpan Perubahan?</h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pasien</span>
                  <span className="font-bold uppercase">{rekamMedis?.pasien?.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Diagnosis baru</span>
                  <span className="font-bold">{formData.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Biaya</span>
                  <span className="text-amber-600 font-black">Rp {totalBiaya.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowKonfirmasi(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cek Lagi
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-60"
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

export default function EditRekamMedisPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-gray-500 font-bold">
          Memuat Halaman...
        </div>
      }
    >
      <EditRekamMedisContent />
    </React.Suspense>
  );
}