"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface QuizInfo {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  code: string;
  questionsCount: number;
  participantsCount: number;
  createdBy: string;
  allowGuest: boolean;
}

export default function JoinQuizPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
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
      <div className="min-h-screen gradient-dark flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md"
        >
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-white/50 mb-6">{error}</p>
          <Link href="/" className="btn-primary inline-block">
            ← Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 max-w-lg w-full text-center relative z-10"
      >
        <div className="w-20 h-20 rounded-card gradient-primary flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎯</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{quiz?.title}</h1>
        {quiz?.description && (
          <p className="text-white/50 mb-4">{quiz.description}</p>
        )}

        <div className="flex items-center justify-center gap-6 text-white/40 text-sm mb-6">
          <span>📝 {quiz?.questionsCount} soal</span>
          <span>👥 {quiz?.participantsCount} peserta</span>
          <span>👤 {quiz?.createdBy}</span>
        </div>

        <div className="p-4 bg-white/5 rounded-answer mb-8">
          <p className="text-white/40 text-xs mb-1">Kode Quiz</p>
          <p className="text-primary font-mono font-bold text-3xl tracking-[0.3em]">
            {quiz?.code}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/play/${quiz?.id}`)}
          className="btn-primary w-full text-lg py-4"
          id="start-quiz-btn"
        >
          🚀 Mulai Quiz
        </motion.button>

        <Link
          href="/"
          className="block text-white/30 text-sm mt-4 hover:text-white/50 transition-colors"
        >
          ← Kembali
        </Link>
      </motion.div>
    </div>
  );
}
