"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  userId?: string | null;
}

interface QuizData {
  id: string;
  title: string;
  status: string;
  mode: string;
  scheduledAt: string | null;
  code: string;
}

export default function AdminWaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/quiz/${quizId}/waiting/status`);
      const data = await res.json();
      if (data.participants) setParticipants(data.participants);
    } catch {}
  }, [quizId]);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/quiz/${quizId}`);
      const data = await res.json();
      if (data.quiz) {
        setQuiz(data.quiz);
        // Map waiting participants from waitingRoom
        if (data.quiz.waitingRoom?.participants) {
          setParticipants(
            data.quiz.waitingRoom.participants.map((p: any) => ({
              id: p.id,
              name: p.guestName || "Tamu",
              joinedAt: p.joinedAt,
              userId: p.userId,
            }))
          );
        }
      }
    } catch {}
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchQuiz, fetchStatus]);

  const handleOpenRoom = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/quiz/${quizId}/open-room`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Ruang tunggu dibuka!");
        setQuiz((q) => q ? { ...q, status: "WAITING" } : q);
      } else {
        toast.error(data.error || "Gagal membuka ruang tunggu");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setActionLoading(false); }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/quiz/${quizId}/start`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Quiz dimulai! Semua peserta diarahkan ke quiz.");
        router.push(`/admin/quiz/${quizId}/result`);
      } else {
        toast.error(data.error || "Gagal memulai quiz");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setActionLoading(false); }
  };

  const handleKick = async (participantId: string) => {
    try {
      const res = await fetch(`/api/admin/quiz/${quizId}/waiting/${participantId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Peserta dikeluarkan");
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      }
    } catch { toast.error("Gagal mengeluarkan peserta"); }
  };

  const scheduledPassed = quiz?.scheduledAt && new Date() > new Date(quiz.scheduledAt);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-[-0.01em]">
            Ruang Tunggu
          </h1>
          {quiz && (
            <p className="text-on-surface-variant text-sm mt-1">
              {quiz.title} ·{" "}
              <code className="text-primary font-mono">{quiz.code}</code>
            </p>
          )}
        </div>
        <Link href={`/admin/quiz/${quizId}/edit`} className="btn-ghost text-sm">
          ← Kembali ke Edit
        </Link>
      </div>

      {/* Warning: scheduled time passed but not started */}
      {scheduledPassed && quiz?.status !== "ACTIVE" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-[1rem] bg-tertiary/10 mb-6"
          style={{ border: "1px solid rgba(255,184,108,0.2)" }}
        >
          <p className="text-tertiary text-sm font-semibold">
            ⚠ Jadwal mulai sudah terlewat. Klik <strong>Mulai Sekarang</strong> untuk memulai quiz.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status & Controls */}
        <div className="space-y-4">
          <div className="card p-6">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-4">
              Status Quiz
            </p>
            <div className="flex items-center gap-3 mb-6">
              <span className={`w-2 h-2 rounded-full ${
                quiz?.status === "ACTIVE" ? "bg-success animate-pulse" :
                quiz?.status === "WAITING" ? "bg-tertiary animate-pulse" :
                "bg-outline-variant"
              }`} />
              <span className="text-on-surface font-bold">
                {quiz?.status === "SCHEDULED" ? "Terjadwal"
                  : quiz?.status === "WAITING" ? "Menunggu"
                  : quiz?.status === "ACTIVE" ? "Aktif"
                  : quiz?.status || "-"}
              </span>
            </div>

            {quiz?.scheduledAt && (
              <div className="mb-4 p-3 rounded-[0.75rem] bg-surface-mid">
                <p className="text-on-surface-variant text-xs mb-1">Jadwal Mulai</p>
                <p className="text-on-surface text-sm font-semibold">
                  {new Date(quiz.scheduledAt).toLocaleString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {quiz?.status === "SCHEDULED" && (
                <button
                  onClick={handleOpenRoom}
                  disabled={actionLoading}
                  className="btn-ghost w-full text-sm"
                  style={{ color: "#00d9b8" }}
                >
                  {actionLoading ? "Membuka..." : "Buka Ruang Tunggu"}
                </button>
              )}

              {(quiz?.status === "WAITING" || quiz?.status === "SCHEDULED") && (
                <button
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="btn-primary w-full"
                >
                  {actionLoading ? "Memulai..." : "Mulai Sekarang"}
                </button>
              )}

              {quiz?.status === "ACTIVE" && (
                <div className="p-3 rounded-[0.75rem] bg-success/10 text-center">
                  <p className="text-success font-bold text-sm">Quiz sedang berlangsung</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-4">
              Statistik
            </p>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-gradient">{participants.length}</p>
              <p className="text-on-surface-variant text-sm mt-1">Peserta Menunggu</p>
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-5">
              Daftar Peserta ({participants.length})
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {participants.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-[1rem] bg-surface-mid group"
                  >
                    <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #b6a0ff30, #7e51ff30)", color: "#b6a0ff" }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-on-surface font-semibold text-sm truncate">{p.name}</p>
                      <p className="text-on-surface-variant text-xs">
                        Bergabung {new Date(p.joinedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {quiz?.status !== "ACTIVE" && (
                      <button
                        onClick={() => handleKick(p.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-error/60 hover:text-error text-xs font-semibold px-2 py-1 rounded-lg"
                      >
                        Kick
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {participants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-on-surface-variant/40 text-sm">
                    Belum ada peserta di ruang tunggu
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
