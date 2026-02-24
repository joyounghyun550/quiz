"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { DailyQuizLogRow, QuizSessionRow, UserRow } from "@/shared/types/database.type";
import KakaoShareButton from "@/shared/ui/KakaoShareButton";

import type { SeasonInfo } from "@/entities/season/model/types";
import type { DailyTipWithBookmark } from "@/entities/tip/model/types";
import { getTierInfo } from "@/entities/user/lib/tier.util";
import type { TierInfo } from "@/entities/user/model/types";

import DailyTipCard from "@/features/daily-tip/ui/DailyTipCard";
import SeasonBanner from "@/features/season/ui/SeasonBanner";
import WeeklyChallengeCard from "@/features/weekly-challenge/ui/WeeklyChallengeCard";

import DailyQuizCard from "@/widgets/home-dashboard/ui/DailyQuizCard";
import DashboardHeader from "@/widgets/home-dashboard/ui/DashboardHeader";
import QuickStats from "@/widgets/home-dashboard/ui/QuickStats";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type WeeklyChallengeInfo = {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  participantCount: number;
  hasParticipated: boolean;
} | null;

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
  weeklyChallenge: WeeklyChallengeInfo;
  season: SeasonInfo | null;
  dailyTip: DailyTipWithBookmark | null;
};

const HomeSkeleton = () => (
  <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pt-6">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 animate-pulse rounded-full bg-gray-800" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-800" />
        <div className="h-3 w-48 animate-pulse rounded bg-gray-800" />
      </div>
    </div>
    <div className="h-40 animate-pulse rounded-2xl bg-gray-800/50" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-800/50" />
      ))}
    </div>
  </div>
);

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

        // 위클리 챌린지 정보
        let weeklyChallenge: WeeklyChallengeInfo = null;
        try {
          const weeklyRes = await fetch("/api/quiz/weekly/current");
          if (weeklyRes.ok) {
            const weeklyData = await weeklyRes.json();
            weeklyChallenge = weeklyData.challenge ?? null;
          }
        } catch {
          // 위클리 로드 실패 무시
        }

        // 시즌 정보
        let season: SeasonInfo | null = null;
        try {
          const seasonRes = await fetch("/api/season/current");
          if (seasonRes.ok) {
            const seasonData = await seasonRes.json();
            season = seasonData.season ?? null;
          }
        } catch {
          // 시즌 로드 실패 무시
        }

        // 오늘의 팁
        let dailyTip: DailyTipWithBookmark | null = null;
        try {
          const tipRes = await fetch("/api/tips/today");
          if (tipRes.ok) {
            const tipData = await tipRes.json();
            dailyTip = tipData.tip ?? null;
          }
        } catch {
          // 팁 로드 실패 무시
        }

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
          weeklyChallenge,
          season,
          dailyTip,
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
    return <HomeSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pt-6">
      <DashboardHeader name={data.name} tierInfo={data.tierInfo} streak={data.streak} />
      <SeasonBanner season={data.season} />
      <DailyQuizCard
        isCompleted={data.todayCompleted}
        correctCount={data.todayCorrectCount}
        totalQuestions={data.todayTotalQuestions}
      />
      {data.weeklyChallenge && <WeeklyChallengeCard challenge={data.weeklyChallenge} />}
      <DailyTipCard
        tip={data.dailyTip}
        onToggleBookmark={async (tipId) => {
          try {
            await fetch("/api/tips/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tipId }),
            });
            setData((prev) =>
              prev && prev.dailyTip
                ? { ...prev, dailyTip: { ...prev.dailyTip, isBookmarked: !prev.dailyTip.isBookmarked } }
                : prev
            );
          } catch {
            // 무시
          }
        }}
      />
      <QuickStats
        totalAnswered={data.totalAnswered}
        totalCorrect={data.totalCorrect}
        longestStreak={data.longestStreak}
      />

      {/* 친구 초대 섹션 */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">💬</span>
          <div>
            <p className="text-sm font-semibold text-white">친구에게 알려주기</p>
            <p className="text-xs text-gray-500">DevRank를 친구에게 공유해 함께 성장하세요</p>
          </div>
        </div>
        <KakaoShareButton className="h-11 w-full text-sm" />
      </div>
    </div>
  );
}
