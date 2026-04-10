"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface Props {
  quiz: { id: string; title: string; code: string; status: string };
  stats: {
    totalParticipants: number;
    completedParticipants: number;
    avgScore: number;
    avgTime: number;
    highestScore: number;
    lowestScore: number;
  };
  leaderboard: {
    rank: number;
    name: string;
    email: string;
    score: number;
    accuracy: number;
    totalTime: number;
  }[];
  questionStats: {
    id: string;
    text: string;
    type: string;
    accuracy: number;
    totalAnswers: number;
  }[];
}

export default function ResultClient({
  quiz,
  stats,
  leaderboard,
  questionStats,
}: Props) {
  const barData = questionStats.map((q, i) => ({
    name: `Q${i + 1}`,
    akurasi: q.accuracy,
    fullText: q.text,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Hasil Quiz</h1>
          <p className="text-white/50 mt-1">
            {quiz.title} ·{" "}
            <code className="text-primary font-mono">{quiz.code}</code>
          </p>
        </div>
        <Link href="/admin/quiz" className="btn-ghost">
          ← Kembali
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { icon: "👥", label: "Peserta", value: stats.totalParticipants },
          { icon: "✅", label: "Selesai", value: stats.completedParticipants },
          { icon: "📊", label: "Rata-rata", value: `${stats.avgScore}%` },
          { icon: "⏱", label: "Avg Waktu", value: `${stats.avgTime}s` },
          { icon: "🏆", label: "Skor Tertinggi", value: stats.highestScore },
          { icon: "📉", label: "Skor Terendah", value: stats.lowestScore },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-white/50 text-xs mt-2">{stat.label}</p>
            <p className="text-white font-bold text-lg mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Accuracy per Question Chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold text-lg mb-4">
            📊 Akurasi Per Soal
          </h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#2D1B69",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: any) => [`${value}%`, "Akurasi"]}
                />
                <Bar dataKey="akurasi" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <motion.rect
                      key={index}
                      fill={
                        entry.akurasi >= 70
                          ? "#00B894"
                          : entry.akurasi >= 50
                          ? "#FDCB6E"
                          : "#D63031"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-white/30">Belum ada data</p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold text-lg mb-4">
            🏆 Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-white/30">Belum ada peserta selesai</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-answer ${
                    i < 3 ? "bg-white/10" : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-lg w-8 ${
                        i === 0
                          ? "text-yellow-400"
                          : i === 1
                          ? "text-gray-300"
                          : i === 2
                          ? "text-amber-600"
                          : "text-white/30"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {entry.name}
                      </p>
                      <p className="text-white/30 text-xs">{entry.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-white/30 text-xs">
                      {entry.accuracy}% · {entry.totalTime}s
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Details */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold text-lg mb-4">
          📝 Detail Per Soal
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["#", "Soal", "Tipe", "Akurasi", "Dijawab"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-white/40 text-xs font-medium uppercase px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questionStats.map((q, i) => (
                <tr key={q.id} className="table-row">
                  <td className="px-4 py-3 text-white/30 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 text-white text-sm max-w-md truncate">
                    {q.text}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {q.type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            q.accuracy >= 70
                              ? "bg-success"
                              : q.accuracy >= 50
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                          style={{ width: `${q.accuracy}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {q.accuracy}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">
                    {q.totalAnswers}×
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
