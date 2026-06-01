# Dokumentasi Backend — Sistem Catatan Dokter Klinik dr. Yofli

> **Untuk Tim Frontend** — Panduan lengkap menggunakan backend klinik.
> Diperbarui sesuai dokumen RPL (ERD 3NF).

---

## ⚡ Cara Tercepat: Gunakan API Client Helper

Semua endpoint sudah dibungkus menjadi fungsi siap pakai di **`src/lib/api.ts`**.
Tidak perlu menulis `fetch` sendiri. Cukup import dan panggil fungsinya.

```ts
// Cukup import fungsi yang dibutuhkan
import { getPasienList, createPasien, login } from '@/lib/api';
```

> **Catatan penting:** Semua fungsi mengembalikan `Promise`. Gunakan `await` atau `.then()`.
> Jika terjadi error (misal: 403 Forbidden, 404 Not Found), fungsi akan **melempar `Error`**
> dengan pesan dari server — tangkap dengan `try/catch`.

---

## Tech Stack

| Teknologi | Keterangan |
|---|---|
| Next.js 16 (App Router) | Framework & API Routes |
| Prisma ORM v5 | Akses database |
| PostgreSQL (Docker/Local) | Database development |
| Zod | Validasi request body |
| `jose` + `bcryptjs` | JWT Auth & hashing password |
| HTTP-Only Cookie | Penyimpanan token login (otomatis oleh browser) |

---

## Struktur Database (3NF)

```
User ──────────────── Jadwal ──────── Pasien
 │                       │               │
 │                   RekamMedis ─────────┤
 │                       │               │
 └──── (dokterId) ───────┤           Pembayaran
                      Tindakan
                      Diagnosis
                      Resep
                      Rujukan
```

| Tabel | Keterangan |
|---|---|
| `User` | Admin & Dokter (dibedakan via `role`) |
| `Pasien` | Data induk pasien, memiliki `noRm` unik otomatis |
| `Jadwal` | Antrian kunjungan (alias endpoint: `/api/antrian`) |
| `RekamMedis` | Catatan pemeriksaan per kunjungan |
| `Diagnosis` | Hasil diagnosis (relasi ke `RekamMedis`) |
| `Resep` | Daftar obat (relasi ke `RekamMedis`) |
| `Rujukan` | Data rujukan (relasi ke `RekamMedis`) |
| `Pembayaran` | Transaksi pembayaran pasien |

---

## Format Respons API

```json
// Sukses
{ "success": true, "data": { ... }, "message": "..." }

// Gagal
{ "success": false, "error": "Pesan error", "details": [...] }
```

> Saat menggunakan fungsi dari `api.ts`, format ini sudah ditangani otomatis.
> Fungsi langsung mengembalikan isi `data`, bukan seluruh objek respons.

---

## Autentikasi

1. Panggil `login()` → cookie `token` otomatis tersimpan oleh browser
2. Semua request berikutnya **tidak perlu kirim token manual** — browser kirim otomatis
3. Halaman yang membutuhkan login sudah **otomatis dilindungi** oleh `middleware.ts`

---

## 🗂️ Referensi Fungsi API Client

### Tipe Data yang Dikembalikan

Semua tipe sudah tersedia di `@/lib/api` dan bisa di-import langsung:

```ts
import type { ApiUser, ApiPasien, ApiAntrian, ApiRekamMedis, ApiPembayaran } from '@/lib/api';
```

---

### 🔐 Auth

#### `login(username, password)`
Login ke sistem. Cookie disimpan otomatis, tidak perlu simpan token secara manual.

```ts
import { login } from '@/lib/api';

const user = await login('admin', 'admin123');
// user → { id, username, role: 'ADMIN', namaLengkap, spesialisasi }

// Redirect berdasarkan role:
if (user.role === 'ADMIN') router.push('/dashboard');
if (user.role === 'DOKTER') router.push('/patients');
```

---

#### `getMe()`
Cek siapa yang sedang login. Panggil di awal halaman untuk validasi sesi.

```ts
import { getMe } from '@/lib/api';

const user = await getMe();
// user → { id, username, role, namaLengkap, spesialisasi }
```

---

#### `logout()`
Hapus sesi login. Cookie JWT langsung dihapus dari browser.

```ts
import { logout } from '@/lib/api';

await logout();
router.push('/login');
```

---

### 🏥 Pasien *(Akses: ADMIN)*

#### `getPasienList(search?)`
Ambil semua pasien. Opsional: filter berdasarkan nama.

```ts
import { getPasienList } from '@/lib/api';

// Semua pasien
const semua = await getPasienList();

// Filter berdasarkan nama
const hasil = await getPasienList('Budi');
// hasil → ApiPasien[]
```

---

#### `getPasien(id)`
Ambil detail satu pasien beserta seluruh riwayat rekam medis dan pembayaran.

```ts
import { getPasien } from '@/lib/api';

const pasien = await getPasien('uuid-pasien');
// pasien → { id, noRm, nama, ..., rekamMedis: [...], pembayaran: [...] }
```

---

#### `createPasien(data)`
Tambah pasien baru. `noRm` di-generate otomatis oleh server.

```ts
import { createPasien } from '@/lib/api';

const pasienBaru = await createPasien({
  nama: 'Budi Santoso',           // wajib
  jenisKelamin: 'LAKI_LAKI',      // wajib: 'LAKI_LAKI' | 'PEREMPUAN'
  tanggalLahir: '1990-05-15',     // wajib: YYYY-MM-DD
  noTelepon: '08123456789',       // opsional
  alamat: 'Jl. Merdeka No.1',     // opsional
});
// pasienBaru → { id, noRm, nama, ... }
```

---

#### `updatePasien(id, data)`
Perbarui data pasien. Kirim **hanya field yang ingin diubah**.

```ts
import { updatePasien } from '@/lib/api';

// Hanya update nomor telepon
const updated = await updatePasien('uuid-pasien', {
  noTelepon: '08999999999',
});

// Atau update beberapa field sekaligus
const updated2 = await updatePasien('uuid-pasien', {
  nama: 'Budi Santoso Jr.',
  alamat: 'Jl. Baru No.2',
});
```

---

#### `deletePasien(id)`
Hapus pasien beserta **seluruh** data terkait (rekam medis, antrian, pembayaran).

```ts
import { deletePasien } from '@/lib/api';

await deletePasien('uuid-pasien');
```

---

### 👨‍⚕️ Dokter *(Akses: Semua)*

#### `getDokterList()`
Ambil daftar semua dokter. Gunakan untuk dropdown pilihan dokter saat mendaftarkan antrian.

```ts
import { getDokterList } from '@/lib/api';

const dokterList = await getDokterList();
// dokterList → [{ id, namaLengkap, spesialisasi }, ...]
```

---

#### `getDokter(id)`
Ambil detail dokter beserta daftar antrian hari ini.

```ts
import { getDokter } from '@/lib/api';

const dokter = await getDokter('uuid-dokter');
// dokter → { id, namaLengkap, spesialisasi, jadwal: [...] }
```

---

### 📋 Antrian *(Akses: ADMIN & DOKTER)*

#### `getAntrian(params?)`
Ambil daftar antrian. Default: semua antrian **hari ini**.

```ts
import { getAntrian } from '@/lib/api';

// Antrian hari ini (semua dokter)
const antrian = await getAntrian();

// Filter berdasarkan dokter tertentu
const antrianDokter = await getAntrian({ dokterId: 'uuid-dokter' });

// Filter berdasarkan tanggal tertentu
const antrianTanggal = await getAntrian({ tanggal: '2026-05-05' });

// Kombinasi filter
const filter = await getAntrian({ tanggal: '2026-05-05', dokterId: 'uuid-dokter' });
// → ApiAntrian[]  →  [{ id, nomorAntrian, jam, status, pasien: {...}, dokter: {...} }]
```

---

#### `createAntrian(data)`
Buat antrian baru. Nomor antrian dihitung otomatis oleh server.

```ts
import { createAntrian } from '@/lib/api';

const antrian = await createAntrian({
  pasienId: 'uuid-pasien',   // wajib
  dokterId: 'uuid-dokter',   // wajib
  jam: '09:00',              // wajib, format HH:MM
});
// antrian → { id, nomorAntrian: 1, jam: '09:00', status: 'MENUNGGU', ... }
```

---

#### `updateStatusAntrian(id, status)`
Perbarui status antrian. Dokter hanya bisa ubah antrian miliknya.

```ts
import { updateStatusAntrian } from '@/lib/api';

// Tandai sedang diperiksa
await updateStatusAntrian('uuid-antrian', 'DIPERIKSA');

// Tandai selesai
await updateStatusAntrian('uuid-antrian', 'SELESAI');

// Batalkan antrian
await updateStatusAntrian('uuid-antrian', 'BATAL');
// Status: 'MENUNGGU' | 'DIPERIKSA' | 'SELESAI' | 'BATAL'
```

---

### 📝 Rekam Medis *(Akses: DOKTER)*

#### `createRekamMedis(data)`
Simpan rekam medis pemeriksaan lengkap dalam **satu request**.
Jika `jadwalId` diisi, status antrian otomatis berubah menjadi `SELESAI`.

```ts
import { createRekamMedis } from '@/lib/api';

// Contoh lengkap dengan resep dan rujukan
const rm = await createRekamMedis({
  pasienId: 'uuid-pasien',          // wajib
  jadwalId: 'uuid-antrian',         // opsional — jika diisi, antrian otomatis SELESAI
  keluhan: 'Demam 3 hari',          // wajib
  tindakan: 'Infus RL',             // opsional
  diagnosis: [                       // wajib, minimal 1
    { deskripsi: 'Demam Dengue' },
    { deskripsi: 'Dehidrasi Ringan' },
  ],
  resep: [                           // opsional
    { namaObat: 'Paracetamol', dosis: '500mg', aturanPakai: '3x1' },
    { namaObat: 'Oralit', dosis: '1 sachet', aturanPakai: 'Tiap diare' },
  ],
  rujukan: {                         // opsional
    tujuan: 'RS Hasan Sadikin',
    keterangan: 'Perlu rawat inap',
  },
});

// Contoh minimal (tanpa resep dan rujukan)
const rmMinimal = await createRekamMedis({
  pasienId: 'uuid-pasien',
  keluhan: 'Batuk pilek',
  diagnosis: [{ deskripsi: 'ISPA' }],
});
```

---

#### `getRekamMedisPasien(pasienId)`
Ambil seluruh riwayat rekam medis seorang pasien, diurutkan **terbaru dulu**.

```ts
import { getRekamMedisPasien } from '@/lib/api';

const riwayat = await getRekamMedisPasien('uuid-pasien');
// riwayat → ApiRekamMedis[]
// Tiap item: { id, tanggal, keluhan, tindakan, dokter, diagnosis, resep, rujukan }
```

---

### 💰 Pembayaran *(Akses: ADMIN)*

#### `getPembayaran(params?)`
Ambil daftar pembayaran. Filter opsional berdasarkan pasien atau status.

```ts
import { getPembayaran } from '@/lib/api';

// Semua pembayaran
const semua = await getPembayaran();

// Filter pasien tertentu
const milikPasien = await getPembayaran({ pasienId: 'uuid-pasien' });

// Filter yang belum bayar
const belumLunas = await getPembayaran({ status: 'BELUM_BAYAR' });

// Kombinasi filter
const filter = await getPembayaran({ pasienId: 'uuid-pasien', status: 'LUNAS' });
// → ApiPembayaran[]
```

---

#### `createPembayaran(data)`
Buat transaksi pembayaran baru. Status awal otomatis: `BELUM_BAYAR`.

```ts
import { createPembayaran } from '@/lib/api';

const tagihan = await createPembayaran({
  pasienId: 'uuid-pasien',         // wajib
  rekamMedisId: 'uuid-rm',         // opsional, untuk tautkan ke pemeriksaan
  jumlah: 150000,                  // wajib, angka (Rupiah)
  metode: 'TUNAI',                 // wajib: 'TUNAI' | 'TRANSFER' | 'BPJS'
});
// tagihan → { id, jumlah: 150000, status: 'BELUM_BAYAR', ... }
```

---

#### `updateStatusPembayaran(id, status)`
Tandai pembayaran sebagai lunas atau kembalikan ke belum bayar.

```ts
import { updateStatusPembayaran } from '@/lib/api';

// Tandai lunas
await updateStatusPembayaran('uuid-pembayaran', 'LUNAS');

// Batalkan ke belum bayar
await updateStatusPembayaran('uuid-pembayaran', 'BELUM_BAYAR');
```

---

## 🛡️ Penanganan Error

Semua fungsi di `api.ts` akan **melempar `Error`** jika server mengembalikan `success: false`.
Gunakan `try/catch` untuk menangani error di komponen:

```ts
import { createPasien } from '@/lib/api';

try {
  const pasien = await createPasien({ nama: 'Budi', jenisKelamin: 'LAKI_LAKI', tanggalLahir: '1990-01-01' });
  console.log('Berhasil:', pasien);
} catch (err) {
  // err.message berisi pesan error dari server, misal: "Forbidden", "Data tidak valid"
  alert('Gagal: ' + (err as Error).message);
}
```

---

## 📖 Referensi Endpoint Lengkap (Raw)

> Bagian ini untuk referensi jika ingin memanggil endpoint secara manual tanpa helper.

### 🔐 Autentikasi (`/api/auth`)

#### `POST /api/auth/login`
```json
// Request Body
{ "username": "admin", "password": "admin123" }
```

#### `GET /api/auth/me`
Tidak butuh body. Kembalikan data user yang sedang login.

#### `POST /api/auth/logout`
Tidak butuh body. Hapus cookie token.

---

### 🏥 Pasien (`/api/pasien`) — Akses: ADMIN

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/pasien` | Semua pasien |
| GET | `/api/pasien?search=nama` | Filter berdasarkan nama |
| POST | `/api/pasien` | Tambah pasien baru |
| GET | `/api/pasien/[id]` | Detail + riwayat rekam medis & pembayaran |
| PUT | `/api/pasien/[id]` | Update data pasien (partial) |
| DELETE | `/api/pasien/[id]` | Hapus pasien + semua datanya |

---

### 👨‍⚕️ Dokter (`/api/dokter`) — Akses: Semua

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/dokter` | Daftar semua dokter |
| GET | `/api/dokter/[id]` | Detail dokter + antrian hari ini |

---

### 📋 Antrian (`/api/antrian`) — Akses: ADMIN & DOKTER

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/antrian` | Antrian hari ini |
| GET | `/api/antrian?dokterId=uuid` | Filter per dokter |
| GET | `/api/antrian?tanggal=YYYY-MM-DD` | Filter per tanggal |
| GET | `/api/antrian/[id]` | Detail spesifik antrean & pasien |
| POST | `/api/antrian` | Buat antrian baru (Admin) |
| PUT | `/api/antrian/[id]` | Update jadwal penuh (status, jam, keluhan, dll) |
| DELETE | `/api/antrian/[id]` | Hapus data antrian (Admin) |

---

### 📝 Rekam Medis (`/api/rekam-medis`) — Akses: DOKTER

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/rekam-medis` | Simpan rekam medis lengkap |
| GET | `/api/rekam-medis/pasien/[id]` | Riwayat rekam medis pasien |

---

### 💰 Pembayaran (`/api/pembayaran`) — Akses: ADMIN

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/pembayaran` | Semua pembayaran |
| GET | `/api/pembayaran?pasienId=uuid` | Filter per pasien |
| GET | `/api/pembayaran?status=BELUM_BAYAR` | Filter per status |
| GET | `/api/pembayaran/[id]` | Detail lengkap transaksi & rekam medis |
| POST | `/api/pembayaran` | Buat tagihan baru |
| PUT | `/api/pembayaran/[id]` | Update detail tagihan (jumlah, metode, status) |
| DELETE | `/api/pembayaran/[id]` | Hapus data tagihan (Admin) |

---

### 🏥 Rujukan (`/api/rujukan`) — Akses: ADMIN & DOKTER

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/rujukan/[id]` | Detail rujukan lengkap |
| PATCH | `/api/rujukan/[id]` | Update detail rujukan (DRAFT) |
| POST | `/api/rujukan/[id]/finalize` | Finalisasi rujukan (Kunci data & beri No. Surat) |

---

## Akun Default & Setup Database

### 📦 Menjalankan Database via Docker (Rekomendasi)
Aplikasi ini menggunakan PostgreSQL. Cara termudah adalah menjalankannya menggunakan Docker Compose:
- **Windows & macOS**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), lalu buka aplikasinya.
- **Linux (Ubuntu/Arch/Debian)**: Install Docker (`sudo apt install docker.io docker-compose` atau `sudo pacman -S docker docker-compose`).
  - Jalankan service: `sudo systemctl start docker`.
  - Berikan izin socket jika terjadi permission denied: `sudo chmod 666 /var/run/docker.sock`.

Jalankan database PostgreSQL dengan perintah:
```bash
docker compose up -d
```

### 🌱 Inisialisasi & Seeding Data
Setelah database menyala, jalankan perintah berikut untuk menyinkronkan skema dan mengisi data:
```bash
npx prisma db push
npx tsx prisma/seed.ts
npx tsx prisma/seed_realistic.ts
```

Akun default yang terbentuk:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Dokter (dr. Yofli) | `dryofli` | `admin123` |

---

## Perubahan Terbaru

### 14 Mei 2026
- **Middleware Migration**: Proteksi route dan injeksi header auth resmi dipindah ke `src/middleware.ts`. File `proxy.ts` sudah dideprecated.
- **Atomic Transaction (Rekam Medis)**: `POST /api/rekam-medis` sekarang secara otomatis membuat record `Pembayaran` (tagihan) agar data tidak terputus.
- **Rujukan Sync**: Implementasi fitur **Auto-Fill Rujukan** (menarik data diagnosa dan catatan tambahan dokter ke form rujukan admin).
- **Schema Update**: Field `tindakan` pada Rekam Medis kini menggunakan format `String` (scalar) untuk kemudahan input dokter.
- **API Rujukan**: Penambahan endpoint `/api/rujukan/[id]/finalize` untuk proses penguncian data rujukan oleh Admin.

### 8 Mei 2026
- **GET /api/pasien**: Sekarang mendukung filter berdasarkan `nama`, `noRm`, atau `id` menggunakan parameter `searchType`.
- **POST /api/pasien**: ID pasien (`P0001`, `P0002`, ...) dan nomor rekam medis (`R0001`, `R0002`, ...) sekarang di-generate otomatis di backend.
- **Prisma Schema**: Field `id` dan `noRm` pada tabel `Pasien` tidak lagi menggunakan `@default(uuid())` untuk mendukung ID yang diformat.
