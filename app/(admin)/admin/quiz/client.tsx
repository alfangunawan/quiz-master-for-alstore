"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface QuizItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  code: string;
  category: string | null;
  visibility: string;
  questionsCount: number;
  participantsCount: number;
  createdAt: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE": return "badge-active";
    case "DRAFT": return "badge-draft";
    default: return "badge-finished";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "ACTIVE": return "Aktif";
    case "DRAFT": return "Draft";
    case "FINISHED": return "Selesai";
    case "ARCHIVED": return "Arsip";
    default: return status;
  }
};

export default function QuizListClient({ quizzes }: { quizzes: QuizItem[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const router = useRouter();

  const filtered = quizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode ${code} disalin!`);
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/quiz/${id}/publish`, { method: "POST" });
      if (res.ok) {
        toast.success("Quiz berhasil dipublish!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal publish");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus quiz ini?")) return;
    try {
      const res = await fetch(`/api/admin/quiz/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Quiz dihapus");
        router.refresh();
      }
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Kelola Quiz</h1>
          <p className="text-white/50 mt-1">{quizzes.length} quiz total</p>
        </div>
        <Link href="/admin/quiz/create" className="btn-primary">
          ➕ Buat Quiz Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Cari quiz..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
          id="quiz-search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="ALL" className="bg-dark">Semua Status</option>
          <option value="DRAFT" className="bg-dark">Draft</option>
          <option value="ACTIVE" className="bg-dark">Aktif</option>
          <option value="FINISHED" className="bg-dark">Selesai</option>
          <option value="ARCHIVED" className="bg-dark">Arsip</option>
        </select>
      </div>

      {/* Quiz Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/50 text-lg">
            {search ? "Tidak ada quiz yang cocok" : "Belum ada quiz"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg truncate">
                    {quiz.title}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    {quiz.category || "Umum"}
                  </p>
                </div>
                <span className={statusBadge(quiz.status)}>
                  {statusLabel(quiz.status)}
                </span>
              </div>

              {quiz.description && (
                <p className="text-white/40 text-sm mb-4 line-clamp-2">
                  {quiz.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-white/40 text-sm mb-4">
                <span>📝 {quiz.questionsCount} soal</span>
                <span>👥 {quiz.participantsCount} peserta</span>
              </div>

              {/* Code */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-btn">
                <span className="text-white/40 text-xs">Kode:</span>
                <code className="text-primary font-mono font-bold flex-1">
                  {quiz.code}
                </code>
                <button
                  onClick={() => handleCopyCode(quiz.code)}
                  className="text-white/40 hover:text-white text-sm"
                >
                  📋
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                <Link
                  href={`/admin/quiz/${quiz.id}/edit`}
                  className="btn-ghost text-sm flex-1 text-center"
                >
                  ✏️ Edit
                </Link>
                {quiz.status === "DRAFT" && (
                  <button
                    onClick={() => handlePublish(quiz.id)}
                    className="btn-primary text-sm flex-1"
                  >
                    🚀 Publish
                  </button>
                )}
                <Link
                  href={`/admin/quiz/${quiz.id}/result`}
                  className="btn-ghost text-sm flex-1 text-center"
                >
                  📊 Hasil
                </Link>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="btn-ghost text-sm text-red-400"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
