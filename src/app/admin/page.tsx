import Link from "next/link";

export default function AdminLanding() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Portal Administrator Klinik</h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Pusat kendali untuk pendaftaran, manajemen antrean, dan kasir. Pilih menu di bawah untuk mulai bekerja.
          </p>
        </div>
        {/* Icon Background Transparan */}
        <div className="absolute -right-4 -top-10 opacity-10 text-[12rem] pointer-events-none">
          🏥
        </div>
      </div>

      {/* Grid Menu Utama */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Menu Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Link href="/admin/dashboard" className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-500 hover:shadow-md hover:-translate-y-1 transition-all text-left">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
              📊
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Dashboard</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Lihat ringkasan statistik dan antrean aktif hari ini.</p>
          </Link>
          
          <Link href="/admin/pasien" className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-500 hover:shadow-md hover:-translate-y-1 transition-all text-left">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
              👥
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Data Pasien</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Input pasien baru & kelola riwayat rekam medis.</p>
          </Link>

          <Link href="/admin/jadwal" className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-500 hover:shadow-md hover:-translate-y-1 transition-all text-left">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
              📅
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Jadwal Dokter</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Atur daftar antrean pasien yang akan diperiksa.</p>
          </Link>

          <Link href="/admin/kasir" className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-500 hover:shadow-md hover:-translate-y-1 transition-all text-left">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
              💰
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Kasir Klinik</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Proses pembayaran tagihan dan cetak struk/kuitansi.</p>
          </Link>

        </div>
      </div>

      {/* Info Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
           <div className="p-3 bg-amber-50 rounded-full text-2xl">💡</div>
           <div>
             <h4 className="font-bold text-slate-800 mb-1">Pusat Bantuan</h4>
             <p className="text-sm text-slate-500">Pastikan untuk selalu mengecek kesesuaian NIK dan nama pasien saat melakukan pendaftaran baru agar tidak terjadi data ganda.</p>
           </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
           <div className="p-3 bg-emerald-50 rounded-full text-2xl">🛡️</div>
           <div>
             <h4 className="font-bold text-slate-800 mb-1">Status Sistem</h4>
             <p className="text-sm text-slate-500 mb-2">Penyimpanan lokal (LocalStorage) berfungsi dengan baik.</p>
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistem Online
             </span>
           </div>
         </div>
      </div>
    </div>
  );
}