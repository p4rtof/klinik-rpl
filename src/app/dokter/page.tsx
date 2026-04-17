"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAppointments, saveAppointment, initData } from "@/lib/storage";
import type { Appointment } from "@/types/klinik";

export default function DokterPage() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [diagnosa, setDiagnosa] = useState("");
  const [resep, setResep] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    load();
  }, []);

  const load = () => {
    const today = new Date().toISOString().split("T")[0];
    const apts = getAppointments()
      .filter((a) => a.date === today && (a.status === "antri" || a.status === "periksa"))
      .sort((a, b) => a.time.localeCompare(b.time));
    setQueue(apts);
    setLoading(false);
  };

  const handlePeriksa = (apt: Appointment) => {
    const updated = { ...apt, status: "periksa" as const };
    saveAppointment(updated);
    setSelected(updated);
    setDiagnosa("");
    setResep("");
    load();
  };

  const handleSelesai = () => {
    if (!selected) return;
    const updated: Appointment = { ...selected, status: "selesai", diagnosa, resep };
    saveAppointment(updated);
    setSelected(null);
    load();
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <ProtectedRoute requiredRole="DOKTER">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Antrean Poli Umum</h1>
        <p className="text-gray-600">Hari ini: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daftar Antrian */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Daftar Antrian ({queue.length})</h2>
            {queue.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow border">✅ Tidak ada antrian hari ini</div>
            ) : (
              queue.map((apt) => (
                <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{apt.patientName}</h3>
                      <p className="text-sm text-gray-500">⏰ {apt.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === "periksa" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {apt.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Keluhan: {apt.keluhan}</p>
                  {apt.status === "antri" && (
                    <button onClick={() => handlePeriksa(apt)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
                      🩺 Mulai Periksa
                    </button>
                  )}
                  {apt.status === "periksa" && apt.id === selected?.id && (
                    <div className="text-sm text-blue-600 font-medium">Sedang diperiksa...</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Form Pemeriksaan */}
          <div>
            {selected ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-1">Form Pemeriksaan</h2>
                <p className="text-gray-600 text-sm mb-4">Pasien: <strong>{selected.patientName}</strong></p>
                <p className="text-gray-600 text-sm mb-6">Keluhan: {selected.keluhan}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosa Dokter</label>
                    <textarea className="w-full border p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan diagnosa..." value={diagnosa} onChange={(e) => setDiagnosa(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resep Obat</label>
                    <textarea className="w-full border p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan resep obat..." value={resep} onChange={(e) => setResep(e.target.value)} />
                  </div>
                  <button onClick={handleSelesai} disabled={!diagnosa} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors">
                    ✅ Selesai Periksa
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border text-center text-gray-400">
                <div className="text-4xl mb-4">🩺</div>
                <p>Pilih pasien dari daftar antrian untuk mulai pemeriksaan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
