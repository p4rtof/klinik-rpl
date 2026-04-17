import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Administrasi Klinik Dokter Umum",
  description: "Sistem klinik dengan LocalStorage - Admin & Dokter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-black antialiased font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6 md:p-8">{children}</main>
      </body>
    </html>
  );
}
