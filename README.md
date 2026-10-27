# Klinik RPL — Sistem Informasi Klinik

Aplikasi web manajemen klinik (pendaftaran pasien, antrean, pemeriksaan dokter, rekam medis, rujukan, dan pembayaran) berbasis **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **Prisma ORM**.

Proyek ini juga digunakan sebagai objek studi kasus **PBL Keamanan Sistem Informasi**: perancangan dan implementasi protokol **AAA (Authentication, Authorization, Accounting)** beserta fitur kriptografi.

---

## Fitur

| Role | Fitur |
|---|---|
| **Admin** | Dashboard, manajemen data pasien, pendaftaran antrean, pembayaran & cetak kwitansi |
| **Dokter** | Dashboard, jadwal saya, pemeriksaan pasien, rekam medis (anamnesis, TTV, diagnosis, resep, tindakan), rujukan & cetak surat rujukan, profil |

---

## Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.4 | Framework (App Router) + API Routes |
| React | 19.2.x | Library UI |
| TypeScript | 5.x | Bahasa pemrograman |
| [Prisma](https://prisma.io) | ^5.15 | ORM |
| PostgreSQL | - | Database (`provider = "postgresql"`) |
| [Zod](https://zod.dev) | - | Validasi input |
| [jose](https://github.com/panva/jose) | ^6.2 | JWT (HS256) |
| bcryptjs | ^3.0 | Hashing password |
| Tailwind CSS | ^4 | Styling |

---

## Cara Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/p4rtof/klinik-rpl.git
cd klinik-rpl
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root proyek:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
JWT_SECRET="isi_dengan_string_acak_yang_panjang"
```

> **Wajib** mengisi `JWT_SECRET` dengan nilai acak yang kuat. Jangan commit file `.env`.
> Jika memakai Supabase/Neon, `DATABASE_URL` biasanya connection pooler dan `DIRECT_URL` koneksi langsung.

### 4. Sinkronisasi Database & Seeder
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Seeder membuat akun default (**hanya untuk development, segera ganti di production**):

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Dokter | `dryofli` | `admin123` |

Opsional, untuk data contoh yang lebih lengkap: `npx tsx prisma/seed_realistic.ts`

### 5. Jalankan Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

### Script Lain
```bash
npm run build   # build production
npm run start   # jalankan hasil build
npm run lint    # cek ESLint
```

---

## Struktur Folder

```
klinik-rpl/
├── prisma/
│   ├── schema.prisma        # Definisi model database
│   ├── migrations/          # Riwayat migrasi
│   ├── seed.ts              # Seeder akun admin & dokter
│   └── seed_realistic.ts    # Seeder data contoh
├── public/                  # Aset statis (SVG, logo)
├── src/
│   ├── middleware.ts        # Proteksi route & injeksi identitas dari JWT
│   ├── app/
│   │   ├── (auth)/          # Halaman login
│   │   ├── (admin)/         # Dashboard, data pasien, pembayaran
│   │   ├── (doctor)/        # Dashboard dokter, jadwal, periksa, rekam medis, profil
│   │   ├── rujukan/print/   # Cetak surat rujukan
│   │   └── api/             # Backend API Routes
│   │       ├── auth/        # login, logout, me
│   │       ├── pasien/
│   │       ├── dokter/
│   │       ├── antrian/
│   │       ├── rekam-medis/
│   │       ├── rujukan/
│   │       ├── pembayaran/
│   │       └── tindakan-medis/
│   └── lib/                 # prisma.ts, auth.ts, validations.ts, api.ts, id-generator.ts
└── backend_docs.md          # Dokumentasi API detail
```

---

## Model Database

`User` · `Pasien` · `Jadwal` · `RekamMedis` · `Diagnosis` · `Resep` · `Rujukan` · `Pembayaran`

Detail relasi ada di [`prisma/schema.prisma`](prisma/schema.prisma).

---

## Keamanan Saat Ini

- Password di-hash dengan **bcrypt**.
- Sesi memakai **JWT (HS256)**, berlaku 8 jam, disimpan di cookie `httpOnly` (`secure` di production, `sameSite=lax`).
- **Middleware** membatasi akses halaman berdasarkan role (ADMIN / DOKTER).
- Input API divalidasi dengan **Zod**.

---

## Roadmap PBL: Protokol Keamanan AAA

Fitur yang dikerjakan pada proyek PBL (status: dalam pengerjaan):

- [ ] **Threat modeling** (STRIDE) dan desain protokol keamanan
- [ ] **Enkripsi data at rest** (AES-256-GCM) untuk field sensitif rekam medis & data pasien
- [ ] **Authentication**: hardening login (rate limiting / lockout, password policy, manajemen sesi)
- [ ] **Authorization**: penegakan role & kepemilikan data di setiap API route
- [ ] **Accounting**: audit log (siapa, aksi, resource, waktu, IP) dan riwayat login
- [ ] **Key management**: pemisahan kunci enkripsi dari kode (environment/KMS)
- [ ] **Pengujian & benchmark**: performance overhead sebelum vs sesudah enkripsi

---

## Dokumentasi API

Endpoint utama (lengkapnya di **[backend_docs.md](backend_docs.md)**):

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/login` | Login, mengirim cookie sesi |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Data user yang sedang login |
| GET/POST | `/api/pasien` | Daftar / tambah pasien |
| GET/POST | `/api/antrian` | Daftar / buat antrean |
| GET/POST | `/api/rekam-medis` | Daftar / input rekam medis |
| GET/POST | `/api/pembayaran` | Daftar / buat pembayaran |

Semua endpoint selain login membutuhkan sesi login yang valid. Helper pemanggilan API tersedia di `src/lib/api.ts`.

---

## Workflow Kolaborasi

1. Pull terbaru dari `main`.
2. Buat branch: `feature/nama-fitur`.
3. Kerjakan dan commit.
4. Push ke GitHub dan buat Pull Request.

> Jika mengubah `schema.prisma`, jalankan `npx prisma db push` (atau `npx prisma migrate dev`).

---

<p align="center">Proyek RPL & PBL Keamanan Sistem Informasi · Klinik · 2026</p>
