/*
  Warnings:

  - Made the column `updatedAt` on table `Rujukan` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rujukan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rekamMedisId" TEXT NOT NULL,
    "nomorSurat" TEXT,
    "tanggalRujukan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tujuan" TEXT NOT NULL,
    "poliTujuan" TEXT,
    "diagnosa" TEXT,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rujukan_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rujukan" ("createdAt", "diagnosa", "id", "keterangan", "nomorSurat", "poliTujuan", "rekamMedisId", "status", "tanggalRujukan", "tujuan", "updatedAt") SELECT "createdAt", "diagnosa", "id", "keterangan", "nomorSurat", "poliTujuan", "rekamMedisId", "status", "tanggalRujukan", "tujuan", "updatedAt" FROM "Rujukan";
DROP TABLE "Rujukan";
ALTER TABLE "new_Rujukan" RENAME TO "Rujukan";
CREATE UNIQUE INDEX "Rujukan_nomorSurat_key" ON "Rujukan"("nomorSurat");
CREATE INDEX "Rujukan_rekamMedisId_idx" ON "Rujukan"("rekamMedisId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
