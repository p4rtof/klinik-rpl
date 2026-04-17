export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <h1 className="text-4xl font-bold text-blue-600">Sistem Klinik RPL</h1>
      <p className="mt-4 text-slate-600">Selamat datang di sistem manajemen klinik.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 bg-white shadow rounded-lg border hover:border-blue-500 transition text-cyan-700">
          Pendaftaran Pasien
        </button>
        <button className="p-4 bg-white shadow rounded-lg border hover:border-blue-500 transition text-cyan-700">
          Lihat Antrean
        </button>
      </div>
    </div>
  );
}