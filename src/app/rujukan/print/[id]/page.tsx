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
  // tanggalLahir di schema kamu string "YYYY-MM-DD"
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

export default async function PrintRujukanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rujukan = await prisma.rujukan.findUnique({
    where: { id },
    include: {
      rekamMedis: {
        include: {
          pasien: true,
          dokter: true,
        },
      },
    },
  });

  if (!rujukan) return notFound();

  const pasien = rujukan.rekamMedis.pasien;
  const dokter = rujukan.rekamMedis.dokter;

  const umur = pasien.tanggalLahir ? hitungUmur(pasien.tanggalLahir) : "";

  return (
    <div className="print-root">
     <PrintToolbar />

      <div className="paper">
        {/* KOP */}
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
          <div className="surat-title">SURAT RUJUKAN</div>

          <div className="meta">
            <div>
              <span className="label">No. Surat</span>
              <span className="value">{rujukan.nomorSurat ?? "-"}</span>
            </div>
            <div>
              <span className="label">Tanggal</span>
              <span className="value">{formatTanggalIndo(rujukan.tanggalRujukan)}</span>
            </div>
            <div>
              <span className="label">Status</span>
              <span className="value">{rujukan.status}</span>
            </div>
          </div>
        </div>

        {/* Data Pasien */}
        <div className="section">
          <div className="section-title">Data Pasien</div>
          <div className="grid">
            <div className="row">
              <div className="cell label">Nama</div>
              <div className="cell">: {pasien.nama}</div>
            </div>
            <div className="row">
              <div className="cell label">No. RM</div>
              <div className="cell">: {pasien.noRm}</div>
            </div>
            <div className="row">
              <div className="cell label">Jenis Kelamin</div>
              <div className="cell">: {pasien.jenisKelamin}</div>
            </div>
            <div className="row">
              <div className="cell label">Tgl Lahir / Umur</div>
              <div className="cell">
                : {pasien.tanggalLahir} {umur ? `(${umur})` : ""}
              </div>
            </div>
            <div className="row">
              <div className="cell label">No. Telepon</div>
              <div className="cell">: {pasien.noTelepon ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Alamat</div>
              <div className="cell">: {pasien.alamat ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* Isi Rujukan */}
        <div className="section">
          <div className="section-title">Rujukan</div>
          <div className="grid">
            <div className="row">
              <div className="cell label">Tujuan</div>
              <div className="cell">: {rujukan.tujuan}</div>
            </div>
            {/* <div className="row">
              <div className="cell label">Poli Tujuan</div>
              <div className="cell">: {rujukan.poliTujuan ?? "-"}</div>
            </div> */}
            <div className="row">
              <div className="cell label">Diagnosa</div>
              <div className="cell">: {rujukan.diagnosa ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Keterangan</div>
              <div className="cell">: {rujukan.keterangan ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* Penutup + TTD */}
        <div className="penutup">
          <div>Demikian surat rujukan ini dibuat untuk dipergunakan sebagaimana mestinya.</div>

          <div className="ttd">
            <div className="ttd-box">
              <div>Dokter Pemeriksa</div>
              <div className="spacer" />
              <div className="nama">( {dokter.namaLengkap ?? "................................"} )</div>
            </div>
            <div className="ttd-box">
              <div>Stempel Klinik</div>
              <div className="spacer stamp" />
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
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

        .penutup {
          margin-top: 18px;
          font-size: 12.5px;
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
        .spacer.stamp {
          border: 1px dashed #999;
          border-radius: 8px;
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