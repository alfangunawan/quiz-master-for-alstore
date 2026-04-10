"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  quiz: {
    id: string;
    title: string;
    description: string;
    category: string;
    code: string;
    status: string;
    visibility: string;
    randomizeQ: boolean;
    randomizeA: boolean;
    maxParticipants: number | null;
    showLiveBoard: boolean;
    allowGuest: boolean;
  };
  questions: any[];
}

export default function EditQuizClient({ quiz, questions }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(quiz);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quiz/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Quiz berhasil diperbarui!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Quiz</h1>
          <p className="text-white/50 mt-1">
            Kode: <code className="text-primary font-mono">{quiz.code}</code> ·
            Status: {quiz.status}
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/quiz")}
          className="btn-ghost"
        >
          ← Kembali
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-white/70 text-sm font-medium mb-2">
              Judul Quiz
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-white/70 text-sm font-medium mb-2">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {[
                "Umum", "Matematika", "Sains", "Bahasa",
                "Sejarah", "Teknologi", "Seni", "Olahraga",
              ].map((cat) => (
                <option key={cat} value={cat} className="bg-dark">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Visibilitas
            </label>
            <select
              value={form.visibility}
              onChange={(e) =>
                setForm({ ...form, visibility: e.target.value })
              }
              className="input-field"
            >
              <option value="PRIVATE" className="bg-dark">🔒 Private</option>
              <option value="PUBLIC" className="bg-dark">🌍 Publik</option>
              <option value="DRAFT" className="bg-dark">📝 Draft</option>
            </select>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "randomizeQ", label: "Acak Soal", icon: "🔀" },
              { key: "randomizeA", label: "Acak Jawaban", icon: "🔄" },
              { key: "showLiveBoard", label: "Leaderboard", icon: "🏆" },
              { key: "allowGuest", label: "Guest", icon: "👤" },
            ].map((toggle) => (
              <label
                key={toggle.key}
                className="flex items-center gap-3 p-4 rounded-answer bg-white/5 cursor-pointer hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={(form as any)[toggle.key]}
                  onChange={(e) =>
                    setForm({ ...form, [toggle.key]: e.target.checked })
                  }
                  className="w-5 h-5 accent-primary"
                />
                <span className="text-lg">{toggle.icon}</span>
                <span className="text-white/70 text-sm">{toggle.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Questions Preview */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">
            📝 Soal ({questions.length})
          </h2>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-answer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-sm">#{i + 1}</span>
                  <span className="text-white">{q.text}</span>
                </div>
                <span className="text-white/30 text-xs">
                  {q.type} · {q.timeLimit}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
