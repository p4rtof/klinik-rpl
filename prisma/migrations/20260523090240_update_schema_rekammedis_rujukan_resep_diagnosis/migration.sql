/*
  Warnings:

  - You are about to drop the column `deskripsi` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `aturanPakai` on the `Resep` table. All the data in the column will be lost.
  - You are about to drop the column `namaObat` on the `Resep` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rekamMedisId]` on the table `Rujukan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `diagnosis` to the `Diagnosis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aturan` to the `Resep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `obatId` to the `Resep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RekamMedis" ADD COLUMN "namaDokter" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rekamMedisId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Diagnosis_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Diagnosis" ("createdAt", "diagnosis", "id", "rekamMedisId") SELECT "createdAt", "deskripsi", "id", "rekamMedisId" FROM "Diagnosis";
DROP TABLE "Diagnosis";
ALTER TABLE "new_Diagnosis" RENAME TO "Diagnosis";
CREATE TABLE "new_Resep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rekamMedisId" TEXT NOT NULL,
    "obatId" TEXT NOT NULL,
    "dosis" TEXT NOT NULL,
    "aturan" TEXT NOT NULL,
    "jumlah" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resep_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Resep" ("createdAt", "dosis", "id", "obatId", "rekamMedisId", "aturan", "jumlah") SELECT "createdAt", "dosis", "id", "namaObat", "rekamMedisId", "aturanPakai", "jumlah" FROM "Resep";
DROP TABLE "Resep";
ALTER TABLE "new_Resep" RENAME TO "Resep";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Rujukan_rekamMedisId_key" ON "Rujukan"("rekamMedisId");
