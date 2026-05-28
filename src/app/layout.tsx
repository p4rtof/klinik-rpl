import { Poppins } from "next/font/google";
import "./globals.css";

// 1. Panggil Poppins dan atur ketebalan (weight) yang mau dipakai
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"] 
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* 2. Terapkan class Poppins ke body */}
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}