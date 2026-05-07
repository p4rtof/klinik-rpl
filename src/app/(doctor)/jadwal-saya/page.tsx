"use client";

import React, { useMemo, useState } from "react";

type MonthOption = { label: string; value: number }; // 0-11

const MONTHS_ID: MonthOption[] = [
  { label: "Januari", value: 0 },
  { label: "Februari", value: 1 },
  { label: "Maret", value: 2 },
  { label: "April", value: 3 },
  { label: "Mei", value: 4 },
  { label: "Juni", value: 5 },
  { label: "Juli", value: 6 },
  { label: "Agustus", value: 7 },
  { label: "September", value: 8 },
  { label: "Oktober", value: 9 },
  { label: "November", value: 10 },
  { label: "Desember", value: 11 },
];

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTanggalID(date: Date) {
  // contoh: Senin, 25 April 2026
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Menghasilkan 6 minggu (42 cell) seperti kalender pada umumnya.
 * start: Minggu (0) s.d. Sabtu (6)
 */
function buildCalendarMatrix(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastOfMonth.getDate();

  // 0 = Minggu ... 6 = Sabtu
  const startDay = firstOfMonth.getDay();

  // isi 42 cell
  const cells: Array<{
    date: Date;
    inCurrentMonth: boolean;
  }> = [];

  // tanggal awal matrix = mundur dari tgl 1 sampai ketemu Minggu
  const startDate = new Date(year, monthIndex, 1 - startDay);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    cells.push({
      date: d,
      inCurrentMonth: d.getMonth() === monthIndex,
    });
  }

  return { cells, daysInMonth };
}

export default function JadwalSayaPage() {
  const today = new Date();

  const [year] = useState<number>(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState<number>(today.getMonth());

  const { cells } = useMemo(() => buildCalendarMatrix(year, monthIndex), [year, monthIndex]);

  const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  return (
    <div className="space-y-5 text-black">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Jadwal Saya</h1>
          <p className="mt-1 text-lg font-semibold">
            Hari ini :{" "}
            <span className="text-blue-600">{formatTanggalID(today)}</span>
          </p>
        </div>

        {/* Dropdown Bulan */}
        <div className="w-full sm:w-56">
          <select
            value={monthIndex}
            onChange={(e) => setMonthIndex(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none shadow-sm"
          >
            {MONTHS_ID.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kalender */}
      <div className="rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden">
        {/* Header hari */}
        <div className="grid grid-cols-7 bg-blue-600 text-white text-center font-bold">
          {DAYS_ID.map((d) => (
            <div key={d} className="py-3 border-r border-white/20 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Grid tanggal */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const d = cell.date;
            const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
            const isToday = key === todayKey;

            return (
              <div
                key={`${key}-${idx}`}
                className={[
                  "min-h-[92px] sm:min-h-[110px] border-t border-r border-gray-200 last:border-r-0 p-2",
                  !cell.inCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={[
                      "text-sm font-bold",
                      cell.inCurrentMonth ? "text-blue-600" : "text-gray-400",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </span>

                  {/* Badge hari ini */}
                  {isToday && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Hari ini
                    </span>
                  )}
                </div>

                {/* Slot jadwal (dummy) — nanti bisa kamu isi dari API */}
                {/* Contoh: kalau ada jadwal, tampilkan pill */}
                {/* <div className="mt-2">
                  <div className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md">
                    09:00 - 12:00 Praktik
                  </div>
                </div> */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Catatan kecil */}
      <p className="text-xs text-gray-500">
        * Kalender ini masih template. Nanti tinggal sambungkan ke API jadwal dokter untuk menandai hari/slot praktik.
      </p>
    </div>
  );
}