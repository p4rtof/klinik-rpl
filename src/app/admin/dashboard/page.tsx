"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  getSession,
  getPatients,
  getAppointments,
  getPayments,
  initData,
} from "@/lib/storage";
import type { Patient, Appointment } from "@/types/klinik";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(getSession());
  const [patientsToday, setPatientsToday] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
    const currentSession = getSession();
    setSession(currentSession);
    if (!currentSession || currentSession.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const patients = getPatients();
    const appointments = getAppointments();
    const payments = getPayments();

    setPatientsToday(appointments.filter((a) => a.date === today).length);
    setTotalRevenue(payments.reduce((sum, p) => sum + p.amount, 0));
    setQueue(
      appointments
        .filter((a) => a.status === "antri")
        .sort((a, b) => a.time.localeCompare(b.time)),
    );

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 mb-8">
              Selamat datang, {session?.username}!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg">
            <div className="text-3xl font-bold">{patientsToday}</div>
            <div className="text-blue-100">Pasien Hari Ini</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg">
            <div className="text-3xl font-bold">
              Rp {totalRevenue.toLocaleString()}
            </div>
            <div className="text-green-100">Total Pendapatan</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl shadow-lg">
            <div className="text-3xl font-bold">{queue.length}</div>
            <div className="text-purple-100">Antrian Aktif</div>
          </div>
        </div>

        {/* Antrian Live */}
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold mb-6">Antrian Saat Ini</h2>
          {queue.length === 0 ? (
            <p className="text-gray-500 text-center py-12">Tidak ada antrian</p>
          ) : (
            <div className="space-y-4">
              {queue.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <div className="font-bold text-lg">{apt.patientName}</div>
                    <div className="text-sm text-gray-600">
                      {apt.time} - {apt.keluhan || "Umum"}
                    </div>
                  </div>
                  <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {apt.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <h3 className="text-xl font-bold mb-6">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1">
                  ➕ Tambah Pasien Baru
                </button>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1">
                  📋 Buat Antrian
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white p-8 rounded-xl shadow-lg border h-full">
              <h3 className="text-xl font-bold mb-6">Ringkasan Minggu Ini</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span>Total Pasien</span>
                  <span className="font-bold">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaksi</span>
                  <span className="font-bold">Rp 4.5jt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
