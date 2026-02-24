"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { getTierInfo } from "@/entities/user/lib/tier.util";
import TierBadge from "@/entities/user/ui/TierBadge";

type OverallUser = {
  id: string;
  name: string;
  profile_image_url: string | null;
  current_lp: number;
  current_tier: string;
  current_tier_division: number;
  current_streak: number;
  total_answered: number;
  total_correct: number;
};

type CategoryUser = {
  id: string;
  name: string;
  profile_image_url: string | null;
  current_lp: number;
  current_tier: string;
  current_tier_division: number;
  current_streak: number;
  category_lp: number;
  total_answered: number;
  total_correct: number;
};

type CategoryKey = "javascript" | "typescript" | "react" | "nextjs" | "css" | "web_fundamentals";

const CATEGORIES: { key: CategoryKey; label: string; icon: string; color: string }[] = [
  { key: "javascript", label: "JavaScript", icon: "JS", color: "#F7DF1E" },
  { key: "typescript", label: "TypeScript", icon: "TS", color: "#3178C6" },
  { key: "react", label: "React", icon: "⚛", color: "#61DAFB" },
  { key: "nextjs", label: "Next.js", icon: "N", color: "#ffffff" },
  { key: "css", label: "CSS", icon: "🎨", color: "#38BDF8" },
  { key: "web_fundamentals", label: "Web", icon: "🌐", color: "#34D399" },
];

const RANK_STYLES = [
  { bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { bg: "bg-gray-400/10", border: "border-gray-400/30" },
  { bg: "bg-orange-700/10", border: "border-orange-700/30" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overall" | CategoryKey>("overall");
  const [overallUsers, setOverallUsers] = useState<OverallUser[]>([]);
  const [categoryUsers, setCategoryUsers] = useState<CategoryUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 전체 순위 최초 로드
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setOverallUsers(data.users ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      } catch {
        // 에러 시 빈 목록
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  // 카테고리 탭 전환 시 로드
  useEffect(() => {
    if (activeTab === "overall") return;
    setIsLoading(true);
    fetch(`/api/leaderboard/category?category=${activeTab}`)
      .then((r) => r.json())
      .then((data) => setCategoryUsers(data.users ?? []))
      .catch(() => setCategoryUsers([]))
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const isOverall = activeTab === "overall";
  const users = isOverall ? overallUsers : categoryUsers;
  const currentUserRank = users.findIndex((u) => u.id === currentUserId) + 1;
  const activeCategoryInfo = CATEGORIES.find((c) => c.key === activeTab);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">순위표</h1>
          <p className="text-xs text-gray-500">
            {isOverall ? "LP 기준 전체 랭킹" : `${activeCategoryInfo?.label} 카테고리 랭킹`}
          </p>
        </div>
        {currentUserRank > 0 && (
          <span className="ml-auto rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-400">
            내 순위 #{currentUserRank}
          </span>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-col gap-2">
        {/* 전체 탭 */}
        <button
          onClick={() => setActiveTab("overall")}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "overall"
              ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
              : "border-gray-800 bg-gray-900/30 text-gray-400 hover:border-gray-700 hover:text-gray-300"
          }`}
        >
          🏆 전체 랭킹
        </button>

        {/* 카테고리 탭 2열 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                activeTab === cat.key
                  ? "border-opacity-50 bg-opacity-10"
                  : "border-gray-800 bg-gray-900/30 text-gray-400 hover:border-gray-700 hover:text-gray-300"
              }`}
              style={
                activeTab === cat.key
                  ? { borderColor: `${cat.color}80`, backgroundColor: `${cat.color}18`, color: cat.color }
                  : {}
              }
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-2 rounded-2xl border border-gray-800 bg-gray-900/30 p-4">
          <PodiumCard user={users[1]} rank={2} isCurrentUser={users[1].id === currentUserId} isOverall={isOverall} />
          <PodiumCard
            user={users[0]}
            rank={1}
            isCurrentUser={users[0].id === currentUserId}
            large
            isOverall={isOverall}
          />
          <PodiumCard user={users[2]} rank={3} isCurrentUser={users[2].id === currentUserId} isOverall={isOverall} />
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {users.map((user, index) => {
          const rank = index + 1;
          const isMe = user.id === currentUserId;
          const tierInfo = getTierInfo((user as OverallUser | CategoryUser).current_lp);
          const style = RANK_STYLES[index] ?? null;
          const accuracy = user.total_answered > 0 ? Math.round((user.total_correct / user.total_answered) * 100) : 0;
          const lp = isOverall ? (user as OverallUser).current_lp : (user as CategoryUser).category_lp;

          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                isMe
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : style
                    ? `${style.bg} ${style.border}`
                    : "border-gray-800 bg-gray-900/30"
              }`}
            >
              {/* Rank */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                {rank <= 3 ? (
                  <span className="text-lg font-bold">{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
                ) : (
                  <span className={`text-sm font-bold ${isMe ? "text-cyan-400" : "text-gray-500"}`}>#{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-800">
                {user.profile_image_url ? (
                  <Image src={user.profile_image_url} alt={user.name} width={36} height={36} className="object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-sm font-bold"
                    style={{ color: tierInfo.color, backgroundColor: tierInfo.bgColor }}
                  >
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={`truncate text-sm font-semibold ${isMe ? "text-cyan-300" : "text-white"}`}>
                  {user.name}
                  {isMe && <span className="ml-1 text-xs text-cyan-500">(나)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <TierBadge tierInfo={getTierInfo((user as OverallUser | CategoryUser).current_lp)} size="sm" />
                  {user.current_streak > 0 && (
                    <span className="text-[10px] text-orange-400">🔥 {user.current_streak}일</span>
                  )}
                </div>
              </div>

              {/* LP + 정답률 */}
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className="text-base font-bold"
                  style={{ color: isOverall ? tierInfo.color : (activeCategoryInfo?.color ?? "#fff") }}
                >
                  {lp.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">LP</span>
                <span
                  className={`text-xs font-semibold ${
                    user.total_answered === 0
                      ? "text-gray-600"
                      : accuracy >= 80
                        ? "text-emerald-400"
                        : accuracy >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                  }`}
                >
                  {user.total_answered > 0 ? `${accuracy}%` : "-"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <span className="text-4xl">🏆</span>
          <p className="text-sm">
            {isOverall ? "아직 랭킹 데이터가 없습니다" : "이 카테고리에 아직 데이터가 없습니다"}
          </p>
        </div>
      )}
    </div>
  );
}

type PodiumCardProps = {
  user: OverallUser | CategoryUser;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
  large?: boolean;
  isOverall: boolean;
};

function PodiumCard({ user, rank, isCurrentUser, large = false, isOverall }: PodiumCardProps) {
  const tierInfo = getTierInfo((user as OverallUser | CategoryUser).current_lp);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const accuracy = user.total_answered > 0 ? Math.round((user.total_correct / user.total_answered) * 100) : null;
  const lp = isOverall ? (user as OverallUser).current_lp : (user as CategoryUser).category_lp;

  return (
    <div className={`flex flex-col items-center gap-1 ${large ? "mb-0" : "mb-0 mt-4"}`}>
      <span className="text-xl">{medal}</span>
      <div
        className={`overflow-hidden rounded-full bg-gray-800 ${large ? "h-14 w-14" : "h-10 w-10"} ${isCurrentUser ? "ring-2 ring-cyan-400" : ""}`}
      >
        {user.profile_image_url ? (
          <Image
            src={user.profile_image_url}
            alt={user.name}
            width={large ? 56 : 40}
            height={large ? 56 : 40}
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-bold"
            style={{ color: tierInfo.color, backgroundColor: tierInfo.bgColor, fontSize: large ? 20 : 14 }}
          >
            {user.name.charAt(0)}
          </div>
        )}
      </div>
      <span className={`truncate font-semibold ${large ? "max-w-[80px] text-sm" : "max-w-[64px] text-xs"} text-white`}>
        {user.name}
      </span>
      <span className={`font-bold ${large ? "text-base" : "text-sm"}`} style={{ color: tierInfo.color }}>
        {lp.toLocaleString()} LP
      </span>
      <TierBadge tierInfo={tierInfo} size="sm" showDivision={false} />
      {accuracy !== null && (
        <span
          className={`text-[10px] font-semibold ${accuracy >= 80 ? "text-emerald-400" : accuracy >= 50 ? "text-amber-400" : "text-red-400"}`}
        >
          정답 {accuracy}%
        </span>
      )}
    </div>
  );
}
