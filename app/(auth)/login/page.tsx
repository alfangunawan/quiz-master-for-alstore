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
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7e51ff, transparent)" }} />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00d9b8, transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-[1rem] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #b6a0ff, #7e51ff)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-gradient">QuizNeon</span>
        </Link>

        <div className="card-highest p-8" style={{ boxShadow: "0 20px 48px rgba(0,0,0,0.4)" }}>
          <h1 className="text-2xl font-extrabold text-on-surface text-center mb-1 tracking-[-0.01em]">
            Selamat Datang Kembali
          </h1>
          <p className="text-on-surface-variant text-sm text-center mb-8">
            Masuk ke akun Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
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
              <label htmlFor="password" className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
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
              className="btn-primary w-full mt-2"
              id="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full"
                  style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 1s linear infinite" }} />
              ) : "Masuk"}
            </button>
          </form>

          <p className="text-on-surface-variant/50 text-sm text-center mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary font-semibold hover:text-on-surface transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <Link href="/" className="text-on-surface-variant/40 hover:text-on-surface-variant text-sm transition-colors">
            ← Kembali ke beranda
          </Link>
        </motion.p>
      </motion.div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
