"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { TierName, UserRow } from "@/shared/types/database.type";

import QuizFlow from "@/features/daily-quiz/ui/QuizFlow";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { useQuizStore } from "@/stores/use-quiz-store";

export default function RetryPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { startSession, questions, sessionType, isCompleted } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [userTier, setUserTier] = useState<TierName>("inline");
  const [userStreak, setUserStreak] = useState(0);

  // 이어서 풀기: 기존 retry 세션이 있으면 API 호출 스킵
  const hasActiveSession = sessionType === "retry" && questions.length > 0 && !isCompleted;

  useEffect(() => {
    const load = async () => {
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

        if (!profile?.has_completed_placement) {
          router.replace("/quiz/placement");
          return;
        }

        setUserTier(profile.current_tier);
        setUserStreak(profile.current_streak);

        // 기존 세션이 있으면 새 문제 불러오지 않음
        if (hasActiveSession) {
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/quiz/retry");
        const data = await res.json();

        if (data.empty || !data.questions?.length) {
          setIsEmpty(true);
          return;
        }

        if (data.questions && data.sessionId) {
          startSession(data.questions, data.sessionId, "retry");
        }
      } catch {
        router.push("/quiz");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [router, supabase, startSession, hasActiveSession]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          <p className="text-sm text-gray-400">오답 문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gray-950 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10">
          <span className="text-4xl">🎉</span>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">틀린 문제가 없어요!</p>
          <p className="mt-1 text-sm text-gray-400">아직 풀어본 문제가 없거나 모두 맞혔습니다.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/quiz")}
          className="h-12 w-full max-w-xs rounded-xl bg-gray-800 font-semibold text-white transition-colors hover:bg-gray-700"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <p className="text-gray-400">문제를 불러오는 중...</p>
      </div>
    );
  }

  return <QuizFlow userTier={userTier} userStreak={userStreak} />;
}
