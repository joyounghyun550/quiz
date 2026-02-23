"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import type { TierName } from "@/shared/types/database.type";

import HintRevealer from "@/entities/question/ui/HintRevealer";
import OptionList from "@/entities/question/ui/OptionList";
import QuestionCard from "@/entities/question/ui/QuestionCard";
import { calculateLpChange } from "@/entities/user/lib/lp.util";
import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { checkAnswer, getHintLevel } from "@/features/daily-quiz/lib/quiz-logic.util";
import AnswerFeedback from "@/features/daily-quiz/ui/AnswerFeedback";
import QuizProgress from "@/features/daily-quiz/ui/QuizProgress";

import { useQuizStore } from "@/stores/use-quiz-store";

type QuizFlowProps = {
  userTier: TierName;
  userStreak: number;
};

const QuizFlow = ({ userTier, userStreak }: QuizFlowProps) => {
  const router = useRouter();
  const {
    questions,
    currentIndex,
    selectAnswer,
    useHint: applyHint,
    nextQuestion,
    completeSession,
    sessionId,
    sessionType,
  } = useQuizStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    isCorrect: boolean;
    lpChange: number;
    explanation: string;
    explanationCode?: string | null;
  } | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion || showFeedback) return;
      selectAnswer(currentQuestion.id, optionId);
    },
    [currentQuestion, showFeedback, selectAnswer]
  );

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion?.selectedAnswer) return;

    const result = checkAnswer(currentQuestion, currentQuestion.selectedAnswer);
    const hintLevel = getHintLevel(currentQuestion);
    const userTierDifficulty = getTierDifficulty(userTier);

    const lpChange =
      sessionType === "placement"
        ? 0
        : calculateLpChange({
            isCorrect: result.isCorrect,
            questionDifficulty: currentQuestion.difficulty,
            userTierDifficulty,
            currentStreak: userStreak,
            hintLevel,
          });

    setCurrentResult({
      isCorrect: result.isCorrect,
      lpChange,
      explanation: currentQuestion.explanation,
      explanationCode: currentQuestion.explanation_code,
    });
    setShowFeedback(true);
  }, [currentQuestion, userTier, userStreak, sessionType]);

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    setCurrentResult(null);

    if (currentIndex >= questions.length - 1) {
      completeSession();
      router.push(`/quiz/result?session=${sessionId}`);
    } else {
      nextQuestion();
    }
  }, [currentIndex, questions.length, completeSession, nextQuestion, router, sessionId]);

  const handleHintReveal = useCallback(
    (level: 1 | 2) => {
      if (!currentQuestion) return;
      applyHint(currentQuestion.id, level);
    },
    [currentQuestion, applyHint]
  );

  if (!currentQuestion) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-gray-400">문제를 불러오는 중...</p>
      </div>
    );
  }

  const answerStates = questions.map((q) => {
    if (!q.selectedAnswer) return null;
    return q.correct_answer === q.selectedAnswer;
  });

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950 px-5 pb-8 pt-4">
      {/* Progress */}
      <QuizProgress current={currentIndex} total={questions.length} answers={answerStates} />

      {/* Question */}
      <div className="mt-6 flex flex-1 flex-col gap-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
        />

        {/* Options */}
        {!showFeedback && currentQuestion.options && (
          <>
            <OptionList
              options={currentQuestion.options}
              selectedId={currentQuestion.selectedAnswer ?? null}
              onSelect={handleSelect}
            />

            {/* Hints */}
            <HintRevealer
              hint1={currentQuestion.hint_1}
              hint2={currentQuestion.hint_2}
              hint1Used={!!currentQuestion.hint1Used}
              hint2Used={!!currentQuestion.hint2Used}
              onRevealHint={handleHintReveal}
            />

            {/* Submit Button */}
            <button
              type="button"
              disabled={!currentQuestion.selectedAnswer}
              onClick={handleSubmitAnswer}
              className="mt-auto h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500"
            >
              정답 확인
            </button>
          </>
        )}

        {/* Feedback */}
        {showFeedback && currentResult && (
          <>
            {currentQuestion.options && (
              <OptionList
                options={currentQuestion.options}
                selectedId={currentQuestion.selectedAnswer ?? null}
                correctId={currentQuestion.correct_answer}
                showResult
                disabled
                onSelect={() => undefined}
              />
            )}
            <AnswerFeedback
              isCorrect={currentResult.isCorrect}
              lpChange={currentResult.lpChange}
              explanation={currentResult.explanation}
              explanationCode={currentResult.explanationCode}
              onNext={handleNext}
              isLast={currentIndex >= questions.length - 1}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QuizFlow;
