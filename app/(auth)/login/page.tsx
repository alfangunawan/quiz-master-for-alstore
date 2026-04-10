"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email atau password salah");
      } else {
        toast.success("Login berhasil!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-answer gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <span className="text-white font-bold text-2xl">QuizMaster Pro</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Selamat Datang Kembali
          </h1>
          <p className="text-white/50 text-center mb-8">
            Masuk ke akun Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-white/70 text-sm font-medium mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-white/70 text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary-300 font-semibold transition-colors"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Guest Mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-white/30 text-sm mb-3">atau</p>
          <Link
            href="/"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Kembali ke beranda dan gabung quiz sebagai tamu
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
