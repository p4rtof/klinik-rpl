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
  noTelepon: string | null;
  sip: string | null;
  str: string | null;
  fotoUrl: string | null;
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
  jumlah: string | null;
}

export interface ApiRujukan {
  id: string;
  tujuan: string;
  poliTujuan: string | null;
  diagnosa: string | null;
  keterangan: string | null;
  status: 'DRAFT' | 'FINAL';
}

export interface ApiRekamMedis {
  id: string;
  tanggal: string;
  keluhan: string;
  
  // Anamnesis
  riwayatPenyakitSekarang?: string;
  riwayatPenyakitDahulu?: string;
  riwayatObat?: string;
  riwayatKeluarga?: string;
  kebiasaan?: string;

  // Pemeriksaan Fisik
  tdSistolik?: number;
  tdDiastolik?: number;
  nadi?: number;
  rr?: number;
  suhu?: number;
  spo2?: number;
  beratBadan?: number;
  tinggiBadan?: number;
  pemeriksaanFisik?: string;

  // Edukasi & Catatan
  edukasi?: string;
  catatanTambahan?: string;

  tindakan: ApiTindakan[];
  dokter: { namaLengkap: string; spesialisasi: string | null };
  diagnosis: ApiDiagnosis[];
  resep: ApiResep[];
  rujukan: ApiRujukan[];
}

export interface ApiTindakan {
  id: string;
  deskripsi: string;
}

export interface ApiTindakanStandar {
  id: string;
  label: string;
  harga: number;
}

export interface ApiPembayaran {
  id: string;
  pasienId: string;
  rekamMedisId: string | null;
  tanggal: string;
  jumlah: number;
  metode: 'TUNAI' | 'TRANSFER' | 'BPJS';
  status: 'BELUM_BAYAR' | 'LUNAS';
  pasien: { id: string; noRm: string; nama: string };
  rekamMedis?: ApiRekamMedis;
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

export const login = (username: string, password: string) =>
  api<ApiUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getMe = () => api<ApiUser>('/api/auth/me');

export const logout = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' });
};

// ================================================================
// PASIEN  (Akses: ADMIN & DOKTER)
// ================================================================

export const getPasienList = (search?: string, searchType: string = 'nama', sortBy: string = 'id') => {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  query.set('searchType', searchType);
  query.set('sortBy', sortBy);
  return api<ApiPasien[]>(`/api/pasien?${query.toString()}`);
};

export const getPasien = (id: string) =>
  api<ApiPasienDetail>(`/api/pasien/${id}`);

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

export const deletePasien = (id: string) =>
  api<null>(`/api/pasien/${id}`, { method: 'DELETE' });

// ================================================================
// DOKTER  (Akses: Semua)
// ================================================================

export const getDokterList = () => api<ApiDokter[]>('/api/dokter');

export const getDokter = (id: string) =>
  api<ApiDokter & { jadwal: ApiAntrian[] }>(`/api/dokter/${id}`);

export const updateDokterProfile = (id: string, data: Partial<{
  namaLengkap: string;
  spesialisasi: string;
  noTelepon: string;
  sip: string;
  str: string;
  fotoUrl: string;
}>) =>
  api<ApiDokter>(`/api/dokter/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// ================================================================
// ANTRIAN  (Akses: ADMIN & DOKTER)
// ================================================================

export const getAntrian = (params?: { 
  tanggal?: string; 
  tanggalMulai?: string; 
  tanggalAkhir?: string; 
  dokterId?: string;
  sortBy?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.tanggal) query.set('tanggal', params.tanggal);
  if (params?.tanggalMulai) query.set('tanggalMulai', params.tanggalMulai);
  if (params?.tanggalAkhir) query.set('tanggalAkhir', params.tanggalAkhir);
  if (params?.dokterId) query.set('dokterId', params.dokterId);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  const qs = query.toString();
  return api<ApiAntrian[]>(`/api/antrian${qs ? `?${qs}` : ''}`);
};

export const createAntrian = (data: {
  pasienId: string;
  dokterId: string;
  jam: string;
  tanggal?: string;
  keluhan: string;
}) =>
  api<ApiAntrian>('/api/antrian', {
    method: 'POST',
    body: JSON.stringify(data),
  });

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

export const createRekamMedis = (data: {
  pasienId: string;
  jadwalId?: string;
  keluhan: string;
  riwayatPenyakitSekarang?: string;
  riwayatPenyakitDahulu?: string;
  riwayatObat?: string;
  riwayatKeluarga?: string;
  kebiasaan?: string;
  tdSistolik?: number;
  tdDiastolik?: number;
  nadi?: number;
  rr?: number;
  suhu?: number;
  spo2?: number;
  beratBadan?: number;
  tinggiBadan?: number;
  pemeriksaanFisik?: string;
  edukasi?: string;
  catatanTambahan?: string;
  tindakan?: string | string[];
  diagnosis: { deskripsi: string }[];
  resep?: { namaObat: string; dosis: string; aturanPakai: string; jumlah?: string }[];
  rujukan?: { tujuan: string; poliTujuan?: string; diagnosa?: string; keterangan?: string };
  biayaTindakan?: number;
}) =>
  api<ApiRekamMedis>('/api/rekam-medis', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getTindakanMedis = () => api<ApiTindakanStandar[]>('/api/tindakan-medis');

export const getRekamMedisPasien = (pasienId: string) =>
  api<ApiRekamMedis[]>(`/api/rekam-medis/pasien/${pasienId}`);

// ================================================================
// PEMBAYARAN  (Akses: ADMIN)
// ================================================================

export const getPembayaranList = (params?: {
  pasienId?: string;
  status?: 'BELUM_BAYAR' | 'LUNAS';
}) => {
  const query = new URLSearchParams();
  if (params?.pasienId) query.set('pasienId', params.pasienId);
  if (params?.status) query.set('status', params.status);
  return api<ApiPembayaran[]>(`/api/pembayaran?${query.toString()}`);
};

export const getPembayaranDetail = (id: string) => api<ApiPembayaran>(`/api/pembayaran/${id}`);

export const updatePembayaran = (
  id: string,
  data: Partial<{
    status: 'BELUM_BAYAR' | 'LUNAS';
    metode: 'TUNAI' | 'TRANSFER' | 'BPJS';
    jumlah: number;
  }>
) =>
  api<ApiPembayaran>(`/api/pembayaran/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePembayaran = (id: string) =>
  api<null>(`/api/pembayaran/${id}`, { method: 'DELETE' });

export const updateStatusRujukan = (id: string, status: 'DRAFT' | 'FINAL') =>
  api<any>(`/api/rujukan/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
