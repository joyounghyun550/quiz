"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { UserRow } from "@/shared/types/database.type";

import type { AchievementWithStatus } from "@/entities/achievement/model/types";
import AchievementBadge from "@/entities/achievement/ui/AchievementBadge";
import type { SeasonRecord } from "@/entities/season/model/types";
import { getTierInfo } from "@/entities/user/lib/tier.util";
import type { TierInfo } from "@/entities/user/model/types";
import LpBar from "@/entities/user/ui/LpBar";
import TierBadge from "@/entities/user/ui/TierBadge";

import SeasonHistoryCard from "@/features/season/ui/SeasonHistoryCard";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type ProfileData = {
  name: string;
  email: string;
  profileImageUrl: string | null;
  tierInfo: TierInfo;
  currentStreak: number;
  longestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<ProfileData | null>(null);
  const [recentBadges, setRecentBadges] = useState<AchievementWithStatus[]>([]);
  const [seasonRecords, setSeasonRecords] = useState<SeasonRecord[]>([]);
  const [skillProgress, setSkillProgress] = useState<{ unlocked: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
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

        if (!profile) return;

        setData({
          name: profile.name,
          email: profile.email,
          profileImageUrl: profile.profile_image_url,
          tierInfo: getTierInfo(profile.current_lp),
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          totalAnswered: profile.total_answered,
          totalCorrect: profile.total_correct,
        });

        // 업적 로드
        try {
          const achRes = await fetch("/api/achievements");
          if (achRes.ok) {
            const achData = await achRes.json();
            const earned = (achData.achievements ?? [])
              .filter((a: AchievementWithStatus) => a.earned)
              .sort(
                (a: AchievementWithStatus, b: AchievementWithStatus) =>
                  new Date(b.earnedAt ?? 0).getTime() - new Date(a.earnedAt ?? 0).getTime()
              )
              .slice(0, 6);
            setRecentBadges(earned);
          }
        } catch {
          // 업적 로드 실패 무시
        }

        // 시즌 기록 로드
        try {
          const seasonRes = await fetch("/api/season/history");
          if (seasonRes.ok) {
            const seasonData = await seasonRes.json();
            setSeasonRecords((seasonData.records ?? []).slice(0, 3));
          }
        } catch {
          // 시즌 로드 실패 무시
        }

        // 스킬 트리 진행률 로드
        try {
          const skillRes = await fetch("/api/skill-tree");
          if (skillRes.ok) {
            const skillData = await skillRes.json();
            const nodes = skillData.nodes ?? [];
            const unlocked = nodes.filter((n: { status: string }) => n.status === "unlocked").length;
            setSkillProgress({ unlocked, total: nodes.length });
          }
        } catch {
          // 스킬 로드 실패 무시
        }
      } catch {
        // 에러
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    sessionStorage.removeItem("pwa-install-dismissed");
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (isLoading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  const accuracy = data.totalAnswered > 0 ? Math.round((data.totalCorrect / data.totalAnswered) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pb-24 pt-6">
      <h1 className="text-xl font-bold text-white">프로필</h1>

      {/* Profile Card */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-800">
          {data.profileImageUrl ? (
            <Image src={data.profileImageUrl} alt={data.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500">
              {data.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-white">{data.name}</h2>
          <p className="text-xs text-gray-500">{data.email}</p>
        </div>
        <TierBadge tierInfo={data.tierInfo} size="lg" />
        <LpBar tierInfo={data.tierInfo} className="w-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <span className="text-2xl font-bold text-white">{data.totalAnswered}</span>
          <span className="text-xs text-gray-500">풀은 문제</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <span className="text-2xl font-bold text-white">{accuracy}%</span>
          <span className="text-xs text-gray-500">정답률</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <span className="text-2xl font-bold text-orange-400">{data.currentStreak}</span>
          <span className="text-xs text-gray-500">현재 스트릭</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <span className="text-2xl font-bold text-white">{data.longestStreak}</span>
          <span className="text-xs text-gray-500">최장 스트릭</span>
        </div>
      </div>

      {/* Skill Tree Preview */}
      {skillProgress && skillProgress.total > 0 && (
        <Link
          href="/skill-tree"
          className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:border-gray-700"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">스킬 트리</h3>
            <span className="text-xs text-cyan-400">전체 보기 →</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${Math.round((skillProgress.unlocked / skillProgress.total) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-400">
              {skillProgress.unlocked}/{skillProgress.total}
            </span>
          </div>
        </Link>
      )}

      {/* Achievements Preview */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">업적</h3>
          <Link href="/profile/achievements" className="text-xs text-cyan-400 hover:text-cyan-300">
            전체 보기 →
          </Link>
        </div>
        {recentBadges.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto">
            {recentBadges.map((badge) => (
              <AchievementBadge key={badge.id} achievement={badge} size="sm" />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-gray-600">아직 획득한 업적이 없습니다</p>
        )}
      </div>

      {/* Season History */}
      {seasonRecords.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">시즌 기록</h3>
          {seasonRecords.map((record) => (
            <SeasonHistoryCard key={record.seasonId} record={record} />
          ))}
        </div>
      )}

      {/* Settings Link */}
      <Link
        href="/profile/settings"
        className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4"
      >
        <span className="text-sm text-gray-300">알림 설정</span>
        <span className="text-gray-600">→</span>
      </Link>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl border border-red-900/50 bg-red-500/10 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/20"
      >
        로그아웃
      </button>
    </div>
  );
}
