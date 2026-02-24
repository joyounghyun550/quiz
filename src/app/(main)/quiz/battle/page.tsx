"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { BattleRow, UserRow } from "@/shared/types/database.type";
import { cn } from "@/shared/utils/cn.util";

import BattleCreateCard from "@/features/battle/ui/BattleCreateCard";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type RecentBattle = {
  id: string;
  status: string;
  opponentName: string;
  myCorrect: number;
  opponentCorrect: number;
  isWinner: boolean | null;
  createdAt: string;
};

export default function BattlePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [recentBattles, setRecentBattles] = useState<RecentBattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // 최근 대결 목록 (최근 5개)
        const { data: battles } = (await supabase
          .from("battles")
          .select("*")
          .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(5)) as { data: BattleRow[] | null };

        if (battles && battles.length > 0) {
          // 상대방 이름 조회
          const opponentIds = battles
            .map((b) => (b.host_id === user.id ? b.guest_id : b.host_id))
            .filter((id): id is string => id !== null);

          const uniqueIds = Array.from(new Set(opponentIds));
          let profileMap: Record<string, string> = {};

          if (uniqueIds.length > 0) {
            const { data: profiles } = (await supabase.from("users").select("id, name").in("id", uniqueIds)) as {
              data: Pick<UserRow, "id" | "name">[] | null;
            };

            profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.name]));
          }

          const recent: RecentBattle[] = battles.map((b) => {
            const isHost = b.host_id === user.id;
            const opponentId = isHost ? b.guest_id : b.host_id;
            const opponentName = opponentId ? (profileMap[opponentId] ?? "Unknown") : "대기 중";
            const myCorrect = isHost ? b.host_correct : b.guest_correct;
            const opponentCorrect = isHost ? b.guest_correct : b.host_correct;

            let isWinner: boolean | null = null;
            if (b.status === "completed") {
              isWinner = b.winner_id === user.id;
            }

            return {
              id: b.id,
              status: b.status,
              opponentName,
              myCorrect,
              opponentCorrect,
              isWinner,
              createdAt: b.created_at,
            };
          });

          setRecentBattles(recent);
        }
      } catch {
        // 에러 무시
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  const handleJoin = async () => {
    if (isJoining || inviteCode.length !== 6) return;
    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetch("/api/battle/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setJoinError(data.error ?? "참가에 실패했습니다.");
        return;
      }

      router.push(`/quiz/battle/${data.battle.id}`);
    } catch {
      setJoinError("참가에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "waiting":
        return { text: "대기 중", color: "text-yellow-400" };
      case "both_playing":
      case "host_playing":
      case "guest_playing":
        return { text: "진행 중", color: "text-cyan-400" };
      case "completed":
        return { text: "완료", color: "text-gray-400" };
      case "expired":
        return { text: "만료", color: "text-gray-600" };
      default:
        return { text: status, color: "text-gray-400" };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">1:1 대결</h1>
        <span className="rounded-full bg-pink-500/15 px-2.5 py-1 text-xs font-bold text-pink-400">VS</span>
      </div>

      {/* 대결 만들기 */}
      <BattleCreateCard />

      {/* 초대코드로 참가 */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">초대코드로 참가</h3>
            <p className="text-[10px] text-gray-500">친구에게 받은 코드를 입력하세요</p>
          </div>
        </div>

        <div className="my-4 h-px bg-gray-800" />

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value.toUpperCase().slice(0, 6));
              setJoinError(null);
            }}
            placeholder="초대 코드 입력 (6자리)"
            maxLength={6}
            className="h-12 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 text-center font-mono text-lg tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-gray-600 focus:border-pink-500 focus:outline-none"
          />
          {joinError && <p className="text-center text-xs text-red-400">{joinError}</p>}
          <button
            type="button"
            onClick={handleJoin}
            disabled={inviteCode.length !== 6 || isJoining}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl",
              "border border-gray-700 bg-gray-800/50",
              "font-semibold text-white transition-colors",
              "hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800/50"
            )}
          >
            {isJoining ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "참가하기"
            )}
          </button>
        </div>
      </div>

      {/* 최근 대결 */}
      {recentBattles.length > 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-300">최근 대결</h3>
          <div className="flex flex-col gap-2">
            {recentBattles.map((battle) => {
              const statusInfo = getStatusLabel(battle.status);

              return (
                <Link
                  key={battle.id}
                  href={
                    battle.status === "completed" ? `/quiz/battle/${battle.id}/result` : `/quiz/battle/${battle.id}`
                  }
                  className="flex items-center gap-3 rounded-xl bg-gray-800/30 p-3 transition-colors hover:bg-gray-800/60"
                >
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">vs {battle.opponentName}</span>
                      {battle.isWinner !== null && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            battle.isWinner ? "bg-amber-500/15 text-amber-400" : "bg-gray-700 text-gray-400"
                          )}
                        >
                          {battle.isWinner ? "WIN" : "LOSE"}
                        </span>
                      )}
                    </div>
                    {battle.status === "completed" && (
                      <span className="text-xs text-gray-500">
                        {battle.myCorrect}문제 vs {battle.opponentCorrect}문제
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={cn("text-xs font-medium", statusInfo.color)}>{statusInfo.text}</span>
                    <span className="text-[10px] text-gray-600">{formatDate(battle.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
