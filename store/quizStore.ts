import { create } from "zustand";

interface AnswerRecord {
  questionId: string;
  selected: string[];
  isCorrect: boolean;
  points: number;
  timeSpent: number;
}

interface QuizState {
  sessionId: string | null;
  currentQuestionIndex: number;
  score: number;
  streak: number;
  answers: AnswerRecord[];
  timeRemaining: number;
  totalQuestions: number;
  quizTitle: string;

  setSession: (id: string) => void;
  setQuizInfo: (title: string, totalQuestions: number) => void;
  setTimeRemaining: (time: number) => void;
  submitAnswer: (
    questionId: string,
    selected: string[],
    isCorrect: boolean,
    points: number,
    timeSpent: number
  ) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  sessionId: null,
  currentQuestionIndex: 0,
  score: 0,
  streak: 0,
  answers: [],
  timeRemaining: 30,
  totalQuestions: 0,
  quizTitle: "",

  setSession: (id) => set({ sessionId: id }),

  setQuizInfo: (title, totalQuestions) => set({ quizTitle: title, totalQuestions }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  submitAnswer: (questionId, selected, isCorrect, points, timeSpent) =>
    set((state) => ({
      score: state.score + points,
      streak: isCorrect ? state.streak + 1 : 0,
      answers: [
        ...state.answers,
        { questionId, selected, isCorrect, points, timeSpent },
      ],
    })),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  resetQuiz: () =>
    set({
      sessionId: null,
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      timeRemaining: 30,
      totalQuestions: 0,
      quizTitle: "",
    }),
}));
