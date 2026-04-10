"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  stats: {
    totalQuizzes: number;
    activeQuizzes: number;
    totalParticipants: number;
    avgScore: number;
  };
  recentQuizzes: {
    id: string;
    title: string;
    status: string;
    code: string;
    category: string | null;
    questionsCount: number;
    participantsCount: number;
    createdAt: string;
  }[];
}

const statusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "badge-active";
    case "DRAFT":
      return "badge-draft";
    default:
      return "badge-finished";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "DRAFT":
      return "Draft";
    case "FINISHED":
      return "Selesai";
    case "ARCHIVED":
      return "Arsip";
    default:
      return status;
  }
};

export default function AdminDashboardClient({
  stats,
  recentQuizzes,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
          <p className="text-white/50 mt-1">
            Kelola quiz dan lihat statistik Anda
          </p>
        </div>
        <Link href="/admin/quiz/create" className="btn-primary" id="create-quiz-btn">
          ➕ Buat Quiz Baru
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: "📝",
            label: "Total Quiz",
            value: stats.totalQuizzes,
            color: "from-primary to-primary-600",
          },
          {
            icon: "🟢",
            label: "Quiz Aktif",
            value: stats.activeQuizzes,
            color: "from-emerald-500 to-emerald-700",
          },
          {
            icon: "👥",
            label: "Total Peserta",
            value: stats.totalParticipants,
            color: "from-secondary to-secondary-600",
          },
          {
            icon: "📊",
            label: "Rata-rata Skor",
            value: `${stats.avgScore}%`,
            color: "from-amber-500 to-amber-700",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />
            <span className="text-3xl">{stat.icon}</span>
            <p className="text-white/50 text-sm mt-3">{stat.label}</p>
            <p className="text-white font-bold text-3xl mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Quizzes Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white font-semibold text-lg">Quiz Terbaru</h2>
          <Link
            href="/admin/quiz"
            className="text-primary text-sm hover:text-primary-300"
          >
            Lihat Semua →
          </Link>
        </div>

        {recentQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-white/50 text-lg">Belum ada quiz yang dibuat</p>
            <p className="text-white/30 text-sm mt-2 mb-6">
              Mulai buat quiz pertama Anda
            </p>
            <Link href="/admin/quiz/create" className="btn-primary inline-block">
              ➕ Buat Quiz
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">
                    Quiz
                  </th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">
                    Kode
                  </th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">
                    Soal
                  </th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">
                    Peserta
                  </th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentQuizzes.map((quiz, i) => (
                  <motion.tr
                    key={quiz.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="table-row"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{quiz.title}</p>
                        <p className="text-white/30 text-xs">
                          {quiz.category || "Umum"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-primary font-mono text-sm bg-primary/10 px-2 py-1 rounded">
                        {quiz.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {quiz.questionsCount}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {quiz.participantsCount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusBadge(quiz.status)}>
                        {statusLabel(quiz.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/quiz/${quiz.id}/edit`}
                          className="text-white/40 hover:text-white text-sm transition-colors"
                        >
                          ✏️
                        </Link>
                        <Link
                          href={`/admin/quiz/${quiz.id}/result`}
                          className="text-white/40 hover:text-white text-sm transition-colors"
                        >
                          📊
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
