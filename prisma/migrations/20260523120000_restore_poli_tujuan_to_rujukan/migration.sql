-- Restore poliTujuan column on Rujukan so current code and Prisma schema match the database.
ALTER TABLE "Rujukan" ADD COLUMN "poliTujuan" TEXT;
