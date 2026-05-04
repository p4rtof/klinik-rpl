import { z } from 'zod';

// === AUTH ===
export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// === PASIEN ===
export const pasienSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggalLahir: z.string().datetime({ message: 'Format tanggal lahir harus ISO-8601 (YYYY-MM-DDTHH:mm:ss.sssZ)' }),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  alamat: z.string().optional(),
  noTelepon: z.string().optional(),
  riwayatAlergi: z.string().optional(),
});

export const updatePasienSchema = pasienSchema.partial();

// === ANTRIAN ===
export const antrianSchema = z.object({
  pasienId: z.string().uuid('ID Pasien tidak valid'),
  dokterId: z.string().uuid('ID Dokter tidak valid'),
});

export const updateStatusAntrianSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPERIKSA', 'SELESAI', 'BATAL']),
});

// === REKAM MEDIS ===
export const rekamMedisSchema = z.object({
  pasienId: z.string().uuid('ID Pasien tidak valid'),
  antrianId: z.string().uuid('ID Antrian tidak valid'),
  keluhan: z.string().min(1, 'Keluhan wajib diisi'),
  diagnosa: z.string().min(1, 'Diagnosa wajib diisi'),
  tindakan: z.string().optional(),
  resepObat: z.string().optional(),
  catatan: z.string().optional(),
});
