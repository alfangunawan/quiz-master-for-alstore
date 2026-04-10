"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Participant {
  id: string;
  name: string;
  email: string;
  quizTitle: string;
  score: number;
  accuracy: number;
  completedAt: string | null;
  createdAt: string;
}

export default function ParticipantsClient({
  participants,
}: {
  participants: Participant[];
}) {
  const [search, setSearch] = useState("");

  const filtered = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.quizTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Peserta</h1>
          <p className="text-white/50 mt-1">
            {participants.length} partisipasi total
          </p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Cari peserta atau quiz..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
          id="participant-search"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Nama", "Email", "Quiz", "Skor", "Akurasi", "Status", "Tanggal"].map(
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
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="table-row"
                >
                  <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-white/50 text-sm">{p.email}</td>
                  <td className="px-6 py-4 text-white/60">{p.quizTitle}</td>
                  <td className="px-6 py-4 text-white font-bold">
                    {p.score.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-bold ${
                        p.accuracy >= 70
                          ? "text-success"
                          : p.accuracy >= 50
                          ? "text-warning"
                          : "text-danger"
                      }`}
                    >
                      {Math.round(p.accuracy)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge ${
                        p.completedAt
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {p.completedAt ? "Selesai" : "Berlangsung"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-sm">
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-white/50">Tidak ada peserta ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
