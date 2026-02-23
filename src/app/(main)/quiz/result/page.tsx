"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import type { TierName } from "@/shared/types/database.type";

import AnswerReview from "@/widgets/quiz-result/ui/AnswerReview";
import ResultSummary from "@/widgets/quiz-result/ui/ResultSummary";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
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

export default function QuizResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const supabase = createSupabaseBrowserClient();
  const { questions, sessionType, resetSession } = useQuizStore();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, answers }),
        });

        const data: SubmitResult = await res.json();
        setResult(data);

        // 배치 테스트 완료 시 has_completed_placement 업데이트
        if (sessionType === "placement") {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            await supabase
              .from("users")
              .update({
                has_completed_placement: true,
                current_lp: data.summary.newTierInfo.lp,
                current_tier: data.summary.newTierInfo.name as TierName,
                current_tier_division: data.summary.newTierInfo.division,
                highest_tier: data.summary.newTierInfo.name as TierName,
                highest_lp: data.summary.newTierInfo.lp,
              })
              .eq("id", user.id);
          }
        }
      } catch {
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    submitAnswers();
  }, [sessionId, questions, sessionType, router, supabase]);

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
      <h1 className="mb-6 text-center text-xl font-bold text-white">
        {sessionType === "placement" ? "배치 테스트 결과" : "오늘의 퀴즈 결과"}
      </h1>

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
      />

      <div className="my-6 h-px bg-gray-800" />

      <AnswerReview items={reviewItems} />

      <button
        type="button"
        onClick={handleGoHome}
        className="mt-8 h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600"
      >
        {sessionType === "placement" ? "시작하기" : "홈으로"}
      </button>
    </div>
  );
}
