"use client";

import React, { useMemo, useState } from "react";

type Gender = "Laki-laki" | "Perempuan";

type Patient = {
  nomorRM: string;
  nama: string;
  jenisKelamin: Gender;
  tanggalLahir: string; // yyyy-mm-dd
  telepon: string;
  alamat: string;
  alergi: string; // bisa kosong
};

type VitalSign = {
  tdSistolik?: number; // mmHg
  tdDiastolik?: number; // mmHg
  nadi?: number; // x/menit
  rr?: number; // x/menit
  suhu?: number; // C
  spo2?: number; // %
  bb?: number; // kg
  tb?: number; // cm
};

type Soap = {
  subjektif: string;
  objektif: string;
  assesment: string;
  plan: string;
};

type RxItem = {
  namaObat: string;
  aturanPakai: string;
  jumlah: string;
};

function calcAge(tanggalLahir: string) {
  const dob = new Date(tanggalLahir);
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  return years;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toIDDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{children}</div>;
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
    />
  );
}

export default function RekamMedisPage() {
  // Dummy patient (nanti ganti dari API / antrean)
  const [patient, setPatient] = useState<Patient>({
    nomorRM: "R0121",
    nama: "Troye Sivan",
    jenisKelamin: "Laki-laki",
    tanggalLahir: "1999-06-05",
    telepon: "0898416269",
    alamat: "Jl. Manggis No 33, Tebet, Jakarta Selatan, DKI Jakarta",
    alergi: "Tidak ada",
  });

  const [tanggalKunjungan, setTanggalKunjungan] = useState<string>(todayISO());
  const [dokter, setDokter] = useState<string>("dr. Yofli");
  const [poli, setPoli] = useState<string>("Poli Umum");

  const [keluhanUtama, setKeluhanUtama] = useState<string>("Nyeri sendi sejak 2 minggu, memberat saat pagi.");
  const [riwayatPenyakitSekarang, setRiwayatPenyakitSekarang] = useState<string>("");
  const [riwayatPenyakitDahulu, setRiwayatPenyakitDahulu] = useState<string>("");
  const [riwayatObat, setRiwayatObat] = useState<string>("");
  const [riwayatAlergi, setRiwayatAlergi] = useState<string>(patient.alergi);
  const [riwayatKeluarga, setRiwayatKeluarga] = useState<string>("");
  const [kebiasaan, setKebiasaan] = useState<string>("");

  const [vital, setVital] = useState<VitalSign>({
    tdSistolik: 120,
    tdDiastolik: 80,
    nadi: 88,
    rr: 18,
    suhu: 36.7,
    spo2: 98,
    bb: 68,
    tb: 172,
  });

  const [pemeriksaanFisik, setPemeriksaanFisik] = useState<string>(
    "Keadaan umum baik, nyeri tekan pada sendi tangan, tidak ada sesak."
  );

  const [diagnosisUtama, setDiagnosisUtama] = useState<string>("Suspek Rheumatoid Arthritis");
  const [diagnosisBanding, setDiagnosisBanding] = useState<string>("");
  const [icd10, setIcd10] = useState<string>(""); // opsional
  const [tindakan, setTindakan] = useState<string>("Edukasi, pemeriksaan lanjutan, terapi simtomatik.");
  const [penunjang, setPenunjang] = useState<string>("Lab: LED/CRP, RF, Anti-CCP (bila tersedia).");

  const [soap, setSoap] = useState<Soap>({
    subjektif: "Keluhan nyeri sendi, kaku pagi hari.",
    objektif: "TTV dalam batas normal, nyeri tekan sendi.",
    assesment: "Suspek RA, perlu pemeriksaan penunjang.",
    plan: "Terapi awal + kontrol 1 minggu.",
  });

  const [resep, setResep] = useState<RxItem[]>([
    { namaObat: "Paracetamol 500mg", aturanPakai: "3x1 setelah makan bila nyeri", jumlah: "10 tablet" },
  ]);

  const [edukasi, setEdukasi] = useState<string>(
    "Istirahat cukup, kompres hangat, catat nyeri, kembali bila memburuk."
  );
  const [rujukan, setRujukan] = useState<string>("");
  const [catatan, setCatatan] = useState<string>("");

  const bmi = useMemo(() => {
    const bb = vital.bb ?? 0;
    const tb = vital.tb ?? 0;
    if (!bb || !tb) return "";
    const m = tb / 100;
    const val = bb / (m * m);
    return val ? val.toFixed(1) : "";
  }, [vital.bb, vital.tb]);

  const handleAddRx = () => {
    setResep((prev) => [...prev, { namaObat: "", aturanPakai: "", jumlah: "" }]);
  };

  const handleRemoveRx = (idx: number) => {
    setResep((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    // TODO: POST ke API (mis. /api/doctor/rekam-medis)
    const payload = {
      tanggalKunjungan,
      dokter,
      poli,
      patient,
      keluhanUtama,
      riwayat: {
        penyakitSekarang: riwayatPenyakitSekarang,
        penyakitDahulu: riwayatPenyakitDahulu,
        obat: riwayatObat,
        alergi: riwayatAlergi,
        keluarga: riwayatKeluarga,
        kebiasaan,
      },
      vital,
      pemeriksaanFisik,
      diagnosis: { utama: diagnosisUtama, banding: diagnosisBanding, icd10 },
      tindakan,
      penunjang,
      soap,
      resep,
      edukasi,
      rujukan,
      catatan,
    };

    console.log("SIMPAN REKAM MEDIS:", payload);
    alert("Sementara tersimpan di console. Nanti sambungkan ke API backend.");
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Rekam Medis</h1>
          <p className="text-sm text-gray-600 font-semibold">
            Lengkapi data pemeriksaan sesuai SOAP, tanda vital, diagnosis, dan terapi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
            <span className="font-bold text-gray-500">Tanggal:</span>{" "}
            <span className="font-extrabold text-gray-900">{toIDDate(tanggalKunjungan)}</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-extrabold shadow-sm transition"
          >
            Simpan Rekam Medis
          </button>
        </div>
      </div>

      {/* Identitas Pasien */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-blue-700 font-extrabold text-lg">Identitas Pasien</h2>
            <p className="text-xs text-gray-500 font-semibold">Pastikan data pasien benar sebelum mengisi.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <div className="text-[11px] font-bold text-gray-500">Nomor RM</div>
              <div className="font-extrabold">{patient.nomorRM}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <div className="text-[11px] font-bold text-gray-500">Umur</div>
              <div className="font-extrabold">{calcAge(patient.tanggalLahir)} tahun</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <div className="text-[11px] font-bold text-gray-500">Poli</div>
              <input
                value={poli}
                onChange={(e) => setPoli(e.target.value)}
                className="w-full bg-transparent outline-none font-extrabold"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Nama</FieldLabel>
                <Input
                  value={patient.nama}
                  onChange={(value) => setPatient((prev) => ({ ...prev, nama: value }))}
                  placeholder="Nama pasien"
                />
              </div>
              <div>
                <FieldLabel>Jenis Kelamin</FieldLabel>
                <select
                  value={patient.jenisKelamin}
                  onChange={(e) => setPatient((prev) => ({ ...prev, jenisKelamin: e.target.value as Gender }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Tanggal Lahir</FieldLabel>
                <Input
                  type="date"
                  value={patient.tanggalLahir}
                  onChange={(value) => setPatient((prev) => ({ ...prev, tanggalLahir: value }))}
                />
              </div>
              <div>
                <FieldLabel>Telepon</FieldLabel>
                <Input
                  value={patient.telepon}
                  onChange={(value) => setPatient((prev) => ({ ...prev, telepon: value }))}
                  placeholder="Nomor telepon"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <FieldLabel>Alamat</FieldLabel>
              <TextArea
                value={patient.alamat}
                onChange={(value) => setPatient((prev) => ({ ...prev, alamat: value }))}
                rows={3}
                placeholder="Alamat pasien"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Dokter</FieldLabel>
                <Input value={dokter} onChange={setDokter} />
              </div>
              <div>
                <FieldLabel>Alergi (update bila ada)</FieldLabel>
                <Input value={riwayatAlergi} onChange={setRiwayatAlergi} placeholder="Mis. penisilin / udang / -"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keluhan & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h2 className="text-blue-700 font-extrabold">Anamnesis</h2>

          <div>
            <FieldLabel>Keluhan Utama</FieldLabel>
            <TextArea value={keluhanUtama} onChange={setKeluhanUtama} rows={3} />
          </div>

          <div>
            <FieldLabel>Riwayat Penyakit Sekarang</FieldLabel>
            <TextArea value={riwayatPenyakitSekarang} onChange={setRiwayatPenyakitSekarang} rows={4} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Riwayat Penyakit Dahulu</FieldLabel>
              <TextArea value={riwayatPenyakitDahulu} onChange={setRiwayatPenyakitDahulu} rows={3} />
            </div>
            <div>
              <FieldLabel>Riwayat Obat</FieldLabel>
              <TextArea value={riwayatObat} onChange={setRiwayatObat} rows={3} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Riwayat Keluarga</FieldLabel>
              <TextArea value={riwayatKeluarga} onChange={setRiwayatKeluarga} rows={3} />
            </div>
            <div>
              <FieldLabel>Kebiasaan (merokok/alkohol/dll)</FieldLabel>
              <TextArea value={kebiasaan} onChange={setKebiasaan} rows={3} />
            </div>
          </div>
        </div>

        {/* Tanda Vital */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-blue-700 font-extrabold">Pemeriksaan</h2>
              <p className="text-xs text-gray-500 font-semibold">Isi TTV dan pemeriksaan fisik.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <div className="text-[11px] font-bold text-gray-500">BMI</div>
              <div className="font-extrabold">{bmi || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <FieldLabel>TD Sistolik</FieldLabel>
              <Input
                value={vital.tdSistolik?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, tdSistolik: v ? Number(v) : undefined }))}
                type="number"
                placeholder="mmHg"
              />
            </div>
            <div>
              <FieldLabel>TD Diastolik</FieldLabel>
              <Input
                value={vital.tdDiastolik?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, tdDiastolik: v ? Number(v) : undefined }))}
                type="number"
                placeholder="mmHg"
              />
            </div>
            <div>
              <FieldLabel>Nadi</FieldLabel>
              <Input
                value={vital.nadi?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, nadi: v ? Number(v) : undefined }))}
                type="number"
                placeholder="x/menit"
              />
            </div>
            <div>
              <FieldLabel>RR</FieldLabel>
              <Input
                value={vital.rr?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, rr: v ? Number(v) : undefined }))}
                type="number"
                placeholder="x/menit"
              />
            </div>

            <div>
              <FieldLabel>Suhu</FieldLabel>
              <Input
                value={vital.suhu?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, suhu: v ? Number(v) : undefined }))}
                type="number"
                placeholder="°C"
              />
            </div>
            <div>
              <FieldLabel>SpO2</FieldLabel>
              <Input
                value={vital.spo2?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, spo2: v ? Number(v) : undefined }))}
                type="number"
                placeholder="%"
              />
            </div>
            <div>
              <FieldLabel>BB</FieldLabel>
              <Input
                value={vital.bb?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, bb: v ? Number(v) : undefined }))}
                type="number"
                placeholder="kg"
              />
            </div>
            <div>
              <FieldLabel>TB</FieldLabel>
              <Input
                value={vital.tb?.toString() ?? ""}
                onChange={(v) => setVital((p) => ({ ...p, tb: v ? Number(v) : undefined }))}
                type="number"
                placeholder="cm"
              />
            </div>
          </div>

          <div>
            <FieldLabel>Pemeriksaan Fisik</FieldLabel>
            <TextArea value={pemeriksaanFisik} onChange={setPemeriksaanFisik} rows={5} />
          </div>
        </div>
      </div>

      {/* Diagnosis & Tatalaksana */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-blue-700 font-extrabold">Diagnosis & Tatalaksana</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Diagnosis Utama</FieldLabel>
            <Input value={diagnosisUtama} onChange={setDiagnosisUtama} placeholder="Contoh: Gastritis akut" />
          </div>
          <div>
            <FieldLabel>Diagnosis Banding</FieldLabel>
            <Input value={diagnosisBanding} onChange={setDiagnosisBanding} placeholder="Opsional" />
          </div>
          <div>
            <FieldLabel>Kode ICD-10 (opsional)</FieldLabel>
            <Input value={icd10} onChange={setIcd10} placeholder="Contoh: M06.9" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Tindakan / Terapi</FieldLabel>
            <TextArea value={tindakan} onChange={setTindakan} rows={4} />
          </div>
          <div>
            <FieldLabel>Pemeriksaan Penunjang</FieldLabel>
            <TextArea value={penunjang} onChange={setPenunjang} rows={4} />
          </div>
        </div>
      </div>

      {/* SOAP */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-blue-700 font-extrabold">Catatan SOAP</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <FieldLabel>S (Subjektif)</FieldLabel>
            <TextArea value={soap.subjektif} onChange={(v) => setSoap((p) => ({ ...p, subjektif: v }))} rows={4} />
          </div>
          <div>
            <FieldLabel>O (Objektif)</FieldLabel>
            <TextArea value={soap.objektif} onChange={(v) => setSoap((p) => ({ ...p, objektif: v }))} rows={4} />
          </div>
          <div>
            <FieldLabel>A (Assessment)</FieldLabel>
            <TextArea value={soap.assesment} onChange={(v) => setSoap((p) => ({ ...p, assesment: v }))} rows={4} />
          </div>
          <div>
            <FieldLabel>P (Plan)</FieldLabel>
            <TextArea value={soap.plan} onChange={(v) => setSoap((p) => ({ ...p, plan: v }))} rows={4} />
          </div>
        </div>
      </div>

      {/* Resep + Edukasi + Rujukan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resep */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-blue-700 font-extrabold">Resep Obat</h2>
            <button
              type="button"
              onClick={handleAddRx}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-extrabold text-sm transition"
            >
              + Tambah Obat
            </button>
          </div>

          <div className="space-y-3">
            {resep.map((rx, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FieldLabel>Nama Obat</FieldLabel>
                    <Input
                      value={rx.namaObat}
                      onChange={(v) =>
                        setResep((prev) => prev.map((it, i) => (i === idx ? { ...it, namaObat: v } : it)))
                      }
                      placeholder="Mis. Amoxicillin 500mg"
                    />
                  </div>
                  <div>
                    <FieldLabel>Aturan Pakai</FieldLabel>
                    <Input
                      value={rx.aturanPakai}
                      onChange={(v) =>
                        setResep((prev) => prev.map((it, i) => (i === idx ? { ...it, aturanPakai: v } : it)))
                      }
                      placeholder="Mis. 3x1 sesudah makan"
                    />
                  </div>
                  <div>
                    <FieldLabel>Jumlah</FieldLabel>
                    <Input
                      value={rx.jumlah}
                      onChange={(v) =>
                        setResep((prev) => prev.map((it, i) => (i === idx ? { ...it, jumlah: v } : it)))
                      }
                      placeholder="Mis. 10 tablet"
                    />
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRx(idx)}
                    className="text-red-600 hover:underline font-bold text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edukasi + Rujukan + Catatan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-blue-700 font-extrabold">Edukasi, Rujukan, Catatan</h2>

          <div>
            <FieldLabel>Edukasi Pasien</FieldLabel>
            <TextArea value={edukasi} onChange={setEdukasi} rows={4} />
          </div>

          <div>
            <FieldLabel>Rujukan (bila perlu)</FieldLabel>
            <TextArea value={rujukan} onChange={setRujukan} rows={3} placeholder="Contoh: Rujuk Sp.PD-R untuk evaluasi lanjut." />
          </div>

          <div>
            <FieldLabel>Catatan Tambahan</FieldLabel>
            <TextArea value={catatan} onChange={setCatatan} rows={3} />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => history.back()}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-2 rounded-lg font-extrabold shadow-sm transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-extrabold shadow-sm transition"
            >
              Simpan
            </button>
          </div>

          <p className="text-[11px] text-gray-500 font-semibold">
            * Untuk sistem produksi: wajib ada audit trail (siapa mengubah apa & kapan), pembatasan akses, dan validasi data.
          </p>
        </div>
      </div>
    </div>
  );
}