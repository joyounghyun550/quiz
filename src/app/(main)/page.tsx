"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { DailyQuizLogRow, QuizSessionRow, UserRow } from "@/shared/types/database.type";

import { getTierInfo } from "@/entities/user/lib/tier.util";
import type { TierInfo } from "@/entities/user/model/types";

import DailyQuizCard from "@/widgets/home-dashboard/ui/DailyQuizCard";
import DashboardHeader from "@/widgets/home-dashboard/ui/DashboardHeader";
import QuickStats from "@/widgets/home-dashboard/ui/QuickStats";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type DashboardData = {
  name: string;
  tierInfo: TierInfo;
  streak: number;
  totalAnswered: number;
  totalCorrect: number;
  longestStreak: number;
  todayCompleted: boolean;
  todayCorrectCount?: number;
  todayTotalQuestions?: number;
};

export default function HomePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
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

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (!profile.has_completed_placement) {
          router.replace("/quiz/placement");
          return;
        }

        const tierInfo = getTierInfo(profile.current_lp);

        // 오늘 퀴즈 완료 여부 확인
        const today = new Date().toISOString().split("T")[0];
        const { data: todayLog } = (await supabase
          .from("daily_quiz_log")
          .select("*")
          .eq("user_id", user.id)
          .eq("quiz_date", today)
          .single()) as { data: (DailyQuizLogRow & { quiz_sessions: QuizSessionRow | null }) | null };

        setData({
          name: profile.name,
          tierInfo,
          streak: profile.current_streak,
          totalAnswered: profile.total_answered,
          totalCorrect: profile.total_correct,
          longestStreak: profile.longest_streak,
          todayCompleted: todayLog?.is_completed ?? false,
          todayCorrectCount: todayLog?.quiz_sessions?.correct_count,
          todayTotalQuestions: todayLog?.quiz_sessions?.total_questions,
        });
      } catch {
        // 에러 시 로그인으로
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [router, supabase]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pt-6">
      <DashboardHeader name={data.name} tierInfo={data.tierInfo} streak={data.streak} />
      <DailyQuizCard
        isCompleted={data.todayCompleted}
        correctCount={data.todayCorrectCount}
        totalQuestions={data.todayTotalQuestions}
      />
      <QuickStats
        totalAnswered={data.totalAnswered}
        totalCorrect={data.totalCorrect}
        longestStreak={data.longestStreak}
      />
    </div>
  );
}
