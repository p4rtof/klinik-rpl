"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Daftar pilihan tindakan dengan harga tetap
const PILIHAN_TINDAKAN = [
  { label: "Konsultasi Dokter Umum", harga: 50000 },
  { label: "Pemeriksaan Fisik Lengkap", harga: 75000 },
  { label: "Injeksi / Suntik Vitamin", harga: 100000 },
  { label: "Cek Gula Darah & Kolesterol", harga: 85000 },
  { label: "Surat Keterangan Sehat", harga: 30000 },
  { label: "Tindakan Bedah Ringan", harga: 250000 },
];

export default function PeriksaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const antreanId = searchParams.get("id");

  const [antrean, setAntrean] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Form Pemeriksaan
  const [formData, setFormData] = useState({
    tindakan: "",
    biayaTindakan: 0,
    diagnosis: "",
    keterangan: "",
    resep: "",
    perluRujukan: false,
    tujuanRujukan: "",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/antrian/${antreanId}`);
        const json = await res.json();
        
        if (json.success) {
          setAntrean(json.data);
          const resHistory = await fetch(`/api/rekam-medis/pasien/${json.data.pasienId}`);
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

  // Fungsi saat dokter memilih tindakan
  const handlePilihTindakan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const terpilih = PILIHAN_TINDAKAN.find(t => t.label === e.target.value);
    setFormData({
      ...formData,
      tindakan: terpilih ? terpilih.label : "",
      biayaTindakan: terpilih ? terpilih.harga : 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tindakan || !formData.diagnosis.trim()) {
      alert("Tindakan dan Diagnosis wajib diisi!");
      return;
    }

    try {
      const payload: any = {
        pasienId: antrean.pasienId,
        jadwalId: antrean.id,
        keluhan: antrean.keluhan || "Pemeriksaan rutin",
        tindakan: formData.tindakan, // Mengirim nama tindakan yang dipilih
        diagnosis: [{ deskripsi: formData.diagnosis }], // Sesuai schema diagnosisItemSchema
        resep: formData.resep ? [{ 
          namaObat: formData.resep, 
          dosis: "-", 
          aturanPakai: "Sesuai petunjuk dokter" 
        }] : [], // Sesuai resepItemSchema
        // Keterangan tambahan (opsional)
        keterangan: formData.keterangan 
      };

      // Rujukan bersifat opsional: Hanya dikirim jika checkbox dicentang dan tujuan diisi
      if (formData.perluRujukan && formData.tujuanRujukan.trim()) {
        payload.rujukan = {
          tujuan: formData.tujuanRujukan,
          keterangan: "Rujukan berdasarkan hasil pemeriksaan dokter"
        };
      }

      const res = await fetch("/api/rekam-medis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // alert("Pemeriksaan Selesai! Data dikirim ke Admin untuk proses pembayaran.");
        router.push("/dashboard-dokter");
      } else {
        alert("Gagal menyimpan pemeriksaan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold animate-pulse text-primary">Memuat Data Pasien...</div>;
  if (!antrean) return <div className="p-10 text-center text-red-500 font-bold">Pasien tidak ditemukan.</div>;

  return (
    <div className="w-full space-y-6 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DATA PASIEN */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold border-b border-gray-50 pb-4">Data Pasien</h2>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Pasien</p>
              <p className="text-xl font-extrabold">{antrean.pasien?.nama}</p>
              <p className="text-xs text-primary font-bold">{antrean.pasien?.noRm}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Jenis Kelamin</p>
                <p className="font-bold">{antrean.pasien?.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Usia</p>
                <p className="font-bold">
                  {antrean.pasien?.tanggalLahir ? 
                    new Date().getFullYear() - new Date(antrean.pasien.tanggalLahir).getFullYear() 
                    : "-"} Tahun
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIWAYAT TERAKHIR */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-xl font-bold border-b border-gray-50 pb-4 text-orange-500">Riwayat Terakhir</h2>
          <div className="overflow-auto max-h-[180px]">
            {history.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-50">
                    <th className="pb-2 font-bold uppercase text-[10px]">Tanggal</th>
                    <th className="pb-2 font-bold uppercase text-[10px]">Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 3).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-gray-500">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 font-semibold">
                        {Array.isArray(item.diagnosis) ? item.diagnosis.map((d: any) => d.deskripsi).join(", ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-10 text-gray-400 italic text-sm font-medium">Belum ada riwayat pemeriksaan sebelumnya.</p>
            )}
          </div>
        </div>
      </div>

      {/* FORM PEMERIKSAAN */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-widest">Input Hasil Pemeriksaan</h2>
          <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
            Biaya Layanan: Rp {formData.biayaTindakan.toLocaleString()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. PILIH TINDAKAN (DROPDOWN) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Pilih Tindakan Medis</label>
              <select 
                required
                value={formData.tindakan}
                onChange={handlePilihTindakan}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-primary outline-none font-bold bg-white cursor-pointer"
              >
                <option value="">-- Pilih Tindakan --</option>
                {PILIHAN_TINDAKAN.map((t, index) => (
                  <option key={index} value={t.label}>{t.label} (Rp {t.harga.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {/* 2. DIAGNOSIS */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Diagnosis Utama (Wajib)</label>
              <input 
                required
                value={formData.diagnosis} 
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} 
                className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-primary outline-none font-bold placeholder:text-gray-200" 
                placeholder="Misal: Gastritis / Demam Akut..." 
              />
            </div>

            {/* 3. KETERANGAN */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">3. Keterangan Pemeriksaan Fisik</label>
              <textarea 
                value={formData.keterangan} 
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none placeholder:text-gray-200" 
                placeholder="Catatan tambahan mengenai kondisi fisik pasien..." 
              />
            </div>

            {/* 4. RESEP OBAT */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">4. Resep Obat & Aturan Pakai</label>
              <textarea 
                value={formData.resep} 
                onChange={(e) => setFormData({...formData, resep: e.target.value})} 
                className="w-full border-2 border-gray-100 p-4 rounded-2xl h-24 focus:border-primary outline-none font-bold resize-none placeholder:text-gray-200" 
                placeholder="Contoh: Paracetamol 500mg (3x1 sesudah makan)..." 
              />
            </div>

            {/* 5. RUJUKAN (OPSIONAL) */}
            <div className="space-y-2 md:col-span-2 p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <input 
                  type="checkbox" 
                  id="rujukan" 
                  checked={formData.perluRujukan} 
                  onChange={(e) => setFormData({...formData, perluRujukan: e.target.checked})} 
                  className="w-5 h-5 accent-primary cursor-pointer" 
                />
                <label htmlFor="rujukan" className="font-bold text-primary cursor-pointer select-none">
                  5. Pasien Membutuhkan Rujukan Spesialis?
                </label>
              </div>

              {formData.perluRujukan && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text"
                    required={formData.perluRujukan}
                    value={formData.tujuanRujukan}
                    onChange={(e) => setFormData({...formData, tujuanRujukan: e.target.value})}
                    placeholder="Masukkan RS atau Poli Tujuan (Contoh: RS Hermina / Poli Mata)"
                    className="w-full border-2 border-primary/20 p-4 rounded-2xl focus:border-primary outline-none font-bold text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 italic font-medium">* Admin akan otomatis mencetak surat rujukan ke tujuan ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-10 py-4 font-bold text-gray-400 hover:text-gray-600 transition-all uppercase text-sm tracking-widest"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] uppercase text-sm tracking-widest"
            >
              Simpan & Selesai Pemeriksaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}