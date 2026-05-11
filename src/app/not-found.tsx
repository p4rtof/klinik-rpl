import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="text-3xl font-bold mt-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 mt-2 text-lg">Maaf, halaman yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
      
      <Link 
        href="/login" 
        className="mt-8 bg-green-theme hover:bg-green-theme-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
      >
        Kembali ke Login
      </Link>
    </div>
  );
}