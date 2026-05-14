import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Membersihkan data lama...");
  await prisma.pembayaran.deleteMany();
  await prisma.rujukan.deleteMany();
  await prisma.rekamMedis.deleteMany();
  await prisma.jadwal.deleteMany();
  // Catatan: Pasien tidak dihapus agar relasi tetap aman, kita pakai upsert.

  console.log("Memulai seeding data realistik...");

  // 1. Dapatkan User Dokter (dr. Yofli)
  const dokter = await prisma.user.findFirst({
    where: { role: "DOKTER" },
  });

  if (!dokter) {
    console.error("Error: User DOKTER tidak ditemukan. Jalankan seed utama dulu!");
    return;
  }

  // 2. Dataset Pasien
  const dataPasien = [
    { id: "P0001", nama: "Budi Santoso", noRm: "R0001", noTelepon: "08123456789", alamat: "Jl. Merdeka No. 10, Bandung", tanggalLahir: "1985-05-12", jenisKelamin: "LAKI_LAKI" },
    { id: "P0002", nama: "Siti Aminah", noRm: "R0002", noTelepon: "08198765432", alamat: "Griya Asri Blok C, Cimahi", tanggalLahir: "1992-08-20", jenisKelamin: "PEREMPUAN" },
    { id: "P0003", nama: "Hendra Wijaya", noRm: "R0003", noTelepon: "08522334455", alamat: "Kost Biru Gg. Sayang, Jatinangor", tanggalLahir: "2002-01-15", jenisKelamin: "LAKI_LAKI" },
    { id: "P0004", nama: "Dewi Lestari", noRm: "R0004", noTelepon: "08771122334", alamat: "Perum Permata No. 5, Soreang", tanggalLahir: "1978-11-30", jenisKelamin: "PEREMPUAN" },
    { id: "P0005", nama: "Ahmad Fauzi", noRm: "R0005", noTelepon: "08133445566", alamat: "Jl. Kebon Jeruk No. 8, Bandung", tanggalLahir: "1965-03-22", jenisKelamin: "LAKI_LAKI" },
    { id: "P0006", nama: "Rina Kartika", noRm: "R0006", noTelepon: "08211223344", alamat: "Apartemen Gateway Lt. 5, Cicadas", tanggalLahir: "1995-07-08", jenisKelamin: "PEREMPUAN" },
    { id: "P0007", nama: "Dedi Mulyadi", noRm: "R0007", noTelepon: "08122334455", alamat: "Ds. Bojongsoang RT 02/03", tanggalLahir: "1970-09-12", jenisKelamin: "LAKI_LAKI" },
    { id: "P0008", nama: "Ani Maryani", noRm: "R0008", noTelepon: "08133442211", alamat: "Cipadung Kidul No. 12", tanggalLahir: "1988-12-01", jenisKelamin: "PEREMPUAN" },
    { id: "P0009", nama: "Rizky Ramadhan", noRm: "R0009", noTelepon: "08566778899", alamat: "Jl. Sukajadi No. 45", tanggalLahir: "2005-10-10", jenisKelamin: "LAKI_LAKI" },
    { id: "P0010", nama: "Siska Putri", noRm: "R0010", noTelepon: "08788990011", alamat: "Ujung Berung Regency B3", tanggalLahir: "1998-02-14", jenisKelamin: "PEREMPUAN" },
  ];

  console.log("Memasukkan data pasien...");
  for (const p of dataPasien) {
    await prisma.pasien.upsert({
      where: { noRm: p.noRm },
      update: {},
      create: {
        id: p.id,
        nama: p.nama,
        noRm: p.noRm,
        noTelepon: p.noTelepon,
        alamat: p.alamat,
        tanggalLahir: p.tanggalLahir,
        jenisKelamin: p.jenisKelamin as any,
      },
    });
  }

  const pasiens = await prisma.pasien.findMany();

  // 3. Dataset Pemeriksaan (Rekam Medis) & Pembayaran
  const kasusMedis = [
    { keluhan: "Demam tinggi sejak 2 hari, mual, pusing", diagnosis: "Observasi Febris", tindakan: "Pemberian Paracetamol 500mg, cek darah", biaya: 150000 },
    { keluhan: "Batuk berdahak, sesak nafas ringan", diagnosis: "ISPA (Infeksi Saluran Pernafasan Akut)", tindakan: "Nebulizer Ventolin", biaya: 200000 },
    { keluhan: "Nyeri lambung, ulu hati perih", diagnosis: "Gastritis Akut", tindakan: "Injeksi Ranitidin", biaya: 175000 },
    { keluhan: "Luka robek di lutut karena jatuh", diagnosis: "Vulnus Laceratum", tindakan: "Hecting 3 jahitan, pembersihan luka", biaya: 350000 },
    { keluhan: "Pusing berputar (vertigo)", diagnosis: "Vertigo BPPV", tindakan: "Manuver Epley", biaya: 125000 },
    { keluhan: "Gatal-gatal kemerahan di seluruh tubuh", diagnosis: "Urtikaria (Alergi)", tindakan: "Injeksi Dexamethasone", biaya: 150000 },
    { keluhan: "Nyeri saat buang air kecil", diagnosis: "Infeksi Saluran Kemih", tindakan: "Pemberian antibiotik", biaya: 160000 },
  ];

  console.log("Memasukkan riwayat pemeriksaan sebulan terakhir...");
  
  for (let i = 0; i < 30; i++) {
    const pasien = pasiens[i % pasiens.length];
    const kasus = kasusMedis[i % kasusMedis.length];
    
    // Tanggal acak dalam 30 hari terakhir
    const tanggal = new Date();
    tanggal.setDate(tanggal.getDate() - (30 - i));

    const rm = await prisma.rekamMedis.create({
      data: {
        pasienId: pasien.id,
        dokterId: dokter.id,
        namaDokter: dokter.namaLengkap,
        tanggal: tanggal,
        keluhan: kasus.keluhan,
        tindakan: kasus.tindakan,
        catatanTambahan: "Saran: Istirahat cukup dan banyak minum air putih.",
        pemeriksaanFisik: "TD: 120/80 mmHg, Nadi: 80x/m, Suhu: 37.5C",
        diagnosis: {
          create: [{ diagnosis: kasus.diagnosis }]
        },
        resep: {
          create: [
            { obatId: "Antibiotik", dosis: "3x1", aturan: "Sesudah Makan", jumlah: "10" },
            { obatId: "Vitamin C", dosis: "1x1", aturan: "Sesudah Makan", jumlah: "5" }
          ]
        }
      }
    });

    // Buat Pembayaran
    await prisma.pembayaran.create({
      data: {
        pasienId: pasien.id,
        rekamMedisId: rm.id,
        jumlah: kasus.biaya,
        metode: i % 3 === 0 ? "TRANSFER" : "TUNAI",
        status: i === 29 ? "BELUM_BAYAR" : "LUNAS", // Sisakan 1 yang belum bayar
        tanggal: tanggal
      }
    });

    // Buat 3 Rujukan secara acak
    if (i === 5 || i === 15 || i === 25) {
      await prisma.rujukan.create({
        data: {
          rekamMedisId: rm.id,
          tujuan: i === 5 ? "RS Hasan Sadikin" : "RS Hermina",
          poliTujuan: i === 5 ? "Poli Penyakit Dalam" : "Poli Bedah",
          diagnosa: kasus.diagnosis,
          status: "FINAL",
          nomorSurat: `SURAT/RUJ/2026/00${i}`,
          keterangan: "Mohon penanganan lebih lanjut."
        }
      });
    }
  }

  // 4. Dataset Masa Depan (Antrian Hari Ini & 3 Hari Ke Depan)
  console.log("Memasukkan antrian untuk hari ini dan 3 hari ke depan...");
  for (let d = 0; d <= 3; d++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + d);
    targetDate.setHours(9, 0, 0, 0); // Mulai jam 9 pagi

    for (let j = 0; j < 3; j++) {
      const pasien = pasiens[(d + j) % pasiens.length];
      const jam = `${9 + j}:00`;
      
      await prisma.jadwal.create({
        data: {
          pasienId: pasien.id,
          dokterId: dokter.id,
          tanggal: targetDate,
          jam: jam,
          nomorAntrian: j + 1, // Tambahkan nomor antrian (1, 2, 3)
          keluhan: "Kontrol rutin pasca pengobatan",
          status: "MENUNGGU",
        },
      });
    }
  }

  console.log("Seeding selesai! 10 Pasien, 30 Transaksi, dan 9 Antrian masa depan berhasil dimasukkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
