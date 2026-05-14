"use client";

import React, { useEffect } from "react";

export default function PrintToolbar() {
  useEffect(() => {
    // Otomatis print pas halaman struk kebuka
    setTimeout(() => window.print(), 800);
  }, []);

  return (
    <div className="no-print toolbar">
      <button onClick={() => window.print()} className="btn">
        Print Struk
      </button>
      <a href="/pembayaran" className="btn secondary">
        Kembali
      </a>
    </div>
  );
}