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

const optionAccents = [
  { bg: "rgba(182,160,255,0.12)", ring: "#b6a0ff" },
  { bg: "rgba(0,217,184,0.10)",   ring: "#00d9b8" },
  { bg: "rgba(255,184,108,0.10)", ring: "#ffb86c" },
  { bg: "rgba(192,132,252,0.10)", ring: "#c084fc" },
];

export default function CreateQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "Umum",
    mode: "OPEN" as "OPEN" | "SCHEDULED",
    visibility: "PRIVATE" as "PUBLIC" | "PRIVATE" | "DRAFT",
    randomizeQ: false,
    randomizeA: false,
    maxParticipants: null as number | null,
    showLiveBoard: true,
    allowGuest: false,
    scheduledAt: "",
    expiresAt: "",
  });

  const [questions, setQuestions] = useState<QuestionData[]>([{ ...defaultQuestion }]);
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
    if (data.type === "TRUE_FALSE") {
      updated[index].options = [
        { id: "a", text: "Benar", isCorrect: true },
        { id: "b", text: "Salah", isCorrect: false },
      ];
    } else if (data.type === "SHORT_ANSWER") {
      updated[index].options = [{ id: "a", text: "", isCorrect: true }];
    } else if (data.type === "MULTIPLE_CHOICE" && updated[index].options.length < 2) {
      updated[index].options = [...defaultQuestion.options];
    }
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, data: Partial<{ text: string; isCorrect: boolean }>) => {
    const updated = [...questions];
    const opts = [...updated[qIndex].options];
    opts[oIndex] = { ...opts[oIndex], ...data };
    if (data.isCorrect && updated[qIndex].type !== "MULTIPLE_SELECT") {
      opts.forEach((o, i) => { if (i !== oIndex) o.isCorrect = false; });
    }
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const buildPayload = (publish = false) => ({
    ...quizData,
    scheduledAt: quizData.scheduledAt || null,
    expiresAt: quizData.expiresAt || null,
    questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
  });

  const handleSubmit = async () => {
    if (!quizData.title.trim()) { toast.error("Judul quiz wajib diisi"); setStep(1); return; }
    const emptyQ = questions.findIndex((q) => !q.text.trim());
    if (emptyQ !== -1) { toast.error(`Pertanyaan #${emptyQ + 1} belum diisi`); setActiveQ(emptyQ); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Gagal membuat quiz"); return; }
      toast.success("Quiz berhasil disimpan sebagai draft!");
      router.push("/admin/quiz");
      router.refresh();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setLoading(false); }
  };

  const handlePublish = async () => {
    if (!quizData.title.trim()) { toast.error("Judul quiz wajib diisi"); setStep(1); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Gagal membuat quiz"); return; }

      const pubRes = await fetch(`/api/admin/quiz/${data.quiz.id}/publish`, { method: "POST" });
      if (pubRes.ok) {
        const msg = quizData.mode === "SCHEDULED"
          ? `Quiz terjadwal! Kode: ${data.quiz.code}`
          : `Quiz dipublish! Kode: ${data.quiz.code}`;
        toast.success(msg);
        router.push("/admin/quiz");
        router.refresh();
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setLoading(false); }
  };

  const currentQ = questions[activeQ];

  const Toggle = ({ k, label }: { k: string; label: string }) => (
    <label className="flex items-center gap-3 p-4 rounded-[1rem] bg-surface-mid cursor-pointer hover:bg-surface-high transition-colors">
      <input type="checkbox" checked={(quizData as any)[k]}
        onChange={(e) => setQuizData({ ...quizData, [k]: e.target.checked })}
        className="w-4 h-4 accent-primary rounded" />
      <span className="text-on-surface-variant text-sm font-medium">{label}</span>
    </label>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-[-0.01em]">Buat Quiz Baru</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Step {step}/3 — {step === 1 ? "Detail Quiz" : step === 2 ? "Buat Soal" : "Review & Publish"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <button key={s} onClick={() => setStep(s)}
              className={`w-9 h-9 rounded-[0.75rem] flex items-center justify-center font-bold text-sm transition-all ${
                s === step ? "text-primary-on scale-110" :
                s < step ? "bg-success/20 text-success" :
                "bg-surface-mid text-on-surface-variant"
              }`}
              style={s === step ? { background: "linear-gradient(135deg,#b6a0ff,#7e51ff)" } : {}}>
              {s < step ? "✓" : s}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="card p-8">
            <h2 className="text-lg font-bold text-on-surface mb-6">Detail Quiz</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Judul Quiz *</label>
                <input type="text" value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  placeholder="Contoh: Quiz Sejarah Indonesia"
                  className="input-field text-lg" id="quiz-title-input" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Deskripsi</label>
                <textarea value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  placeholder="Deskripsi singkat..." rows={3} className="input-field resize-none" />
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Kategori</label>
                <select value={quizData.category}
                  onChange={(e) => setQuizData({ ...quizData, category: e.target.value })}
                  className="input-field">
                  {["Umum","Matematika","Sains","Bahasa","Sejarah","Teknologi","Seni","Olahraga"].map((c) => (
                    <option key={c} value={c} className="bg-surface-high">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Visibilitas</label>
                <select value={quizData.visibility}
                  onChange={(e) => setQuizData({ ...quizData, visibility: e.target.value as any })}
                  className="input-field">
                  <option value="PRIVATE" className="bg-surface-high">Private (hanya via kode)</option>
                  <option value="PUBLIC" className="bg-surface-high">Publik</option>
                </select>
              </div>

              {/* Quiz Mode */}
              <div className="md:col-span-2">
                <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-3">Mode Quiz</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "OPEN", label: "Open", desc: "Peserta langsung mulai, tanpa ruang tunggu" },
                    { value: "SCHEDULED", label: "Terjadwal", desc: "Ada ruang tunggu, admin yang memulai" },
                  ].map((mode) => (
                    <button key={mode.value} type="button"
                      onClick={() => setQuizData({ ...quizData, mode: mode.value as any })}
                      className={`p-4 rounded-[1rem] text-left transition-all ${
                        quizData.mode === mode.value
                          ? "bg-primary/15 ring-1 ring-primary"
                          : "bg-surface-mid hover:bg-surface-high"
                      }`}>
                      <p className="text-on-surface font-bold text-sm">{mode.label}</p>
                      <p className="text-on-surface-variant text-xs mt-1">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduled At */}
              {quizData.mode === "SCHEDULED" && (
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                      Jadwal Buka Ruang Tunggu
                    </label>
                    <input type="datetime-local" value={quizData.scheduledAt}
                      onChange={(e) => setQuizData({ ...quizData, scheduledAt: e.target.value })}
                      className="input-field" />
                  </div>
                </div>
              )}

              {/* Expires At for OPEN mode */}
              {quizData.mode === "OPEN" && (
                <div>
                  <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">
                    Batas Waktu (opsional)
                  </label>
                  <input type="datetime-local" value={quizData.expiresAt}
                    onChange={(e) => setQuizData({ ...quizData, expiresAt: e.target.value })}
                    className="input-field" />
                </div>
              )}

              {/* Toggles */}
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Toggle k="randomizeQ" label="Acak Soal" />
                <Toggle k="randomizeA" label="Acak Jawaban" />
                <Toggle k="showLiveBoard" label="Leaderboard Live" />
                <Toggle k="allowGuest" label="Izinkan Tamu" />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={() => setStep(2)} className="btn-primary" id="step1-next-btn">
                Lanjut ke Soal →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex gap-5">
            {/* Sidebar */}
            <div className="w-56 shrink-0">
              <div className="card p-4 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em]">
                    Soal ({questions.length})
                  </p>
                  <button onClick={addQuestion} className="text-primary text-sm font-bold" id="add-question-btn">+ Tambah</button>
                </div>
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                  {questions.map((q, i) => (
                    <button key={i} onClick={() => setActiveQ(i)}
                      className={`w-full text-left p-3 rounded-[0.75rem] text-xs transition-all ${
                        activeQ === i ? "bg-primary/15 text-primary font-bold" : "bg-surface-mid text-on-surface-variant hover:bg-surface-high"
                      }`}>
                      <span className="text-on-surface-variant/50 mr-1">#{i + 1}</span>
                      <span className="truncate block">{q.text || "Belum diisi..."}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1">
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-on-surface">Soal #{activeQ + 1}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => duplicateQuestion(activeQ)} className="btn-ghost text-sm p-2" title="Duplikat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8"/></svg>
                    </button>
                    <button onClick={() => removeQuestion(activeQ)} disabled={questions.length <= 1}
                      className="btn-ghost text-sm p-2 text-error/70 hover:text-error disabled:opacity-30">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>

                {/* Type */}
                <div className="mb-5">
                  <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Tipe</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: "MULTIPLE_CHOICE", label: "Pilihan Ganda" },
                      { value: "TRUE_FALSE", label: "Benar/Salah" },
                      { value: "SHORT_ANSWER", label: "Isian Singkat" },
                      { value: "MULTIPLE_SELECT", label: "Multi Select" },
                    ].map((t) => (
                      <button key={t.value} onClick={() => updateQuestion(activeQ, { type: t.value as any })}
                        className={`p-2.5 rounded-[0.75rem] text-xs font-semibold transition-all ${
                          currentQ.type === t.value ? "text-primary-on" : "bg-surface-mid text-on-surface-variant hover:bg-surface-high"
                        }`}
                        style={currentQ.type === t.value ? { background: "linear-gradient(135deg,#b6a0ff,#7e51ff)" } : {}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div className="mb-5">
                  <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Pertanyaan *</label>
                  <textarea value={currentQ.text}
                    onChange={(e) => updateQuestion(activeQ, { text: e.target.value })}
                    placeholder="Tulis pertanyaan di sini..." rows={3}
                    className="input-field text-lg resize-none" id="question-text-input" />
                </div>

                {/* Options */}
                {currentQ.type !== "SHORT_ANSWER" ? (
                  <div className="mb-5">
                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-3">Opsi Jawaban</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQ.options.map((opt, oi) => {
                        const accent = optionAccents[oi % 4];
                        return (
                          <div key={oi} className="relative rounded-[1rem] p-4 transition-all"
                            style={{ background: accent.bg, outline: opt.isCorrect ? `2px solid ${accent.ring}` : "none" }}>
                            <div className="flex items-center gap-3">
                              <button type="button"
                                onClick={() => updateOption(activeQ, oi, { isCorrect: !opt.isCorrect })}
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all text-xs font-bold`}
                                style={{ background: opt.isCorrect ? accent.ring : "rgba(255,255,255,0.1)", color: "white" }}>
                                {opt.isCorrect && "✓"}
                              </button>
                              <input type="text" value={opt.text}
                                onChange={(e) => updateOption(activeQ, oi, { text: e.target.value })}
                                placeholder={`Opsi ${String.fromCharCode(65 + oi)}`}
                                className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/40 font-semibold outline-none text-sm" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mb-5">
                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Jawaban Benar</label>
                    <input type="text" value={currentQ.options[0]?.text || ""}
                      onChange={(e) => updateOption(activeQ, 0, { text: e.target.value })}
                      placeholder="Ketik jawaban yang benar..." className="input-field" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Waktu (detik)</label>
                    <select value={currentQ.timeLimit}
                      onChange={(e) => updateQuestion(activeQ, { timeLimit: parseInt(e.target.value) })}
                      className="input-field">
                      {[10, 15, 20, 30, 45, 60, 90].map((t) => (
                        <option key={t} value={t} className="bg-surface-high">{t} detik</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Poin</label>
                    <select value={currentQ.points}
                      onChange={(e) => updateQuestion(activeQ, { points: parseInt(e.target.value) })}
                      className="input-field">
                      {[500, 1000, 2000].map((p) => (
                        <option key={p} value={p} className="bg-surface-high">{p} poin</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] mb-2">Penjelasan (opsional)</label>
                  <textarea value={currentQ.explanation}
                    onChange={(e) => updateQuestion(activeQ, { explanation: e.target.value })}
                    placeholder="Penjelasan jawaban yang benar..." rows={2} className="input-field resize-none" />
                </div>

                <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(76,64,113,0.2)" }}>
                  <button onClick={() => setStep(1)} className="btn-ghost text-sm">← Kembali</button>
                  <div className="flex items-center gap-3">
                    {activeQ < questions.length - 1
                      ? <button onClick={() => setActiveQ(activeQ + 1)} className="btn-ghost text-sm">Soal Berikutnya →</button>
                      : <button onClick={addQuestion} className="btn-ghost text-sm">+ Tambah Soal</button>}
                    <button onClick={() => setStep(3)} className="btn-primary" id="step2-next-btn">Review →</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="card p-8">
            <h2 className="text-lg font-bold text-on-surface mb-6">Review & Publish</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Mode", value: quizData.mode === "SCHEDULED" ? "Terjadwal" : "Open" },
                { label: "Jumlah Soal", value: questions.length },
                { label: "Estimasi Waktu", value: `${Math.ceil(questions.reduce((a, q) => a + q.timeLimit, 0) / 60)} mnt` },
                { label: "Total Poin", value: questions.reduce((a, q) => a + q.points, 0).toLocaleString() },
              ].map((s, i) => (
                <div key={i} className="bg-surface-mid rounded-[1rem] p-4 text-center">
                  <p className="text-on-surface-variant text-xs uppercase tracking-[0.05em]">{s.label}</p>
                  <p className="text-on-surface font-bold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-8">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-surface-mid rounded-[1rem]">
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant text-xs font-mono">#{i + 1}</span>
                    <div>
                      <p className="text-on-surface text-sm font-medium">{q.text || "Soal belum diisi"}</p>
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        {q.type.replace("_", " ")} · {q.timeLimit}s · {q.points} poin
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveQ(i); setStep(2); }} className="text-primary text-sm font-semibold hover:text-on-surface transition-colors">Edit</button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6" style={{ borderTop: "1px solid rgba(76,64,113,0.2)" }}>
              <button onClick={() => setStep(2)} className="btn-ghost">← Kembali</button>
              <div className="flex items-center gap-3">
                <button onClick={handleSubmit} disabled={loading} className="btn-ghost" id="save-draft-btn">
                  {loading ? "Menyimpan..." : "Simpan Draft"}
                </button>
                <button onClick={handlePublish} disabled={loading} className="btn-primary" id="publish-quiz-btn">
                  {loading ? "Publishing..." :
                    quizData.mode === "SCHEDULED" ? "Publish (Terjadwal)" : "Publish Quiz"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
