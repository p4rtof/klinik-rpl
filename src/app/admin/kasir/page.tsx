"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPayments, savePayment, getAppointments, initData } from "@/lib/storage";
import type { Payment, Appointment } from "@/types/klinik";

export default function KasirPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selesaiApts, setSelesaiApts] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ appointmentId: "", amount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    load();
  }, []);

  const load = () => {
    const apts = getAppointments().filter((a) => a.status === "selesai");
    const pays = getPayments();
    const paidIds = pays.map((p) => p.appointmentId);
    setSelesaiApts(apts.filter((a) => !paidIds.includes(a.id)));
    setPayments(pays.sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apt = selesaiApts.find((a) => a.id === formData.appointmentId);
    if (!apt) return;
    const payment: Payment = {
      id: Date.now().toString(),
      appointmentId: apt.id,
      patientName: apt.patientName,
      amount: formData.amount,
      date: new Date().toISOString().split("T")[0],
      status: "lunas",
    };
    savePayment(payment);
    setShowModal(false);
    setFormData({ appointmentId: "", amount: 0 });
    load();
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kasir</h1>
            <p className="text-gray-600">Kelola pembayaran pasien</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg">
            💳 Tambah Pembayaran
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm text-green-100">Total Pendapatan</div>
          <div className="text-3xl font-bold">Rp {total.toLocaleString("id-ID")}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Pasien", "Tanggal", "Jumlah", "Status"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{p.patientName}</td>
                    <td className="px-6 py-4 text-gray-700">{p.date}</td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">Rp {p.amount.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">{p.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && <div className="text-center py-12 text-gray-500">💰 Belum ada transaksi</div>}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Tambah Pembayaran</h2>
              {selesaiApts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada pasien selesai yang belum dibayar.</p>
                  <button onClick={() => setShowModal(false)} className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Tutup</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pasien</label>
                    <select required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.appointmentId} onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}>
                      <option value="">-- Pilih Pasien --</option>
                      {selesaiApts.map((a) => <option key={a.id} value={a.id}>{a.patientName} - {a.date}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Bayar (Rp)</label>
                    <input type="number" required min="0" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })} placeholder="150000" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">Bayar</button>
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Batal</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
