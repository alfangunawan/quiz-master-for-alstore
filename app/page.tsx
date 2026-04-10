"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [quizCode, setQuizCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (quizCode.length === 6) router.push(`/quiz/${quizCode}`);
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(126,81,255,0.18) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,217,184,0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(182,160,255,0.06) 0%, transparent 70%)" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-[1rem] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #b6a0ff, #7e51ff)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeWidth="0" />
            </svg>
          </div>
          <span className="font-extrabold text-xl text-gradient">QuizNeon</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/login" className="btn-ghost text-sm">
            Masuk
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Daftar Gratis
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-16 md:pt-24 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          {/* Label pill */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-pill bg-primary/10">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-on-surface-variant text-sm font-semibold uppercase tracking-[0.05em]">
              Platform Quiz Interaktif
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface mb-6 leading-[1.05] tracking-[-0.02em]">
            Buat Quiz yang{" "}
            <span className="text-gradient">Menginspirasi</span>
            <br />& Menyenangkan
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto leading-relaxed">
            QuizNeon membantu guru, trainer, dan event organizer membuat
            quiz interaktif dengan pengalaman gamified yang membuat peserta
            ketagihan belajar.
          </p>

          {/* Join Quiz Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto mb-16"
          >
            <input
              type="text"
              placeholder="Kode Quiz (6 karakter)"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="input-field text-center text-xl tracking-[0.3em] font-bold uppercase flex-1"
              maxLength={6}
              id="quiz-code-input"
            />
            <button
              onClick={handleJoin}
              disabled={quizCode.length !== 6}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              id="join-quiz-btn"
            >
              Gabung
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full"
        >
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#b6a0ff"/>
                </svg>
              ),
              accent: "#b6a0ff",
              title: "Real-time & Interaktif",
              desc: "Quiz berjalan secara real-time dengan leaderboard live dan feedback instan untuk setiap jawaban.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#00d9b8" strokeWidth="2"/>
                  <path d="M12 8v4l3 3" stroke="#00d9b8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              accent: "#00d9b8",
              title: "Gamified Experience",
              desc: "Sistem poin, streak bonus, dan animasi menarik yang mengubah belajar menjadi pengalaman seru.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="#ffb86c" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 16l4-4 4 4 5-5" stroke="#ffb86c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              accent: "#ffb86c",
              title: "Analitik Mendalam",
              desc: "Dashboard analitik lengkap untuk menganalisis performa, akurasi, dan kemajuan peserta.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="card p-8 cursor-default relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06] -translate-y-8 translate-x-8"
                style={{ background: feature.accent }} />
              <div className="mb-5 w-12 h-12 rounded-[1rem] flex items-center justify-center bg-surface-mid">
                {feature.icon}
              </div>
              <h3 className="text-on-surface font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-12 md:gap-20 mt-20 pt-12 w-full max-w-3xl"
          style={{ borderTop: "1px solid rgba(76,64,113,0.3)" }}
        >
          {[
            { value: "10K+", label: "Quiz Dibuat" },
            { value: "50K+", label: "Peserta" },
            { value: "99%", label: "Kepuasan" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-extrabold text-gradient tracking-[-0.02em]">
                {stat.value}
              </div>
              <div className="text-on-surface-variant text-sm mt-1 uppercase tracking-[0.05em] font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8" style={{ borderTop: "1px solid rgba(76,64,113,0.2)" }}>
        <p className="text-on-surface-variant/40 text-sm">
          © 2026 QuizNeon. Built with passion.
        </p>
      </footer>
    </div>
  );
}
