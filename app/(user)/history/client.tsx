"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Session {
  id: string;
  quizTitle: string;
  quizCategory: string | null;
  quizCode: string;
  score: number;
  accuracy: number;
  rank: number | null;
  totalTime: number;
  completedAt: string | null;
  createdAt: string;
}

export default function HistoryClient({ sessions }: { sessions: Session[] }) {
  return (
    <div className="min-h-screen gradient-dark">
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-answer gradient-primary flex items-center justify-center">
            <span className="text-white font-bold">Q</span>
          </div>
          <span className="text-white font-bold text-lg">QuizMaster Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="btn-ghost text-sm">
            📊 Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost text-sm text-white/50"
          >
            Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Riwayat Quiz</h1>
          <p className="text-white/50 mb-8">
            {sessions.length} quiz telah diikuti
          </p>

          {sessions.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-white/50 text-lg">Belum ada riwayat quiz</p>
              <Link
                href="/"
                className="btn-primary inline-block mt-6"
              >
                Gabung Quiz Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">
                        {session.quizTitle}
                      </h3>
                      <span className="badge bg-white/10 text-white/40">
                        {session.quizCategory || "Umum"}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm">
                      {new Date(session.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">
                        {session.score.toLocaleString()}
                      </p>
                      <p className="text-white/30 text-xs">Poin</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">
                        {Math.round(session.accuracy)}%
                      </p>
                      <p className="text-white/30 text-xs">Akurasi</p>
                    </div>
                    {session.rank && (
                      <div className="text-center">
                        <p className="text-primary font-bold text-lg">
                          #{session.rank}
                        </p>
                        <p className="text-white/30 text-xs">Peringkat</p>
                      </div>
                    )}
                    <span
                      className={`badge ${
                        session.completedAt
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {session.completedAt ? "Selesai" : "Belum Selesai"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
