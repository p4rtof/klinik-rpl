import { z } from 'zod';

// === AUTH ===
export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// === PASIEN ===
export const pasienSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'), // YYYY-MM-DD dari <input type="date">
  noTelepon: z.string().optional(),
  alamat: z.string().optional(),
});

export const updatePasienSchema = pasienSchema.partial();

// === JADWAL / ANTRIAN ===
export const jadwalSchema = z.object({
  pasienId: z.string().uuid('ID Pasien tidak valid'),
  dokterId: z.string().uuid('ID Dokter tidak valid'),
  jam: z.string().min(1, 'Jam wajib diisi'), // format "HH:MM"
});

export const updateStatusJadwalSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPERIKSA', 'SELESAI', 'BATAL']),
});

// === REKAM MEDIS ===
// Satu request POST berisi keluhan + diagnosis[] + resep[] + rujukan (opsional)
export const diagnosisItemSchema = z.object({
  deskripsi: z.string().min(1, 'Deskripsi diagnosis wajib diisi'),
});

export const resepItemSchema = z.object({
  namaObat: z.string().min(1, 'Nama obat wajib diisi'),
  dosis: z.string().min(1, 'Dosis wajib diisi'),
  aturanPakai: z.string().min(1, 'Aturan pakai wajib diisi'),
});

export const rujukanItemSchema = z.object({
  tujuan: z.string().min(1, 'Tujuan rujukan wajib diisi'),
  keterangan: z.string().optional(),
});

export const rekamMedisSchema = z.object({
  pasienId: z.string().uuid('ID Pasien tidak valid'),
  jadwalId: z.string().uuid('ID Jadwal tidak valid').optional(), // jika ada, otomatis SELESAI
  keluhan: z.string().min(1, 'Keluhan wajib diisi'),
  tindakan: z.string().optional(),
  diagnosis: z.array(diagnosisItemSchema).min(1, 'Minimal 1 diagnosis wajib diisi'),
  resep: z.array(resepItemSchema).default([]),
  rujukan: rujukanItemSchema.optional(),
});

// === PEMBAYARAN ===
export const pembayaranSchema = z.object({
  pasienId: z.string().uuid('ID Pasien tidak valid'),
  rekamMedisId: z.string().uuid('ID Rekam Medis tidak valid').optional(),
  jumlah: z.number().positive('Jumlah harus lebih dari 0'),
  metode: z.enum(['TUNAI', 'TRANSFER', 'BPJS']),
});

export const updateStatusPembayaranSchema = z.object({
  status: z.enum(['BELUM_BAYAR', 'LUNAS']),
});
