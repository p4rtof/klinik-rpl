/*
  Warnings:

  - You are about to drop the `Antrian` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dokter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `nik` on the `Pasien` table. All the data in the column will be lost.
  - You are about to drop the column `riwayatAlergi` on the `Pasien` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `RekamMedis` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosa` on the `RekamMedis` table. All the data in the column will be lost.
  - You are about to drop the column `resepObat` on the `RekamMedis` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalPeriksa` on the `RekamMedis` table. All the data in the column will be lost.
  - The required column `noRm` was added to the `Pasien` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Dokter_userId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "spesialisasi" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Antrian";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Dokter";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pasienId" TEXT NOT NULL,
    "dokterId" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "jam" TEXT NOT NULL,
    "nomorAntrian" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Jadwal_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Jadwal_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rekamMedisId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Diagnosis_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rekamMedisId" TEXT NOT NULL,
    "namaObat" TEXT NOT NULL,
    "dosis" TEXT NOT NULL,
    "aturanPakai" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resep_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rujukan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rekamMedisId" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rujukan_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pasienId" TEXT NOT NULL,
    "rekamMedisId" TEXT,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah" REAL NOT NULL,
    "metode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_BAYAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pembayaran_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pembayaran_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pasien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noRm" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tanggalLahir" TEXT NOT NULL,
    "noTelepon" TEXT,
    "alamat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Pasien" ("alamat", "createdAt", "id", "jenisKelamin", "nama", "noTelepon", "tanggalLahir", "updatedAt") SELECT "alamat", "createdAt", "id", "jenisKelamin", "nama", "noTelepon", "tanggalLahir", "updatedAt" FROM "Pasien";
DROP TABLE "Pasien";
ALTER TABLE "new_Pasien" RENAME TO "Pasien";
CREATE UNIQUE INDEX "Pasien_noRm_key" ON "Pasien"("noRm");
CREATE TABLE "new_RekamMedis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pasienId" TEXT NOT NULL,
    "dokterId" TEXT NOT NULL,
    "jadwalId" TEXT,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keluhan" TEXT NOT NULL,
    "tindakan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RekamMedis_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RekamMedis_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RekamMedis_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "Jadwal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RekamMedis" ("createdAt", "dokterId", "id", "keluhan", "pasienId", "tindakan", "updatedAt") SELECT "createdAt", "dokterId", "id", "keluhan", "pasienId", "tindakan", "updatedAt" FROM "RekamMedis";
DROP TABLE "RekamMedis";
ALTER TABLE "new_RekamMedis" RENAME TO "RekamMedis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
