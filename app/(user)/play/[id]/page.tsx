"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

interface LeaderEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
}

const answerColors = [
  "bg-answer-blue",
  "bg-answer-teal",
  "bg-answer-orange",
  "bg-answer-purple",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PlayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [phase, setPhase] = useState<"loading" | "playing" | "feedback" | "result">("loading");
  const [sessionId, setSessionId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [error, setError] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasTimedUpRef = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${quizId}/play`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Gagal memuat quiz"); return; }
        setSessionId(data.sessionId);
        setQuizTitle(data.quiz.title);
        setQuestions(data.questions);
        setPhase("playing");
      } catch { setError("Gagal memuat quiz"); }
    };
    fetchQuiz();
  }, [quizId]);

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

    setTimeout(() => {
      if (currentIndex >= questions.length - 1) { finishQuiz(); }
      else {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShortAnswer("");
        setFeedback(null);
        hasTimedUpRef.current = false;
        setPhase("playing");
      }
    }, 2000);
  }, [currentIndex, questions, sessionId, quizId]);

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
      if (data.isCorrect) { setScore(prev => prev + data.pointsEarned); setStreak(prev => prev + 1); }
      else { setStreak(0); }
    } catch {}

    setTimeout(() => {
      if (currentIndex >= questions.length - 1) { finishQuiz(); }
      else {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShortAnswer("");
        setFeedback(null);
        setPhase("playing");
      }
    }, 2000);
  };

  const finishQuiz = async () => {
    setPhase("result");
    try {
      const res = await fetch(`/api/quiz/${quizId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setResult(data.result);
      setLeaderboard(data.leaderboard);
    } catch {
      setResult({ score, totalTime: 0, accuracy: 0, rank: 0, totalQuestions: questions.length, correctAnswers: 0, wrongAnswers: 0 });
    }
  };

  if (error) return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-6">
      <div className="glass-card p-12 text-center max-w-md">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
        <p className="text-white/50 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="btn-primary">Kembali</button>
      </div>
    </div>
  );

  if (phase === "loading") return (
    <div className="min-h-screen gradient-dark flex items-center justify-center">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-6" />
        <p className="text-white/50 text-lg">Memuat quiz...</p>
      </div>
    </div>
  );

  // RESULT
  if (phase === "result" && result) {
    const grade = result.accuracy >= 90 ? { label: "Excellent!", emoji: "🏆", color: "#FFD700" }
      : result.accuracy >= 70 ? { label: "Good!", emoji: "⭐", color: "#00B894" }
      : result.accuracy >= 50 ? { label: "Fair", emoji: "👍", color: "#FDCB6E" }
      : { label: "Try Again", emoji: "💪", color: "#D63031" };

    return (
      <div className="min-h-screen gradient-dark px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success/20 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: "spring" }} className="text-center mb-8">
            <div className="text-7xl mb-4">{grade.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: grade.color }}>{grade.label}</h1>
            <p className="text-white/50 text-lg">{quizTitle}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-8 text-center mb-6">
            <p className="text-white/40 text-sm mb-2">Total Skor</p>
            <p className="text-6xl font-extrabold text-gradient">{result.score.toLocaleString()}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Benar", value: result.correctAnswers, icon: "✅" },
              { label: "Salah", value: result.wrongAnswers, icon: "❌" },
              { label: "Akurasi", value: `${Math.round(result.accuracy)}%`, icon: "🎯" },
              { label: "Peringkat", value: `#${result.rank}`, icon: "🏅" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="glass-card p-4 text-center">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-white font-bold text-xl mt-2">{stat.value}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {leaderboard.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card p-6 mb-6">
              <h2 className="text-white font-bold text-lg mb-4">🏆 Leaderboard</h2>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-answer ${i < 3 ? "bg-white/10" : "bg-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-white/40"}`}>#{entry.rank}</span>
                      <span className="text-white font-medium">{entry.name}</span>
                    </div>
                    <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center justify-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="btn-secondary">📋 Dashboard</button>
            <button onClick={() => router.push("/")} className="btn-primary">🏠 Kembali</button>
          </motion.div>
        </div>
      </div>
    );
  }

  // PLAYING
  const question = questions[currentIndex];
  if (!question) return null;

  const timerPercent = (timeRemaining / question.timeLimit) * 100;
  const timerColor = timerPercent > 50 ? "bg-success" : timerPercent > 25 ? "bg-warning" : "bg-danger";

  return (
    <div className="min-h-screen gradient-dark flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="text-white/60 text-sm font-medium">Soal {currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/60">
            <span>⏱</span>
            <span className={`font-mono font-bold text-lg ${timeRemaining <= 5 ? "text-danger animate-pulse" : "text-white"}`}>{timeRemaining}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">Poin:</span>
            <span className="text-white font-bold text-lg">{score.toLocaleString()}</span>
          </div>
          {streak >= 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="badge bg-orange-500/20 text-orange-400">🔥 {streak} Streak!</motion.div>
          )}
        </div>
      </header>

      <div className="h-1.5 bg-white/5">
        <div className={`h-full ${timerColor} transition-all duration-1000 ease-linear`} style={{ width: `${timerPercent}%` }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} variants={containerVariants} initial="hidden" animate="visible" className="w-full">
            <motion.div variants={cardVariants} className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug">{question.text}</h2>
            </motion.div>

            {question.type === "SHORT_ANSWER" ? (
              <motion.div variants={cardVariants} className="max-w-lg mx-auto">
                <div className="flex gap-3">
                  <input type="text" value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)}
                    placeholder="Ketik jawaban Anda..." className="input-field text-lg text-center" disabled={phase !== "playing"} autoFocus
                    onKeyDown={(e) => e.key === "Enter" && shortAnswer.trim() && handleSelectAnswer(shortAnswer)} id="short-answer-input" />
                  <button onClick={() => handleSelectAnswer(shortAnswer)} disabled={phase !== "playing" || !shortAnswer.trim()} className="btn-primary">Kirim</button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, i) => {
                  let extraClasses = "";
                  if (feedback) {
                    if (feedback.correctAnswers.includes(option.id)) extraClasses = "!bg-success ring-2 ring-success shadow-lg shadow-success/30";
                    else if (selectedAnswer === option.id && !feedback.isCorrect) extraClasses = "!bg-danger ring-2 ring-danger animate-shake";
                    else extraClasses = "opacity-50";
                  } else if (selectedAnswer === option.id) extraClasses = "ring-2 ring-white";

                  return (
                    <motion.button key={option.id} variants={cardVariants} whileHover={phase === "playing" ? { scale: 1.03 } : {}}
                      whileTap={phase === "playing" ? { scale: 0.97 } : {}} onClick={() => handleSelectAnswer(option.id)}
                      disabled={phase !== "playing"} className={`answer-card ${answerColors[i % 4]} ${extraClasses}`} id={`answer-${option.id}`}>
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                        <span className="flex-1 text-left">{option.text}</span>
                        {feedback && feedback.correctAnswers.includes(option.id) && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">✅</motion.span>}
                        {feedback && selectedAnswer === option.id && !feedback.correctAnswers.includes(option.id) && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">❌</motion.span>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <AnimatePresence>
              {feedback && feedback.pointsEarned > 0 && (
                <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -60 }} transition={{ duration: 1.2 }} className="text-center mt-6">
                  <span className="text-3xl font-extrabold text-success">+{feedback.pointsEarned} 🔥</span>
                </motion.div>
              )}
              {feedback && feedback.pointsEarned === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
                  <span className="text-xl text-danger font-bold">{selectedAnswer ? "Jawaban salah" : "Waktu habis!"}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {feedback?.explanation && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-white/5 rounded-answer text-center">
                <p className="text-white/40 text-xs mb-1">💡 Penjelasan</p>
                <p className="text-white/70 text-sm">{feedback.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="px-6 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${i < currentIndex ? "bg-success" : i === currentIndex ? "bg-primary animate-pulse" : "bg-white/10"}`} />
          ))}
        </div>
      </footer>
    </div>
  );
}
