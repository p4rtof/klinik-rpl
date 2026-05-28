import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Buat Poli Umum
  const poliUmum = await prisma.poli.upsert({
    where: { namaPoli: 'Poli Umum' },
    update: {},
    create: {
      namaPoli: 'Poli Umum',
      keterangan: 'Layanan kesehatan umum 24 jam',
    },
  });
  console.log('✅ Poli:', poliUmum.namaPoli);

  // 2. Buat user Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      namaLengkap: 'Administrator',
    },
  });
  console.log('✅ Admin:', admin.username);

  // 3. Buat user Dokter (dr. Yofli)
  const userDokter = await prisma.user.upsert({
    where: { username: 'dryofli' },
    update: {},
    create: {
      username: 'dryofli',
      password: hashedPassword,
      role: 'DOKTER',
      namaLengkap: 'dr. Yofli',
    },
  });
  console.log('✅ User Dokter:', userDokter.username);

  // 4. Buat Dokter Profile
  const dokterProfile = await prisma.dokter.upsert({
    where: { userId: userDokter.id },
    update: {
      poliId: poliUmum.id,
      namaLengkap: 'dr. Yofli',
    },
    create: {
      userId: userDokter.id,
      poliId: poliUmum.id,
      namaLengkap: 'dr. Yofli',
      sip: 'SIP/123/2026',
      str: 'STR/123/2026',
      noTelepon: '0858-8788-35683',
    },
  });
  console.log('✅ Profil Dokter:', dokterProfile.namaLengkap);

  console.log('\n📋 Akun default:');
  console.log('  Admin    → username: admin    | password: admin123');
  console.log('  Dokter   → username: dryofli  | password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });