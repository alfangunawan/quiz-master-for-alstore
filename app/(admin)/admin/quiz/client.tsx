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
  mode: string;
  code: string;
  category: string | null;
  visibility: string;
  questionsCount: number;
  participantsCount: number;
  waitingCount?: number;
  scheduledAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse?: boolean }> = {
  DRAFT:     { label: "Draft",      color: "#7a6f99" },
  SCHEDULED: { label: "Terjadwal",  color: "#b6a0ff" },
  WAITING:   { label: "Menunggu",   color: "#ffb86c", pulse: true },
  ACTIVE:    { label: "Aktif",      color: "#4ade80", pulse: true },
  FINISHED:  { label: "Selesai",    color: "#c084fc" },
  ARCHIVED:  { label: "Arsip",      color: "#4c4071" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-[0.06em]"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />}
      {cfg.label}
    </span>
  );
}

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
    } catch { toast.error("Terjadi kesalahan"); }
  };

  const handleOpenRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/quiz/${id}/open-room`, { method: "POST" });
      if (res.ok) {
        toast.success("Ruang tunggu dibuka!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch { toast.error("Terjadi kesalahan"); }
  };

  const handleStart = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/quiz/${id}/start`, { method: "POST" });
      if (res.ok) {
        toast.success("Quiz dimulai!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch { toast.error("Terjadi kesalahan"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus quiz ini?")) return;
    try {
      const res = await fetch(`/api/admin/quiz/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Quiz dihapus"); router.refresh(); }
    } catch { toast.error("Gagal menghapus"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-[-0.01em]">Kelola Quiz</h1>
          <p className="text-on-surface-variant text-sm mt-1">{quizzes.length} quiz total</p>
        </div>
        <Link href="/admin/quiz/create" className="btn-primary">+ Buat Quiz Baru</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Cari quiz..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1" id="quiz-search-input" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-48">
          <option value="ALL" className="bg-surface-high">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val} className="bg-surface-high">{cfg.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-surface-mid flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#4c4071" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="#4c4071" strokeWidth="1.8"/>
            </svg>
          </div>
          <p className="text-on-surface-variant">
            {search ? "Tidak ada quiz yang cocok" : "Belum ada quiz"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quiz, i) => (
            <motion.div key={quiz.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="card p-6 flex flex-col">

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="text-on-surface font-bold text-base truncate">{quiz.title}</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {quiz.category || "Umum"} · {quiz.mode === "SCHEDULED" ? "Terjadwal" : "Open"}
                  </p>
                </div>
                <StatusBadge status={quiz.status} />
              </div>

              {quiz.description && (
                <p className="text-on-surface-variant text-xs mb-3 line-clamp-2">{quiz.description}</p>
              )}

              {/* Scheduled time warning */}
              {quiz.status === "SCHEDULED" && quiz.scheduledAt && new Date() > new Date(quiz.scheduledAt) && (
                <div className="mb-3 p-2.5 rounded-[0.75rem] bg-tertiary/10">
                  <p className="text-tertiary text-xs font-semibold">
                    ⚠ Jadwal terlewat — klik Mulai Sekarang
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 text-on-surface-variant text-xs mb-4">
                <span>{quiz.questionsCount} soal</span>
                <span>{quiz.participantsCount} peserta</span>
                {quiz.waitingCount !== undefined && quiz.waitingCount > 0 && (
                  <span className="text-tertiary font-semibold">{quiz.waitingCount} menunggu</span>
                )}
              </div>

              {/* Code */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-surface-mid rounded-[0.75rem]">
                <span className="text-on-surface-variant text-xs">Kode:</span>
                <code className="text-primary font-mono font-bold flex-1 text-sm">{quiz.code}</code>
                <button onClick={() => handleCopyCode(quiz.code)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-4" style={{ borderTop: "1px solid rgba(76,64,113,0.2)" }}>
                <Link href={`/admin/quiz/${quiz.id}/edit`} className="btn-ghost text-xs flex-1 text-center py-2">Edit</Link>

                {quiz.status === "DRAFT" && (
                  <button onClick={() => handlePublish(quiz.id)} className="btn-primary text-xs flex-1 py-2">
                    Publish
                  </button>
                )}

                {quiz.status === "SCHEDULED" && (
                  <>
                    <button onClick={() => handleOpenRoom(quiz.id)}
                      className="btn-ghost text-xs flex-1 py-2" style={{ color: "#00d9b8" }}>
                      Buka Ruang
                    </button>
                    <Link href={`/admin/quiz/${quiz.id}/waiting`} className="btn-ghost text-xs py-2 px-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </Link>
                  </>
                )}

                {quiz.status === "WAITING" && (
                  <>
                    <button onClick={() => handleStart(quiz.id)}
                      className="btn-primary text-xs flex-1 py-2">
                      Mulai Sekarang
                    </button>
                    <Link href={`/admin/quiz/${quiz.id}/waiting`} className="btn-ghost text-xs py-2 px-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                      </svg>
                    </Link>
                  </>
                )}

                <Link href={`/admin/quiz/${quiz.id}/result`} className="btn-ghost text-xs py-2 px-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M7 16l4-4 4 4 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <button onClick={() => handleDelete(quiz.id)} className="btn-ghost text-xs py-2 px-3 text-error/60 hover:text-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
