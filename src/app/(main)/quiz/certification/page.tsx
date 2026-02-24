"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { TierName, UserRow } from "@/shared/types/database.type";

import QuizFlow from "@/features/daily-quiz/ui/QuizFlow";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { useQuizStore } from "@/stores/use-quiz-store";

export default function CertificationQuizPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { startSession, questions, sessionType, isCompleted } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState<TierName>("inline");
  const [userStreak, setUserStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasActiveSession = sessionType === "practice" && questions.length > 0 && !isCompleted;

  useEffect(() => {
    const init = async () => {
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

        if (hasActiveSession) {
          setIsLoading(false);
          return;
        }

        // 정보처리기사 퀴즈 문제 로드
        const res = await fetch("/api/quiz/certification");
        const data = await res.json();

        if (data.questions?.length > 0 && data.sessionId) {
          startSession(data.questions, data.sessionId, "practice");
        } else {
          setError("정보처리기사 퀴즈 문제가 없습니다. 문제를 추가해주세요.");
        }
      } catch {
        setError("퀴즈를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          <p className="text-sm text-gray-400">정보처리기사 퀴즈 준비 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-950 px-6">
        <span className="text-4xl">📜</span>
        <p className="text-gray-400">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/quiz")}
          className="rounded-xl bg-gray-800 px-6 py-3 text-sm text-white"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return <QuizFlow userTier={userTier} userStreak={userStreak} />;
}
