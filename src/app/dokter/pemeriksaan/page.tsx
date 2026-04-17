"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAppointments, initData } from "@/lib/storage";
import type { Appointment } from "@/types/klinik";

export default function PemeriksaanPage() {
  const [records, setRecords] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    const data = getAppointments()
      .filter((a) => a.status === "selesai")
      .sort((a, b) => b.date.localeCompare(a.date));
    setRecords(data);
    setLoading(false);
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <ProtectedRoute requiredRole="DOKTER">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pemeriksaan</h1>
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{r.patientName}</h3>
                  <p className="text-sm text-gray-500">{r.date} • {r.time}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">SELESAI</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-semibold">Keluhan:</span><p className="text-gray-600 mt-1">{r.keluhan}</p></div>
                <div><span className="font-semibold">Diagnosa:</span><p className="text-gray-600 mt-1">{r.diagnosa || "-"}</p></div>
                <div><span className="font-semibold">Resep:</span><p className="text-gray-600 mt-1">{r.resep || "-"}</p></div>
              </div>
            </div>
          ))}
          {records.length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">📋 Belum ada riwayat pemeriksaan</div>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
