"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error || "Gagal mendaftar"); return; }

      toast.success("Pendaftaran berhasil!");
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 relative overflow-hidden">
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
            Buat Akun Baru
          </h1>
          <p className="text-on-surface-variant text-sm text-center mb-8">
            Daftar gratis dan mulai buat quiz
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              id="register-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full"
                  style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 1s linear infinite" }} />
              ) : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-on-surface-variant/50 text-sm text-center mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-semibold hover:text-on-surface transition-colors">
              Masuk
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
