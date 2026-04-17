import Link from "next/link";

export default function AdminLanding() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard Admin
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Pendaftaran, Kasir, dan Manajemen Pasien
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/dashboard"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              📊
            </div>
            <div className="font-bold">Dashboard</div>
          </Link>
          <Link
            href="/admin/pasien"
            className="group bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl text-center hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              👥
            </div>
            <div className="font-bold">Pasien</div>
          </Link>
          <Link
            href="/admin/jadwal"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl text-center hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              📅
            </div>
            <div className="font-bold">Jadwal</div>
          </Link>
          <Link
            href="/admin/kasir"
            className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl text-center hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              💰
            </div>
            <div className="font-bold">Kasir</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
