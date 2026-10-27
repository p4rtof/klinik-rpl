"use client";

export default function PrintToolbar() {
  return (
    <div className="no-print toolbar">
      <button onClick={() => window.print()} className="btn">
        Print
      </button>
      <a href="/pembayaran" className="btn secondary">
        Kembali
      </a>
    </div>
  );
}