import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
  let umur = today.getFullYear() - birth.getFullYear();
  const mdiff = today.getMonth() - birth.getMonth();
  if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) umur--;
  return `${umur} tahun`;
}

function PrintToolbar() {
  return (
    <div className="toolbar no-print">
      <a
        className="btn"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.print();
        }}
      >
        Print
      </a>
      <a className="btn secondary" href="/pembayaran">
        Kembali
      </a>
    </div>
  );
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
          },
          resep: true,
        },
      },
    },
  });

  if (!rujukan || !rujukan.rekamMedis) return notFound();

  const rm = rujukan.rekamMedis;
  const pasien = rm.pasien;
  const dokter = rm.dokter;

  // schema kamu sekarang: Diagnosis.diagnosis
  const diagnosaDokter = rm.diagnosis?.[0]?.diagnosis ?? "-";

  return (
    <div className="print-root">
      <PrintToolbar />

      <div className="paper">
        {/* KOP */}
        <div className="kop">
          <div>
            <Image
              src="/logo.png"
              alt="Logo Klinik"
              width={72}
              height={72}
              priority
            />
          </div>
          <div>
            <div className="kop-title">Klinik dr.Yofli</div>
            <div className="kop-line">Alamat Klinik (isi di sini)</div>
            <div className="kop-line">Telp: (isi di sini)</div>
          </div>
        </div>
        <div className="divider" />

        {/* HEADER */}
        <div className="surat-header">
          <div className="surat-title">SURAT RUJUKAN</div>
          <div className="meta">
            <div>
              <div className="label">No</div>
              <div className="value">: {rujukan.nomorSurat ?? "-"}</div>
            </div>
            <div>
              <div className="label">Tanggal</div>
              <div className="value">: {formatTanggalIndo(rujukan.tanggalRujukan)}</div>
            </div>
          </div>
        </div>

        {/* DATA PASIEN */}
        <div className="section">
          <div className="section-title">Data Pasien</div>
          <div className="grid2col">
            <div className="row">
              <div className="cell label">Nama</div>
              <div className="cell">: {pasien.nama}</div>
            </div>
            <div className="row">
              <div className="cell label">No RM</div>
              <div className="cell">: {pasien.noRm}</div>
            </div>
            <div className="row">
              <div className="cell label">Jenis Kelamin</div>
              <div className="cell">
                : {pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
              </div>
            </div>
            <div className="row">
              <div className="cell label">Tanggal Lahir</div>
              <div className="cell">
                : {pasien.tanggalLahir} ({hitungUmur(pasien.tanggalLahir)})
              </div>
            </div>
            {pasien.alamat && (
              <div className="row-full">
                <div className="cell label">Alamat</div>
                <div className="cell">: {pasien.alamat}</div>
              </div>
            )}
          </div>
        </div>

        {/* RINGKASAN PEMERIKSAAN */}
        <div className="section">
          <div className="section-title">Ringkasan Pemeriksaan</div>
          <div className="grid2col">
            <div className="row-full">
              <div className="cell label">Keluhan</div>
              <div className="cell">: {rm.keluhan}</div>
            </div>
            {rm.tindakan && (
              <div className="row-full">
                <div className="cell label">Tindakan</div>
                <div className="cell">: {rm.tindakan}</div>
              </div>
            )}
            <div className="row-full">
              <div className="cell label">Diagnosa Dokter</div>
              <div className="cell">: {diagnosaDokter}</div>
            </div>
            {rm.catatanTambahan && (
              <div className="row-full">
                <div className="cell label">Catatan</div>
                <div className="cell">: {rm.catatanTambahan}</div>
              </div>
            )}
          </div>
        </div>

        {/* DETAIL RUJUKAN */}
        <div className="section rujukan-box">
          <div className="section-title">Keterangan Rujukan</div>
          <div className="grid2col">
            <div className="row-full">
              <div className="cell label">Dirujuk ke</div>
              <div className="cell">: {rujukan.tujuan}</div>
            </div>

            {rujukan.poliTujuan && (
              <div className="row-full">
                <div className="cell label">Poli Tujuan</div>
                <div className="cell">: {rujukan.poliTujuan}</div>
              </div>
            )}

            <div className="row-full">
              <div className="cell label">Diagnosa</div>
              <div className="cell">: {diagnosaDokter}</div>
            </div>

            <div className="row-full">
              <div className="cell label">Keterangan</div>
              <div className="cell">: {rujukan.keterangan ?? "-"}</div>
            </div>

            {rm.rujukanCatatan && (
              <div className="row-full">
                <div className="cell label">Catatan Rujukan</div>
                <div className="cell">: {rm.rujukanCatatan}</div>
              </div>
            )}
          </div>
        </div>

        {/* PENUTUP + TTD */}
        <div className="penutup">
          <div>Demikian surat rujukan ini dibuat untuk dipergunakan sebagaimana mestinya.</div>

          <div className="ttd">
            <div className="ttd-box">
              <div>Dokter Pemeriksa</div>
              <div className="spacer" />
              <div className="nama">( {dokter.namaLengkap ?? "................................"} )</div>
              {dokter.str && <div className="sub-nama">STR: {dokter.str}</div>}
            </div>
            <div className="ttd-box">
              <div>Stempel Klinik</div>
              <div className="spacer stamp" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .print-root { padding: 16px; background: #f5f5f5; min-height: 100vh; }
        .toolbar { display:flex; gap:8px; margin-bottom: 12px; }
        .btn { border: 1px solid #111; background:#111; color:#fff; padding:8px 12px; border-radius:8px; font-size:14px; text-decoration:none; }
        .btn.secondary { background:#fff; color:#111; }

        .paper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          color: #111;
          padding: 14mm 16mm;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          font-family: 'Times New Roman', serif;
          font-size: 12.5px;
        }

        .kop { display:grid; grid-template-columns:72px 1fr; gap:12px; align-items:center; }
        .kop-title { font-weight:800; font-size:17px; margin-bottom:3px; font-family: Arial, sans-serif; }
        .kop-line { font-size:11.5px; line-height:1.4; font-family: Arial, sans-serif; }
        .divider { border-top: 2.5px solid #111; margin: 10px 0; }

        .surat-header { display:flex; justify-content:space-between; gap:12px; margin-bottom:6px; }
        .surat-title { font-size:18px; font-weight:900; letter-spacing:1px; font-family: Arial, sans-serif; text-decoration: underline; text-underline-offset: 3px; }
        .meta { font-size:11.5px; min-width:200px; font-family: Arial, sans-serif; }
        .meta > div { display:grid; grid-template-columns:70px 1fr; gap:4px; margin-bottom:3px; }
        .meta .label { color:#444; }
        .meta .value { font-weight:700; }

        .section { margin-top:11px; }
        .section-title { font-weight:800; font-size:12.5px; font-family: Arial, sans-serif; border-bottom:1px solid #ccc; padding-bottom:2px; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.4px; }
        .grid2col { font-size:12px; }
        .row { display:grid; grid-template-columns:140px 1fr; margin-bottom:3px; }
        .row-full { display:grid; grid-template-columns:160px 1fr; margin-bottom:3px; }
        .cell.label { font-weight:700; }

        .rujukan-box { background:#f8f9ff; border:1.5px solid #c0c8e8; border-radius:8px; padding:8px 12px 4px; margin-top:12px; }
        .rujukan-box .section-title { border-bottom-color:#b0b8d8; color:#2a3a7a; }

        .penutup { margin-top:16px; font-size:12px; font-family: Arial, sans-serif; }
        .ttd { margin-top:14px; display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .ttd-box { border:1px solid #111; border-radius:8px; padding:10px; min-height:100px; font-size:12px; }
        .spacer { height:48px; }
        .spacer.stamp { border:1px dashed #999; border-radius:8px; }
        .nama { text-align:center; font-weight:800; margin-top:4px; }
        .sub-nama { text-align:center; font-size:10.5px; color:#555; margin-top:2px; }

        @media print {
          .no-print { display:none !important; }
          .print-root { background:white; padding:0; }
          .paper { box-shadow:none; width:auto; min-height:auto; margin:0; padding:12mm 14mm; }
        }
      `}</style>
    </div>
  );
}