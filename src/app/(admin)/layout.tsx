 
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-teal-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-teal-500">
          Klinik App
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Menu aktif */}
          <a href="#" className="block py-2 px-4 bg-teal-800 rounded-lg">Dashboard</a>
          {/* Menu lain */}
          <a href="#" className="block py-2 px-4 hover:bg-teal-500 rounded-lg">Data Pasien</a>
          <a href="#" className="block py-2 px-4 hover:bg-teal-500 rounded-lg">Pembayaran</a>
        </nav>
      </aside>

      {/* Area Kanan */}
      <div className="flex-1 flex flex-col">
        
        {/* Header Atas */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span>Halo, Admin!</span>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div> {/* Avatar */}
          </div>
        </header>

        {/* Konten Utama (Berubah-ubah sesuai halaman) */}
        <main className="p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}