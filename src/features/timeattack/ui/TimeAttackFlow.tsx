"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { TIMEATTACK_CONFIG } from "@/shared/constants/tier.constant";
import type { TierName } from "@/shared/types/database.type";

import OptionList from "@/entities/question/ui/OptionList";
import QuestionCard from "@/entities/question/ui/QuestionCard";

import { checkAnswer } from "@/features/daily-quiz/lib/quiz-logic.util";
import QuizProgress from "@/features/daily-quiz/ui/QuizProgress";
import { calculateQuestionScore } from "@/features/timeattack/lib/timeattack-scoring.util";

import { useQuizStore } from "@/stores/use-quiz-store";

type TimeAttackFlowProps = {
  userTier: TierName;
};

const TimeAttackFlow = ({ userTier: _userTier }: TimeAttackFlowProps) => {
  const router = useRouter();
  const { questions, currentIndex, selectAnswer, nextQuestion, completeSession, sessionId, resetSession } =
    useQuizStore();

  const [totalScore, setTotalScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [lastScoreGain, setLastScoreGain] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentResult, setCurrentResult] = useState<{ isCorrect: boolean } | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  // 타이머 상태
  const [remainingMs, setRemainingMs] = useState<number>(TIMEATTACK_CONFIG.TIME_LIMIT_MS);
  const startTimeRef = useRef(Date.now());
  const pausedRemainingRef = useRef<number>(TIMEATTACK_CONFIG.TIME_LIMIT_MS);
  const rafRef = useRef(0);
  const isPaused = showFeedback || showQuitConfirm || timeUp;

  const currentQuestion = questions[currentIndex];

  // 타이머 로직
  useEffect(() => {
    if (isPaused) {
      pausedRemainingRef.current = remainingMs;
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const savedRemaining = pausedRemainingRef.current;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, savedRemaining - elapsed);
      setRemainingMs(newRemaining);

      if (newRemaining <= 0) {
        setTimeUp(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, remainingMs]);

  // 타임업 시 자동 완료
  useEffect(() => {
    if (!timeUp) return;
    completeSession();
    const totalTimeMs = TIMEATTACK_CONFIG.TIME_LIMIT_MS - remainingMs;
    const query = new URLSearchParams({
      session: sessionId ?? "",
      timeattack: "true",
      score: String(totalScore),
      timeMs: String(totalTimeMs),
      comboMax: String(comboMax),
    });
    router.push(`/quiz/result?${query.toString()}`);
  }, [timeUp, completeSession, sessionId, router, totalScore, comboMax, remainingMs]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion || showFeedback || timeUp) return;
      selectAnswer(currentQuestion.id, optionId);

      // 타임어택: 선택 즉시 정답 확인
      const result = checkAnswer(currentQuestion, optionId);

      const newCombo = result.isCorrect ? comboCount + 1 : 0;
      const questionScore = calculateQuestionScore({
        isCorrect: result.isCorrect,
        timeRemainingMs: remainingMs,
        totalTimeMs: TIMEATTACK_CONFIG.TIME_LIMIT_MS,
        comboCount: result.isCorrect ? newCombo : 0,
      });

      setTotalScore((prev) => prev + questionScore);
      setLastScoreGain(questionScore > 0 ? questionScore : null);
      setComboCount(newCombo);
      setComboMax((prev) => Math.max(prev, newCombo));
      setCurrentResult({ isCorrect: result.isCorrect });
      setShowFeedback(true);

      // 1초 후 자동 다음 문제
      setTimeout(() => {
        if (currentIndex >= questions.length - 1) {
          completeSession();
          const totalTimeMs = TIMEATTACK_CONFIG.TIME_LIMIT_MS - remainingMs;
          const query = new URLSearchParams({
            session: sessionId ?? "",
            timeattack: "true",
            score: String(totalScore + questionScore),
            timeMs: String(totalTimeMs),
            comboMax: String(Math.max(comboMax, newCombo)),
          });
          router.push(`/quiz/result?${query.toString()}`);
        } else {
          setShowFeedback(false);
          setCurrentResult(null);
          setLastScoreGain(null);
          nextQuestion();
        }
      }, 800);
    },
    [
      currentQuestion,
      showFeedback,
      timeUp,
      selectAnswer,
      comboCount,
      remainingMs,
      currentIndex,
      questions.length,
      completeSession,
      sessionId,
      router,
      totalScore,
      comboMax,
      nextQuestion,
    ]
  );

  const handleQuit = useCallback(() => {
    setShowQuitConfirm(true);
  }, []);

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
    if (i === currentIndex && !showFeedback) return null;
    if (q.options && q.options.length > 0) {
      const selected = q.options.find((o) => o.id === q.selectedAnswer);
      return selected?.isCorrect ?? false;
    }
    return q.correct_answer === q.selectedAnswer;
  });

  const seconds = Math.ceil(remainingMs / 1000);
  const progress = remainingMs / TIMEATTACK_CONFIG.TIME_LIMIT_MS;
  const isUrgent = seconds <= 10;
  const isCritical = seconds <= 5;
  const barColor = isCritical ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-cyan-400";

  const comboEmoji =
    comboCount >= 5 ? "🔥" : comboCount >= 4 ? "⚡" : comboCount >= 3 ? "✨" : comboCount >= 2 ? "🎯" : "";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950">
      {/* 나가기 확인 모달 */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl border border-gray-700 bg-gray-900 p-6 sm:rounded-2xl">
            <h3 className="mb-1 text-base font-bold text-white">타임어택을 포기하시겠어요?</h3>
            <p className="mb-5 text-sm text-gray-400">포기하면 현재 진행 상황이 사라집니다.</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600"
              >
                계속하기
              </button>
              <button
                type="button"
                onClick={handleAbandonQuit}
                className="h-12 w-full rounded-xl border border-gray-700 bg-gray-800 font-semibold text-gray-300 transition-colors hover:bg-gray-700"
              >
                포기하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800/50 px-5 py-3">
        <div className="flex items-center gap-3">
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
            <span className="text-xs font-semibold text-gray-300">타임어택</span>
            <span className="text-[10px] text-gray-600">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">60초</span>
        </div>

        {/* Timer bar */}
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 overflow-hidden rounded-full bg-gray-800">
            <div
              className={`h-2 rounded-full ${barColor} ${isCritical ? "animate-pulse" : ""}`}
              style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }}
            />
          </div>
          <span
            className={`min-w-[3rem] text-right text-lg font-bold tabular-nums ${
              isCritical ? "animate-pulse text-red-400" : isUrgent ? "text-amber-400" : "text-cyan-400"
            }`}
          >
            {seconds}s
          </span>
        </div>

        {/* Score + Combo */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tabular-nums text-white">{totalScore.toLocaleString()}</span>
            <span className="text-xs text-gray-500">점</span>
            <AnimatePresence mode="popLayout">
              {lastScoreGain !== null && lastScoreGain > 0 && (
                <motion.span
                  key={totalScore}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm font-bold text-emerald-400"
                >
                  +{lastScoreGain}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {comboCount >= 2 && (
            <motion.div
              key={comboCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1"
            >
              <span className="text-base">{comboEmoji}</span>
              <span className="text-xs font-bold text-amber-400">{comboCount}콤보</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pt-3">
        <QuizProgress current={currentIndex} total={questions.length} answers={answerStates} />
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-8 pt-4">
        <QuestionCard question={currentQuestion} questionNumber={currentIndex + 1} totalQuestions={questions.length} />

        {/* Options - 선택 즉시 결과 표시 */}
        {currentQuestion.options ? (
          <OptionList
            options={currentQuestion.options}
            selectedId={currentQuestion.selectedAnswer ?? null}
            correctId={showFeedback ? currentQuestion.correct_answer : undefined}
            showResult={showFeedback}
            disabled={showFeedback}
            onSelect={handleSelect}
          />
        ) : (
          <div className="flex gap-3">
            {(["true", "false"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSelect(val)}
                disabled={showFeedback}
                className={`flex h-14 flex-1 items-center justify-center rounded-xl border-2 text-base font-semibold transition-all ${
                  showFeedback && currentResult
                    ? currentQuestion.correct_answer === val
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : currentQuestion.selectedAnswer === val
                        ? "border-red-500 bg-red-500/10 text-red-300"
                        : "border-gray-700 bg-gray-800/50 text-gray-500"
                    : currentQuestion.selectedAnswer === val
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                      : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500"
                }`}
              >
                {val === "true" ? "참 (True)" : "거짓 (False)"}
              </button>
            ))}
          </div>
        )}

        {/* 피드백 인디케이터 */}
        <AnimatePresence>
          {showFeedback && currentResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 ${
                currentResult.isCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              <span className="text-lg">{currentResult.isCorrect ? "⭕" : "❌"}</span>
              <span className="text-sm font-semibold">{currentResult.isCorrect ? "정답!" : "오답!"}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TimeAttackFlow;
