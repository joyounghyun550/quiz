"use client";

import { useCallback, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
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
    resetSession,
  } = useQuizStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    isCorrect: boolean;
    lpChange: number;
    explanation: string;
    explanationCode?: string | null;
    correctOptionText?: string | null;
    correctAnswer?: string;
  } | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

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
      correctOptionText: result.correctOptionText,
      correctAnswer: result.correctAnswer,
    });

    if (result.isCorrect) {
      setComboCount((prev) => {
        const next = prev + 1;
        if (next >= 2) setShowCombo(true);
        return next;
      });
    } else {
      setComboCount(0);
    }

    setShowFeedback(true);
  }, [currentQuestion, userTier, userStreak, sessionType]);

  useEffect(() => {
    if (!showCombo) return;
    const timer = setTimeout(() => setShowCombo(false), 1500);
    return () => clearTimeout(timer);
  }, [showCombo]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      // 마지막 문제: 상태 초기화 없이 바로 이동 (화면 깜빡임 방지)
      completeSession();
      router.push(`/quiz/result?session=${sessionId}`);
    } else {
      setShowFeedback(false);
      setCurrentResult(null);
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

  const handleQuit = useCallback(() => {
    setShowQuitConfirm(true);
  }, []);

  const handleConfirmQuit = useCallback(() => {
    // 세션을 리셋하지 않고 나가기 → localStorage에 자동 저장됨
    router.replace("/quiz");
  }, [router]);

  const handleAbandonQuit = useCallback(() => {
    resetSession();
    router.replace("/quiz");
  }, [resetSession, router]);

  if (!currentQuestion) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-gray-400">문제를 불러오는 중...</p>
      </div>
    );
  }

  const answerStates = questions.map((q, i) => {
    if (!q.selectedAnswer) return null;
    // 현재 문제는 피드백 확인 전까지 색상 표시 안 함 (정답 노출 방지)
    if (i === currentIndex && !showFeedback) return null;
    // options가 있으면 isCorrect 필드 사용 (배치 테스트는 correct_answer가 클라이언트에 없음)
    if (q.options && q.options.length > 0) {
      const selected = q.options.find((o) => o.id === q.selectedAnswer);
      return selected?.isCorrect ?? false;
    }
    return q.correct_answer === q.selectedAnswer;
  });

  const isDaily = sessionType === "daily";
  const isPractice = sessionType === "practice";
  const isRetry = sessionType === "retry";

  const comboEmoji = comboCount >= 5 ? "🔥" : comboCount >= 4 ? "⚡" : comboCount >= 3 ? "✨" : "🎯";
  const comboLabel =
    comboCount >= 5 ? "대단해요!" : comboCount >= 4 ? "엄청난 집중력!" : comboCount >= 3 ? "훌륭해요!" : "연속 정답!";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950">
      {/* 나가기 확인 모달 */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl border border-gray-700 bg-gray-900 p-6 sm:rounded-2xl">
            <h3 className="mb-1 text-base font-bold text-white">퀴즈를 나가시겠어요?</h3>
            <p className="mb-5 text-sm text-gray-400">
              {sessionType === "placement"
                ? "배치 테스트는 나갔다 돌아오면 이어서 풀 수 있어요."
                : "진행 상황이 저장됩니다. 나중에 이어서 풀 수 있어요."}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600"
              >
                계속 풀기
              </button>
              <button
                type="button"
                onClick={handleConfirmQuit}
                className="h-12 w-full rounded-xl border border-gray-700 bg-gray-800 font-semibold text-gray-300 transition-colors hover:bg-gray-700"
              >
                저장하고 나가기
              </button>
              <button
                type="button"
                onClick={handleAbandonQuit}
                className="h-10 w-full rounded-xl text-sm text-gray-500 transition-colors hover:text-red-400"
              >
                처음부터 다시 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 콤보 알림 */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            key={comboCount}
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-gray-900/95 px-5 py-3 shadow-xl backdrop-blur-sm">
              <span className="text-2xl">{comboEmoji}</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-400">{comboCount}콤보!</span>
                <span className="text-[10px] text-gray-400">{comboLabel}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-800/50 px-5 py-3">
        <button
          type="button"
          onClick={handleQuit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-semibold text-gray-300">
            {sessionType === "placement"
              ? "배치 테스트"
              : sessionType === "retry"
                ? "오답 노트"
                : sessionType === "practice"
                  ? "티어 올리기"
                  : "오늘의 퀴즈"}
          </span>
          <span className="text-[10px] text-gray-600">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        {isDaily ? (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">2× LP</span>
        ) : isRetry ? (
          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">오답</span>
        ) : isPractice ? (
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">연습</span>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      {/* Progress */}
      <div className="px-5 pt-3">
        <QuizProgress current={currentIndex} total={questions.length} answers={answerStates} />
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-8 pt-4">
        <QuestionCard question={currentQuestion} questionNumber={currentIndex + 1} totalQuestions={questions.length} />

        {/* Options */}
        {!showFeedback && (
          <>
            {currentQuestion.options ? (
              <OptionList
                options={currentQuestion.options}
                selectedId={currentQuestion.selectedAnswer ?? null}
                onSelect={handleSelect}
              />
            ) : (
              /* True / False 버튼 */
              <div className="flex gap-3">
                {(["true", "false"] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelect(val)}
                    className={`flex h-14 flex-1 items-center justify-center rounded-xl border-2 text-base font-semibold transition-all ${
                      currentQuestion.selectedAnswer === val
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                        : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {val === "true" ? "참 (True)" : "거짓 (False)"}
                  </button>
                ))}
              </div>
            )}

            {/* Hints: 배치 테스트에서는 힌트 사용 불가 */}
            {sessionType !== "placement" && (
              <HintRevealer
                hint1={currentQuestion.hint_1}
                hint2={currentQuestion.hint_2}
                hint1Used={!!currentQuestion.hint1Used}
                hint2Used={!!currentQuestion.hint2Used}
                onRevealHint={handleHintReveal}
              />
            )}

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
              correctOptionText={currentResult.correctOptionText}
              correctAnswer={currentResult.correctAnswer}
              onNext={handleNext}
              isLast={currentIndex >= questions.length - 1}
              isPlacement={sessionType === "placement"}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QuizFlow;
