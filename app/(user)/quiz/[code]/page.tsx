"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

interface QuizInfo {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  code: string;
  mode: string;
  status: string;
  questionsCount: number;
  participantsCount: number;
  createdBy: string;
  allowGuest: boolean;
  scheduledAt: string | null;
}

export default function JoinQuizPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/join/${code}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Quiz tidak ditemukan");
        } else {
          setQuiz(data.quiz);
        }
      } catch {
        setError("Gagal memuat quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [code]);

  const handleJoinWaiting = async () => {
    if (!quiz) return;
    const name = guestName.trim();
    if (!name) {
      toast.error("Masukkan nama kamu terlebih dahulu");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/waiting/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: name }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(
          `/waiting/${quiz.id}?participantId=${data.participantId}&guestName=${encodeURIComponent(name)}`
        );
      } else {
        toast.error(data.error || "Gagal bergabung");
        setJoining(false);
      }
    } catch {
      toast.error("Terjadi kesalahan");
      setJoining(false);
    }
  };

  const handleJoinActive = () => {
    if (!quiz) return;
    router.push(`/play/${quiz.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-error/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ff6b8a" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="#ff6b8a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface mb-2">Quiz Tidak Tersedia</h1>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <Link href="/" className="btn-primary inline-block">← Kembali ke Beranda</Link>
        </motion.div>
      </div>
    );
  }

  const isWaiting = quiz?.status === "WAITING" || quiz?.status === "SCHEDULED";
  const isActive = quiz?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7e51ff, transparent)" }} />
        <div className="absolute -bottom-48 -left-48 w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #00d9b8, transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
                fill="url(#lg-join)" stroke="url(#lg-join)" strokeWidth="0.5" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="lg-join" x1="4.5" y1="2" x2="19.5" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#b6a0ff"/>
                  <stop offset="1" stopColor="#00d9b8"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-on-surface font-extrabold text-xl tracking-[-0.02em]">QuizNeon</span>
          </div>
        </div>

        <div className="card p-8">
          {/* Quiz info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill mb-4"
              style={{ background: isWaiting ? "rgba(182,160,255,0.1)" : "rgba(0,217,184,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: isWaiting ? "#b6a0ff" : "#00d9b8" }} />
              <span className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: isWaiting ? "#b6a0ff" : "#00d9b8" }}>
                {quiz?.status === "SCHEDULED" ? "Terjadwal" :
                 quiz?.status === "WAITING" ? "Ruang Tunggu Terbuka" :
                 "Aktif"}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-on-surface tracking-[-0.02em] mb-1">
              {quiz?.title}
            </h1>
            {quiz?.description && (
              <p className="text-on-surface-variant text-sm mb-4">{quiz.description}</p>
            )}

            <div className="flex items-center justify-center gap-5 text-on-surface-variant text-xs">
              <span>{quiz?.questionsCount} soal</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span>{quiz?.category || "Umum"}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span>oleh {quiz?.createdBy}</span>
            </div>
          </div>

          {/* Quiz code */}
          <div className="flex items-center gap-3 p-4 bg-surface-mid rounded-[0.75rem] mb-6">
            <span className="text-on-surface-variant text-xs">Kode:</span>
            <code className="text-primary font-mono font-extrabold text-xl tracking-[0.15em] flex-1">
              {quiz?.code}
            </code>
          </div>

          {/* Scheduled time info */}
          {quiz?.scheduledAt && (
            <div className="p-3 rounded-[0.75rem] bg-surface-mid mb-6">
              <p className="text-on-surface-variant text-xs mb-1">
                {new Date() > new Date(quiz.scheduledAt) ? "Dijadwalkan pada" : "Mulai pada"}
              </p>
              <p className="text-on-surface font-semibold text-sm">
                {new Date(quiz.scheduledAt).toLocaleString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isWaiting && (
              <motion.div
                key="waiting-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-on-surface-variant text-sm text-center">
                  Masukkan nama kamu untuk bergabung ke ruang tunggu
                </p>
                <input
                  type="text"
                  placeholder="Nama kamu..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinWaiting()}
                  className="input-field w-full text-center font-semibold"
                  maxLength={32}
                  autoFocus
                />
                <button
                  onClick={handleJoinWaiting}
                  disabled={joining || !guestName.trim()}
                  className="btn-primary w-full py-3"
                >
                  {joining ? "Bergabung..." : "Masuk Ruang Tunggu →"}
                </button>
              </motion.div>
            )}

            {isActive && (
              <motion.div
                key="active-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  onClick={handleJoinActive}
                  className="btn-primary w-full py-3 text-base"
                >
                  Mulai Quiz →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            href="/"
            className="block text-on-surface-variant/40 text-sm text-center mt-5 hover:text-on-surface-variant transition-colors"
          >
            ← Kembali
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
