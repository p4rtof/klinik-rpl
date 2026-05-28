import { NextResponse } from "next/server";

// Daftar tindakan medis standar (disesuaikan dengan frontend)
const PILIHAN_TINDAKAN = [
  { id: "T001", label: "Konsultasi Dokter Umum", harga: 50000 },
  { id: "T002", label: "Pemeriksaan Fisik Lengkap", harga: 75000 },
  { id: "T003", label: "Injeksi / Suntik Vitamin", harga: 100000 },
  { id: "T004", label: "Cek Gula Darah & Kolesterol", harga: 85000 },
  { id: "T005", label: "Surat Keterangan Sehat", harga: 30000 },
  { id: "T006", label: "Tindakan Bedah Ringan", harga: 250000 },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: PILIHAN_TINDAKAN,
  });
}
