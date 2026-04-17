export default function DokterPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Antrean Poli Umum</h1>
      
      {/* Contoh 1 Pasien dari Antrean */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-4">
        <h2 className="text-lg font-bold">Pasien: Fadhla (20 Tahun)</h2>
        <p className="text-slate-600 mb-4">Keluhan Awal: Pusing dan demam sejak kemarin.</p>
        
        <form className="flex flex-col gap-4">
          <textarea placeholder="Diagnosa Dokter..." className="border p-2 rounded h-24"></textarea>
          <textarea placeholder="Resep Obat..." className="border p-2 rounded h-24"></textarea>
          
          <button type="button" className="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
            Selesai Periksa
          </button>
        </form>
      </div>
    </div>
  );
}