import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      namaLengkap: 'Administrator Sistem',
    },
  });

  console.log('Seeder berhasil! User Admin:');
  console.log({ id: admin.id, username: admin.username, role: admin.role });

  // Buat User Dokter
  const doctorUser = await prisma.user.upsert({
    where: { username: 'dryofli' },
    update: {},
    create: {
      username: 'dryofli',
      password: hashedPassword,
      role: 'DOKTER',
      namaLengkap: 'dr. Yofli',
    },
  });

  // Hubungkan User Dokter dengan entitas Dokter
  const doctorProfile = await prisma.dokter.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      nama: doctorUser.namaLengkap,
      spesialisasi: 'Umum',
      jadwalPraktik: 'Senin - Jumat, 08:00 - 16:00',
    },
  });

  console.log('User Dokter berhasil dibuat:');
  console.log({ id: doctorUser.id, username: doctorUser.username, role: doctorUser.role, spesialisasi: doctorProfile.spesialisasi });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
