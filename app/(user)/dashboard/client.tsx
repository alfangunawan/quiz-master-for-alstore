"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  user: { name: string; email: string; image: string | null };
  stats: {
    totalQuizzes: number;
    completedQuizzes: number;
    avgScore: number;
    bestRank: number;
  };
  recentSessions: {
    id: string;
    quizTitle: string;
    score: number;
    accuracy: number;
    completedAt: string | null;
    createdAt: string;
  }[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const LightningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
  </svg>
);

export default function UserDashboardClient({ user, stats, recentSessions }: Props) {
  const [quizCode, setQuizCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (quizCode.length === 6) router.push(`/quiz/${quizCode}`);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-48 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7e51ff, transparent)" }} />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #00d9b8, transparent)" }} />
      </div>

      {/* Top Nav */}
      <nav className="glass-nav relative z-10 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #b6a0ff, #7e51ff)" }}>
              <LightningIcon />
            </div>
            <span className="font-extrabold text-lg text-gradient">QuizNeon</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/history" className="btn-ghost text-sm">
              Riwayat
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-ghost text-sm text-on-surface-variant/50"
            >
              Keluar
            </button>
            <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #b6a0ff40, #7e51ff40)", color: "#b6a0ff" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Greeting */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-[-0.02em] mb-1">
              Halo, {user.name}!
            </h1>
            <p className="text-on-surface-variant">
              Siap untuk quiz hari ini? Masukkan kode atau lihat riwayat Anda.
            </p>
          </motion.div>

          {/* Join Quiz */}
          <motion.div variants={itemVariants} className="card p-6 mb-6">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-4">
              Gabung Quiz
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Kode 6 karakter..."
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase().slice(0, 6))}
                className="input-field flex-1 text-center text-xl tracking-[0.3em] font-bold uppercase"
                maxLength={6}
                id="dashboard-quiz-code"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={quizCode.length !== 6}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                id="dashboard-join-btn"
              >
                Gabung
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Quiz", value: stats.totalQuizzes, color: "#b6a0ff" },
              { label: "Rata-rata Skor", value: `${stats.avgScore}%`, color: "#00d9b8" },
              { label: "Diselesaikan", value: stats.completedQuizzes, color: "#4ade80" },
              { label: "Peringkat Terbaik", value: stats.bestRank > 0 ? `#${stats.bestRank}` : "—", color: "#ffb86c" },
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} className="card p-5">
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-3">{stat.label}</p>
                <p className="text-2xl font-extrabold tracking-[-0.01em]" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Sessions */}
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em]">
                Quiz Terakhir
              </p>
              <Link href="/history" className="text-primary text-sm font-semibold hover:text-on-surface transition-colors">
                Lihat Semua →
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-14 h-14 rounded-[1.5rem] bg-surface-mid flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4c4071" strokeWidth="1.8"/>
                    <path d="M12 8v5M12 16h.01" stroke="#4c4071" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-on-surface-variant font-semibold">Belum ada quiz</p>
                <p className="text-on-surface-variant/40 text-sm mt-1">Masukkan kode quiz di atas untuk memulai</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    whileHover={{ backgroundColor: "rgba(35,21,84,0.6)" }}
                    className="flex items-center justify-between p-4 rounded-[1rem] transition-colors"
                  >
                    <div>
                      <p className="text-on-surface font-semibold text-sm">{session.quizTitle}</p>
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        {new Date(session.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-on-surface font-bold text-sm">{session.score.toLocaleString()} pts</p>
                      <p className="text-on-surface-variant text-xs mt-0.5">{Math.round(session.accuracy)}% akurasi</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
