import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { QuizQuestion } from "@/entities/question/model/types";

type QuizState = {
  questions: QuizQuestion[];
  currentIndex: number;
  sessionId: string | null;
  sessionType: "daily" | "placement" | "practice" | "retry" | "timeattack" | "weekly";
  isCompleted: boolean;
  startTime: number | null;
  questionStartTime: number | null;

  // Actions
  startSession: (
    questions: QuizQuestion[],
    sessionId: string,
    sessionType: "daily" | "placement" | "practice" | "retry" | "timeattack" | "weekly"
  ) => void;
  selectAnswer: (questionId: string, answerId: string) => void;
  useHint: (questionId: string, level: 1 | 2) => void;
  nextQuestion: () => void;
  completeSession: () => void;
  resetSession: () => void;
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: "quiz-session",
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        sessionId: state.sessionId,
        sessionType: state.sessionType,
        isCompleted: state.isCompleted,
        startTime: state.startTime,
        questionStartTime: state.questionStartTime,
      }),
    }
  )
);
