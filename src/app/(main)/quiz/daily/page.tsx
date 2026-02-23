"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { TierName, UserRow } from "@/shared/types/database.type";

import QuizFlow from "@/features/daily-quiz/ui/QuizFlow";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { useQuizStore } from "@/stores/use-quiz-store";

export default function DailyQuizPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { startSession, questions } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState<TierName>("inline");
  const [userStreak, setUserStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
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

        const res = await fetch("/api/quiz/daily");
        const data = await res.json();

        if (data.questions && data.sessionId) {
          startSession(data.questions, data.sessionId, "daily");
        }
      } catch {
        setError("퀴즈를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [router, supabase, startSession]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-gray-400">오늘의 퀴즈를 준비 중...</p>
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
          onClick={() => router.push("/")}
          className="rounded-xl bg-gray-800 px-6 py-3 text-sm text-white"
        >
          홈으로 돌아가기
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
