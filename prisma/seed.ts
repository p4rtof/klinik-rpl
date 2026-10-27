import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Buat user Admin
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

  // Buat user Dokter (dr. Yofli)
  const dokter = await prisma.user.upsert({
    where: { username: 'dryofli' },
    update: {},
    create: {
      username: 'dryofli',
      password: hashedPassword,
      role: 'DOKTER',
      namaLengkap: 'dr. Yofli',
      spesialisasi: 'Umum',
    },
  });
  console.log('✅ Dokter:', dokter.username, '—', dokter.namaLengkap);

  console.log('\n📋 Akun default:');
  console.log('  Admin    → username: admin    | password: admin123');
  console.log('  Dokter   → username: dryofli  | password: admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });