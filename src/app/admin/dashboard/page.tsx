"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getSession, getAppointments, getPayments, initData } from '@/lib/storage';
import type { Appointment } from '@/types/klinik';

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
    if (!currentSession || currentSession.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const appointments = getAppointments();
    const payments = getPayments();
    setPatientsToday(appointments.filter((a: Appointment) => a.date === today).length);
    setTotalRevenue(payments.reduce((sum: number, p: any) => sum + p.amount, 0));
    setQueue(appointments.filter((a: Appointment) => a.status === 'antri').sort((a: Appointment, b: Appointment) => a.time.localeCompare(b.time)));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-slate-50/50 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Admin</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Selamat bertugas, <span className="font-semibold text-blue-600">{session?.username}</span>
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-500">Tanggal Hari Ini</p>
              <p className="text-slate-800 font-semibold">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pasien Hari Ini</h3>
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg text-xl">👥</div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{patientsToday}</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pendapatan</h3>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xl">💰</div>
              </div>
              <p className="text-3xl font-bold text-slate-800">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Antrean Aktif</h3>
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg text-xl">📋</div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{queue.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a href="/admin/pasien" className="group bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Daftar Pasien Baru</h3>
                <p className="text-blue-100 text-sm">Input data pasien ke sistem</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">➕</div>
            </a>
            <a href="/admin/jadwal" className="group bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Atur Jadwal & Antrean</h3>
                <p className="text-teal-100 text-sm">Kelola antrean periksa dokter</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">📅</div>
            </a>
          </div>

          {/* Antrean Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Daftar Antrean Saat Ini</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Pasien</th>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Keluhan</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="font-medium">Tidak ada antrean saat ini</p>
                      </td>
                    </tr>
                  ) : (
                    queue.map((apt, index) => (
                      <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                        <td className="px-6 py-4 font-semibold capitalize">{apt.patientName}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{apt.time}</td>
                        <td className="px-6 py-4 truncate max-w-xs" title={apt.keluhan || 'Konsultasi umum'}>
                          {apt.keluhan || 'Konsultasi umum'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            Menunggu
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}