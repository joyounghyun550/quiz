"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import AnswerReview from "@/widgets/quiz-result/ui/AnswerReview";
import ResultSummary from "@/widgets/quiz-result/ui/ResultSummary";

import { useQuizStore } from "@/stores/use-quiz-store";

type SubmitResult = {
  answerResults: {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: string;
    lpChange: number;
    explanation: string;
    explanationCode?: string | null;
  }[];
  summary: {
    correctCount: number;
    totalQuestions: number;
    totalLpChange: number;
    newTierInfo: {
      name: string;
      label: string;
      division: number;
      divisionLabel: string;
      lp: number;
      progressPercent: number;
      color: string;
      bgColor: string;
    };
    tierChanged: boolean;
    promoted: boolean;
  };
};

const SESSION_TITLES: Record<string, string> = {
  placement: "배치 테스트 결과",
  retry: "오답 노트 결과",
  practice: "티어 올리기 결과",
  daily: "오늘의 퀴즈 결과",
  timeattack: "타임어택 결과",
  weekly: "위클리 챌린지 결과",
};

export default function QuizResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const { questions, sessionType, resetSession } = useQuizStore();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const submitAnswers = async () => {
      if (!sessionId || questions.length === 0) {
        router.replace("/");
        return;
      }

      try {
        const answers = questions.map((q) => ({
          questionId: q.id,
          userAnswer: q.selectedAnswer ?? "",
          hint1Used: !!q.hint1Used,
          hint2Used: !!q.hint2Used,
          timeSpentMs: q.timeSpentMs ?? 0,
        }));

        const body: Record<string, unknown> = { sessionId, answers };

        // 타임어택 데이터 전달
        if (searchParams.get("timeattack") === "true") {
          body.timeattackData = {
            totalScore: Number(searchParams.get("score") ?? 0),
            totalTimeMs: Number(searchParams.get("timeMs") ?? 0),
            comboMax: Number(searchParams.get("comboMax") ?? 0),
          };
        }

        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          router.replace("/");
          return;
        }

        const data: SubmitResult = await res.json();
        setResult(data);

        // 업적 체크
        try {
          const achRes = await fetch("/api/achievements/check", { method: "POST" });
          if (achRes.ok) {
            const achData = await achRes.json();
            if (achData.newAchievements?.length > 0) {
              for (const ach of achData.newAchievements) {
                toast.success(`${ach.icon} 업적 달성! ${ach.title}`, { duration: 4000 });
              }
            }
          }
        } catch {
          // 업적 체크 실패는 무시
        }
      } catch {
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    submitAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // 마일스톤 토스트
  useEffect(() => {
    if (!result || toastShownRef.current) return;
    toastShownRef.current = true;

    const { correctCount, totalQuestions, tierChanged, promoted } = result.summary;

    if (tierChanged && promoted) {
      const tierLabel = result.summary.newTierInfo.label;
      toast.success(`🎉 티어 승급! ${tierLabel}에 오신 것을 환영합니다!`, { duration: 5000 });
    } else if (correctCount === totalQuestions && totalQuestions > 0) {
      toast.success("🌟 완벽한 점수! 모든 문제를 맞혔어요!", { duration: 4000 });
    }
  }, [result]);

  const handleGoHome = () => {
    resetSession();
    router.push("/");
  };

  if (isLoading || !result) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-gray-400">결과를 계산하는 중...</p>
        </div>
      </div>
    );
  }

  const isPlacement = sessionType === "placement";

  const reviewItems = result.answerResults.map((ar) => {
    const question = questions.find((q) => q.id === ar.questionId);
    return {
      questionId: ar.questionId,
      title: question?.title ?? "",
      category: question?.category ?? "",
      isCorrect: ar.isCorrect,
      userAnswer: question?.selectedAnswer ?? "",
      correctAnswer: ar.correctAnswer,
      options: question?.options?.map((o) => ({ id: o.id, text: o.text })) ?? null,
      explanation: ar.explanation,
      explanationCode: ar.explanationCode,
      codeSnippet: question?.code_snippet,
      codeLanguage: question?.code_language,
      lpChange: ar.lpChange,
    };
  });

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950 px-5 pb-8 pt-6">
      <h1 className="mb-6 text-center text-xl font-bold text-white">{SESSION_TITLES[sessionType] ?? "퀴즈 결과"}</h1>

      <ResultSummary
        correctCount={result.summary.correctCount}
        totalQuestions={result.summary.totalQuestions}
        totalLpChange={result.summary.totalLpChange}
        tierLabel={result.summary.newTierInfo.label}
        tierDivisionLabel={result.summary.newTierInfo.divisionLabel}
        tierColor={result.summary.newTierInfo.color}
        tierBgColor={result.summary.newTierInfo.bgColor}
        tierChanged={result.summary.tierChanged}
        promoted={result.summary.promoted}
        newLp={result.summary.newTierInfo.lp}
        progressPercent={result.summary.newTierInfo.progressPercent}
        isPlacement={isPlacement}
      />

      <div className="my-6 h-px bg-gray-800" />

      <AnswerReview items={reviewItems} isPlacement={isPlacement} />

      <div className="mt-8">
        <button
          type="button"
          onClick={handleGoHome}
          className="h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          {isPlacement ? "시작하기" : "홈으로"}
        </button>
      </div>
    </div>
  );
}
