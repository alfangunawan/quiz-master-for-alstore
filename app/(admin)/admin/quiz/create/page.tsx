"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QuestionData {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "MULTIPLE_SELECT";
  text: string;
  image: string | null;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  timeLimit: number;
  points: number;
}

const defaultQuestion: QuestionData = {
  type: "MULTIPLE_CHOICE",
  text: "",
  image: null,
  options: [
    { id: "a", text: "", isCorrect: true },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ],
  explanation: "",
  timeLimit: 30,
  points: 1000,
};

const answerColors = [
  "bg-answer-blue",
  "bg-answer-teal",
  "bg-answer-orange",
  "bg-answer-purple",
];

export default function CreateQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 - Quiz Details
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "Umum",
    visibility: "PRIVATE" as "PUBLIC" | "PRIVATE" | "DRAFT",
    randomizeQ: false,
    randomizeA: false,
    maxParticipants: null as number | null,
    showLiveBoard: true,
    allowGuest: false,
  });

  // Step 2 - Questions
  const [questions, setQuestions] = useState<QuestionData[]>([
    { ...defaultQuestion },
  ]);
  const [activeQ, setActiveQ] = useState(0);

  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion }]);
    setActiveQ(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setActiveQ(Math.min(activeQ, updated.length - 1));
  };

  const duplicateQuestion = (index: number) => {
    const newQ = { ...questions[index] };
    const updated = [...questions];
    updated.splice(index + 1, 0, newQ);
    setQuestions(updated);
    setActiveQ(index + 1);
  };

  const updateQuestion = (index: number, data: Partial<QuestionData>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...data };

    // Auto-adjust options for TRUE_FALSE type
    if (data.type === "TRUE_FALSE") {
      updated[index].options = [
        { id: "a", text: "Benar", isCorrect: true },
        { id: "b", text: "Salah", isCorrect: false },
      ];
    } else if (data.type === "SHORT_ANSWER") {
      updated[index].options = [
        { id: "a", text: "", isCorrect: true },
      ];
    } else if (
      data.type === "MULTIPLE_CHOICE" &&
      updated[index].options.length < 2
    ) {
      updated[index].options = [...defaultQuestion.options];
    }

    setQuestions(updated);
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    data: Partial<{ text: string; isCorrect: boolean }>
  ) => {
    const updated = [...questions];
    const opts = [...updated[qIndex].options];
    opts[oIndex] = { ...opts[oIndex], ...data };

    // For single-answer types, only allow one correct
    if (data.isCorrect && updated[qIndex].type !== "MULTIPLE_SELECT") {
      opts.forEach((o, i) => {
        if (i !== oIndex) o.isCorrect = false;
      });
    }

    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!quizData.title.trim()) {
      toast.error("Judul quiz wajib diisi");
      setStep(1);
      return;
    }

    const emptyQ = questions.findIndex((q) => !q.text.trim());
    if (emptyQ !== -1) {
      toast.error(`Pertanyaan #${emptyQ + 1} belum diisi`);
      setActiveQ(emptyQ);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quizData,
          questions: questions.map((q, i) => ({
            ...q,
            order: i + 1,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal membuat quiz");
        return;
      }

      toast.success("Quiz berhasil dibuat! 🎉");
      router.push("/admin/quiz");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!quizData.title.trim()) {
      toast.error("Judul quiz wajib diisi");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // Create quiz first
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quizData,
          questions: questions.map((q, i) => ({
            ...q,
            order: i + 1,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membuat quiz");
        return;
      }

      // Then publish
      const pubRes = await fetch(`/api/admin/quiz/${data.quiz.id}/publish`, {
        method: "POST",
      });

      if (pubRes.ok) {
        toast.success(`Quiz dipublish! Kode: ${data.quiz.code}`);
        router.push("/admin/quiz");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[activeQ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Buat Quiz Baru</h1>
          <p className="text-white/50 mt-1">
            Step {step} dari 3 —{" "}
            {step === 1
              ? "Detail Quiz"
              : step === 2
              ? "Buat Soal"
              : "Review & Publish"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                s === step
                  ? "bg-primary text-white scale-110"
                  : s < step
                  ? "bg-success/20 text-success"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {s < step ? "✓" : s}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 - Quiz Details */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Detail Quiz</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Judul Quiz *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) =>
                    setQuizData({ ...quizData, title: e.target.value })
                  }
                  placeholder="Contoh: Quiz Sejarah Indonesia"
                  className="input-field text-lg"
                  id="quiz-title-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) =>
                    setQuizData({ ...quizData, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat tentang quiz ini..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Kategori
                </label>
                <select
                  value={quizData.category}
                  onChange={(e) =>
                    setQuizData({ ...quizData, category: e.target.value })
                  }
                  className="input-field"
                >
                  {[
                    "Umum",
                    "Matematika",
                    "Sains",
                    "Bahasa",
                    "Sejarah",
                    "Teknologi",
                    "Seni",
                    "Olahraga",
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
                  value={quizData.visibility}
                  onChange={(e) =>
                    setQuizData({
                      ...quizData,
                      visibility: e.target.value as any,
                    })
                  }
                  className="input-field"
                >
                  <option value="PRIVATE" className="bg-dark">
                    🔒 Private (hanya via kode)
                  </option>
                  <option value="PUBLIC" className="bg-dark">
                    🌍 Publik
                  </option>
                  <option value="DRAFT" className="bg-dark">
                    📝 Draft
                  </option>
                </select>
              </div>

              {/* Toggles */}
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    key: "randomizeQ",
                    label: "Acak Soal",
                    icon: "🔀",
                  },
                  {
                    key: "randomizeA",
                    label: "Acak Jawaban",
                    icon: "🔄",
                  },
                  {
                    key: "showLiveBoard",
                    label: "Leaderboard Live",
                    icon: "🏆",
                  },
                  {
                    key: "allowGuest",
                    label: "Izinkan Guest",
                    icon: "👤",
                  },
                ].map((toggle) => (
                  <label
                    key={toggle.key}
                    className="flex items-center gap-3 p-4 rounded-answer bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={
                        (quizData as any)[toggle.key] as boolean
                      }
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          [toggle.key]: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded accent-primary"
                    />
                    <div>
                      <span className="text-lg">{toggle.icon}</span>
                      <span className="text-white/70 text-sm ml-2">
                        {toggle.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                className="btn-primary"
                id="step1-next-btn"
              >
                Lanjut ke Soal →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 - Questions */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex gap-6"
          >
            {/* Question List Sidebar */}
            <div className="w-64 shrink-0">
              <div className="glass-card p-4 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">
                    Soal ({questions.length})
                  </h3>
                  <button
                    onClick={addQuestion}
                    className="text-primary hover:text-primary-300 text-sm font-semibold"
                    id="add-question-btn"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveQ(i)}
                      className={`w-full text-left p-3 rounded-btn text-sm transition-all ${
                        activeQ === i
                          ? "bg-primary/20 border border-primary/30 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30">#{i + 1}</span>
                        <span className="truncate">
                          {q.text || "Soal belum diisi..."}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Editor */}
            <div className="flex-1">
              <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Soal #{activeQ + 1}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => duplicateQuestion(activeQ)}
                      className="btn-ghost text-sm"
                      title="Duplikat"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => removeQuestion(activeQ)}
                      className="btn-ghost text-sm text-red-400"
                      title="Hapus"
                      disabled={questions.length <= 1}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Question Type */}
                <div className="mb-6">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Tipe Soal
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      {
                        value: "MULTIPLE_CHOICE",
                        label: "Pilihan Ganda",
                        icon: "📝",
                      },
                      {
                        value: "TRUE_FALSE",
                        label: "Benar / Salah",
                        icon: "✅",
                      },
                      {
                        value: "SHORT_ANSWER",
                        label: "Isian Singkat",
                        icon: "✏️",
                      },
                      {
                        value: "MULTIPLE_SELECT",
                        label: "Multi Select",
                        icon: "☑️",
                      },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          updateQuestion(activeQ, {
                            type: type.value as any,
                          })
                        }
                        className={`p-3 rounded-btn text-sm font-medium transition-all ${
                          currentQ.type === type.value
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Pertanyaan *
                  </label>
                  <textarea
                    value={currentQ.text}
                    onChange={(e) =>
                      updateQuestion(activeQ, { text: e.target.value })
                    }
                    placeholder="Tulis pertanyaan Anda di sini..."
                    rows={3}
                    className="input-field text-lg resize-none"
                    id="question-text-input"
                  />
                </div>

                {/* Options */}
                {currentQ.type !== "SHORT_ANSWER" ? (
                  <div className="mb-6">
                    <label className="block text-white/70 text-sm font-medium mb-3">
                      Opsi Jawaban
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQ.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`relative rounded-answer p-4 ${answerColors[oi % 4]} ${
                            opt.isCorrect
                              ? "ring-2 ring-white shadow-lg"
                              : "opacity-80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                updateOption(activeQ, oi, {
                                  isCorrect: !opt.isCorrect,
                                })
                              }
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                opt.isCorrect
                                  ? "border-white bg-white text-green-600"
                                  : "border-white/50"
                              }`}
                            >
                              {opt.isCorrect && (
                                <span className="text-sm font-bold">✓</span>
                              )}
                            </button>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) =>
                                updateOption(activeQ, oi, {
                                  text: e.target.value,
                                })
                              }
                              placeholder={`Opsi ${String.fromCharCode(
                                65 + oi
                              )}`}
                              className="w-full bg-transparent text-white placeholder:text-white/50 font-semibold outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Jawaban Benar (case-insensitive)
                    </label>
                    <input
                      type="text"
                      value={currentQ.options[0]?.text || ""}
                      onChange={(e) =>
                        updateOption(activeQ, 0, { text: e.target.value })
                      }
                      placeholder="Ketik jawaban yang benar..."
                      className="input-field"
                    />
                  </div>
                )}

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      ⏱ Waktu (detik)
                    </label>
                    <select
                      value={currentQ.timeLimit}
                      onChange={(e) =>
                        updateQuestion(activeQ, {
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                    >
                      {[10, 15, 20, 30, 45, 60, 90].map((t) => (
                        <option key={t} value={t} className="bg-dark">
                          {t} detik
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      🏆 Poin
                    </label>
                    <select
                      value={currentQ.points}
                      onChange={(e) =>
                        updateQuestion(activeQ, {
                          points: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                    >
                      {[500, 1000, 2000].map((p) => (
                        <option key={p} value={p} className="bg-dark">
                          {p} poin
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mb-6">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    💡 Penjelasan (opsional)
                  </label>
                  <textarea
                    value={currentQ.explanation}
                    onChange={(e) =>
                      updateQuestion(activeQ, { explanation: e.target.value })
                    }
                    placeholder="Penjelasan jawaban yang benar..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-ghost"
                  >
                    ← Kembali
                  </button>
                  <div className="flex items-center gap-3">
                    {activeQ < questions.length - 1 ? (
                      <button
                        onClick={() => setActiveQ(activeQ + 1)}
                        className="btn-secondary"
                      >
                        Soal Berikutnya →
                      </button>
                    ) : (
                      <button
                        onClick={addQuestion}
                        className="btn-secondary"
                      >
                        + Tambah Soal
                      </button>
                    )}
                    <button
                      onClick={() => setStep(3)}
                      className="btn-primary"
                      id="step2-next-btn"
                    >
                      Review →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3 - Review & Publish */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">
              Review & Publish
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-answer p-4 text-center">
                <p className="text-white/50 text-sm">Judul</p>
                <p className="text-white font-bold mt-1">
                  {quizData.title || "-"}
                </p>
              </div>
              <div className="bg-white/5 rounded-answer p-4 text-center">
                <p className="text-white/50 text-sm">Jumlah Soal</p>
                <p className="text-white font-bold text-2xl mt-1">
                  {questions.length}
                </p>
              </div>
              <div className="bg-white/5 rounded-answer p-4 text-center">
                <p className="text-white/50 text-sm">Estimasi Waktu</p>
                <p className="text-white font-bold mt-1">
                  {Math.ceil(
                    questions.reduce((acc, q) => acc + q.timeLimit, 0) / 60
                  )}{" "}
                  menit
                </p>
              </div>
              <div className="bg-white/5 rounded-answer p-4 text-center">
                <p className="text-white/50 text-sm">Total Poin</p>
                <p className="text-white font-bold mt-1">
                  {questions.reduce((acc, q) => acc + q.points, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Questions Summary */}
            <div className="space-y-3 mb-8">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-answer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-white/30 text-sm font-mono">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {q.text || "Soal belum diisi"}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {q.type.replace("_", " ")} · {q.timeLimit}s ·{" "}
                        {q.points} poin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveQ(i);
                      setStep(2);
                    }}
                    className="text-primary text-sm hover:text-primary-300"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <button onClick={() => setStep(2)} className="btn-ghost">
                ← Kembali
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-secondary"
                  id="save-draft-btn"
                >
                  {loading ? "Menyimpan..." : "💾 Simpan Draft"}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="btn-primary"
                  id="publish-quiz-btn"
                >
                  {loading ? "Publishing..." : "🚀 Publish Quiz"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
