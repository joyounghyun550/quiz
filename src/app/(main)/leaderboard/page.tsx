"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { getTierInfo } from "@/entities/user/lib/tier.util";
import TierBadge from "@/entities/user/ui/TierBadge";

type LeaderboardUser = {
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

const RANK_STYLES = [
  { bg: "bg-yellow-500/10", border: "border-yellow-500/30", rank: "text-yellow-400", badge: "bg-yellow-500" },
  { bg: "bg-gray-400/10", border: "border-gray-400/30", rank: "text-gray-300", badge: "bg-gray-400" },
  { bg: "bg-orange-700/10", border: "border-orange-700/30", rank: "text-orange-600", badge: "bg-orange-700" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setUsers(data.users ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      } catch {
        // 에러 시 빈 목록
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  const currentUserRank = users.findIndex((u) => u.id === currentUserId) + 1;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">순위표</h1>
          <p className="text-xs text-gray-500">LP 기준 전체 랭킹</p>
        </div>
        {currentUserRank > 0 && (
          <span className="ml-auto rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-400">
            내 순위 #{currentUserRank}
          </span>
        )}
      </div>

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-2 rounded-2xl border border-gray-800 bg-gray-900/30 p-4">
          {/* 2nd */}
          <PodiumCard user={users[1]} rank={2} isCurrentUser={users[1].id === currentUserId} />
          {/* 1st */}
          <PodiumCard user={users[0]} rank={1} isCurrentUser={users[0].id === currentUserId} large />
          {/* 3rd */}
          <PodiumCard user={users[2]} rank={3} isCurrentUser={users[2].id === currentUserId} />
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {users.map((user, index) => {
          const rank = index + 1;
          const isMe = user.id === currentUserId;
          const tierInfo = getTierInfo(user.current_lp);
          const style = RANK_STYLES[index] ?? null;
          const accuracy = user.total_answered > 0 ? Math.round((user.total_correct / user.total_answered) * 100) : 0;

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
                <div className="flex items-center gap-2">
                  <span className={`truncate text-sm font-semibold ${isMe ? "text-cyan-300" : "text-white"}`}>
                    {user.name}
                    {isMe && <span className="ml-1 text-xs text-cyan-500">(나)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TierBadge tierInfo={tierInfo} size="sm" />
                  {user.current_streak > 0 && (
                    <span className="text-[10px] text-orange-400">🔥 {user.current_streak}일</span>
                  )}
                  <span className="text-[10px] text-gray-500">{accuracy}%</span>
                </div>
              </div>

              {/* LP */}
              <div className="flex flex-col items-end">
                <span className="text-base font-bold" style={{ color: tierInfo.color }}>
                  {user.current_lp.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">LP</span>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <span className="text-4xl">🏆</span>
          <p className="text-sm">아직 랭킹 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}

type PodiumCardProps = {
  user: LeaderboardUser;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
  large?: boolean;
};

function PodiumCard({ user, rank, isCurrentUser, large = false }: PodiumCardProps) {
  const tierInfo = getTierInfo(user.current_lp);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

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
        {user.current_lp.toLocaleString()} LP
      </span>
      <TierBadge tierInfo={tierInfo} size="sm" showDivision={false} />
    </div>
  );
}
