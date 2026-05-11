-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pasien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "alamat" TEXT,
    "noTelepon" TEXT,
    "riwayatAlergi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Dokter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "spesialisasi" TEXT NOT NULL,
    "jadwalPraktik" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dokter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Antrian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pasienId" TEXT NOT NULL,
    "dokterId" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "nomorAntrian" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Antrian_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Antrian_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "Dokter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RekamMedis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pasienId" TEXT NOT NULL,
    "dokterId" TEXT NOT NULL,
    "tanggalPeriksa" DATETIME NOT NULL,
    "keluhan" TEXT NOT NULL,
    "diagnosa" TEXT NOT NULL,
    "tindakan" TEXT,
    "resepObat" TEXT,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RekamMedis_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RekamMedis_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "Dokter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_nik_key" ON "Pasien"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Dokter_userId_key" ON "Dokter"("userId");
