"use client";

import { useEffect, useState } from "react";

import type { CategoryStatRow, DailyQuizLogRow, UserRow } from "@/shared/types/database.type";

import AccuracyCard from "@/features/statistics/ui/AccuracyCard";
import CategoryBreakdown from "@/features/statistics/ui/CategoryBreakdown";
import ContributionCalendar from "@/features/streak/ui/ContributionCalendar";
import StreakDisplay from "@/features/streak/ui/StreakDisplay";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

const CATEGORY_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  nextjs: "Next.js",
  css: "CSS",
  web_fundamentals: "Web 기초",
};

type StatsData = {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  categoryStats: { category: string; label: string; totalAnswered: number; totalCorrect: number }[];
  completedDates: string[];
};

export default function StatsPage() {
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
          data: UserRow | null;
        };

        if (!profile) return;

        // 카테고리 통계
        const { data: catStats } = (await supabase
          .from("category_stats")
          .select("*")
          .eq("user_id", user.id)) as { data: CategoryStatRow[] | null };

        const categories = ["javascript", "typescript", "react", "nextjs", "css", "web_fundamentals"];
        const categoryStats = categories.map((cat) => {
          const stats = catStats?.filter((s) => s.category === cat) ?? [];
          return {
            category: cat,
            label: CATEGORY_LABELS[cat] ?? cat,
            totalAnswered: stats.reduce((sum, s) => sum + s.total_answered, 0),
            totalCorrect: stats.reduce((sum, s) => sum + s.total_correct, 0),
          };
        });

        // 완료한 날짜들
        const { data: quizLogs } = (await supabase
          .from("daily_quiz_log")
          .select("quiz_date")
          .eq("user_id", user.id)
          .eq("is_completed", true)) as { data: Pick<DailyQuizLogRow, "quiz_date">[] | null };

        const completedDates = quizLogs?.map((log) => log.quiz_date) ?? [];

        setData({
          totalAnswered: profile.total_answered,
          totalCorrect: profile.total_correct,
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          categoryStats,
          completedDates,
        });
      } catch {
        // 에러
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [supabase]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pt-6">
      <h1 className="text-xl font-bold text-white">통계</h1>
      <AccuracyCard totalAnswered={data.totalAnswered} totalCorrect={data.totalCorrect} />
      <StreakDisplay currentStreak={data.currentStreak} longestStreak={data.longestStreak} />
      <CategoryBreakdown stats={data.categoryStats} />
      <ContributionCalendar completedDates={data.completedDates} />
    </div>
  );
}
