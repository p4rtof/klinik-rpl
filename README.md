# 🏥 Klinik RPL — Sistem Informasi Klinik

> Aplikasi web manajemen klinik berbasis **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **Prisma ORM**.

---

## 👥 Pembagian Tim

| Peran | Tanggung Jawab |
|---|---|
| 🖥️ **Frontend Admin** | Dashboard admin, manajemen data pasien, pendaftaran antrean |
| 🩺 **Frontend Dokter** | Dashboard dokter, pemeriksaan pasien, rekam medis |
| ⚙️ **Backend** | API Routes, Database Schema, Autentikasi JWT |

---

## 🛠️ Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.4 | Framework (App Router) |
| React | 19.x | Library UI |
| [Prisma](https://prisma.io) | ^6.x | ORM (Object-Relational Mapping) |
| [SQLite](https://sqlite.org) | 3.x | Database (File-based) |
| [Zod](https://zod.dev) | ^3.x | Schema Validation |
| [Jose](https://github.com/panva/jose) | ^5.x | JWT for Edge Runtime |
| Tailwind CSS | ^4.0 | Styling |

---

## 🚀 Cara Menjalankan Proyek

### 1. Clone Repository
```bash
git clone https://github.com/p4rtof/klinik-rpl.git
cd klinik-rpl
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Database
Pastikan file `.env` sudah ada:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="rahasia_super_aman_anda"
```

Lalu sinkronkan database dan jalankan seeder:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Folder Utama

```
klinik-rpl/
├── prisma/
│   ├── schema.prisma      # Definisi Database Model
│   └── seed.ts            # Data awal (admin & dokter)
├── public/                # Aset statis
├── src/
│   ├── app/
│   │   ├── (admin)/       # 🖥️ Halaman Dashboard Admin
│   │   ├── (auth)/        # 🔐 Halaman Login
│   │   ├── (doctor)/      # 🩺 Halaman Dashboard Dokter
│   │   └── api/           # ⚙️ Backend — API Routes
│   │       ├── antrian/
│   │       ├── auth/
│   │       ├── dokter/
│   │       ├── pasien/
│   │       └── rekam-medis/
│   ├── lib/               # Shared Utilities (Prisma Client, Auth, Zod)
│   └── proxy.ts           # Middleware Keamanan (JWT Check)
```

---

## 📖 Panduan Backend & API

### Endpoint API
Backend telah mengimplementasikan beberapa modul utama:
*   `POST /api/auth/login`: Autentikasi user & pemberian session cookie.
*   `GET /api/pasien`: Mengambil daftar pasien (Admin).
*   `POST /api/antrian`: Membuat antrean baru.
*   `POST /api/rekam-medis`: Input diagnosa oleh dokter.

Dokumentasi detail mengenai API dapat dilihat pada: **[BACKEND_DOCS.md](BACKEND_DOCS.md)**

### Contoh Fetch Data di Frontend
```tsx
// Contoh memanggil data pasien dari Client Component atau Server Component
async function fetchData() {
  const res = await fetch('/api/pasien');
  const result = await res.json();
  if (result.success) return result.data;
}
```

---

## 🔄 Workflow Kolaborasi Tim

1. **Pull terbaru** dari `main`.
2. **Buat branch** sesuai fitur: `feature/nama-fitur`.
3. **Kerjakan fitur** dan lakukan commit.
4. **Push** ke GitHub dan buat **Pull Request**.

---

## ⚠️ Hal yang Perlu Diperhatikan

- **Next.js 16 + React 19**: Gunakan fitur terbaru seperti `use client` atau Server Actions jika diperlukan.
- **Prisma**: Jika Anda mengubah `schema.prisma`, jangan lupa jalankan `npx prisma db push`.
- **Security**: Semua API dilindungi oleh middleware (kecuali login). User harus login terlebih dahulu.
- **Validation**: Backend menggunakan Zod untuk validasi input. Pastikan data yang dikirim sesuai skema di `src/lib/validations.ts`.

---

<p align="center">Proyek RPL · Kelompok Klinik · 2026</p>
