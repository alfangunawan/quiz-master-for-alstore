"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [quizCode, setQuizCode] = useState("");

  return (
    <div className="min-h-screen gradient-dark relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-answer gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="text-white font-bold text-xl">QuizMaster Pro</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/login" className="btn-ghost text-sm">
            Masuk
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Daftar Gratis
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 md:pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-pill bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-white/70 text-sm font-medium">
              Platform Quiz Interaktif #1
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Buat Quiz yang{" "}
            <span className="text-gradient">Menginspirasi</span>
            <br />& Menyenangkan
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            QuizMaster Pro membantu guru, trainer, dan event organizer membuat
            quiz interaktif dengan pengalaman gamified yang membuat peserta
            ketagihan belajar.
          </p>

          {/* Join Quiz Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto mb-12"
          >
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Masukkan kode quiz..."
                value={quizCode}
                onChange={(e) =>
                  setQuizCode(e.target.value.toUpperCase().slice(0, 6))
                }
                className="input-field text-center text-lg tracking-[0.3em] font-bold uppercase"
                maxLength={6}
                id="quiz-code-input"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">
                {quizCode.length}/6
              </div>
            </div>
            <Link
              href={quizCode.length === 6 ? `/quiz/${quizCode}` : "#"}
              className={`btn-primary w-full sm:w-auto whitespace-nowrap ${
                quizCode.length !== 6 ? "opacity-50 pointer-events-none" : ""
              }`}
              id="join-quiz-btn"
            >
              🚀 Gabung Quiz
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
        >
          {[
            {
              icon: "⚡",
              title: "Real-time & Interaktif",
              desc: "Quiz berjalan secara real-time dengan leaderboard live dan feedback instan",
            },
            {
              icon: "🎮",
              title: "Gamified Experience",
              desc: "Sistem poin, streak bonus, dan animasi menarik membuat belajar jadi seru",
            },
            {
              icon: "📊",
              title: "Analitik Mendalam",
              desc: "Dashboard analitik lengkap untuk menganalisis performa peserta",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="glass-card p-8 group cursor-default"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 pt-12 border-t border-white/5 w-full max-w-3xl"
        >
          {[
            { value: "10K+", label: "Quiz Dibuat" },
            { value: "50K+", label: "Peserta" },
            { value: "99%", label: "Kepuasan" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gradient">
                {stat.value}
              </div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/5">
        <p className="text-white/30 text-sm">
          © 2026 QuizMaster Pro. Built with ❤️
        </p>
      </footer>
    </div>
  );
}
