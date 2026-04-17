"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPatients, savePatient, deletePatient, initData } from "@/lib/storage";
import type { Patient } from "@/types/klinik";

export default function PasienPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({ id: "", name: "", age: 0, phone: "", address: "", keluhan: "" });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    loadPatients();
  }, []);

  const loadPatients = () => {
    setPatients(getPatients());
    setLoading(false);
  };

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      savePatient({ ...formData, createdDate: editingPatient.createdDate });
    } else {
      savePatient({ ...formData, id: Date.now().toString(), createdDate: new Date().toISOString() });
    }
    setShowModal(false);
    setFormData({ id: "", name: "", age: 0, phone: "", address: "", keluhan: "" });
    setEditingPatient(null);
    loadPatients();
  };

  const editPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({ id: patient.id, name: patient.name, age: patient.age, phone: patient.phone, address: patient.address, keluhan: patient.keluhan });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus pasien ini?")) { deletePatient(id); loadPatients(); }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Pasien</h1>
            <p className="text-gray-600">Kelola data pasien klinik</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
            ➕ Tambah Pasien
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
          <input type="text" placeholder="Cari nama atau nomor telepon..." className="w-full max-w-md p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Nama", "Umur", "Telepon", "Keluhan", "Aksi"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-700">{p.age} th</td>
                    <td className="px-6 py-4 text-gray-700">{p.phone}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={p.keluhan}>{p.keluhan}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button onClick={() => editPatient(p)} className="text-blue-600 hover:text-blue-900 font-bold">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 font-bold">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && <div className="text-center py-12 text-gray-500">📭 Tidak ada data pasien</div>}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">{editingPatient ? "Edit Pasien" : "Tambah Pasien Baru"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Umur</label>
                    <input type="number" required min="0" max="120" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.age} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                    <input type="tel" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keluhan Awal</label>
                  <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg" value={formData.keluhan} onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })} placeholder="Deskripsi keluhan pasien..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">{editingPatient ? "Update" : "Simpan"}</button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); setFormData({ id: "", name: "", age: 0, phone: "", address: "", keluhan: "" }); }} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
