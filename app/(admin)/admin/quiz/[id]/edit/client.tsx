"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  quiz: {
    id: string;
    title: string;
    description: string;
    category: string;
    code: string;
    status: string;
    mode: string;
    scheduledAt: string | null;
    expiresAt: string | null;
    visibility: string;
    randomizeQ: boolean;
    randomizeA: boolean;
    maxParticipants: number | null;
    showLiveBoard: boolean;
    allowGuest: boolean;
  };
  questions: any[];
}

// Convert ISO string to datetime-local value (strip seconds + Z)
function isoToDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

const CATEGORIES = ["Umum", "Matematika", "Sains", "Bahasa", "Sejarah", "Teknologi", "Seni", "Olahraga"];

export default function EditQuizClient({ quiz, questions }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ...quiz,
    scheduledAt: isoToDatetimeLocal(quiz.scheduledAt),
    expiresAt: isoToDatetimeLocal(quiz.expiresAt),
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const body = {
        ...form,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const res = await fetch(`/api/admin/quiz/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const isScheduled = form.mode === "SCHEDULED";
  const isWaiting = quiz.status === "WAITING" || quiz.status === "SCHEDULED";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-[-0.01em]">Edit Quiz</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Kode: <code className="text-primary font-mono">{quiz.code}</code> ·{" "}
            <span className="capitalize">{quiz.status.toLowerCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isWaiting && (
            <Link href={`/admin/quiz/${quiz.id}/waiting`}
              className="btn-ghost text-sm"
              style={{ color: "#00d9b8" }}>
              Ruang Tunggu →
            </Link>
          )}
          <button onClick={() => router.push("/admin/quiz")} className="btn-ghost">
            ← Kembali
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 space-y-6"
      >
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-on-surface-variant text-sm font-semibold mb-2">Judul Quiz</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-base"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-on-surface-variant text-sm font-semibold mb-2">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-on-surface-variant text-sm font-semibold mb-2">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-surface-high">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-on-surface-variant text-sm font-semibold mb-2">Visibilitas</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="input-field"
            >
              <option value="PRIVATE" className="bg-surface-high">Private</option>
              <option value="PUBLIC" className="bg-surface-high">Publik</option>
            </select>
          </div>
        </div>

        {/* Mode section */}
        <div style={{ borderTop: "1px solid rgba(76,64,113,0.3)", paddingTop: "1.5rem" }}>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-[0.05em] mb-4">Mode Quiz</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(["OPEN", "SCHEDULED"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm({ ...form, mode: m })}
                className={`p-4 rounded-[1rem] text-left transition-all ${
                  form.mode === m
                    ? "bg-primary/15"
                    : "bg-surface-mid hover:bg-surface-high"
                }`}
                style={form.mode === m ? { border: "1px solid rgba(182,160,255,0.4)" } : {}}
              >
                <p className="text-on-surface font-bold text-sm">
                  {m === "OPEN" ? "Open" : "Terjadwal"}
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  {m === "OPEN"
                    ? "Peserta bergabung langsung"
                    : "Mulai pada waktu yang ditentukan"}
                </p>
              </button>
            ))}
          </div>

          {isScheduled && (
            <div>
              <label className="block text-on-surface-variant text-sm font-semibold mb-2">Jadwal Mulai</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="input-field"
              />
            </div>
          )}

          {!isScheduled && (
            <div>
              <label className="block text-on-surface-variant text-sm font-semibold mb-2">Berlaku Hingga (opsional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="input-field"
              />
            </div>
          )}
        </div>

        {/* Toggles */}
        <div style={{ borderTop: "1px solid rgba(76,64,113,0.3)", paddingTop: "1.5rem" }}>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-[0.05em] mb-4">Pengaturan</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "randomizeQ", label: "Acak Soal" },
              { key: "randomizeA", label: "Acak Jawaban" },
              { key: "showLiveBoard", label: "Leaderboard" },
              { key: "allowGuest", label: "Izinkan Tamu" },
            ].map((toggle) => (
              <label
                key={toggle.key}
                className="flex items-center gap-3 p-4 rounded-[1rem] bg-surface-mid cursor-pointer hover:bg-surface-high transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(form as any)[toggle.key]}
                  onChange={(e) => setForm({ ...form, [toggle.key]: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-on-surface text-sm font-medium">{toggle.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Questions list */}
        <div style={{ borderTop: "1px solid rgba(76,64,113,0.3)", paddingTop: "1.5rem" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-[0.05em]">
              Daftar Soal ({questions.length})
            </p>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 rounded-[1rem] bg-surface-mid"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-on-surface-variant/50 text-sm font-mono shrink-0">#{i + 1}</span>
                  <span className="text-on-surface text-sm truncate">{q.text}</span>
                </div>
                <span className="text-on-surface-variant text-xs shrink-0 ml-3">
                  {q.type === "MULTIPLE_CHOICE" ? "Pilihan" : q.type === "TRUE_FALSE" ? "B/S" : "Isian"} · {q.timeLimit}s · {q.points}pts
                </span>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-on-surface-variant/40 text-sm text-center py-6">Belum ada soal</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid rgba(76,64,113,0.2)" }}>
          <button onClick={() => router.push("/admin/quiz")} className="btn-ghost">
            Batal
          </button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
