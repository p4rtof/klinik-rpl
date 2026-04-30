"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Tembak API Backe nd (Ganti URL ini dengan endpoint API aslimu)
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role === "admin") {
          router.push("/dashboard");
        } else if (data.role === "dokter") {
          router.push("/patients");
        } else {
          setError("Role tidak dikenali!");
        }
      } else {
        setError(data.message || "Username atau password salah!");
      }
    } catch (err) {
      setError("Gagal terhubung ke server backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-30 bg-teal-50 p-4">
      <div className="">
        <div className="text-center">
          <div className="text-primary-dark mb-3 font-extrabold text-4xl">
            Selamat Datang
          </div>
          <div className="text-primary font-bold  mx-auto text-[28px]">
            Aplikasi Sistem Administrasi Klinik dr. Yofli
          </div>
        </div>
        <img 
        src="/login_img.svg"
            alt="login"
            className="w-[350px] h-auto mt-8 mx-auto"
        />
      </div>

      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-dark">LOGIN</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Pesan Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 text-black focus:ring-primary outline-none"
              placeholder="Masukkan Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-xl transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
