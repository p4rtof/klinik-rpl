import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Membersihkan data lama...");
  await prisma.detailPembayaran.deleteMany();
  await prisma.pembayaran.deleteMany();
  await prisma.rujukan.deleteMany();
  await prisma.resep.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.rekamMedisTindakan.deleteMany();
  await prisma.rekamMedis.deleteMany();
  await prisma.jadwal.deleteMany();
  await prisma.dokter.deleteMany();
  await prisma.poli.deleteMany();
  await prisma.obat.deleteMany();
  await prisma.tindakan.deleteMany();
  await prisma.penyakit.deleteMany();

  console.log("Memulai seeding data relasional...");

  // 1. Seed Poli
  const poliUmum = await prisma.poli.create({
    data: { namaPoli: "Poli Umum", keterangan: "Layanan kesehatan umum 24 jam" }
  });
  const poliGigi = await prisma.poli.create({
    data: { namaPoli: "Poli Gigi", keterangan: "Layanan kesehatan gigi dan mulut" }
  });
  const poliKIA = await prisma.poli.create({
    data: { namaPoli: "Poli KIA", keterangan: "Kesehatan Ibu dan Anak" }
  });
  console.log("✅ Seeded Poli");

  // 2. Dapatkan User Dokter (dryofli)
  const userDokter = await prisma.user.findFirst({
    where: { role: "DOKTER" }
  });

  if (!userDokter) {
    console.error("Error: User DOKTER tidak ditemukan. Jalankan seed utama dahulu (npm run db:seed / npx prisma db seed)!");
    return;
  }

  // Buat Profil Dokter
  const dokter = await prisma.dokter.create({
    data: {
      userId: userDokter.id,
      poliId: poliUmum.id,
      namaLengkap: userDokter.namaLengkap,
      sip: "SIP/123/2026",
      str: "STR/123/2026",
      noTelepon: "0858-8788-35683",
    }
  });
  console.log("✅ Seeded Profil Dokter");

  // 3. Seed Penyakit (ICD-10)
  const dataPenyakit = [
    { kodeIcd10: "R50.9", namaPenyakit: "Observasi Febris (Demam)", deskripsi: "Demam tidak spesifik" },
    { kodeIcd10: "J06.9", namaPenyakit: "ISPA (Infeksi Saluran Pernafasan Akut)", deskripsi: "Infeksi pernafasan akut atas" },
    { kodeIcd10: "K29.0", namaPenyakit: "Gastritis Akut", deskripsi: "Peradangan dinding lambung akut" },
    { kodeIcd10: "S81.0", namaPenyakit: "Vulnus Laceratum (Luka Robek)", deskripsi: "Luka robek pada lutut/tungkai" },
    { kodeIcd10: "H81.1", namaPenyakit: "Vertigo BPPV", deskripsi: "Pusing berputar jinak" },
    { kodeIcd10: "L50.9", namaPenyakit: "Urtikaria (Alergi/Gatal)", deskripsi: "Gatal kemerahan alergi" },
    { kodeIcd10: "N39.0", namaPenyakit: "Infeksi Saluran Kemih (ISK)", deskripsi: "Infeksi bakteri pada saluran kemih" },
  ];
  const penyakitRecords = [];
  for (const dp of dataPenyakit) {
    const rec = await prisma.penyakit.create({ data: dp });
    penyakitRecords.push(rec);
  }
  console.log("✅ Seeded Penyakit ICD-10");

  // 4. Seed Obat
  const dataObat = [
    { kodeObat: "OBT001", namaObat: "Paracetamol 500mg", satuan: "tablet", hargaJual: 1500, stok: 100 },
    { kodeObat: "OBT002", namaObat: "Antibiotik (Amoxicillin)", satuan: "tablet", hargaJual: 5000, stok: 100 },
    { kodeObat: "OBT003", namaObat: "Vitamin C 250mg", satuan: "tablet", hargaJual: 1000, stok: 150 },
    { kodeObat: "OBT004", namaObat: "Ventolin Nebules", satuan: "ampul", hargaJual: 25000, stok: 50 },
    { kodeObat: "OBT005", namaObat: "Ranitidin Injeksi", satuan: "ampul", hargaJual: 15000, stok: 60 },
    { kodeObat: "OBT006", namaObat: "Dexamethasone Injeksi", satuan: "ampul", hargaJual: 12000, stok: 80 },
    { kodeObat: "OBT007", namaObat: "Salep Bioplacenton", satuan: "tube", hargaJual: 30000, stok: 40 },
  ];
  const obatRecords = [];
  for (const dob of dataObat) {
    const rec = await prisma.obat.create({ data: dob });
    obatRecords.push(rec);
  }
  console.log("✅ Seeded Obat");

  // 5. Seed Tindakan
  const dataTindakan = [
    { kodeTindakan: "TDK001", namaTindakan: "Konsultasi Dokter & Pemeriksaan Umum", harga: 50000 },
    { kodeTindakan: "TDK002", namaTindakan: "Pemberian Paracetamol 500mg, cek darah", harga: 100000 },
    { kodeTindakan: "TDK003", namaTindakan: "Nebulizer Ventolin", harga: 150000 },
    { kodeTindakan: "TDK004", namaTindakan: "Injeksi Ranitidin", harga: 125000 },
    { kodeTindakan: "TDK005", namaTindakan: "Hecting 3 jahitan, pembersihan luka", harga: 300000 },
    { kodeTindakan: "TDK006", namaTindakan: "Manuver Epley", harga: 75000 },
    { kodeTindakan: "TDK007", namaTindakan: "Injeksi Dexamethasone", harga: 100000 },
    { kodeTindakan: "TDK008", namaTindakan: "Pemberian antibiotik", harga: 110000 },
  ];
  const tindakanRecords = [];
  for (const dt of dataTindakan) {
    const rec = await prisma.tindakan.create({ data: dt });
    tindakanRecords.push(rec);
  }
  console.log("✅ Seeded Tindakan");

  // 6. Dataset Pasien
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

  // 7. Kasus Medis mapping ke Penyakit, Tindakan dan Obat
  const kasusMedis = [
    {
      keluhan: "Demam tinggi sejak 2 hari, mual, pusing",
      penyakit: penyakitRecords[0], // Observasi Febris
      tindakan: tindakanRecords[1], // Pemberian Paracetamol 500mg, cek darah (harga: 100000)
      obat: obatRecords[0], // Paracetamol 500mg
      biaya: 150000
    },
    {
      keluhan: "Batuk berdahak, sesak nafas ringan",
      penyakit: penyakitRecords[1], // ISPA
      tindakan: tindakanRecords[2], // Nebulizer Ventolin (harga: 150000)
      obat: obatRecords[3], // Ventolin Nebules
      biaya: 200000
    },
    {
      keluhan: "Nyeri lambung, ulu hati perih",
      penyakit: penyakitRecords[2], // Gastritis Akut
      tindakan: tindakanRecords[3], // Injeksi Ranitidin (harga: 125000)
      obat: obatRecords[4], // Ranitidin Injeksi
      biaya: 175000
    },
    {
      keluhan: "Luka robek di lutut karena jatuh",
      penyakit: penyakitRecords[3], // Vulnus Laceratum
      tindakan: tindakanRecords[4], // Hecting 3 jahitan, pembersihan luka (harga: 300000)
      obat: obatRecords[6], // Salep Bioplacenton
      biaya: 350000
    },
    {
      keluhan: "Pusing berputar (vertigo)",
      penyakit: penyakitRecords[4], // Vertigo BPPV
      tindakan: tindakanRecords[5], // Manuver Epley (harga: 75000)
      obat: obatRecords[5], // Dexamethasone Injeksi
      biaya: 125000
    },
    {
      keluhan: "Gatal-gatal kemerahan di seluruh tubuh",
      penyakit: penyakitRecords[5], // Urtikaria
      tindakan: tindakanRecords[6], // Injeksi Dexamethasone (harga: 100000)
      obat: obatRecords[5], // Dexamethasone Injeksi
      biaya: 150000
    },
    {
      keluhan: "Nyeri saat buang air kecil",
      penyakit: penyakitRecords[6], // ISK
      tindakan: tindakanRecords[7], // Pemberian antibiotik (harga: 110000)
      obat: obatRecords[1], // Antibiotik
      biaya: 160000
    },
  ];

  console.log("Memasukkan riwayat pemeriksaan sebulan terakhir...");
  for (let i = 0; i < 30; i++) {
    const pasien = pasiens[i % pasiens.length];
    const kasus = kasusMedis[i % kasusMedis.length];

    const tanggal = new Date();
    tanggal.setDate(tanggal.getDate() - (30 - i));

    // a. Buat Rekam Medis
    const rm = await prisma.rekamMedis.create({
      data: {
        pasienId: pasien.id,
        dokterId: dokter.id,
        namaDokter: dokter.namaLengkap,
        tanggal: tanggal,
        keluhan: kasus.keluhan,
        catatanTambahan: "Saran: Istirahat cukup dan banyak minum air putih.",
        pemeriksaanFisik: "TD: 120/80 mmHg, Nadi: 80x/m, Suhu: 37.5C",
        tdSistolik: 120,
        tdDiastolik: 80,
        nadi: 80,
        suhu: 37.5,
        // Hubungkan ke Penyakit melalui Diagnosis
        diagnosis: {
          create: [{ penyakitId: kasus.penyakit.id }]
        },
        // Hubungkan ke Obat melalui Resep
        resep: {
          create: [
            { obatId: kasus.obat.id, dosis: "3x1", aturan: "Sesudah Makan", jumlah: 10, hargaSnapshot: kasus.obat.hargaJual },
            { obatId: obatRecords[2].id, dosis: "1x1", aturan: "Sesudah Makan", jumlah: 5, hargaSnapshot: obatRecords[2].hargaJual }
          ]
        },
        // Hubungkan ke Tindakan
        rekamMedisTindakan: {
          create: [
            { tindakanId: kasus.tindakan.id, hargaSnapshot: kasus.tindakan.harga, kuantitas: 1 }
          ]
        }
      }
    });

    // b. Buat Pembayaran
    const pembayaran = await prisma.pembayaran.create({
      data: {
        pasienId: pasien.id,
        rekamMedisId: rm.id,
        totalJumlah: kasus.biaya,
        metode: i % 3 === 0 ? "TRANSFER" : "TUNAI",
        status: i === 29 ? "BELUM_BAYAR" : "LUNAS",
        tanggal: tanggal
      }
    });

    // c. Buat Detail Pembayaran (Rincian Item Invoice)
    // 1. Biaya Konsultasi Dokter (TDK001)
    await prisma.detailPembayaran.create({
      data: {
        pembayaranId: pembayaran.id,
        tipeItem: "KONSULTASI",
        namaItem: "Konsultasi Dokter & Pemeriksaan Umum",
        hargaSatuan: 50000,
        kuantitas: 1,
        subtotal: 50000
      }
    });
    // 2. Biaya Tindakan Medis yang dilakukan
    await prisma.detailPembayaran.create({
      data: {
        pembayaranId: pembayaran.id,
        tipeItem: "TINDAKAN",
        namaItem: kasus.tindakan.namaTindakan,
        hargaSatuan: kasus.tindakan.harga,
        kuantitas: 1,
        subtotal: kasus.tindakan.harga
      }
    });

    // d. Buat 3 Rujukan secara acak
    if (i === 5 || i === 15 || i === 25) {
      await prisma.rujukan.create({
        data: {
          rekamMedisId: rm.id,
          tujuan: i === 5 ? "RS Hasan Sadikin" : "RS Hermina",
          poliTujuan: i === 5 ? "Poli Penyakit Dalam" : "Poli Bedah",
          diagnosa: kasus.penyakit.namaPenyakit,
          status: "FINAL",
          nomorSurat: `SURAT/RUJ/2026/00${i}`,
          keterangan: "Mohon penanganan lebih lanjut."
        }
      });
    }
  }

  // 8. Jadwal (Antrian Hari Ini & 3 Hari Ke Depan)
  console.log("Memasukkan antrian untuk hari ini dan 3 hari ke depan...");
  for (let d = 0; d <= 3; d++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + d);
    targetDate.setHours(9, 0, 0, 0);

    for (let j = 0; j < 3; j++) {
      const pasien = pasiens[(d + j) % pasiens.length];
      const jam = `${9 + j}:00`;

      await prisma.jadwal.create({
        data: {
          pasienId: pasien.id,
          dokterId: dokter.id,
          poliId: poliUmum.id,
          tanggal: targetDate,
          jam: jam,
          nomorAntrian: j + 1,
          keluhan: "Kontrol rutin pasca pengobatan",
          status: "MENUNGGU",
        },
      });
    }
  }

  console.log("Seeding selesai! 10 Pasien, 30 Transaksi (dengan Ledger Breakdown), dan 9 Antrian berhasil dimasukkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
