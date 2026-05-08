/**
 * ================================================================
 * API CLIENT — Klinik dr. Yofli
 * ================================================================
 * Kumpulan fungsi siap pakai untuk memanggil semua endpoint backend.
 * Cookie JWT dikirim otomatis oleh browser — tidak perlu setup apapun.
 *
 * Import contoh:
 *   import { getPasienList, createPasien } from '@/lib/api';
 * ================================================================
 */

// ================================================================
// TIPE DATA
// ================================================================

export interface ApiUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'DOKTER';
  namaLengkap: string;
  spesialisasi: string | null;
}

export interface ApiPasien {
  id: string;
  noRm: string;
  nama: string;
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
  tanggalLahir: string;
  noTelepon: string | null;
  alamat: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPasienDetail extends ApiPasien {
  rekamMedis: ApiRekamMedis[];
  pembayaran: ApiPembayaran[];
}

export interface ApiDokter {
  id: string;
  namaLengkap: string;
  spesialisasi: string | null;
}

export interface ApiAntrian {
  id: string;
  nomorAntrian: number;
  jam: string;
  status: 'MENUNGGU' | 'DIPERIKSA' | 'SELESAI' | 'BATAL';
  tanggal: string;
  pasien: { id: string; noRm: string; nama: string; noTelepon: string | null };
  dokter: { id: string; namaLengkap: string; spesialisasi: string | null };
}

export interface ApiDiagnosis {
  id: string;
  deskripsi: string;
}

export interface ApiResep {
  id: string;
  namaObat: string;
  dosis: string;
  aturanPakai: string;
}

export interface ApiRujukan {
  id: string;
  tujuan: string;
  keterangan: string | null;
}

export interface ApiRekamMedis {
  id: string;
  tanggal: string;
  keluhan: string;
  tindakan: string | null;
  dokter: { namaLengkap: string; spesialisasi: string | null };
  diagnosis: ApiDiagnosis[];
  resep: ApiResep[];
  rujukan: ApiRujukan[];
}

export interface ApiPembayaran {
  id: string;
  pasienId: string;
  rekamMedisId: string | null;
  tanggal: string;
  jumlah: number;
  metode: 'TUNAI' | 'TRANSFER' | 'BPJS';
  status: 'BELUM_BAYAR' | 'LUNAS';
  pasien: { noRm: string; nama: string };
}

// ================================================================
// HELPER INTERNAL — jangan dipanggil langsung dari komponen
// ================================================================

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? 'Terjadi kesalahan pada server');
  }
  return json.data as T;
}

// ================================================================
// AUTH
// ================================================================

/**
 * Login dengan username dan password.
 * Cookie JWT disimpan otomatis oleh browser setelah berhasil.
 * @throws Error jika username/password salah
 */
export const login = (username: string, password: string) =>
  api<ApiUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

/**
 * Ambil data user yang sedang login.
 * Gunakan di awal halaman untuk cek sesi aktif.
 * @throws Error jika belum login
 */
export const getMe = () => api<ApiUser>('/api/auth/me');

/**
 * Logout — hapus cookie JWT, sesi langsung tidak valid.
 * Setelah ini redirect ke /login.
 */
export const logout = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' });
};

// ================================================================
// PASIEN  (Akses: ADMIN)
// ================================================================

/**
 * Ambil daftar semua pasien. Opsional: filter berdasarkan nama.
 * @param search - kata kunci nama pasien (opsional)
 */
export const getPasienList = (search?: string) =>
  api<ApiPasien[]>(
    `/api/pasien${search ? `?search=${encodeURIComponent(search)}` : ''}`
  );

/**
 * Ambil detail satu pasien lengkap dengan riwayat rekam medis & pembayaran.
 * @param id - UUID pasien
 */
export const getPasien = (id: string) =>
  api<ApiPasienDetail>(`/api/pasien/${id}`);

/**
 * Tambah pasien baru. Nomor RM (noRm) di-generate otomatis oleh server.
 * @param data.nama          - nama lengkap pasien (wajib)
 * @param data.jenisKelamin  - 'LAKI_LAKI' | 'PEREMPUAN' (wajib)
 * @param data.tanggalLahir  - format 'YYYY-MM-DD' (wajib)
 * @param data.noTelepon     - nomor telepon (opsional)
 * @param data.alamat        - alamat lengkap (opsional)
 */
export const createPasien = (data: {
  nama: string;
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
  tanggalLahir: string;
  noTelepon?: string;
  alamat?: string;
}) =>
  api<ApiPasien>('/api/pasien', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Perbarui data pasien. Kirim hanya field yang ingin diubah.
 * @param id   - UUID pasien
 * @param data - field yang ingin diperbarui (semua opsional)
 */
export const updatePasien = (
  id: string,
  data: Partial<{
    nama: string;
    jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
    tanggalLahir: string;
    noTelepon: string;
    alamat: string;
  }>
) =>
  api<ApiPasien>(`/api/pasien/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Hapus pasien beserta seluruh data terkait (rekam medis, antrian, pembayaran).
 * @param id - UUID pasien
 */
export const deletePasien = (id: string) =>
  api<null>(`/api/pasien/${id}`, { method: 'DELETE' });

// ================================================================
// DOKTER  (Akses: Semua)
// ================================================================

/**
 * Ambil daftar semua dokter yang terdaftar.
 * Gunakan untuk mengisi dropdown pilihan dokter saat buat antrian.
 */
export const getDokterList = () => api<ApiDokter[]>('/api/dokter');

/**
 * Ambil detail satu dokter beserta daftar antrian hari ini.
 * @param id - UUID dokter
 */
export const getDokter = (id: string) =>
  api<ApiDokter & { jadwal: ApiAntrian[] }>(`/api/dokter/${id}`);

// ================================================================
// ANTRIAN  (Akses: ADMIN & DOKTER)
// ================================================================

/**
 * Ambil daftar antrian. Default: antrian hari ini.
 * @param params.tanggal  - filter tanggal format 'YYYY-MM-DD' (opsional)
 * @param params.dokterId - filter berdasarkan dokter tertentu (opsional)
 */
export const getAntrian = (params?: { tanggal?: string; dokterId?: string }) => {
  const query = new URLSearchParams();
  if (params?.tanggal) query.set('tanggal', params.tanggal);
  if (params?.dokterId) query.set('dokterId', params.dokterId);
  const qs = query.toString();
  return api<ApiAntrian[]>(`/api/antrian${qs ? `?${qs}` : ''}`);
};

/**
 * Buat antrian baru untuk pasien. Nomor antrian dihitung otomatis.
 * @param data.pasienId - UUID pasien (wajib)
 * @param data.dokterId - UUID dokter (wajib)
 * @param data.jam      - format 'HH:MM', contoh: '09:00' (wajib)
 */
export const createAntrian = (data: {
  pasienId: string;
  dokterId: string;
  jam: string;
}) =>
  api<ApiAntrian>('/api/antrian', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Perbarui status antrian (MENUNGGU → DIPERIKSA → SELESAI / BATAL).
 * Dokter hanya bisa mengubah antrian miliknya sendiri.
 * @param id     - UUID antrian
 * @param status - status baru
 */
export const updateStatusAntrian = (
  id: string,
  status: 'MENUNGGU' | 'DIPERIKSA' | 'SELESAI' | 'BATAL'
) =>
  api<ApiAntrian>(`/api/antrian/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

// ================================================================
// REKAM MEDIS  (Akses: DOKTER)
// ================================================================

/**
 * Simpan rekam medis pemeriksaan lengkap dalam satu request.
 * Jika jadwalId diisi, status antrian otomatis berubah menjadi SELESAI.
 * @param data.pasienId  - UUID pasien (wajib)
 * @param data.jadwalId  - UUID antrian, opsional
 * @param data.keluhan   - keluhan utama pasien (wajib)
 * @param data.tindakan  - tindakan medis yang dilakukan (opsional)
 * @param data.diagnosis - array minimal 1 item (wajib)
 * @param data.resep     - array obat yang diresepkan (opsional)
 * @param data.rujukan   - data rujukan jika diperlukan (opsional)
 */
export const createRekamMedis = (data: {
  pasienId: string;
  jadwalId?: string;
  keluhan: string;
  tindakan?: string;
  diagnosis: { deskripsi: string }[];
  resep?: { namaObat: string; dosis: string; aturanPakai: string }[];
  rujukan?: { tujuan: string; keterangan?: string };
}) =>
  api<ApiRekamMedis>('/api/rekam-medis', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Ambil seluruh riwayat rekam medis seorang pasien, urut terbaru dulu.
 * @param pasienId - UUID pasien
 */
export const getRekamMedisPasien = (pasienId: string) =>
  api<ApiRekamMedis[]>(`/api/rekam-medis/pasien/${pasienId}`);

// ================================================================
// PEMBAYARAN  (Akses: ADMIN)
// ================================================================

/**
 * Ambil daftar pembayaran. Filter opsional berdasarkan pasien atau status.
 * @param params.pasienId - filter berdasarkan UUID pasien (opsional)
 * @param params.status   - 'BELUM_BAYAR' | 'LUNAS' (opsional)
 */
export const getPembayaran = (params?: {
  pasienId?: string;
  status?: 'BELUM_BAYAR' | 'LUNAS';
}) => {
  const query = new URLSearchParams();
  if (params?.pasienId) query.set('pasienId', params.pasienId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return api<ApiPembayaran[]>(`/api/pembayaran${qs ? `?${qs}` : ''}`);
};

/**
 * Buat transaksi pembayaran baru. Status awal otomatis: BELUM_BAYAR.
 * @param data.pasienId     - UUID pasien (wajib)
 * @param data.rekamMedisId - UUID rekam medis terkait (opsional)
 * @param data.jumlah       - total biaya dalam Rupiah, angka bulat (wajib)
 * @param data.metode       - 'TUNAI' | 'TRANSFER' | 'BPJS' (wajib)
 */
export const createPembayaran = (data: {
  pasienId: string;
  rekamMedisId?: string;
  jumlah: number;
  metode: 'TUNAI' | 'TRANSFER' | 'BPJS';
}) =>
  api<ApiPembayaran>('/api/pembayaran', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Tandai pembayaran sebagai LUNAS atau kembalikan ke BELUM_BAYAR.
 * @param id     - UUID pembayaran
 * @param status - 'LUNAS' | 'BELUM_BAYAR'
 */
export const updateStatusPembayaran = (
  id: string,
  status: 'BELUM_BAYAR' | 'LUNAS'
) =>
  api<ApiPembayaran>(`/api/pembayaran/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
