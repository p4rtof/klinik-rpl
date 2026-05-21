"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link"

type MonthOption = { label: string; value: number };

const MONTHS_ID: MonthOption[] = [
  { label: "Januari", value: 0 }, { label: "Februari", value: 1 }, { label: "Maret", value: 2 },
  { label: "April", value: 3 }, { label: "Mei", value: 4 }, { label: "Juni", value: 5 },
  { label: "Juli", value: 6 }, { label: "Agustus", value: 7 }, { label: "September", value: 8 },
  { label: "Oktober", value: 9 }, { label: "November", value: 10 }, { label: "Desember", value: 11 },
];

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function pad2(n: number) { return String(n).padStart(2, "0"); }

function formatTanggalID(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function buildCalendarMatrix(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startDay = firstOfMonth.getDay();
  const cells: Array<{ date: Date; inCurrentMonth: boolean; }> = [];
  const startDate = new Date(year, monthIndex, 1 - startDay);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push({ date: d, inCurrentMonth: d.getMonth() === monthIndex });
  }
  return { cells };
}

export default function JadwalSayaPage() {
  const today = new Date();
  const [year] = useState<number>(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState<number>(today.getMonth());
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  
  // State untuk Modal Detail
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailJadwal, setDetailJadwal] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const { cells } = useMemo(() => buildCalendarMatrix(year, monthIndex), [year, monthIndex]);
  const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  const fetchJadwal = async () => {
    try {
      const res = await fetch("/api/antrian");
      const json = await res.json();
      if (json.success) setJadwalList(json.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchJadwal(); }, [monthIndex]);

  const getJadwalForDate = (dateObj: Date) => {
    const dateStr = `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
    return jadwalList.filter((j: any) => new Date(j.tanggal).toISOString().split('T')[0] === dateStr);
  };

  const handleOpenDetail = (date: Date, list: any[]) => {
    if (list.length === 0) return; // Jangan buka modal kalau gak ada jadwal
    setSelectedDate(date);
    setDetailJadwal(list);
    setShowModal(true);
  };

  return (
    <div className="space-y-5 text-black relative">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black">Jadwal Pemeriksaan</h1>
          <p className="mt-1 text-lg font-semibold text-gray-400">
            Hari ini : <span className="text-primary">{formatTanggalID(today)}</span>
          </p>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={monthIndex}
            onChange={(e) => setMonthIndex(Number(e.target.value))}
            className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 font-bold text-gray-700 outline-none shadow-sm"
          >
            {MONTHS_ID.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kalender */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-primary text-white text-center font-bold">
          {DAYS_ID.map((d) => (
            <div key={d} className="py-2.5 uppercase text-lg">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-3">
          {cells.map((cell, idx) => {
            const d = cell.date;
            const isToday = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` === todayKey;
            const jadwalHariIni = getJadwalForDate(d);

            return (
              <div
                key={idx}
                onClick={() => handleOpenDetail(d, jadwalHariIni)}
                className={`min-h-[120px] border-t border-r border-gray-50 p-3 transition-all cursor-pointer hover:bg-blue-50/50 ${
                  !cell.inCurrentMonth ? "bg-gray-50/50 opacity-40" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-lg font-black ${cell.inCurrentMonth ? "text-gray-800" : "text-gray-300"}`}>
                    {d.getDate()}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase">Hari ini</span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {jadwalHariIni.slice(0, 2).map((j: any) => (
                    <div key={j.id} className="text-[10px] bg-blue-50 text-primary border border-blue-100 px-2 py-1 rounded-lg font-bold truncate">
                      {j.jam} • {j.pasien?.nama}
                    </div>
                  ))}
                  {jadwalHariIni.length > 2 && (
                    <div className="text-[10px] text-primary font-black text-center pt-1">+ {jadwalHariIni.length - 2} Detail</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DETAIL JADWAL */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase">Jadwal Pemeriksaan</h2>
                <p className="opacity-80 font-bold">{formatTanggalID(selectedDate)}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-3xl hover:rotate-90 transition-all font-light">✕</button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {detailJadwal.map((j: any) => (
                <div key={j.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm font-black text-primary border border-blue-50">
      {j.nomorAntrian}
    </div>
    <div>
      <p className="text-lg font-black capitalize">{j.pasien?.nama}</p>
      <p className="text-sm font-bold text-gray-400">{j.jam} WIB • {j.pasien?.noRm}</p>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase ${
      j.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {j.status}
    </span>
    <Link
      href={`/rekam-medis?id=${j.id}`}
      onClick={() => setShowModal(false)}
      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
      title="Lihat Riwayat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </Link>
    {j.status === 'MENUNGGU' && (
      <Link
        href={`/periksa?id=${j.id}`}
        onClick={() => setShowModal(false)}
        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
      >
        Periksa
      </Link>
    )}
  </div>
</div>
              ))}
            </div>

            <div className="p-8 border-t border-gray-50">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-2xl font-black transition-all"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}