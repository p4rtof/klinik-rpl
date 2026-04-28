"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState(""); // Ubah email jadi username
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulasi jika login berhasil, langsung diarahkan ke Dashboard Admin
    alert(`Login berhasil sebagai: ${username}`);
    router.push("/dashboard"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-30 bg-teal-50 p-4">
      <div className= "font-bold text-xl text-center">
        <div className="text-primary-dark mb-5 font-bold text-xl">Selamat Datang</div>
        <div className="text-primary font-semibold">Aplikasi Sistem Administrasi pada Praktik dr. Yofli</div>
      </div>
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-dark">LOGIN</h2>
          </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text" 
              className="w-full px-4 py-3 border text-black  border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="Masukkan username"
              onChange={(e) => setUsername(e.target.value)} // Gunakan setUsername
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 text-black focus:ring-primary outline-none"
              placeholder="Masukkan Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}