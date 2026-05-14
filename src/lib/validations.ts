import { z } from "zod";

// === AUTH ===
export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

// === PASIEN ===
export const pasienSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"), // YYYY-MM-DD
  noTelepon: z.string().optional(),
  alamat: z.string().optional(),
});

export const updatePasienSchema = pasienSchema.partial();

// === JADWAL / ANTRIAN ===
export const jadwalSchema = z.object({
  pasienId: z.string().min(1, "ID Pasien wajib diisi"),
  dokterId: z.string().uuid("ID Dokter tidak valid"),
  jam: z.string().min(1, "Jam wajib diisi"),
  keluhan: z.string().min(1, "Keluhan wajib diisi"),
});

export const updateStatusJadwalSchema = z.object({
  status: z.enum(["MENUNGGU", "DIPERIKSA", "SELESAI", "BATAL"]),
});

// === REKAM MEDIS ITEMS ===
export const diagnosisItemSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis wajib diisi"),
  kode: z.string().optional(), // diterima tapi tidak disimpan (model Diagnosis tidak punya kolom kode)
});

export const resepItemSchema = z.object({
  obatId: z.string().min(1, "ID/Nama Obat wajib diisi"),
  dosis: z.string().min(1, "Dosis wajib diisi"),
  aturan: z.string().min(1, "Aturan pakai wajib diisi"),
});

// rujukan harus sesuai model Rujukan: tujuan (wajib) + keterangan (opsional)
export const rujukanItemSchema = z.object({
  tujuan: z.string().min(1, "Tujuan rujukan wajib diisi"),
  keterangan: z.string().optional(),
});

// === REKAM MEDIS ===
export const rekamMedisSchema = z.object({
  pasienId: z.string().min(1, "ID Pasien wajib diisi"),
  jadwalId: z.string().uuid("ID Jadwal tidak valid").optional(),

  keluhan: z.string().min(1, "Keluhan wajib diisi"),
  tindakan: z.string().optional(),

  // Opsi 2: Anamnesis
  anamnesisKeluhanUtama: z.string().optional(),
  anamnesisRps: z.string().optional(),
  anamnesisRpd: z.string().optional(),
  anamnesisRiwayatObat: z.string().optional(),
  anamnesisRiwayatKeluarga: z.string().optional(),
  anamnesisKebiasaan: z.string().optional(),

  // Opsi 2: TTV / Pemeriksaan
  tdSistolik: z.number().int().optional(),
  tdDiastolik: z.number().int().optional(),
  nadi: z.number().int().optional(),
  rr: z.number().int().optional(),
  suhu: z.number().optional(),
  spo2: z.number().int().optional(),
  bb: z.number().optional(),
  tb: z.number().optional(),
  bmi: z.number().optional(),
  pemeriksaanFisik: z.string().optional(),

  // Opsi 2: Edukasi & Catatan
  edukasiPasien: z.string().optional(),
  catatanTambahan: z.string().optional(),
  rujukanCatatan: z.string().optional(),

  diagnosis: z.array(diagnosisItemSchema).min(1, "Minimal 1 diagnosis wajib diisi"),
  resep: z.array(resepItemSchema).default([]),
  rujukan: rujukanItemSchema.optional(),

  biayaTindakan: z.number().optional().default(0),
});

// === PEMBAYARAN ===
export const pembayaranSchema = z.object({
  pasienId: z.string().min(1, "ID Pasien wajib diisi"),
  rekamMedisId: z.string().uuid("ID Rekam Medis tidak valid").optional(),
  jumlah: z.number().positive("Jumlah harus lebih dari 0"),
  metode: z.enum(["TUNAI", "TRANSFER", "BPJS"]),
});

export const updateStatusPembayaranSchema = z.object({
  status: z.enum(["BELUM_BAYAR", "LUNAS"]),
});