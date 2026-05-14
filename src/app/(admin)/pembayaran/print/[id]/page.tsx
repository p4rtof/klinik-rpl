import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrintToolbar from "./PrintToolbar";

function formatTanggalIndo(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function hitungUmur(tanggalLahirYYYYMMDD: string) {
  const [y, m, d] = tanggalLahirYYYYMMDD.split("-").map(Number);
  if (!y || !m || !d) return "";
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return `${age} tahun`;
}

export default async function PrintStrukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Tarik semua data yang dibutuhkan dari Database
  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id },
    include: {
      pasien: true,
      rekamMedis: {
        include: {
          dokter: true,
          diagnosis: true, // Tarik data diagnosis
          resep: true,     // Tarik data obat
        },
      },
    },
  });

  if (!pembayaran) return notFound();

  const pasien = pembayaran.pasien;
  const rekamMedis = pembayaran.rekamMedis;
  const dokter = rekamMedis?.dokter;
  const umur = pasien.tanggalLahir ? hitungUmur(pasien.tanggalLahir) : "";

  // Tentukan info rekening berdasarkan yang disimpan dari form
  let infoRekening = "CASH / TUNAI";
  if (pembayaran.metode === "TRANSFER_BCA") infoRekening = "Transfer BCA (1234567890 a.n Klinik RPL)";
  else if (pembayaran.metode === "TRANSFER_MANDIRI") infoRekening = "Transfer Mandiri (0987654321 a.n Klinik RPL)";
  else if (pembayaran.metode === "TRANSFER_BRI") infoRekening = "Transfer BRI (1122334455 a.n Klinik RPL)";
  else if (pembayaran.metode === "TRANSFER") infoRekening = "Transfer Bank";

  return (
    <div className="print-root">
      <PrintToolbar />

      <div className="paper">
        {/* KOP KLINIK (Sama seperti Rujukan) */}
        <div className="kop">
          <div className="kop-logo">
            <Image src="/logo.svg" alt="Logo Klinik" width={72} height={72} priority />
          </div>
          <div className="kop-text">
            <div className="kop-title">Klinik dr.Yofli</div>
            <div className="kop-line">
              <b>Lokasi 1 (Dramaga):</b> Jl. Cangkurawok, RT.01/RW.08, Babakan, Kec. Dramaga, Bogor.
            </div>
            <div className="kop-line">
              <b>Lokasi 2 (Cijeruk):</b> Jl. Raya Pondok Bitung No.27, RT.01/RW.03, Sukaharja, Kec. Cijeruk, Bogor.
            </div>
            <div className="kop-line">
              <b>Layanan:</b> Praktek dokter umum 24 jam. &nbsp;|&nbsp;
              <b>Telp/HP:</b> 0858-8788-35683
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Header Surat */}
        <div className="surat-header">
          <div className="surat-title">BUKTI PEMBAYARAN</div>
          <div className="meta">
            <div>
              <span className="label">No. Transaksi</span>
              <span className="value">{pembayaran.id.split("-")[0].toUpperCase()}</span>
            </div>
            <div>
              <span className="label">Tanggal Cetak</span>
              <span className="value">{formatTanggalIndo(new Date())}</span>
            </div>
            <div>
              <span className="label">Status</span>
              <span className="value">{pembayaran.status}</span>
            </div>
          </div>
        </div>

        {/* Data Pasien */}
        <div className="section">
          <div className="section-title">Data Pasien</div>
          <div className="grid">
            <div className="row">
              <div className="cell label">Nama Pasien</div>
              <div className="cell">: {pasien.nama}</div>
            </div>
            <div className="row">
              <div className="cell label">No. RM</div>
              <div className="cell">: {pasien.noRm}</div>
            </div>
            <div className="row">
              <div className="cell label">Tgl Lahir / Umur</div>
              <div className="cell">: {pasien.tanggalLahir} {umur ? `(${umur})` : ""}</div>
            </div>
            <div className="row">
              <div className="cell label">Dokter Pemeriksa</div>
              <div className="cell">: {dokter?.namaLengkap || "-"}</div>
            </div>
          </div>
        </div>

        {/* Rincian Medis (Diagnosis & Obat) */}
        <div className="section mt-6">
          <div className="section-title border-b border-gray-300 pb-1 mb-3">Rincian Pemeriksaan & Obat</div>
          
          <div className="mb-4">
            <div className="font-bold text-[13px] mb-1">Hasil Diagnosis:</div>
            {rekamMedis?.diagnosis && rekamMedis.diagnosis.length > 0 ? (
              <ul className="pl-4 m-0" style={{ fontSize: "12.5px" }}>
                {rekamMedis.diagnosis.map((d, i) => (
                  <li key={i}>{d.deskripsi}</li>
                ))}
              </ul>
            ) : (
              <div className="text-[12.5px] italic text-gray-500">- Tidak ada catatan diagnosis.</div>
            )}
          </div>

          <div>
            <div className="font-bold text-[13px] mb-2">Resep Obat / Tindakan:</div>
            {rekamMedis?.resep && rekamMedis.resep.length > 0 ? (
              <table className="table-obat">
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>No</th>
                    <th>Nama Obat / Tindakan</th>
                    <th>Dosis</th>
                    <th>Aturan Pakai</th>
                  </tr>
                </thead>
                <tbody>
                  {rekamMedis.resep.map((r, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td>{r.namaObat}</td>
                      <td>{r.dosis}</td>
                      <td>{r.aturanPakai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-[12.5px] italic text-gray-500">- Tidak ada obat atau tindakan khusus.</div>
            )}
          </div>
        </div>

        {/* Rincian Biaya */}
        <div className="section mt-8 pt-4 border-t-2 border-black">
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-black tracking-wider">GRAND TOTAL</div>
            <div className="text-2xl font-black">Rp {pembayaran.jumlah.toLocaleString('id-ID')}</div>
          </div>
          <div className="grid mt-2 text-[13px]">
            <div className="row">
              <div className="cell label text-gray-600">Metode Pembayaran</div>
              <div className="cell font-bold">: {infoRekening}</div>
            </div>
            <div className="row">
              <div className="cell label text-gray-600">Status Pembayaran</div>
              <div className="cell font-bold text-green-700">: LUNAS</div>
            </div>
          </div>
        </div>

        {/* Penutup + TTD */}
        <div className="penutup">
          <div>Terima kasih atas kunjungan Anda. Semoga lekas sembuh!</div>
          <div className="ttd">
            <div className="ttd-box" style={{ border: "none" }}></div>
            <div className="ttd-box">
              <div style={{ textAlign: "center" }}>Kasir / Front Desk</div>
              <div className="spacer" />
              <div className="nama">( Admin Klinik RPL )</div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles (Menggabungkan bawaan Rujukan + style Tabel) */}
      <style>{`
        .print-root {
          padding: 16px;
          background: #f5f5f5;
          min-height: 100vh;
        }
        .toolbar {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .btn {
          border: 1px solid #111;
          background: #111;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn.secondary {
          background: white;
          color: #111;
        }
        .paper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          color: #111;
          padding: 16mm;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }
        .kop {
          display: grid;
          grid-template-columns: 84px 1fr;
          gap: 12px;
          align-items: center;
        }
        .kop-title {
          font-weight: 800;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .kop-line {
          font-size: 12px;
          line-height: 1.3;
        }
        .divider {
          border-top: 2px solid #111;
          margin: 12px 0;
        }
        .surat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .surat-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .meta {
          font-size: 12px;
          min-width: 220px;
        }
        .meta > div {
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 8px;
          margin-bottom: 4px;
        }
        .meta .label { color: #333; }
        .meta .value { font-weight: 600; }
        .section {
          margin-top: 14px;
        }
        .section-title {
          font-weight: 800;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .grid {
          font-size: 12.5px;
        }
        .row {
          display: grid;
          grid-template-columns: 140px 1fr;
          margin-bottom: 4px;
        }
        .cell.label {
          font-weight: 600;
        }
        .table-obat {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          margin-top: 8px;
        }
        .table-obat th, .table-obat td {
          border: 1px solid #999;
          padding: 6px 10px;
          text-align: left;
        }
        .table-obat th {
          background-color: #f9f9f9;
        }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .penutup {
          margin-top: 28px;
          font-size: 12.5px;
          text-align: center;
          color: #555;
        }
        .ttd {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .ttd-box {
          border: 1px solid #111;
          border-radius: 10px;
          padding: 12px;
          min-height: 110px;
        }
        .spacer {
          height: 54px;
        }
        .nama {
          text-align: center;
          font-weight: 700;
        }

        @media print {
          .no-print { display: none !important; }
          .print-root { background: white; padding: 0; }
          .paper {
            box-shadow: none;
            width: auto;
            min-height: auto;
            margin: 0;
            padding: 14mm;
          }
        }
      `}</style>
    </div>
  );
}