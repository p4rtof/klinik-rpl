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
          diagnosis: true,
          resep: true,
        },
      },
    },
  });

  if (!rujukan) return notFound();

  const pasien = rujukan.rekamMedis.pasien;
  const dokter = rujukan.rekamMedis.dokter;
  const rm = rujukan.rekamMedis;
  const umur = pasien.tanggalLahir ? hitungUmur(pasien.tanggalLahir) : "";

  // Cek apakah ada data TTV
  const adaTTV =
    rm.tdSistolik || rm.tdDiastolik || rm.nadi || rm.rr ||
    rm.suhu || rm.spo2 || rm.bb || rm.tb;

  // Cek apakah ada data Anamnesis
  const adaAnamnesis =
    rm.anamnesisKeluhanUtama || rm.anamnesisRps || rm.anamnesisRpd ||
    rm.anamnesisRiwayatObat || rm.anamnesisRiwayatKeluarga || rm.anamnesisKebiasaan;

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

        {/* ================================================================ */}
        {/* DATA PASIEN                                                       */}
        {/* ================================================================ */}
        <div className="section">
          <div className="section-title">Data Pasien</div>
          <div className="grid2col">
            <div className="row"><div className="cell label">Nama</div><div className="cell">: {pasien.nama}</div></div>
            <div className="row"><div className="cell label">No. RM</div><div className="cell">: {pasien.noRm}</div></div>
            <div className="row"><div className="cell label">Jenis Kelamin</div><div className="cell">: {pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</div></div>
            <div className="row"><div className="cell label">Tgl Lahir / Umur</div><div className="cell">: {pasien.tanggalLahir} {umur ? `(${umur})` : ""}</div></div>
            <div className="row"><div className="cell label">No. Telepon</div><div className="cell">: {pasien.noTelepon ?? "-"}</div></div>
            <div className="row"><div className="cell label">Alamat</div><div className="cell">: {pasien.alamat ?? "-"}</div></div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* ANAMNESIS                                                         */}
        {/* ================================================================ */}
        {adaAnamnesis && (
          <div className="section">
            <div className="section-title">Anamnesis</div>
            <div className="grid2col">
              {rm.anamnesisKeluhanUtama && (
                <div className="row-full">
                  <div className="cell label">Keluhan Utama</div>
                  <div className="cell">: {rm.anamnesisKeluhanUtama}</div>
                </div>
              )}
              {rm.anamnesisRps && (
                <div className="row-full">
                  <div className="cell label">Riwayat Penyakit Sekarang</div>
                  <div className="cell">: {rm.anamnesisRps}</div>
                </div>
              )}
              {rm.anamnesisRpd && (
                <div className="row-full">
                  <div className="cell label">Riwayat Penyakit Dahulu</div>
                  <div className="cell">: {rm.anamnesisRpd}</div>
                </div>
              )}
              {rm.anamnesisRiwayatObat && (
                <div className="row-full">
                  <div className="cell label">Riwayat Obat</div>
                  <div className="cell">: {rm.anamnesisRiwayatObat}</div>
                </div>
              )}
              {rm.anamnesisRiwayatKeluarga && (
                <div className="row-full">
                  <div className="cell label">Riwayat Keluarga</div>
                  <div className="cell">: {rm.anamnesisRiwayatKeluarga}</div>
                </div>
              )}
              {rm.anamnesisKebiasaan && (
                <div className="row-full">
                  <div className="cell label">Kebiasaan</div>
                  <div className="cell">: {rm.anamnesisKebiasaan}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PEMERIKSAAN FISIK / TTV                                           */}
        {/* ================================================================ */}
        {adaTTV && (
          <div className="section">
            <div className="section-title">Pemeriksaan Fisik &amp; Tanda-Tanda Vital</div>

            {/* Grid TTV 4 kolom */}
            <div className="ttv-grid">
              {rm.tdSistolik && rm.tdDiastolik && (
                <div className="ttv-box">
                  <div className="ttv-label">Tekanan Darah</div>
                  <div className="ttv-value">{rm.tdSistolik}/{rm.tdDiastolik} <span className="ttv-unit">mmHg</span></div>
                </div>
              )}
              {rm.nadi && (
                <div className="ttv-box">
                  <div className="ttv-label">Nadi</div>
                  <div className="ttv-value">{rm.nadi} <span className="ttv-unit">x/menit</span></div>
                </div>
              )}
              {rm.rr && (
                <div className="ttv-box">
                  <div className="ttv-label">Laju Napas (RR)</div>
                  <div className="ttv-value">{rm.rr} <span className="ttv-unit">x/menit</span></div>
                </div>
              )}
              {rm.suhu && (
                <div className="ttv-box">
                  <div className="ttv-label">Suhu</div>
                  <div className="ttv-value">{rm.suhu} <span className="ttv-unit">°C</span></div>
                </div>
              )}
              {rm.spo2 && (
                <div className="ttv-box">
                  <div className="ttv-label">SpO2</div>
                  <div className="ttv-value">{rm.spo2} <span className="ttv-unit">%</span></div>
                </div>
              )}
              {rm.bb && (
                <div className="ttv-box">
                  <div className="ttv-label">Berat Badan</div>
                  <div className="ttv-value">{rm.bb} <span className="ttv-unit">kg</span></div>
                </div>
              )}
              {rm.tb && (
                <div className="ttv-box">
                  <div className="ttv-label">Tinggi Badan</div>
                  <div className="ttv-value">{rm.tb} <span className="ttv-unit">cm</span></div>
                </div>
              )}
              {rm.bmi && (
                <div className="ttv-box">
                  <div className="ttv-label">BMI</div>
                  <div className="ttv-value">{rm.bmi} <span className="ttv-unit">kg/m²</span></div>
                </div>
              )}
            </div>

            {rm.pemeriksaanFisik && (
              <div className="row-full" style={{ marginTop: "6px" }}>
                <div className="cell label">Pemeriksaan Fisik</div>
                <div className="cell">: {rm.pemeriksaanFisik}</div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* DIAGNOSIS & TINDAKAN                                              */}
        {/* ================================================================ */}
        <div className="section">
          <div className="section-title">Diagnosis &amp; Tindakan</div>
          <div className="grid2col">
            <div className="row-full">
              <div className="cell label">Diagnosis</div>
              <div className="cell">
                :{" "}
                {rm.diagnosis && rm.diagnosis.length > 0
                  ? rm.diagnosis.map((d: any) => d.diagnosis).join(", ")
                  : "-"}
              </div>
            </div>
            {rm.tindakan && (
              <div className="row-full">
                <div className="cell label">Tindakan</div>
                <div className="cell">: {rm.tindakan}</div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* RESEP OBAT                                                        */}
        {/* ================================================================ */}
        {rm.resep && rm.resep.length > 0 && (
          <div className="section">
            <div className="section-title">Resep Obat yang Diberikan</div>
            <table className="table-obat">
              <thead>
                <tr>
                  <th style={{ width: "30px", textAlign: "center" }}>No</th>
                  <th>Nama Obat</th>
                  <th>Jumlah</th>
                  <th>Aturan Pakai</th>
                </tr>
              </thead>
              <tbody>
                {rm.resep.map((r: any, i: number) => (
                  <tr key={i}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>{r.obatId}</td>
                    <td>{r.dosis}</td>
                    <td>{r.aturan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================ */}
        {/* EDUKASI & CATATAN TAMBAHAN                                        */}
        {/* ================================================================ */}
        {(rm.edukasiPasien || rm.catatanTambahan) && (
          <div className="section">
            <div className="section-title">Edukasi &amp; Catatan Dokter</div>
            <div className="grid2col">
              {rm.edukasiPasien && (
                <div className="row-full">
                  <div className="cell label">Edukasi Pasien</div>
                  <div className="cell">: {rm.edukasiPasien}</div>
                </div>
              )}
              {rm.catatanTambahan && (
                <div className="row-full">
                  <div className="cell label">Catatan Tambahan</div>
                  <div className="cell">: {rm.catatanTambahan}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* DETAIL RUJUKAN                                                    */}
        {/* ================================================================ */}
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
              <div className="cell label">Diagnosa Rujukan</div>
              <div className="cell">: {rujukan.diagnosa ?? "-"}</div>
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

        {/* ================================================================ */}
        {/* PENUTUP + TTD                                                     */}
        {/* ================================================================ */}
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

      {/* ================================================================ */}
      {/* STYLES                                                             */}
      {/* ================================================================ */}
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

        /* ---- PAPER ---- */
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

        /* ---- KOP ---- */
        .kop {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 12px;
          align-items: center;
        }
        .kop-title {
          font-weight: 800;
          font-size: 17px;
          margin-bottom: 3px;
          font-family: Arial, sans-serif;
        }
        .kop-line { font-size: 11.5px; line-height: 1.4; font-family: Arial, sans-serif; }
        .divider { border-top: 2.5px solid #111; margin: 10px 0; }

        /* ---- HEADER ---- */
        .surat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 6px;
        }
        .surat-title {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1px;
          font-family: Arial, sans-serif;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .meta { font-size: 11.5px; min-width: 200px; font-family: Arial, sans-serif; }
        .meta > div {
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 4px;
          margin-bottom: 3px;
        }
        .meta .label { color: #444; }
        .meta .value { font-weight: 700; }

        /* ---- SECTIONS ---- */
        .section { margin-top: 11px; }
        .section-title {
          font-weight: 800;
          font-size: 12.5px;
          font-family: Arial, sans-serif;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        /* ---- GRID ROWS ---- */
        .grid2col { font-size: 12px; }
        .row {
          display: grid;
          grid-template-columns: 140px 1fr;
          margin-bottom: 3px;
        }
        .row-full {
          display: grid;
          grid-template-columns: 160px 1fr;
          margin-bottom: 3px;
        }
        .cell.label { font-weight: 700; }

        /* ---- TTV GRID ---- */
        .ttv-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 6px;
        }
        .ttv-box {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 5px 8px;
          background: #fafafa;
        }
        .ttv-label {
          font-size: 10px;
          font-weight: 700;
          color: #555;
          text-transform: uppercase;
          font-family: Arial, sans-serif;
        }
        .ttv-value {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          margin-top: 2px;
        }
        .ttv-unit {
          font-size: 10px;
          font-weight: 400;
          color: #666;
        }

        /* ---- TABLE OBAT ---- */
        .table-obat {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-top: 4px;
        }
        .table-obat th, .table-obat td {
          border: 1px solid #aaa;
          padding: 5px 8px;
          text-align: left;
        }
        .table-obat thead { background-color: #f0f0f0; font-weight: 800; font-family: Arial, sans-serif; }

        /* ---- RUJUKAN BOX ---- */
        .rujukan-box {
          background: #f8f9ff;
          border: 1.5px solid #c0c8e8;
          border-radius: 8px;
          padding: 8px 12px 4px;
          margin-top: 12px;
        }
        .rujukan-box .section-title { border-bottom-color: #b0b8d8; color: #2a3a7a; }

        /* ---- PENUTUP + TTD ---- */
        .penutup {
          margin-top: 16px;
          font-size: 12px;
          font-family: Arial, sans-serif;
        }
        .ttd {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ttd-box {
          border: 1px solid #111;
          border-radius: 8px;
          padding: 10px;
          min-height: 100px;
          font-size: 12px;
        }
        .spacer { height: 48px; }
        .spacer.stamp { border: 1px dashed #999; border-radius: 8px; }
        .nama { text-align: center; font-weight: 800; margin-top: 4px; }
        .sub-nama { text-align: center; font-size: 10.5px; color: #555; margin-top: 2px; }

        @media print {
          .no-print { display: none !important; }
          .print-root { background: white; padding: 0; }
          .paper {
            box-shadow: none;
            width: auto;
            min-height: auto;
            margin: 0;
            padding: 12mm 14mm;
          }
        }
      `}</style>
    </div>
  );
}