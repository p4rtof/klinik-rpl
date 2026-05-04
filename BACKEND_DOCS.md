# Dokumentasi Backend: Sistem Informasi Klinik

Dokumen ini berisi penjelasan lengkap mengenai teknologi, arsitektur, struktur file, dan spesifikasi API yang telah diimplementasikan pada Backend Sistem Informasi Klinik (klinik-rpl).

## 1. Full Tech Stack (Backend)

*   **Framework**: Next.js 16 (App Router / API Routes)
*   **Database**: SQLite (via `dev.db` untuk *development*)
*   **ORM**: Prisma Client & Prisma Schema
*   **Validasi Data**: Zod
*   **Autentikasi & Keamanan**: 
    *   JWT (JSON Web Token) menggunakan library `jose` (kompatibel dengan Edge Runtime Next.js).
    *   HTTP-Only Cookies untuk menyimpan token secara aman.
    *   *Hashing* password menggunakan `bcryptjs`.
*   **Bahasa**: TypeScript

---

## 2. Struktur Direktori Utama

*   `prisma/schema.prisma` : File pusat yang berisi desain tabel database (Models) dan konfigurasi SQLite.
*   `src/lib/prisma.ts` : Konfigurasi Singleton Prisma Client agar koneksi database efisien.
*   `src/lib/auth.ts` : Utilitas untuk membuat (*sign*) dan memverifikasi (*verify*) token JWT.
*   `src/lib/validations.ts` : Skema Zod untuk memvalidasi *request body* yang masuk dari *frontend*.
*   `src/proxy.ts` : Middleware pelindung. Mencegat semua permintaan (kecuali login) ke `/api/*` untuk memastikan *user* memiliki token JWT yang valid.
*   `src/app/api/...` : Folder yang berisi seluruh rute API backend (Route Handlers).

---

## 3. Spesifikasi Database (Models)

Sistem menggunakan 5 entitas utama:
1.  **User**: Menyimpan data autentikasi (Username, Password Hashed, Role: `ADMIN` / `DOKTER`).
2.  **Dokter**: Menyimpan profil dokter (Nama, Spesialisasi) yang berelasi dengan User.
3.  **Pasien**: Menyimpan data induk pasien (NIK, Nama, Kelahiran, dll).
4.  **Antrian**: Menyimpan antrean kunjungan (Pasien, Dokter, Status: `MENUNGGU`|`DIPERIKSA`|`SELESAI`).
5.  **RekamMedis**: Menyimpan histori pemeriksaan (Keluhan, Diagnosa, Resep).

---

## 4. Spesifikasi Endpoint API Terdaftar

Setiap respons dari API selalu menggunakan format standar:
`{ success: boolean, data?: sembarang, message?: string, error?: string }`

### Autentikasi
*   **`POST /api/auth/login`**: Memvalidasi kredensial, memberikan HTTP-Only cookie berisikan JWT.
*   **`POST /api/auth/logout`**: Menghapus cookie token.

### Manajemen Pasien (Akses: ADMIN)
*   **`GET /api/pasien`**: Mengambil semua daftar pasien. Mendukung pencarian dengan `?search=nama`.
*   **`POST /api/pasien`**: Menambahkan pasien baru.
*   **`GET /api/pasien/[id]`**: Mengambil detail satu pasien.
*   **`PUT /api/pasien/[id]`**: Mengubah data pasien.
*   **`DELETE /api/pasien/[id]`**: Menghapus data pasien.

### Manajemen Dokter
*   **`GET /api/dokter`**: Mengambil daftar dokter (untuk pilihan saat mendaftar antrean).
*   **`GET /api/dokter/[id]`**: Mengambil profil dokter spesifik.

### Manajemen Antrian (Akses: ADMIN & DOKTER)
*   **`GET /api/antrian`**: Mendapatkan antrean hari ini. Bisa di-filter `?dokterId=xxx`.
*   **`POST /api/antrian`**: (ADMIN) Menambahkan pasien ke antrean dokter.
*   **`PUT /api/antrian/[id]`**: (DOKTER/ADMIN) Mengubah status antrean (misal dari MENUNGGU ke DIPERIKSA).

### Manajemen Rekam Medis (Akses: DOKTER)
*   **`POST /api/rekam-medis`**: Menyimpan hasil pemeriksaan. Otomatis mengubah status antrean menjadi SELESAI.
*   **`GET /api/rekam-medis/pasien/[id]`**: Melihat riwayat pemeriksaan pasien.

---

## 5. Cara Menjalankan Project

1.  Jalankan instalasi *package*: `npm install`
2.  Pastikan *file* `.env` ada dengan isi `DATABASE_URL="file:./dev.db"`.
3.  Terapkan skema ke database SQLite: `npx prisma db push`
4.  Jalankan server: `npm run dev`

Untuk akun default, gunakan *seeder*:
`npx tsx prisma/seed.ts` (Akan memberikan akun **admin** dan **dryofli**).
