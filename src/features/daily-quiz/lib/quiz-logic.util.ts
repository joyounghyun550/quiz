import type { QuestionOption, QuizQuestion } from "@/entities/question/model/types";

type AnswerResult = {
  isCorrect: boolean;
  correctAnswer: string;
  correctOptionText: string | null;
};

export const checkAnswer = (question: QuizQuestion, selectedAnswer: string): AnswerResult => {
  let isCorrect: boolean;
  let correctOptionText: string | null = null;

  if (question.options && (question.options as QuestionOption[]).length > 0) {
    // 객관식/코드출력: options의 isCorrect 필드로 판단 (correct_answer 문자열 비교보다 신뢰성 높음)
    const selectedOption = (question.options as QuestionOption[]).find((o) => o.id === selectedAnswer);
    isCorrect = selectedOption?.isCorrect ?? false;
    const correctOption = (question.options as QuestionOption[]).find((o) => o.isCorrect);
    correctOptionText = correctOption?.text ?? null;
  } else {
    // true_false: "true" | "false" 문자열 비교
    isCorrect = question.correct_answer === selectedAnswer;
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
