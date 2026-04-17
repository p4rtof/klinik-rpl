"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAppointments, saveAppointment, deleteAppointment, getPatients, initData } from "@/lib/storage";
import type { Appointment, Patient } from "@/types/klinik";

export default function JadwalPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ patientId: "", date: "", time: "08:00", keluhan: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    load();
  }, []);

  const load = () => {
    setAppointments(getAppointments().sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
    setPatients(getPatients());
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === formData.patientId);
    if (!patient) return;
    const apt: Appointment = {
      id: Date.now().toString(),
      patientId: patient.id,
      patientName: patient.name,
      date: formData.date,
      time: formData.time,
      keluhan: formData.keluhan,
      status: "antri",
    };
    saveAppointment(apt);
    setShowModal(false);
    setFormData({ patientId: "", date: "", time: "08:00", keluhan: "" });
    load();
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus jadwal ini?")) { deleteAppointment(id); load(); }
  };

  const statusColor = (s: string) => ({ antri: "bg-yellow-100 text-yellow-800", periksa: "bg-blue-100 text-blue-800", selesai: "bg-green-100 text-green-800", batal: "bg-red-100 text-red-800" }[s] || "bg-gray-100 text-gray-800");

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jadwal & Antrian</h1>
            <p className="text-gray-600">Kelola jadwal kunjungan pasien</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg">
            ➕ Buat Antrian
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Pasien", "Tanggal", "Jam", "Keluhan", "Status", "Aksi"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{a.patientName}</td>
                    <td className="px-6 py-4 text-gray-700">{a.date}</td>
                    <td className="px-6 py-4 text-gray-700">{a.time}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{a.keluhan}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(a.status)}`}>{a.status.toUpperCase()}</span></td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-900 font-bold text-sm">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && <div className="text-center py-12 text-gray-500">📅 Belum ada jadwal</div>}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Buat Antrian Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pasien</label>
                  <select required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}>
                    <option value="">-- Pilih Pasien --</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                    <input type="date" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jam</label>
                    <input type="time" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keluhan</label>
                  <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg" value={formData.keluhan} onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })} placeholder="Keluhan pasien..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Simpan</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
