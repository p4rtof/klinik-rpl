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

function fmtJK(jk: string) {
  if (jk === "LAKI_LAKI") return "Laki-laki";
  if (jk === "PEREMPUAN") return "Perempuan";
  return jk || "-";
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
          diagnosis: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { penyakit: true }
          },
          rekamMedisTindakan: {
            include: { tindakan: true }
          },
        },
      },
    },
  });

  if (!rujukan || !rujukan.rekamMedis) return notFound();

  const rm = rujukan.rekamMedis;
  const pasien = rm.pasien;
  const dokter = rm.dokter;

  const diagnosaDokter = rm.diagnosis?.[0]?.penyakit?.namaPenyakit ?? rm.diagnosis?.[0]?.catatan ?? "-";
  const tindakanString = rm.rekamMedisTindakan?.map((rt: any) => rt.tindakan?.namaTindakan).join(", ") || "-";
  const umur = pasien.tanggalLahir ? hitungUmur(pasien.tanggalLahir) : "";

  return (
    <div className="print-root text-black">
      <PrintToolbar />

      <div className="paper">
        {/* ===================== KOP ===================== */}
        <div className="kop">
          <div className="kop-logo">
            <Image src="/logo.svg" alt="Logo Klinik" width={88} height={88} priority />
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

        {/* ===================== HEADER SURAT ===================== */}
        <div className="surat-header">
          <div className="surat-title">SURAT RUJUKAN</div>

          <div className="meta">
            <div className="meta-row">
              <div className="meta-label">No. Surat</div>
              <div className="meta-value">: {rujukan.nomorSurat ?? "-"}</div>
            </div>
            <div className="meta-row">
              <div className="meta-label">Tanggal</div>
              <div className="meta-value">: {formatTanggalIndo(new Date(rujukan.tanggalRujukan))}</div>
            </div>
            <div className="meta-row">
              <div className="meta-label">Status</div>
              <div className="meta-value">: {rujukan.status}</div>
            </div>
          </div>
        </div>

        {/* ===================== DATA PASIEN ===================== */}
        <div className="section">
          <div className="section-title">DATA PASIEN</div>
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
              <div className="cell">: {fmtJK(pasien.jenisKelamin)}</div>
            </div>
            <div className="row">
              <div className="cell label">Tgl Lahir / Umur</div>
              <div className="cell">
                : {pasien.tanggalLahir} {umur ? `(${umur})` : ""}
              </div>
            </div>
            {pasien.noTelepon && (
              <div className="row">
                <div className="cell label">No. Telepon</div>
                <div className="cell">: {pasien.noTelepon}</div>
              </div>
            )}
            {pasien.alamat && (
              <div className="row">
                <div className="cell label">Alamat</div>
                <div className="cell">: {pasien.alamat}</div>
              </div>
            )}
          </div>
        </div>

        {/* ===================== ANAMNESIS ===================== */}
        <div className="section">
          <div className="section-title">ANAMNESIS</div>
          <div className="grid">
            <div className="row">
              <div className="cell label">Keluhan Utama</div>
              <div className="cell">: {rm.anamnesisKeluhanUtama ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Riwayat Penyakit Sekarang</div>
              <div className="cell">: {rm.anamnesisRps ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Riwayat Penyakit Dahulu</div>
              <div className="cell">: {rm.anamnesisRpd ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Riwayat Obat</div>
              <div className="cell">: {rm.anamnesisRiwayatObat ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Riwayat Keluarga</div>
              <div className="cell">: {rm.anamnesisRiwayatKeluarga ?? "-"}</div>
            </div>
            <div className="row">
              <div className="cell label">Kebiasaan</div>
              <div className="cell">: {rm.anamnesisKebiasaan ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* ===================== DIAGNOSIS & TINDAKAN ===================== */}
        <div className="section">
          <div className="section-title">DIAGNOSIS &amp; TINDAKAN</div>
          <div className="grid">
            <div className="row">
              <div className="cell label">Diagnosis</div>
              <div className="cell">: {diagnosaDokter}</div>
            </div>
            <div className="row">
              <div className="cell label">Tindakan</div>
              <div className="cell">: {tindakanString}</div>
            </div>
          </div>
        </div>

        {/* ===================== KETERANGAN RUJUKAN ===================== */}
        <div className="section rujukan-box">
          <div className="section-title">KETERANGAN RUJUKAN</div>
          <div className="grid">
            <div className="row">
              <div className="cell label">Dirujuk ke</div>
              <div className="cell">: {rujukan.tujuan}</div>
            </div>
            {rujukan.poliTujuan && (
              <div className="row">
                <div className="cell label">Poli Tujuan</div>
                <div className="cell">: {rujukan.poliTujuan}</div>
              </div>
            )}
            <div className="row">
              <div className="cell label">Diagnosa</div>
              <div className="cell">: {diagnosaDokter}</div>
            </div>

            <div className="row">
              <div className="cell label">Keterangan</div>
              <div className="cell">: {rujukan.keterangan ?? "-"}</div>
            </div>

            {rm.rujukanCatatan && (
              <div className="row">
                <div className="cell label">Catatan Rujukan</div>
                <div className="cell">: {rm.rujukanCatatan}</div>
              </div>
            )}
          </div>
        </div>

        {/* ===================== PENUTUP & TTD ===================== */}
        <div className="penutup">
          <div>Demikian surat rujukan ini dibuat untuk dipergunakan sebagaimana mestinya.</div>

          <div className="ttd">
            <div className="ttd-box" style={{ border: "none" }} />
            <div className="ttd-box">
              <div style={{ textAlign: "center" }}>Dokter Pemeriksa</div>
              <div className="spacer" />
              <div className="nama">( {dokter?.namaLengkap ?? "................................"} )</div>
              {dokter?.str && <div className="sub-nama">STR: {dokter.str}</div>}
              {dokter?.sip && <div className="sub-nama">SIP: {dokter.sip}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== STYLES ===================== */}
      <style>{`
        .print-root { padding: 16px; background: #f5f5f5; min-height: 100vh; }
        .paper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          color: #111;
          padding: 14mm 16mm;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          font-family: "Times New Roman", serif;
          font-size: 12.5px;
        }

        .kop {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 12px;
          align-items: center;
        }
        .kop-title { font-weight: 900; font-size: 18px; font-family: Arial, sans-serif; margin-bottom: 2px; }
        .kop-line { font-size: 11.5px; line-height: 1.35; font-family: Arial, sans-serif; }
        .divider { border-top: 2.5px solid #111; margin: 10px 0 12px; }

        .surat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 8px;
        }
        .surat-title {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.5px;
          font-family: Arial, sans-serif;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .meta {
          font-size: 11.5px;
          min-width: 240px;
          font-family: Arial, sans-serif;
        }
        .meta-row {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 6px;
          margin-bottom: 3px;
        }
        .meta-label { color: #333; font-weight: 700; }
        .meta-value { font-weight: 700; }

        .section { margin-top: 12px; }
        .section-title {
          font-weight: 900;
          font-size: 12.5px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 2px;
          margin-bottom: 7px;
        }

        .grid { font-size: 12px; }
        .row {
          display: grid;
          grid-template-columns: 170px 1fr;
          margin-bottom: 3px;
        }
        .cell.label { font-weight: 700; }

        .rujukan-box {
          background: #f7f8ff;
          border: 1.5px solid #c9cfea;
          border-radius: 10px;
          padding: 10px 12px 6px;
          margin-top: 12px;
        }

        .penutup { margin-top: 16px; font-size: 12px; font-family: Arial, sans-serif; }
        .ttd {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ttd-box {
          border: 1px solid #111;
          border-radius: 10px;
          padding: 12px;
          min-height: 110px;
          font-size: 12px;
        }
        .spacer { height: 54px; }
        .nama { text-align: center; font-weight: 900; margin-top: 4px; }
        .sub-nama { text-align: center; font-size: 10.5px; color: #444; margin-top: 2px; }

        @media print {
          .no-print { display: none !important; }
          .print-root { background: white; padding: 0; }
          .paper { box-shadow: none; width: auto; min-height: auto; margin: 0; padding: 12mm 14mm; }
        }
      `}</style>
    </div>
  );
}