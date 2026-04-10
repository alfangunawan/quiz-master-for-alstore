"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface QuestionData {
  id: string;
  type: string;
  text: string;
  image: string | null;
  options: { id: string; text: string }[];
  timeLimit: number;
  points: number;
  order: number;
}

interface FeedbackData {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswers: string[];
  explanation: string | null;
}

interface ResultData {
  score: number;
  totalTime: number;
  accuracy: number;
  rank: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
}

interface FinalLeaderEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
}

interface InterLeaderEntry {
  rank: number;
  sessionId: string;
  name: string;
  score: number;
  delta: number;
  isCurrentUser: boolean;
}

// Option badge accent colors (1–4)
const optionAccents = [
  { bg: "rgba(182,160,255,0.15)", ring: "#b6a0ff", badge: "linear-gradient(135deg,#b6a0ff,#7e51ff)" },
  { bg: "rgba(0,217,184,0.12)",   ring: "#00d9b8", badge: "linear-gradient(135deg,#00d9b8,#009e87)" },
  { bg: "rgba(255,184,108,0.12)", ring: "#ffb86c", badge: "linear-gradient(135deg,#ffb86c,#e07b39)" },
  { bg: "rgba(192,132,252,0.12)", ring: "#c084fc", badge: "linear-gradient(135deg,#c084fc,#9333ea)" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const LightningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor"/>
    <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" opacity=".6"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// Rank medal color
function rankColor(rank: number) {
  if (rank === 1) return "#ffb86c";
  if (rank === 2) return "#cbc2e8";
  if (rank === 3) return "#e07b39";
  return "#4c4071";
}

// Inter-question leaderboard screen
function InterLeaderboard({
  entries,
  prevEntries,
  questionNum,
  totalQuestions,
  countdown,
}: {
  entries: InterLeaderEntry[];
  prevEntries: InterLeaderEntry[];
  questionNum: number;
  totalQuestions: number;
  countdown: number;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 py-10 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7e51ff, transparent)" }} />
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-primary/10 mb-4">
            <span className="text-primary font-bold text-xs uppercase tracking-[0.06em]">
              Leaderboard — Soal {questionNum} dari {totalQuestions}
            </span>
          </div>
          <p className="text-on-surface-variant text-sm">
            Soal berikutnya dalam <span className="text-primary font-bold">{countdown}s</span>
          </p>
        </motion.div>

        {/* Entries */}
        <LayoutGroup>
          <div className="space-y-2 flex-1">
            <AnimatePresence>
              {entries.map((entry, i) => {
                const prev = prevEntries.find((p) => p.sessionId === entry.sessionId);
                const rankChange = prev ? prev.rank - entry.rank : 0; // positive = moved up
                const isMe = entry.isCurrentUser;

                return (
                  <motion.div
                    key={entry.sessionId}
                    layout
                    layoutId={entry.sessionId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.06 }}
                    className={`flex items-center gap-3 p-4 rounded-[1rem] ${
                      isMe
                        ? "bg-primary/15"
                        : "bg-surface-high"
                    }`}
                    style={isMe ? { border: "1px solid rgba(182,160,255,0.3)" } : {}}
                  >
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-[0.75rem] flex items-center justify-center font-extrabold text-base shrink-0"
                      style={{
                        background: entry.rank <= 3 ? `${rankColor(entry.rank)}20` : "rgba(76,64,113,0.3)",
                        color: entry.rank <= 3 ? rankColor(entry.rank) : "#7a6f99"
                      }}>
                      {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : `#${entry.rank}`}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-on-surface font-bold text-sm truncate">
                        {entry.name}
                        {isMe && <span className="ml-2 text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-pill">Kamu</span>}
                      </p>
                      <p className="text-on-surface-variant text-xs">{entry.score.toLocaleString()} pts</p>
                    </div>

                    {/* Delta badge */}
                    {entry.delta > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.06, type: "spring", bounce: 0.5 }}
                        className="text-success text-xs font-extrabold bg-success/10 px-2 py-1 rounded-pill shrink-0"
                      >
                        +{entry.delta}
                      </motion.span>
                    )}

                    {/* Rank change arrow */}
                    {rankChange !== 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.06 }}
                        className="shrink-0 flex items-center gap-1"
                      >
                        {rankChange > 0 ? (
                          <span className="text-success text-xs font-bold flex items-center gap-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 19V5M5 12l7-7 7 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {rankChange}
                          </span>
                        ) : (
                          <span className="text-error text-xs font-bold flex items-center gap-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5v14M19 12l-7 7-7-7" stroke="#ff6b8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {Math.abs(rankChange)}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {entries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-on-surface-variant/40 text-sm">Belum ada data leaderboard</p>
              </div>
            )}
          </div>
        </LayoutGroup>

        {/* Progress bar for countdown */}
        <div className="mt-6">
          <div className="h-1.5 rounded-pill bg-surface-mid overflow-hidden">
            <motion.div
              className="h-full rounded-pill"
              style={{ background: "linear-gradient(90deg, #b6a0ff, #00d9b8)" }}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const guestName = searchParams.get("guestName");

  const [phase, setPhase] = useState<"loading" | "playing" | "feedback" | "leaderboard" | "result">("loading");
  const [sessionId, setSessionId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [category, setCategory] = useState("Quiz");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [finalLeaderboard, setFinalLeaderboard] = useState<FinalLeaderEntry[]>([]);
  const [interLeader, setInterLeader] = useState<InterLeaderEntry[]>([]);
  const [prevInterLeader, setPrevInterLeader] = useState<InterLeaderEntry[]>([]);
  const [leaderCountdown, setLeaderCountdown] = useState(4);
  const [error, setError] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const leaderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasTimedUpRef = useRef(false);

  // Fetch quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const url = `/api/quiz/${quizId}/play${guestName ? `?guestName=${encodeURIComponent(guestName)}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Gagal memuat quiz"); return; }
        setSessionId(data.sessionId);
        setQuizTitle(data.quiz.title);
        setCategory(data.quiz.category || "Quiz");
        setQuestions(data.questions);
        setPhase("playing");
      } catch { setError("Gagal memuat quiz"); }
    };
    fetchQuiz();
  }, [quizId, guestName]);

  const finishQuiz = useCallback(async () => {
    setPhase("result");
    try {
      const res = await fetch(`/api/quiz/${quizId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setResult(data.result);
      setFinalLeaderboard(data.leaderboard || []);
    } catch {
      setResult({ score, totalTime: 0, accuracy: 0, rank: 0, totalQuestions: questions.length, correctAnswers: 0, wrongAnswers: 0 });
    }
  }, [quizId, sessionId, score, questions.length]);

  const showLeaderboard = useCallback(async (questionId: string, isLast: boolean) => {
    if (isLast) { finishQuiz(); return; }

    // Fetch inter-question leaderboard
    try {
      const res = await fetch(`/api/quiz/${quizId}/leaderboard?questionId=${questionId}&sessionId=${sessionId}`);
      const data = await res.json();
      setPrevInterLeader(interLeader);
      setInterLeader(data.leaderboard || []);
    } catch {}

    setPhase("leaderboard");
    setLeaderCountdown(4);
  }, [quizId, sessionId, interLeader, finishQuiz]);

  // Countdown display + transition out of leaderboard phase
  useEffect(() => {
    if (phase !== "leaderboard") return;

    // Tick countdown display every second
    leaderIntervalRef.current = setInterval(() => {
      setLeaderCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    // After 4 s, advance to next question (outside state-updater so React batches correctly)
    leaderTimerRef.current = setTimeout(() => {
      clearInterval(leaderIntervalRef.current!);
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShortAnswer("");
      setFeedback(null);
      hasTimedUpRef.current = false;
      setPhase("playing");
    }, 4000);

    return () => {
      clearInterval(leaderIntervalRef.current!);
      clearTimeout(leaderTimerRef.current!);
    };
  }, [phase]);

  const handleTimeUp = useCallback(async () => {
    if (hasTimedUpRef.current) return;
    hasTimedUpRef.current = true;

    const question = questions[currentIndex];
    if (!question) return;
    setPhase("feedback");

    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, questionId: question.id, selectedOption: [], timeSpent: question.timeLimit }),
      });
      const data = await res.json();
      setFeedback(data);
      setStreak(0);
    } catch {}

    const isLast = currentIndex >= questions.length - 1;
    setTimeout(() => {
      showLeaderboard(question.id, isLast);
    }, 2000);
  }, [currentIndex, questions, sessionId, quizId, showLeaderboard]);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || questions.length === 0) return;
    const question = questions[currentIndex];
    if (!question) return;

    setTimeRemaining(question.timeLimit);
    startTimeRef.current = Date.now();
    hasTimedUpRef.current = false;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, phase, questions.length, handleTimeUp]);

  const handleSelectAnswer = async (optionId: string) => {
    if (phase !== "playing" || selectedAnswer !== null) return;
    setSelectedAnswer(optionId);
    if (timerRef.current) clearInterval(timerRef.current);

    const question = questions[currentIndex];
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    setPhase("feedback");

    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId, questionId: question.id,
          selectedOption: question.type === "SHORT_ANSWER" ? [shortAnswer] : [optionId],
          timeSpent,
        }),
      });
      const data = await res.json();
      setFeedback(data);
      if (data.isCorrect) {
        setScore(prev => prev + data.pointsEarned);
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
    } catch {}

    const isLast = currentIndex >= questions.length - 1;
    setTimeout(() => {
      showLeaderboard(question.id, isLast);
    }, 2000);
  };

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="card p-12 text-center max-w-md">
        <div className="w-16 h-16 rounded-[1.5rem] bg-error/10 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ff6b8a" strokeWidth="1.8"/>
            <path d="M12 8v4M12 16h.01" stroke="#ff6b8a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-on-surface mb-2">Gagal Memuat</h1>
        <p className="text-on-surface-variant mb-8">{error}</p>
        <button onClick={() => router.push("/")} className="btn-primary w-full">Kembali ke Beranda</button>
      </div>
    </div>
  );

  // ── Loading ──
  if (phase === "loading") return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 rounded-full mx-auto mb-6"
          style={{ border: "3px solid rgba(182,160,255,0.2)", borderTopColor: "#b6a0ff" }}
        />
        <p className="text-on-surface-variant font-medium">Memuat quiz...</p>
      </div>
    </div>
  );

  // ── Inter-question Leaderboard ──
  if (phase === "leaderboard") return (
    <InterLeaderboard
      entries={interLeader}
      prevEntries={prevInterLeader}
      questionNum={currentIndex + 1}
      totalQuestions={questions.length}
      countdown={leaderCountdown}
    />
  );

  // ── Result loading (fetch in-flight) ──
  if (phase === "result" && !result) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 rounded-full mx-auto mb-6"
          style={{ border: "3px solid rgba(182,160,255,0.2)", borderTopColor: "#b6a0ff" }}
        />
        <p className="text-on-surface-variant font-medium">Menghitung hasil...</p>
      </div>
    </div>
  );

  // ── Final Result ──
  if (phase === "result" && result) {
    const grade = result.accuracy >= 90
      ? { label: "Excellent!", color: "#b6a0ff", sub: "Luar biasa! Kamu sangat hebat." }
      : result.accuracy >= 70
      ? { label: "Great Job!", color: "#00d9b8", sub: "Bagus! Hampir sempurna." }
      : result.accuracy >= 50
      ? { label: "Good Try", color: "#ffb86c", sub: "Lumayan! Terus berlatih." }
      : { label: "Keep Going", color: "#ff6b8a", sub: "Jangan menyerah, coba lagi!" };

    return (
      <div className="min-h-screen bg-surface px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #b6a0ff, transparent)" }} />
          <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #00d9b8, transparent)" }} />
        </div>

        <div className="max-w-xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-6"
              style={{ background: `${grade.color}20` }}>
              <span className="text-4xl font-extrabold" style={{ color: grade.color }}>
                {result.accuracy >= 90 ? "★" : result.accuracy >= 70 ? "✓" : result.accuracy >= 50 ? "↑" : "↺"}
              </span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-[-0.02em] mb-2" style={{ color: grade.color }}>
              {grade.label}
            </h1>
            <p className="text-on-surface-variant">{grade.sub}</p>
            <p className="text-on-surface-variant/50 text-sm mt-1">{quizTitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 text-center mb-4"
          >
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-[0.05em] mb-2">Total Skor</p>
            <p className="text-6xl font-extrabold text-gradient tracking-[-0.02em]">
              {result.score.toLocaleString()}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Benar", value: result.correctAnswers, color: "#4ade80" },
              { label: "Salah", value: result.wrongAnswers, color: "#ff6b8a" },
              { label: "Akurasi", value: `${Math.round(result.accuracy)}%`, color: "#b6a0ff" },
              { label: "Peringkat", value: `#${result.rank}`, color: "#ffb86c" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="card p-5 text-center"
              >
                <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-on-surface-variant text-xs mt-1 uppercase tracking-[0.05em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {finalLeaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-on-surface font-bold text-base mb-4 uppercase tracking-[0.05em]">Leaderboard Akhir</h2>
              <div className="space-y-2">
                {finalLeaderboard.map((entry, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-[1rem] ${i < 3 ? "bg-surface-highest" : "bg-surface-mid"}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm w-6 text-center" style={{ color: rankColor(entry.rank) }}>
                        #{entry.rank}
                      </span>
                      <span className="text-on-surface text-sm font-medium">{entry.name}</span>
                    </div>
                    <span className="text-on-surface font-bold text-sm">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3"
          >
            <button onClick={() => router.push("/dashboard")} className="btn-ghost flex-1">Dashboard</button>
            <button onClick={() => router.push("/")} className="btn-primary flex-1">Kembali</button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Playing / Feedback ──
  const question = questions[currentIndex];
  if (!question) return null;

  const timerPercent = (timeRemaining / question.timeLimit) * 100;
  const isLowTime = timeRemaining <= 5;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(126,81,255,0.3), transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,217,184,0.2), transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* ── Header ── */}
      <header className="glass-nav relative z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-[0.625rem] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#b6a0ff,#7e51ff)" }}>
              <LightningIcon />
            </div>
            <span className="font-extrabold text-gradient hidden sm:block">QuizNeon</span>
          </div>

          {/* Center — progress + points + streak */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.08em]">Progress</p>
              <p className="text-on-surface font-bold text-sm leading-none mt-0.5">
                Soal {currentIndex + 1}/{questions.length}
              </p>
            </div>

            <div className="text-center">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.08em]">Poin</p>
              <p className="font-bold text-sm leading-none mt-0.5 text-gradient">{score.toLocaleString()}</p>
            </div>

            <AnimatePresence>
              {streak >= 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="badge-streak flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold"
                >
                  🔥 {streak}x
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="w-9 h-9 rounded-[0.75rem] bg-surface-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
              <BarChartIcon />
            </button>
            <button className="w-9 h-9 rounded-[0.75rem] bg-surface-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
              <UserIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Question Card */}
              <div className="card-highest p-8 mb-6" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
                <p className="text-secondary font-bold text-xs uppercase tracking-[0.08em] mb-4">
                  {category} • Soal {currentIndex + 1}
                </p>
                <h2 className="text-on-surface text-2xl md:text-3xl font-extrabold leading-snug tracking-[-0.01em]">
                  {question.text}
                </h2>
              </div>

              {/* Timer */}
              <div className="mb-6 px-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.08em]">
                    Waktu Tersisa
                  </span>
                  <span className={`font-bold text-sm font-mono ${isLowTime ? "text-error animate-pulse" : "text-on-surface"}`}>
                    {timeRemaining}s
                  </span>
                </div>
                <div className="h-2 rounded-pill bg-surface-lowest overflow-hidden">
                  <motion.div
                    className="h-full rounded-pill"
                    style={{
                      background: isLowTime
                        ? "linear-gradient(90deg, #ff6b8a, #c0334f)"
                        : "linear-gradient(90deg, #00d9b8, #b6a0ff)",
                      width: `${timerPercent}%`,
                    }}
                    transition={{ duration: 0.9, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Answers */}
              {question.type === "SHORT_ANSWER" ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    placeholder="Ketik jawaban Anda..."
                    className="input-field text-lg text-center flex-1"
                    disabled={phase !== "playing"}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && shortAnswer.trim() && handleSelectAnswer(shortAnswer)}
                    id="short-answer-input"
                  />
                  <button
                    onClick={() => handleSelectAnswer(shortAnswer)}
                    disabled={phase !== "playing" || !shortAnswer.trim()}
                    className="btn-primary disabled:opacity-40"
                  >
                    Kirim
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, i) => {
                    const accent = optionAccents[i % 4];
                    const isCorrect = feedback?.correctAnswers.includes(option.id);
                    const isWrong = selectedAnswer === option.id && feedback && !feedback.isCorrect;
                    const isIdle = feedback && !isCorrect && selectedAnswer !== option.id;

                    return (
                      <motion.button
                        key={option.id}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={phase === "playing" ? { scale: 1.025 } : {}}
                        whileTap={phase === "playing" ? { scale: 0.975 } : {}}
                        onClick={() => handleSelectAnswer(option.id)}
                        disabled={phase !== "playing"}
                        id={`answer-${option.id}`}
                        className={`answer-card text-left ${
                          isCorrect ? "answer-card-correct" :
                          isWrong ? "answer-card-wrong" :
                          isIdle ? "answer-card-disabled" : ""
                        }`}
                        style={
                          !isCorrect && !isWrong && !isIdle
                            ? { backgroundColor: accent.bg }
                            : undefined
                        }
                      >
                        <span
                          className="shrink-0 w-9 h-9 rounded-[0.75rem] flex items-center justify-center text-sm font-extrabold"
                          style={{
                            background: isCorrect ? "#16a34a" : isWrong ? "#c0334f" : accent.badge,
                            color: "white",
                          }}
                        >
                          {i + 1}
                        </span>

                        <span className="flex-1 font-semibold text-on-surface">{option.text}</span>

                        {isCorrect && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                            className="text-success text-xl shrink-0">✓</motion.span>
                        )}
                        {isWrong && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="text-error text-xl shrink-0">✗</motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Points float */}
              <AnimatePresence>
                {feedback && feedback.pointsEarned > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -50 }}
                    transition={{ duration: 1.4 }}
                    className="text-center mt-5"
                  >
                    <span className="text-3xl font-extrabold text-gradient">+{feedback.pointsEarned}</span>
                  </motion.div>
                )}
                {feedback && feedback.pointsEarned === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-5"
                  >
                    <span className="text-lg font-bold text-error">
                      {selectedAnswer ? "Jawaban salah" : "Waktu habis!"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Explanation */}
              {feedback?.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-5 bg-surface-high rounded-[1rem]"
                >
                  <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                    Penjelasan
                  </p>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{feedback.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Question progress bar ── */}
      <footer className="relative z-10 px-6 pb-6">
        <div className="flex items-center gap-1.5 max-w-3xl mx-auto">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-pill transition-all duration-400"
              style={{
                background: i < currentIndex
                  ? "#4ade80"
                  : i === currentIndex
                  ? "linear-gradient(90deg, #b6a0ff, #7e51ff)"
                  : "rgba(76,64,113,0.4)"
              }}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
