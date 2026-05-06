"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [dataKunjungan, setDataKunjungan] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [ringkasan, setRingkasan] = useState({ belum: 0, sudah: 0 });
  const [antreanNext, setAntreanNext] = useState({ nama: "-", nomor: "-" });
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modal & Form
  const [showModalKunjungan, setShowModalKunjungan] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    pasienId: "",
    namaPasien: "",
    tanggalBerobat: new Date().toISOString().split('T')[0],
    waktuBerobat: "",
    keluhan: ""
  });

  const fetchDashboardData = async () => {
    try {
      const resAntrian = await fetch("/api/antrian");
      const jsonAntrian = await resAntrian.json();
      if (jsonAntrian.success) {
        const list = jsonAntrian.data;
        setDataKunjungan(list);
        setRingkasan({
          belum: list.filter((a: any) => a.status === "MENUNGGU").length,
          sudah: list.filter((a: any) => a.status === "SELESAI").length
        });
        const next = list.find((a: any) => a.status === "MENUNGGU");
        if (next) setAntreanNext({ nama: next.pasien?.nama || "-", nomor: next.nomorAntrian.toString() });
      }

      const resPasien = await fetch("/api/pasien");
      const jsonPasien = await resPasien.json();
      if (jsonPasien.success) setPasienList(jsonPasien.data);
    } catch (error) {
      console.error("Gagal load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredPasien = pasienList.filter((p: any) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimpanKunjungan = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.pasienId) {
    alert("Maaf, kamu harus memilih pasien dari daftar dropdown agar sistem mendapatkan ID-nya.");
    return;
  }

  try {
    const res = await fetch("/api/antrian", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "x-user-role": "ADMIN" 
      },
      body: JSON.stringify({ 
        // Sesuai dengan antrianSchema milik Adit
        pasienId: formData.pasienId,
        // Sementara pakai dummy ID dokter jika belum ada sistem login dokter
        dokterId: "e12d2fe4-3821-4a95-8c62-8aa7336d8b58" 
      }),
    });

    const resJson = await res.json();

    if (res.ok) {
      alert("Antrean Berhasil Dibuat!");
      setShowModalKunjungan(false);
      fetchDashboardData();
    } else {
      // Jika error, tampilkan detail dari Zod agar kita tahu field mana yang salah
      console.log("Detail Error:", resJson.details);
      alert("Gagal: " + (resJson.error || "Data tidak valid"));
    }
  } catch (err) {
    alert("Koneksi ke server terputus");
  }
};

  return (
    <div className="max-w-8xl mx-auto space-y-6 text-black relative">
      <div className="flex justify-between px-3 items-center mb-4">
        <h1 className="text-3xl font-bold">Selamat Datang, Admin</h1>
        <button 
          onClick={() => setShowModalKunjungan(true)}
          className="bg-green-theme text-2xl hover:bg-green-theme-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <span className="text-3xl">+</span> Tambah Kunjungan
        </button>
      </div>

      {showModalKunjungan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Form Tambah Kunjungan</h2>
              <p className="opacity-80">Lengkapi detail kunjungan pasien</p>
            </div>
            
            {/* Submit handle di sini */}
            <form onSubmit={handleSimpanKunjungan} className="p-8 space-y-4">
              <div className="relative">
                <label className="block text-sm font-bold mb-1">Nama Pasien</label>
                <input 
                  type="text" 
                  placeholder="Cari nama pasien..."
                  className="w-full border-2 p-3 rounded-xl outline-none focus:border-primary"
                  value={formData.namaPasien || searchTerm}
                  autoComplete="off"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFormData({...formData, namaPasien: "", pasienId: ""});
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                {isDropdownOpen && !formData.pasienId && searchTerm.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto z-[60]">
                    {filteredPasien.length > 0 ? (
                      filteredPasien.map((p: any) => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            setFormData({...formData, pasienId: p.id, namaPasien: p.nama});
                            setIsDropdownOpen(false);
                            setSearchTerm("");
                          }}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b"
                        >
                          <p className="font-bold">{p.nama}</p>
                          <p className="text-xs text-gray-400">NIK: {p.nik}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-400 text-sm italic">Pasien tidak ditemukan</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Tanggal Berobat</label>
                  <input 
                    type="date" 
                    className="w-full border-2 p-3 rounded-xl outline-none"
                    value={formData.tanggalBerobat}
                    onChange={(e) => setFormData({...formData, tanggalBerobat: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Waktu</label>
                  <input 
                    type="time" 
                    className="w-full border-2 p-3 rounded-xl outline-none"
                    value={formData.waktuBerobat}
                    onChange={(e) => setFormData({...formData, waktuBerobat: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Keluhan Pasien</label>
                <textarea 
                  placeholder="Ceritakan keluhan pasien..."
                  className="w-full border-2 p-3 rounded-xl outline-none focus:border-primary h-24"
                  value={formData.keluhan}
                  onChange={(e) => setFormData({...formData, keluhan: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModalKunjungan(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                >Batal</button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-theme hover:bg-green-theme-dark text-white py-3 rounded-xl font-bold shadow-lg transition-all"
                >Simpan Kunjungan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ringkasan Pasien */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-2xl">
            Ringkasan Pasien Hari Ini : {" "}
            <span className="text-primary font-semibold">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </h3>
          <div className="flex gap-12 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl">
                <img src="/componen-admin/pasien.svg" className="w-6 h-6" alt="icon" />
              </div>
              <div>
                <p className="text-lg font-medium text-black">Pasien Belum Diperiksa</p>
                <p className="text-3xl font-bold text-primary">{ringkasan.belum}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl">
                <img src="/componen-admin/pasien.svg" className="w-6 h-6" alt="icon" />
              </div>
              <div>
                <p className="text-lg font-medium text-black">Pasien Sudah Diperiksa</p>
                <p className="text-3xl font-bold text-primary">{ringkasan.sudah}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <h3 className="font-bold text-gray-800 text-2xl">Nomor Antrean Berikutnya:</h3>
          <div className="flex items-center justify-between">
            <p className="text-primary text-xl font-semibold uppercase">{antreanNext.nama}</p>
            <p className="text-6xl font-bold text-primary">{antreanNext.nomor}</p>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="px-4 py-2 border-2 uppercase">ID Pasien</th>
              <th className="px-4 py-2 border-2 uppercase">Nama Pasien</th>
              <th className="px-4 py-2 border-2 uppercase">Jenis Kelamin</th>
              <th className="px-4 py-2 border-2 uppercase">Nomor Antrian</th>
              <th className="px-4 py-2 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-black font-bold text-center">
            {isLoading ? (
              <tr><td colSpan={5} className="py-10">Memuat data...</td></tr>
            ) : dataKunjungan.length > 0 ? (
              dataKunjungan.map((item: any, i: number) => (
                <tr key={i} className="border-b hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary font-bold">P{(i+1).toString().padStart(4, '0')}</td>
                  <td className="px-4 py-3 text-left">{item.pasien?.nama}</td>
                  <td className="px-4 py-3 text-sm">{item.pasien?.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-4 py-3 text-primary text-2xl">{item.nomorAntrian}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline">Detail</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="py-10 text-gray-400 italic">Belum ada kunjungan hari ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}