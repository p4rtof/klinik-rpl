/*
  Warnings:

  - You are about to drop the column `poliTujuan` on the `Rujukan` table. All the data in the column will be lost.

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
    "diagnosa" TEXT,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rujukan_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rujukan" ("createdAt", "diagnosa", "id", "keterangan", "nomorSurat", "rekamMedisId", "status", "tanggalRujukan", "tujuan", "updatedAt") SELECT "createdAt", "diagnosa", "id", "keterangan", "nomorSurat", "rekamMedisId", "status", "tanggalRujukan", "tujuan", "updatedAt" FROM "Rujukan";
DROP TABLE "Rujukan";
ALTER TABLE "new_Rujukan" RENAME TO "Rujukan";
CREATE UNIQUE INDEX "Rujukan_nomorSurat_key" ON "Rujukan"("nomorSurat");
CREATE INDEX "Rujukan_rekamMedisId_idx" ON "Rujukan"("rekamMedisId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
