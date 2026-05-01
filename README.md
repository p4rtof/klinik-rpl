# 🏥 Klinik RPL — Sistem Informasi Klinik

> Aplikasi web manajemen klinik berbasis **Next.js 16**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

---

## 👥 Pembagian Tim

| Peran | Tanggung Jawab |
|---|---|
| 🖥️ **Frontend Admin** | Dashboard admin, data pasien, pembayaran |
| 🩺 **Frontend Dokter** | Dashboard dokter, jadwal periksa, rekam medis |
| ⚙️ **Backend** | API Routes (`/api/admin`, `/api/auth`, `/api/doctor`) |

---

## 🛠️ Tech Stack

| Teknologi | Versi |
|---|---|
| [Next.js](https://nextjs.org) | 16.2.4 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| ESLint | ^9 |

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

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Folder

```
klinik-rpl/
│
├── public/
│   ├── componen-admin/        # Komponen statis / aset untuk Admin
│   ├── component-doctor/      # Komponen statis / aset untuk Dokter
│   ├── login_img.svg
│   └── logo.svg
│
├── src/
│   └── app/
│       │
│       ├── (admin)/           # 🖥️ Halaman Frontend Admin
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── data-pasien/
│       │   │   └── page.tsx
│       │   ├── pembayaran/
│       │   └── layout.tsx
│       │
│       ├── (auth)/            # 🔐 Autentikasi
│       │   └── login/
│       │       └── page.tsx
│       │
│       ├── (doctor)/          # 🩺 Halaman Frontend Dokter
│       │   ├── dashboard/
│       │   ├── jadwal-periksa/
│       │   ├── rekam-medis/
│       │   └── layout.tsx
│       │
│       ├── api/               # ⚙️ Backend — API Routes
│       │   ├── admin/
│       │   ├── auth/
│       │   └── doctor/
│       │
│       ├── globals.css
│       ├── icon.png
│       └── layout.tsx         # Root layout
│
├── next.config.ts
├── tailwind.config.*
├── tsconfig.json
└── package.json
```

---

## 📖 Panduan Per Peran

### 🖥️ Frontend Admin

**Lokasi file:** `src/app/(admin)/`

**Halaman yang dikerjakan:**

| Halaman | Path File | URL |
|---|---|---|
| Dashboard | `(admin)/dashboard/page.tsx` | `/dashboard` |
| Data Pasien | `(admin)/data-pasien/page.tsx` | `/data-pasien` |
| Pembayaran | `(admin)/pembayaran/...` | `/pembayaran` |

**Step-by-step memulai:**

```bash
# 1. Buat branch baru
git checkout -b feature/admin-dashboard

# 2. Kerjakan file yang sesuai
# src/app/(admin)/dashboard/page.tsx

# 3. Commit setelah selesai
git add .
git commit -m "feat: update halaman dashboard admin"

# 4. Push ke GitHub
git push origin feature/admin-dashboard
```

**Contoh struktur halaman:**

```tsx
// src/app/(admin)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
      {/* Konten dashboard */}
    </div>
  );
}
```

> 💡 Layout bersama (sidebar, navbar) dikonfigurasi di `src/app/(admin)/layout.tsx` — edit file ini untuk mengubah tampilan yang muncul di semua halaman admin.

---

### 🩺 Frontend Dokter

**Lokasi file:** `src/app/(doctor)/`

**Halaman yang dikerjakan:**

| Halaman | Path File | URL |
|---|---|---|
| Dashboard | `(doctor)/dashboard/...` | `/dashboard` |
| Jadwal Periksa | `(doctor)/jadwal-periksa/...` | `/jadwal-periksa` |
| Rekam Medis | `(doctor)/rekam-medis/...` | `/rekam-medis` |

**Contoh fetch data dari API:**

```tsx
// src/app/(doctor)/rekam-medis/page.tsx
async function getRekamMedis() {
  const res = await fetch('/api/doctor/rekam-medis');
  return res.json();
}

export default async function RekamMedisPage() {
  const data = await getRekamMedis();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Rekam Medis</h1>
      {/* Tampilkan data */}
    </div>
  );
}
```

> 💡 Layout bersama dokter ada di `src/app/(doctor)/layout.tsx`.

---

### 🔐 Autentikasi (Auth)

**Lokasi file:** `src/app/(auth)/login/page.tsx`

Halaman login digunakan oleh **admin maupun dokter**. Setelah login berhasil, redirect ke halaman masing-masing sesuai role.

---

### ⚙️ Backend — API Routes

**Lokasi file:** `src/app/api/`

```
api/
├── admin/    →  Endpoint untuk fitur admin (data pasien, pembayaran, dll)
├── auth/     →  Login, logout, verifikasi session
└── doctor/   →  Endpoint untuk fitur dokter (jadwal, rekam medis, dll)
```

**Contoh membuat endpoint:**

```typescript
// src/app/api/admin/pasien/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Ambil data dari database
  return NextResponse.json({ data: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Simpan ke database
  return NextResponse.json({ success: true }, { status: 201 });
}
```

> 💡 Beri tahu tim Frontend nama endpoint yang sudah siap dipakai beserta format response-nya.

---

## 🔄 Workflow Kolaborasi Tim

```
1. Pull terbaru      →  git pull origin main
2. Buat branch       →  git checkout -b feature/nama-fitur
3. Kerjakan fitur
4. Commit            →  git commit -m "feat: ..."
5. Push              →  git push origin feature/nama-fitur
6. Buat Pull Request di GitHub → minta review
7. Merge ke main setelah disetujui
```

### Konvensi Nama Branch

| Jenis | Format |
|---|---|
| Fitur baru | `feature/nama-fitur` |
| Perbaikan bug | `fix/nama-bug` |
| Perubahan tampilan | `style/nama-perubahan` |
| Refactor | `refactor/nama-bagian` |

### Konvensi Pesan Commit

| Prefix | Digunakan Untuk |
|---|---|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `style:` | Perubahan CSS/tampilan |
| `refactor:` | Restrukturisasi kode |
| `docs:` | Perubahan dokumentasi |

---

## 📦 Script NPM

```bash
npm run dev      # Jalankan development server → localhost:3000
npm run build    # Build untuk production
npm run start    # Jalankan production build
npm run lint     # Cek kode dengan ESLint
```

---

## ⚠️ Hal yang Perlu Diperhatikan

- Proyek ini memakai **Next.js 16 + React 19** — versi baru, mungkin berbeda dari tutorial lama
- Gunakan **App Router** (bukan Pages Router) — routing berbasis folder di `src/app/`
- **Server Components** adalah default — tambahkan `"use client"` hanya jika butuh `useState`, `useEffect`, atau event handler
- **Jangan commit:** `node_modules/`, `.env`, `.env.local`
- **Selalu pull** sebelum mulai kerja agar tidak bentrok

---

<p align="center">Proyek RPL · Kelompok Klinik · 2026</p>