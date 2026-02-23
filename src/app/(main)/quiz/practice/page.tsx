"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { QuestionCategory, TierName, UserRow } from "@/shared/types/database.type";

import QuizFlow from "@/features/daily-quiz/ui/QuizFlow";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { useQuizStore } from "@/stores/use-quiz-store";

const CATEGORY_OPTIONS: { value: QuestionCategory | "all"; label: string; emoji: string; color: string }[] = [
  { value: "all", label: "전체 랜덤", emoji: "🎲", color: "from-cyan-600 to-blue-600" },
  { value: "javascript", label: "JavaScript", emoji: "🟨", color: "from-yellow-600 to-amber-600" },
  { value: "typescript", label: "TypeScript", emoji: "🔷", color: "from-blue-600 to-cyan-600" },
  { value: "react", label: "React", emoji: "⚛️", color: "from-sky-600 to-blue-600" },
  { value: "nextjs", label: "Next.js", emoji: "▲", color: "from-gray-600 to-gray-500" },
  { value: "css", label: "CSS", emoji: "🎨", color: "from-pink-600 to-rose-600" },
  { value: "web_fundamentals", label: "웹 기초", emoji: "🌐", color: "from-emerald-600 to-teal-600" },
];

export default function PracticePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { startSession, questions } = useQuizStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userTier, setUserTier] = useState<TierName>("inline");
  const [userStreak, setUserStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

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
      } catch {
        router.push("/quiz");
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [router, supabase]);

  const handleStart = async (category: QuestionCategory | "all") => {
    setIsLoading(true);
    setError(null);
    try {
      const url = category === "all" ? "/api/quiz/practice" : `/api/quiz/practice?category=${category}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.questions && data.sessionId) {
        startSession(data.questions, data.sessionId, "practice");
        setQuizStarted(true);
      }
    } catch {
      setError("퀴즈를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          <p className="text-sm text-gray-400">퀴즈를 준비 중...</p>
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
          onClick={() => router.push("/quiz")}
          className="rounded-xl bg-gray-800 px-6 py-3 text-sm text-white"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (quizStarted && questions.length > 0) {
    return <QuizFlow userTier={userTier} userStreak={userStreak} />;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-5 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/quiz")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12l7-7M5 12l7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">티어 올리기</h1>
          <p className="text-xs text-gray-500">집중할 카테고리를 선택하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleStart(cat.value)}
            className={`flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br ${cat.color} p-4 text-left transition-all hover:opacity-90 active:scale-[0.97] ${cat.value === "all" ? "col-span-2" : ""}`}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-sm font-semibold text-white">{cat.label}</span>
            {cat.value === "all" && <span className="text-xs text-white/70">약점·강점 카테고리 자동 배분</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
