import { prisma } from "./prisma";

/**
 * Mengkalkulasi ulang nomor antrean untuk seluruh kunjungan pada tanggal tertentu.
 * Urutan didasarkan secara kronologis pada parameter `jam` (format HH:mm),
 * dan jika jamnya sama, diurutkan berdasarkan waktu pembuatan data (`createdAt`).
 * 
 * @param targetDateStr String tanggal dengan format YYYY-MM-DD
 */
export async function recalculateQueueNumbers(targetDateStr: string) {
  const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);

  // 1. Ambil seluruh antrean pada tanggal terpilih
  const schedules = await prisma.jadwal.findMany({
    where: {
      tanggal: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Helper untuk menormalisasi format jam "9:00" menjadi "09:00"
  const normalizeTime = (t: string) => {
    if (!t) return "00:00";
    const parts = t.split(':');
    if (parts.length < 2) return t;
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  };

  // Map data untuk menyertakan string jam hasil normalisasi
  const normalizedSchedules = schedules.map(s => ({
    ...s,
    normalizedJam: normalizeTime(s.jam || ""),
  }));

  // 2. Urutkan berdasarkan jam hasil normalisasi (format HH:mm), kemudian berdasarkan waktu dibuat (createdAt)
  normalizedSchedules.sort((a, b) => {
    if (a.normalizedJam < b.normalizedJam) return -1;
    if (a.normalizedJam > b.normalizedJam) return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  // 3. Perbarui nomor antrean & jam jika ada perbedaan antara nilai saat ini dengan nilai yang diharapkan
  for (let i = 0; i < normalizedSchedules.length; i++) {
    const item = normalizedSchedules[i];
    const expectedNomor = i + 1;
    const needJamUpdate = item.jam !== item.normalizedJam;
    const needNomorUpdate = item.nomorAntrian !== expectedNomor;

    if (needJamUpdate || needNomorUpdate) {
      await prisma.jadwal.update({
        where: { id: item.id },
        data: {
          jam: item.normalizedJam,
          nomorAntrian: expectedNomor,
        },
      });
    }
  }
}
