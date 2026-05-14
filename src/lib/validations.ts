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
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi').refine(v => new Date(v) <= new Date(), { message: 'Tanggal lahir tidak boleh lebih dari sekarang' }),
  noTelepon: z.string().optional(),
  alamat: z.string().optional(),
});

export const updatePasienSchema = pasienSchema.partial();

// === JADWAL / ANTRIAN ===
export const jadwalSchema = z.object({
  pasienId: z.string().min(1, 'ID Pasien wajib diisi'),
  dokterId: z.string().uuid('ID Dokter tidak valid'),
  jam: z.string().min(1, 'Jam wajib diisi'),
  keluhan: z.string().min(1, 'Keluhan wajib diisi'),
});

export const updateStatusJadwalSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPERIKSA', 'SELESAI', 'BATAL']),
});

export const updateJadwalFullSchema = z.object({
  dokterId: z.string().uuid('ID Dokter tidak valid').optional(),
  jam: z.string().optional(),
  keluhan: z.string().optional(),
  status: z.enum(['MENUNGGU', 'DIPERIKSA', 'SELESAI', 'BATAL']).optional(),
  tanggal: z.string().optional(),
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
  jumlah: z.string().optional(),
});

export const rujukanItemSchema = z.object({
  tujuan: z.string().min(1, 'Tujuan rujukan wajib diisi'),
  poliTujuan: z.string().optional(),
  diagnosa: z.string().optional(),
  keterangan: z.string().optional(),
});

export const rekamMedisSchema = z.object({
  pasienId: z.string().min(1, 'ID Pasien wajib diisi'),
  jadwalId: z.string().uuid('ID Jadwal tidak valid').optional(),
  keluhan: z.string().min(1, 'Keluhan wajib diisi'),

  // Anamnesis
  riwayatPenyakitSekarang: z.string().optional(),
  riwayatPenyakitDahulu: z.string().optional(),
  riwayatObat: z.string().optional(),
  riwayatKeluarga: z.string().optional(),
  kebiasaan: z.string().optional(),

  // Pemeriksaan Fisik
  tdSistolik: z.number().int().optional(),
  tdDiastolik: z.number().int().optional(),
  nadi: z.number().int().optional(),
  rr: z.number().int().optional(),
  suhu: z.number().optional(),
  spo2: z.number().optional(),
  beratBadan: z.number().optional(),
  tinggiBadan: z.number().optional(),
  pemeriksaanFisik: z.string().optional(),

  // Edukasi & Catatan
  edukasi: z.string().optional(),
  catatanTambahan: z.string().optional(),

  tindakan: z.union([z.string(), z.array(z.string())]).optional(),
  diagnosis: z.array(diagnosisItemSchema).min(1, 'Minimal 1 diagnosis wajib diisi'),
  resep: z.array(resepItemSchema).default([]),
  rujukan: rujukanItemSchema.optional(),
  biayaTindakan: z.number().optional().default(0),
});

// === USER / DOKTER ===
export const updateDokterSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
  spesialisasi: z.string().optional(),
  noTelepon: z.string().optional(),
  sip: z.string().optional(),
  str: z.string().optional(),
  fotoUrl: z.string().optional(),
});

// === PEMBAYARAN ===
export const pembayaranSchema = z.object({
  pasienId: z.string().min(1, 'ID Pasien wajib diisi'),
  rekamMedisId: z.string().uuid('ID Rekam Medis tidak valid').optional(),
  jumlah: z.number().positive('Jumlah harus lebih dari 0'),
  metode: z.enum(['TUNAI', 'TRANSFER', 'BPJS']),
});

export const updateStatusPembayaranSchema = z.object({
  status: z.enum(['BELUM_BAYAR', 'LUNAS']),
});

export const updatePembayaranSchema = z.object({
  jumlah: z.number().positive('Jumlah harus lebih dari 0').optional(),
  metode: z.enum(['TUNAI', 'TRANSFER', 'BPJS']).optional(),
  status: z.enum(['BELUM_BAYAR', 'LUNAS']).optional(),
});
