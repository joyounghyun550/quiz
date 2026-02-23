import type { QuestionOption, QuizQuestion } from "@/entities/question/model/types";

type AnswerResult = {
  isCorrect: boolean;
  correctAnswer: string;
  correctOptionText: string | null;
};

export const checkAnswer = (question: QuizQuestion, selectedAnswer: string): AnswerResult => {
  const isCorrect = question.correct_answer === selectedAnswer;

  let correctOptionText: string | null = null;
  if (question.options) {
    const correctOption = (question.options as QuestionOption[]).find((o) => o.id === question.correct_answer);
    correctOptionText = correctOption?.text ?? null;
  }

  return {
    isCorrect,
    correctAnswer: question.correct_answer,
    correctOptionText,
  };
};

export const getHintLevel = (question: QuizQuestion): 0 | 1 | 2 => {
  if (question.hint2Used) return 2;
  if (question.hint1Used) return 1;
  return 0;
};

export const calculateQuizSummary = (questions: QuizQuestion[]) => {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q) => q.selectedAnswer);
  const correctCount = answeredQuestions.filter((q) => q.correct_answer === q.selectedAnswer).length;
  const incorrectCount = answeredQuestions.length - correctCount;
  const hintUsedCount = questions.filter((q) => q.hint1Used || q.hint2Used).length;
  const totalTimeMs = questions.reduce((sum, q) => sum + (q.timeSpentMs ?? 0), 0);
  const accuracy = answeredQuestions.length > 0 ? (correctCount / answeredQuestions.length) * 100 : 0;

  return {
    totalQuestions,
    answeredCount: answeredQuestions.length,
    correctCount,
    incorrectCount,
    hintUsedCount,
    totalTimeMs,
    accuracy: Math.round(accuracy),
  };
};
