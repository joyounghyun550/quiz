import { create } from "zustand";

import type { QuizQuestion } from "@/entities/question/model/types";

type QuizState = {
  questions: QuizQuestion[];
  currentIndex: number;
  sessionId: string | null;
  sessionType: "daily" | "placement";
  isCompleted: boolean;
  startTime: number | null;
  questionStartTime: number | null;

  // Actions
  startSession: (questions: QuizQuestion[], sessionId: string, sessionType: "daily" | "placement") => void;
  selectAnswer: (questionId: string, answerId: string) => void;
  useHint: (questionId: string, level: 1 | 2) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeSession: () => void;
  resetSession: () => void;
  recordTimeSpent: (questionId: string) => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  sessionId: null,
  sessionType: "daily",
  isCompleted: false,
  startTime: null,
  questionStartTime: null,

  startSession: (questions, sessionId, sessionType) =>
    set({
      questions: questions.map((q) => ({ ...q, selectedAnswer: undefined, hint1Used: false, hint2Used: false })),
      currentIndex: 0,
      sessionId,
      sessionType,
      isCompleted: false,
      startTime: Date.now(),
      questionStartTime: Date.now(),
    }),

  selectAnswer: (questionId, answerId) =>
    set((state) => ({
      questions: state.questions.map((q) => (q.id === questionId ? { ...q, selectedAnswer: answerId } : q)),
    })),

  useHint: (questionId, level) =>
    set((state) => ({
      questions: state.questions.map((q) => {
        if (q.id !== questionId) return q;
        if (level === 1) return { ...q, hint1Used: true };
        if (level === 2) return { ...q, hint2Used: true };
        return q;
      }),
    })),

  nextQuestion: () => {
    const { currentIndex, questions, questionStartTime } = get();

    // 현재 문제에 소요 시간 기록
    if (questionStartTime) {
      const currentQuestion = questions[currentIndex];
      if (currentQuestion) {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === currentQuestion.id ? { ...q, timeSpentMs: Date.now() - questionStartTime } : q
          ),
        }));
      }
    }

    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, questionStartTime: Date.now() });
    }
  },

  prevQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
      questionStartTime: Date.now(),
    })),

  completeSession: () => {
    const { questionStartTime, currentIndex, questions } = get();

    // 마지막 문제 시간 기록
    if (questionStartTime) {
      const currentQuestion = questions[currentIndex];
      if (currentQuestion) {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === currentQuestion.id ? { ...q, timeSpentMs: Date.now() - questionStartTime } : q
          ),
          isCompleted: true,
        }));
        return;
      }
    }

    set({ isCompleted: true });
  },

  resetSession: () =>
    set({
      questions: [],
      currentIndex: 0,
      sessionId: null,
      sessionType: "daily",
      isCompleted: false,
      startTime: null,
      questionStartTime: null,
    }),

  recordTimeSpent: (questionId) => {
    const { questionStartTime } = get();
    if (!questionStartTime) return;

    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, timeSpentMs: Date.now() - questionStartTime } : q
      ),
    }));
  },
}));
