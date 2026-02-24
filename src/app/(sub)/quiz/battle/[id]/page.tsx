"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import type { TierName, UserRow } from "@/shared/types/database.type";

import type { BattleInfo } from "@/entities/battle/model/types";

import BattleWaitingRoom from "@/features/battle/ui/BattleWaitingRoom";
import QuizFlow from "@/features/daily-quiz/ui/QuizFlow";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { useQuizStore } from "@/stores/use-quiz-store";

type BattlePageData = {
  battle: BattleInfo & {
    hostScore: number;
    hostCorrect: number;
    hostTimeMs: number;
    guestScore: number;
    guestCorrect: number;
    guestTimeMs: number;
    winnerId: string | null;
  };
  questions: Array<Record<string, unknown>>;
  isHost: boolean;
};

export default function BattleFlowPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const battleId = params.id as string;

  const { startSession, questions, isCompleted, resetSession, sessionType } = useQuizStore();
  const [battleData, setBattleData] = useState<BattlePageData | null>(null);
  const [userTier, setUserTier] = useState<TierName>("inline");
  const [userStreak, setUserStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadBattle = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
        data: UserRow | null;
      };

      if (profile) {
        setUserTier(profile.current_tier);
        setUserStreak(profile.current_streak);
      }

      const res = await fetch(`/api/battle/${battleId}`);
      const data: BattlePageData = await res.json();

      if (!res.ok) {
        setError("대결을 찾을 수 없습니다.");
        return;
      }

      setBattleData(data);

      // 대결이 완료된 경우 결과 페이지로
      if (data.battle.status === "completed") {
        router.replace(`/quiz/battle/${battleId}/result`);
        return;
      }

      // playing 상태에서 문제 로드
      if (
        data.battle.status === "both_playing" ||
        data.battle.status === "host_playing" ||
        data.battle.status === "guest_playing"
      ) {
        // 이미 제출한 경우 (timeMs > 0 으로 판단)
        const alreadySubmitted = data.isHost ? data.battle.hostTimeMs > 0 : data.battle.guestTimeMs > 0;

        if (alreadySubmitted) {
          setSubmitted(true);
          return;
        }

        // 아직 세션이 시작되지 않았거나 다른 세션이면 새 세션 시작
        if (sessionType !== "daily" || questions.length === 0) {
          resetSession();
          if (data.questions && data.questions.length > 0) {
            startSession(data.questions as Parameters<typeof startSession>[0], battleId, "daily");
          }
        }
      }
    } catch {
      setError("대결 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [battleId, router, supabase, startSession, resetSession, sessionType, questions.length]);

  useEffect(() => {
    loadBattle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 퀴즈 완료 시 제출
  useEffect(() => {
    if (!isCompleted || isSubmitting || submitted || !battleData) return;

    const submitResults = async () => {
      setIsSubmitting(true);

      try {
        const correctCount = questions.filter((q) => {
          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            const selected = q.options.find((o) => o.id === q.selectedAnswer);
            return selected?.isCorrect ?? false;
          }
          return q.correct_answer === q.selectedAnswer;
        }).length;

        const totalTimeMs = questions.reduce((sum, q) => sum + (q.timeSpentMs ?? 0), 0);

        const res = await fetch(`/api/battle/${battleId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correct: correctCount, timeMs: totalTimeMs }),
        });

        const data = await res.json();

        if (data.submitted) {
          setSubmitted(true);
          resetSession();

          if (data.bothCompleted) {
            router.replace(`/quiz/battle/${battleId}/result`);
          }
        }
      } catch {
        setError("결과 제출에 실패했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [isCompleted, isSubmitting, submitted, battleData, questions, battleId, resetSession, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
          <p className="text-sm text-gray-400">대결 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-950 px-6">
        <p className="text-gray-400">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/quiz/battle")}
          className="rounded-xl bg-gray-800 px-6 py-3 text-sm text-white"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!battleData) return null;

  // 제출 완료 후 대기 화면
  if (submitted) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-6">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 text-4xl">✅</div>
          <h2 className="mb-2 text-xl font-bold text-white">제출 완료!</h2>
          <p className="mb-8 text-sm text-gray-400">상대방이 퀴즈를 마치면 결과를 확인할 수 있습니다.</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={async () => {
                const res = await fetch(`/api/battle/${battleId}`);
                const data = await res.json();
                if (data.battle?.status === "completed") {
                  router.replace(`/quiz/battle/${battleId}/result`);
                }
              }}
              className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-semibold text-white transition-opacity hover:opacity-90"
            >
              결과 확인하기
            </button>
            <button
              type="button"
              onClick={() => router.push("/quiz/battle")}
              className="flex h-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 transition-colors hover:bg-gray-700"
            >
              대결 목록으로
            </button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // 대기실
  if (battleData.battle.status === "waiting" && battleData.isHost) {
    return <BattleWaitingRoom battle={battleData.battle} isHost={battleData.isHost} />;
  }

  // 퀴즈 풀기
  if (questions.length > 0 && !isCompleted) {
    return <QuizFlow userTier={userTier} userStreak={userStreak} />;
  }

  // 결과 제출 중
  if (isSubmitting) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
          <p className="text-sm text-gray-400">결과를 제출하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950">
      <p className="text-gray-400">대결 정보를 불러오는 중...</p>
    </div>
  );
}
