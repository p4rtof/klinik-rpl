import { z } from 'zod';

// === AUTH ===
export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// === PASIEN ===
export const pasienSchema = z.object({
  nama: z.string().min(3, 'Nama minimal terdiri dari 3 karakter').regex(/^[^0-9]*$/, 'Nama tidak boleh mengandung angka'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi').refine(v => new Date(v) <= new Date(), { message: 'Tanggal lahir tidak boleh lebih dari sekarang' }),
  noTelepon: z.string().regex(/^[0-9]*$/, 'Hanya boleh berisi angka').max(15, 'Maksimal 15 digit').optional(),
  alamat: z.string().optional(),
});

export const updatePasienSchema = pasienSchema.partial();

// === JADWAL / ANTRIAN ===
export const jadwalSchema = z.object({
  pasienId: z.string().min(1, 'ID Pasien wajib diisi'),
  dokterId: z.string().uuid('ID Dokter tidak valid'),
  jam: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam wajib HH:MM (contoh: 09:30)').min(1, 'Jam wajib diisi'),
  keluhan: z.string().min(1, 'Keluhan wajib diisi'),
});

export const updateStatusJadwalSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPERIKSA', 'SELESAI', 'BATAL']),
});

export const updateJadwalFullSchema = z.object({
  dokterId: z.string().uuid('ID Dokter tidak valid').optional(),
  jam: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam wajib HH:MM').optional(),
  keluhan: z.string().optional(),
  status: z.enum(['MENUNGGU', 'DIPERIKSA', 'SELESAI', 'BATAL']).optional(),
  tanggal: z.string().optional(),
});

// === REKAM MEDIS ===
export const diagnosisItemSchema = z.object({
  penyakitId: z.string().uuid('ID Penyakit (ICD-10) tidak valid'),
  catatan: z.string().optional(),
});

export const resepItemSchema = z.object({
  obatId: z.string().uuid('ID Obat tidak valid'),
  dosis: z.string().min(1, 'Dosis wajib diisi'),
  aturan: z.string().min(1, 'Aturan pakai wajib diisi'),
  jumlah: z.number().int().positive('Jumlah obat minimal 1'),
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

  // Anamnesis (Synced)
  anamnesisKeluhanUtama: z.string().optional(),
  anamnesisRps: z.string().optional(),
  anamnesisRpd: z.string().optional(),
  anamnesisRiwayatObat: z.string().optional(),
  anamnesisRiwayatKeluarga: z.string().optional(),
  anamnesisKebiasaan: z.string().optional(),

  // Pemeriksaan Fisik / TTV (Synced)
  tdSistolik: z.number().int().min(0).max(400, 'Batas maksimal 400').optional(),
  tdDiastolik: z.number().int().min(0).max(300, 'Batas maksimal 300').optional(),
  nadi: z.number().int().min(0).max(300, 'Batas maksimal 300').optional(),
  rr: z.number().int().min(0).max(100, 'Batas maksimal 100').optional(),
  suhu: z.number().min(30, 'Batas minimal 30C').max(50, 'Batas maksimal 50C').optional(),
  spo2: z.number().min(0).max(100, 'SpO2 maksimal 100%').optional(),
  bb: z.number().min(0).max(700, 'Batas maksimal 700kg').optional(),
  tb: z.number().min(0).max(300, 'Batas maksimal 300cm').optional(),
  bmi: z.number().min(0).max(200).optional(),
  pemeriksaanFisik: z.string().optional(),

  // Edukasi & Catatan
  edukasiPasien: z.string().optional(),
  catatanTambahan: z.string().optional(),
  rujukanCatatan: z.string().optional(),

  tindakan: z.array(z.string().uuid('ID Tindakan tidak valid')).default([]),
  diagnosis: z.array(diagnosisItemSchema).min(1, 'Minimal 1 diagnosis wajib diisi'),
  resep: z.array(resepItemSchema).default([]),
  rujukan: rujukanItemSchema.optional(),
  biayaTindakan: z.number().optional().default(0),
});

// === USER / DOKTER ===
export const updateDokterSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
  poliId: z.string().uuid('ID Poli tidak valid').optional(),
  noTelepon: z.string().regex(/^[0-9]*$/, 'Hanya boleh berisi angka').max(15, 'Maksimal 15 digit').optional(),
  sip: z.string().optional(),
  str: z.string().optional(),
  fotoUrl: z.string().optional(),
});

// === PEMBAYARAN ===
export const pembayaranSchema = z.object({
  pasienId: z.string().min(1, 'ID Pasien wajib diisi'),
  rekamMedisId: z.string().uuid('ID Rekam Medis tidak valid').optional(),
  totalJumlah: z.number().positive('Jumlah harus lebih dari 0'),
  metode: z.enum(['TUNAI', 'TRANSFER', 'BPJS']),
});

export const updateStatusPembayaranSchema = z.object({
  status: z.enum(['BELUM_BAYAR', 'LUNAS']),
});

export const updatePembayaranSchema = z.object({
  totalJumlah: z.number().positive('Jumlah harus lebih dari 0').optional(),
  metode: z.enum(['TUNAI', 'TRANSFER', 'BPJS']).optional(),
  status: z.enum(['BELUM_BAYAR', 'LUNAS']).optional(),
});

// === MASTER DATA ===
export const obatSchema = z.object({
  kodeObat: z.string().min(1, 'Kode obat wajib diisi'),
  namaObat: z.string().min(1, 'Nama obat wajib diisi'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  hargaJual: z.number().min(0, 'Harga jual tidak boleh negatif'),
  stok: z.number().int().min(0, 'Stok tidak boleh negatif'),
});

export const tindakanSchema = z.object({
  kodeTindakan: z.string().min(1, 'Kode tindakan wajib diisi'),
  namaTindakan: z.string().min(1, 'Nama tindakan wajib diisi'),
  harga: z.number().min(0, 'Harga tidak boleh negatif'),
});

export const poliSchema = z.object({
  namaPoli: z.string().min(1, 'Nama poli wajib diisi'),
  keterangan: z.string().optional(),
});
