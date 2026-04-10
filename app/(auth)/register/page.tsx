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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mendaftar");
        return;
      }

      toast.success("Pendaftaran berhasil!");

      // Auto login after register
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
    <div className="min-h-screen gradient-dark flex items-center justify-center px-6 relative overflow-hidden">
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
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-answer gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <span className="text-white font-bold text-2xl">QuizMaster Pro</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-white/50 text-center mb-8">
            Daftar gratis dan mulai buat quiz
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-white/70 text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="reg-email"
                className="block text-white/70 text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="reg-password"
                className="block text-white/70 text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="confirm-password"
                className="block text-white/70 text-sm font-medium mb-2"
              >
                Konfirmasi Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
              id="register-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary-300 font-semibold transition-colors"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
