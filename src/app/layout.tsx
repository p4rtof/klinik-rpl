import type { Metadata } from "next";
import "./globals.css"; // Tetap import ini karena font Calibri diatur di sini

export const metadata: Metadata = {
  title: "Klinik dr. Yofli",
  description: "Sistem Manajemen Klinik RPL",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Cukup bersihkan bagian className bawaan Inter tadi */}
      <body className="bg-[#F4F7FE] min-h-screen text-black antialiased">
        {children}
      </body>
    </html>
  );
}