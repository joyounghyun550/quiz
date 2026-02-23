"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { UserRow } from "@/shared/types/database.type";

import QuizFlow from "@/features/daily-quiz/ui/QuizFlow";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { useQuizStore } from "@/stores/use-quiz-store";

export default function PlacementPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { startSession, questions } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  const handleStart = async () => {
    setShowIntro(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/quiz/placement");
      const data = await res.json();

      if (data.questions && data.sessionId) {
        startSession(data.questions, data.sessionId, "placement");
      }
    } catch {
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkPlacement = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = (await supabase
        .from("users")
        .select("has_completed_placement")
        .eq("id", user.id)
        .single()) as { data: Pick<UserRow, "has_completed_placement"> | null };

      if (profile?.has_completed_placement) {
        router.replace("/");
        return;
      }

      setIsLoading(false);
    };

    checkPlacement();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-6">
        <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400">
            <span className="text-3xl font-bold text-white">?</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-white">배치 테스트</h1>
            <p className="text-sm leading-relaxed text-gray-400">
              당신의 프론트엔드 실력을 측정합니다.
              <br />
              10문제를 풀고 시작 티어를 받으세요!
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-left text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">10</span>
              <span>문제 (쉬움 ~ 전문가)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">X</span>
              <span>힌트 사용 불가</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">∞</span>
              <span>시간제한 없음</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 font-semibold text-white transition-opacity hover:opacity-90"
          >
            테스트 시작하기
          </button>
        </div>
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

  return <QuizFlow userTier="inline" userStreak={0} />;
}
