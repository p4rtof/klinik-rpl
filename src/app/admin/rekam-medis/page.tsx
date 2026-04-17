"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getMedicalRecords, getAppointments, initData } from "@/lib/storage";
import type { Appointment } from "@/types/klinik";

export default function RekamMedisPage() {
  const [records, setRecords] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    const apts = getAppointments().filter((a) => a.status === "selesai" && a.diagnosa);
    setRecords(apts.sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  }, []);

  const filtered = records.filter((r) => r.patientName.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekam Medis</h1>
          <p className="text-gray-600">Riwayat pemeriksaan pasien</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
          <input type="text" placeholder="Cari nama pasien..." className="w-full max-w-md p-3 border border-gray-300 rounded-lg mb-6" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{r.patientName}</h3>
                    <p className="text-sm text-gray-500">{r.date} • {r.time}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">SELESAI</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="font-semibold text-gray-700">Keluhan:</span><p className="text-gray-600 mt-1">{r.keluhan}</p></div>
                  <div><span className="font-semibold text-gray-700">Diagnosa:</span><p className="text-gray-600 mt-1">{r.diagnosa || "-"}</p></div>
                  <div><span className="font-semibold text-gray-700">Resep:</span><p className="text-gray-600 mt-1">{r.resep || "-"}</p></div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-gray-500">📋 Belum ada rekam medis</div>}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
