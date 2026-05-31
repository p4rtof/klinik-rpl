"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  username: string;
  role: "ADMIN" | "DOKTER";
  namaLengkap: string | null;
  spesialisasi: string | null;
  noTelepon: string | null;

  // tambahan
  fotoUrl: string | null;
  sip: string | null;
  str: string | null;
};

export default function ProfilDokterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    namaLengkap: "",
    spesialisasi: "",
    noTelepon: "",
    fotoUrl: "",
    sip: "",
    str: "",
  });

  const initial = useMemo(
    () => ({
      namaLengkap: profile?.namaLengkap ?? "",
      spesialisasi: profile?.spesialisasi ?? "",
      noTelepon: profile?.noTelepon ?? "",
      fotoUrl: profile?.fotoUrl ?? "",
      sip: profile?.sip ?? "",
      str: profile?.str ?? "",
    }),
    [profile]
  );

  // untuk preview saat edit (lebih enak)
  const fotoPreview = isEditing
    ? (formData.fotoUrl || "").trim()
    : (profile?.fotoUrl || "").trim();

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });

      const json = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok || !json.success) {
        alert(json.error || "Gagal memuat profil");
        return;
      }

      const d: Profile = json.data;
      setProfile(d);

      setFormData({
        namaLengkap: d.namaLengkap ?? "",
        spesialisasi: d.spesialisasi ?? "",
        noTelepon: d.noTelepon ?? "",
        fotoUrl: d.fotoUrl ?? "",
        sip: d.sip ?? "",
        str: d.str ?? "",
      });
    } catch (err) {
      console.error("Gagal memuat profil:", err);
      alert("Gagal memuat profil. Coba refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = () => {
    if (!profile) return;
    setIsEditing(true);
    setFormData({
      namaLengkap: profile.namaLengkap ?? "",
      spesialisasi: profile.spesialisasi ?? "",
      noTelepon: profile.noTelepon ?? "",
      fotoUrl: profile.fotoUrl ?? "",
      sip: profile.sip ?? "",
      str: profile.str ?? "",
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(initial);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          spesialisasi: formData.spesialisasi,
          noTelepon: formData.noTelepon,
          fotoUrl: formData.fotoUrl,
          sip: formData.sip,
          str: formData.str,
        }),
      });

      const json = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok && json.success) {
        setProfile(json.data);
        setIsEditing(false);
        // alert("Profil berhasil disimpan.");
      } else {
        alert("Gagal simpan: " + (json.error || "Cek koneksi"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center font-bold animate-pulse">Memuat...</div>
    );
  }

  if (!profile) {
    return (
      <div className="p-10 text-center font-bold text-red-600">
        Profil tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6 text-black">
      <div className="px-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profil Saya</h1>
          <p className="text-gray-400 mt-1">Kelola identitas dokter bertugas.</p>
        </div>

        {!isEditing ? (
          <button
            onClick={startEdit}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            Edit Profil
          </button>
        ) : (
          <button
            onClick={cancelEdit}
            disabled={isSaving}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Batal
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md overflow-hidden">
            {fotoPreview ? (
              // pakai img biasa biar ga ribet config Next Image
              <img
                src={fotoPreview}
                alt="Foto profil"
                className="w-20 h-20 object-cover"
                onError={(e) => {
                  // kalau link error, fallback ke inisial
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-3xl font-bold">
                {profile.namaLengkap ? profile.namaLengkap.charAt(0) : "?"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">
              {profile.namaLengkap || "-"}
            </h2>
            <p className="opacity-80 truncate">@{profile.username} • Dokter</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Foto URL */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Foto Profil (Link/URL)
              </label>

              {isEditing ? (
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.fotoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fotoUrl: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                />
              ) : (
                <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold break-all">
                  {profile.fotoUrl || "-"}
                </div>
              )}

              {isEditing && (
                <p className="text-xs text-gray-400">
                  Tempel link gambar (contoh: dari Google Drive “direct link” /
                  Imgur / GitHub raw).
                </p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Nama Lengkap
              </label>
              {isEditing ? (
                <input
                  required
                  type="text"
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                />
              ) : (
                <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                  {profile.namaLengkap || "-"}
                </div>
              )}
            </div>

            {/* Spesialisasi */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Spesialisasi
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.spesialisasi}
                  onChange={(e) =>
                    setFormData({ ...formData, spesialisasi: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                />
              ) : (
                <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                  {profile.spesialisasi || "-"}
                </div>
              )}
            </div>

            {/* No Telepon */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                No. Telepon
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.noTelepon}
                  onChange={(e) =>
                    setFormData({ ...formData, noTelepon: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                />
              ) : (
                <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                  {profile.noTelepon || "-"}
                </div>
              )}
            </div>

            {/* Username (read-only) */}
            <div className="space-y-1 opacity-80">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Username
              </label>
              <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                {profile.username}
              </div>
            </div>

            {/* SIP */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                SIP
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.sip}
                  onChange={(e) =>
                    setFormData({ ...formData, sip: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                />
              ) : (
                <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                  {profile.sip || "-"}
                </div>
              )}
            </div>

            {/* STR */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                STR
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.str}
                  onChange={(e) =>
                    setFormData({ ...formData, str: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none font-semibold focus:border-primary"
                />
              ) : (
                <div className="w-full border-2 border-gray-50 p-3 rounded-xl bg-gray-50 font-semibold">
                  {profile.str || "-"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-white px-10 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}