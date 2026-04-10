"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

interface WaitingStatus {
  status: string;
  quizId: string;
  participantCount: number;
  participants: Participant[];
  scheduledAt: string | null;
}

function formatCountdown(targetDate: Date): string {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const participantId = searchParams.get("participantId");
  const guestName = searchParams.get("guestName");

  const [status, setStatus] = useState<WaitingStatus | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const [countdownDone, setCountdownDone] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [error, setError] = useState("");
  const seenIds = useRef<Set<string>>(new Set());
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Initial quiz info fetch
  useEffect(() => {
    fetch(`/api/quiz/join/${quizId}`)
      .then((r) => r.json())
      .catch(() => {});
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (!status?.scheduledAt) return;
    const target = new Date(status.scheduledAt);
    const interval = setInterval(() => {
      const timeStr = formatCountdown(target);
      setCountdown(timeStr);
      if (timeStr === "00:00:00") setCountdownDone(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [status?.scheduledAt]);

  // Polling
  useEffect(() => {
    const poll = async () => {
      try {
        const url = `/api/quiz/${quizId}/waiting/status${participantId ? `?participantId=${participantId}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === "KICKED") {
          setError("Anda telah dikeluarkan dari ruang tunggu oleh admin.");
          return;
        }

        if (data.status === "ACTIVE") {
          // Redirect to play with guestName
          const playUrl = `/play/${quizId}${guestName ? `?guestName=${encodeURIComponent(guestName)}` : ""}`;
          router.push(playUrl);
          return;
        }

        setStatus(data);
        setQuizTitle(data.quizTitle || quizTitle);
      } catch {}
    };

    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [quizId, participantId, guestName, router]);

  if (error) return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="card p-12 text-center max-w-md">
        <div className="w-16 h-16 rounded-[1.5rem] bg-error/10 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ff6b8a" strokeWidth="1.8"/>
            <path d="M12 8v4M12 16h.01" stroke="#ff6b8a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-on-surface mb-2">Anda Dikeluarkan</h2>
        <p className="text-on-surface-variant mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="btn-primary w-full">Kembali ke Beranda</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full opacity-12"
          style={{ background: "radial-gradient(circle, #7e51ff, transparent)" }} />
        <div className="absolute -bottom-48 -left-48 w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #00d9b8, transparent)" }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-primary/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em]">
              Ruang Tunggu
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-[-0.02em] mb-2">
            {quizTitle || "Menunggu Quiz Dimulai"}
          </h1>
          <p className="text-on-surface-variant">
            Sebentar lagi quiz akan dimulai oleh admin
          </p>
        </motion.div>

        {/* Countdown */}
        {status?.scheduledAt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-highest p-8 text-center mb-6"
          >
            {countdownDone ? (
              <div>
                <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-[0.05em] mb-2">Status</p>
                <p className="text-tertiary font-bold text-lg">Menunggu admin memulai...</p>
              </div>
            ) : (
              <div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-3">
                  Mulai dalam
                </p>
                <p className="text-5xl font-extrabold text-gradient font-mono tracking-[-0.02em]">
                  {countdown}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {!status?.scheduledAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-6 text-center mb-6"
          >
            <p className="text-on-surface-variant font-semibold">
              Menunggu admin memulai quiz...
            </p>
          </motion.div>
        )}

        {/* Participant list */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em]">
              Peserta
            </p>
            <span className="text-primary font-bold text-sm">
              {status?.participantCount || 0} bergabung
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {status?.participants.map((p, i) => {
                const isNew = !seenIds.current.has(p.id);
                if (isNew) seenIds.current.add(p.id);
                return (
                  <motion.div
                    key={p.id}
                    initial={isNew ? { opacity: 0, y: 16 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isNew ? i * 0.05 : 0 }}
                    className="flex items-center gap-3 p-3 rounded-[1rem] bg-surface-mid"
                  >
                    <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #b6a0ff30, #7e51ff30)", color: "#b6a0ff" }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-on-surface font-semibold text-sm truncate">{p.name}</p>
                      <p className="text-on-surface-variant text-xs">
                        {new Date(p.joinedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {p.name === guestName && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-pill">Anda</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {(!status?.participants || status.participants.length === 0) && (
              <p className="text-on-surface-variant/40 text-sm text-center py-6">
                Belum ada peserta yang bergabung
              </p>
            )}
          </div>
        </div>

        <p className="text-on-surface-variant/30 text-xs text-center mt-6">
          Halaman ini akan otomatis redirect ketika quiz dimulai
        </p>
      </div>
    </div>
  );
}
