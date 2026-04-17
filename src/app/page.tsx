export default function KlinikPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Sistem Informasi Klinik</h1>
          <p className="text-slate-500">Manajemen Pendaftaran Pasien Baru</p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-6 text-slate-700">Form Pendaftaran</h2>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Nama Lengkap</label>
              <input type="text" className="w-full p-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama pasien" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Nomor NIK</label>
              <input type="number" className="w-full p-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="16 digit NIK" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Pilih Poli</label>
              <select className="w-full p-2 border rounded-md text-black bg-white">
                <option>Poli Umum</option>
                <option>Poli Gigi</option>
                <option>Poli Anak</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-600">Keluhan</label>
              <textarea className="w-full p-2 border rounded-md text-black h-24" placeholder="Jelaskan keluhan singkat pasien..."></textarea>
            </div>

            <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition">
              Daftarkan Pasien
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}