"use client";

import { useEffect } from "react";

export default function PrintToolbar() {
  useEffect(() => {
    // auto print optional; hapus kalau tidak mau
    const t = setTimeout(() => {
      if (typeof window !== "undefined") window.print();
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="toolbar no-print">
      <button
        type="button"
        className="btn"
        onClick={() => window.print()}
      >
        Print Struk
      </button>

      <button
        type="button"
        className="btn secondary"
        onClick={() => window.close()}
      >
        Tutup
      </button>

      <style jsx>{`
        .toolbar {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 9999;
          display: flex;
          gap: 8px;
          padding: 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(6px);
          border: 1px solid #e5e7eb;
          pointer-events: auto;
        }
        .btn {
          border: 1px solid #111;
          background: #111;
          color: #fff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
        }
        .btn.secondary {
          background: #fff;
          color: #111;
        }
      `}</style>
    </div>
  );
}