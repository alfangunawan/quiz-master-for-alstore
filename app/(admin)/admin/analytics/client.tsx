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
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Props {
  quizAnalytics: {
    id: string;
    title: string;
    category: string | null;
    participants: number;
    questions: number;
    avgScore: number;
    status: string;
    createdAt: string;
  }[];
  distribution: {
    excellent: number;
    good: number;
    fair: number;
    tryAgain: number;
  };
  totalParticipants: number;
}

const GRADE_COLORS = ["#FFD700", "#00B894", "#FDCB6E", "#D63031"];

export default function AnalyticsClient({
  quizAnalytics,
  distribution,
  totalParticipants,
}: Props) {
  const pieData = [
    { name: "Excellent (≥90%)", value: distribution.excellent },
    { name: "Good (70-89%)", value: distribution.good },
    { name: "Fair (50-69%)", value: distribution.fair },
    { name: "Try Again (<50%)", value: distribution.tryAgain },
  ].filter((d) => d.value > 0);

  const barData = quizAnalytics
    .filter((q) => q.participants > 0)
    .slice(0, 10)
    .map((q) => ({
      name: q.title.length > 15 ? q.title.slice(0, 15) + "..." : q.title,
      peserta: q.participants,
      avgScore: q.avgScore,
    }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analitik</h1>
        <p className="text-white/50 mt-1">
          Overview performa semua quiz Anda
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "📝", label: "Total Quiz", value: quizAnalytics.length },
          { icon: "👥", label: "Total Peserta", value: totalParticipants },
          {
            icon: "🏆",
            label: "Quiz Terpopuler",
            value: quizAnalytics.sort(
              (a, b) => b.participants - a.participants
            )[0]?.title || "-",
          },
          {
            icon: "📊",
            label: "Avg Skor Global",
            value: `${
              quizAnalytics.length > 0
                ? Math.round(
                    quizAnalytics.reduce((a, b) => a + b.avgScore, 0) /
                      quizAnalytics.length
                  )
                : 0
            }%`,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-white/50 text-sm mt-2">{stat.label}</p>
            <p className="text-white font-bold text-xl mt-1 truncate">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Quiz Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-white font-semibold text-lg mb-4">
            📊 Peserta per Quiz
          </h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#2D1B69",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="peserta" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-white/30">Belum ada data</p>
            </div>
          )}
        </motion.div>

        {/* Pie Chart - Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-white font-semibold text-lg mb-4">
            🎯 Distribusi Skor
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GRADE_COLORS[index % GRADE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#2D1B69",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-white/30">Belum ada data</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {pieData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: GRADE_COLORS[i] }}
                />
                <span className="text-white/50">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quiz Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="text-white font-semibold text-lg">
            Performa Quiz
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Quiz", "Kategori", "Soal", "Peserta", "Avg Skor", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {quizAnalytics.map((quiz) => (
                <tr key={quiz.id} className="table-row">
                  <td className="px-6 py-4 text-white font-medium">
                    {quiz.title}
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {quiz.category || "Umum"}
                  </td>
                  <td className="px-6 py-4 text-white/60">{quiz.questions}</td>
                  <td className="px-6 py-4 text-white/60">
                    {quiz.participants}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-bold ${
                        quiz.avgScore >= 70
                          ? "text-success"
                          : quiz.avgScore >= 50
                          ? "text-warning"
                          : "text-danger"
                      }`}
                    >
                      {quiz.avgScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge ${
                        quiz.status === "ACTIVE"
                          ? "badge-active"
                          : quiz.status === "DRAFT"
                          ? "badge-draft"
                          : "badge-finished"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
