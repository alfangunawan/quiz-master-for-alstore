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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function UserDashboardClient({
  user,
  stats,
  recentSessions,
}: Props) {
  const [quizCode, setQuizCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (quizCode.length === 6) {
      router.push(`/quiz/${quizCode}`);
    }
  };

  return (
    <div className="min-h-screen gradient-dark">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-answer gradient-primary flex items-center justify-center">
            <span className="text-white font-bold">Q</span>
          </div>
          <span className="text-white font-bold text-lg">QuizMaster Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/history" className="btn-ghost text-sm">
            📋 Riwayat
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost text-sm text-white/50"
          >
            Keluar
          </button>
          <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Greeting */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Halo, {user.name}! 👋
            </h1>
            <p className="text-white/50">
              Siap untuk quiz hari ini? Masukkan kode atau lihat riwayat Anda.
            </p>
          </motion.div>

          {/* Join Quiz Section */}
          <motion.div variants={itemVariants} className="glass-card p-6 mb-8">
            <h2 className="text-white font-semibold text-lg mb-4">
              🚀 Gabung Quiz
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Masukkan kode 6 karakter..."
                value={quizCode}
                onChange={(e) =>
                  setQuizCode(e.target.value.toUpperCase().slice(0, 6))
                }
                className="input-field flex-1 text-center text-lg tracking-[0.3em] font-bold uppercase"
                maxLength={6}
                id="dashboard-quiz-code"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={quizCode.length !== 6}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                id="dashboard-join-btn"
              >
                Gabung
              </button>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                icon: "📝",
                label: "Total Quiz Diikuti",
                value: stats.totalQuizzes,
              },
              {
                icon: "📊",
                label: "Rata-rata Skor",
                value: `${stats.avgScore}%`,
              },
              {
                icon: "✅",
                label: "Quiz Diselesaikan",
                value: stats.completedQuizzes,
              },
              {
                icon: "🏆",
                label: "Peringkat Terbaik",
                value: stats.bestRank > 0 ? `#${stats.bestRank}` : "-",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="stat-card"
              >
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-white/50 text-sm">{stat.label}</span>
                <span className="text-white font-bold text-2xl">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Quiz */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">
                📋 Quiz Terakhir
              </h2>
              <Link
                href="/history"
                className="text-primary text-sm hover:text-primary-300 transition-colors"
              >
                Lihat Semua →
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-white/50">
                  Anda belum mengikuti quiz apapun.
                </p>
                <p className="text-white/30 text-sm mt-2">
                  Masukkan kode quiz di atas untuk memulai!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    whileHover={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                    className="flex items-center justify-between p-4 rounded-answer transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {session.quizTitle}
                      </p>
                      <p className="text-white/40 text-sm">
                        {new Date(session.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{session.score} pts</p>
                      <p className="text-white/40 text-sm">
                        {Math.round(session.accuracy)}% akurasi
                      </p>
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
