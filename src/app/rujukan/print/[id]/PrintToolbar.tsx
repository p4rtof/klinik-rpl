"use client";

export default function PrintToolbar() {
  return (
    <div className="toolbar no-print">
      <button className="btn" onClick={() => window.print()}>
        Print
      </button>
      <a className="btn secondary" href="/pembayaran">
        Kembali
      </a>

      <style jsx>{`
        .toolbar { display:flex; gap:8px; margin-bottom: 12px; }
        .btn {
          border: 1px solid #111;
          background: #111;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
        }
        .btn.secondary { background: #fff; color:#111; }
      `}</style>
    </div>
  );
}