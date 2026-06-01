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
| [PostgreSQL](https://postgresql.org) | 16.x | Database |
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

### 3. Konfigurasi Database & Docker

Aplikasi ini menggunakan **PostgreSQL** yang dijalankan secara terisolasi menggunakan **Docker**.

#### 📦 Langkah Awal: Instalasi Docker & Docker Compose
Pilih platform OS Anda untuk memasang Docker:

- **Windows & macOS:**
  1. Unduh dan instal [Docker Desktop](https://www.docker.com/products/docker-desktop/).
  2. Jalankan aplikasi Docker Desktop dan pastikan status Docker engine adalah *Running*.
- **Linux (Arch Linux / Ubuntu / Debian):**
  - **Arch Linux:**
    ```bash
    sudo pacman -S docker docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    ```
  - **Ubuntu / Debian:**
    ```bash
    sudo apt update && sudo apt install docker.io docker-compose -y
    sudo systemctl start docker
    sudo systemctl enable docker
    ```
  - **Penting untuk Linux (Izin Akses Socket):**
    Agar Anda bisa menjalankan Docker tanpa `sudo` dan menghindari error *permission denied*, jalankan perintah berikut:
    ```bash
    sudo usermod -aG docker $USER
    # Muat ulang grup session secara instan:
    newgrp docker
    # ATAU jika masih error, jalankan perintah ini untuk memberikan izin socket sementara:
    sudo chmod 666 /var/run/docker.sock
    ```

#### 🛠️ Sinkronisasi Database
1. Pastikan file `.env` sudah terkonfigurasi untuk PostgreSQL:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/klinik_rpl?schema=public"
   JWT_SECRET="rahasia_super_aman_anda"
   ```
2. Jalankan container PostgreSQL via Docker Compose:
   ```bash
   docker compose up -d
   ```
3. Sinkronkan database dan jalankan seeder:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   npx tsx prisma/seed_realistic.ts
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
