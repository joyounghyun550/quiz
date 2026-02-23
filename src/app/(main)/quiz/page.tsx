"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { DailyQuizLogRow, UserRow } from "@/shared/types/database.type";

import { getTierInfo } from "@/entities/user/lib/tier.util";
import TierBadge from "@/entities/user/ui/TierBadge";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type QuizHubData = {
  tierInfo: ReturnType<typeof getTierInfo>;
  dailyCompleted: boolean;
  dailyCorrect?: number;
  dailyTotal?: number;
};

export default function QuizHubPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<QuizHubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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

        const today = new Date().toISOString().split("T")[0];
        const { data: todayLog } = (await supabase
          .from("daily_quiz_log")
          .select("*")
          .eq("user_id", user.id)
          .eq("quiz_date", today)
          .single()) as { data: DailyQuizLogRow | null };

        setData({
          tierInfo: getTierInfo(profile.current_lp),
          dailyCompleted: todayLog?.is_completed ?? false,
          dailyCorrect: undefined,
          dailyTotal: undefined,
        });
      } catch {
        // 에러 시 무시
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [router, supabase]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">퀴즈</h1>
        <TierBadge tierInfo={data.tierInfo} size="sm" />
      </div>

      {/* 오늘의 퀴즈 */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10">
        <div className="p-5">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="#06b6d415"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">오늘의 퀴즈</h3>
              <p className="text-[10px] text-gray-500">하루 1회 · LP 2배</p>
            </div>
            <span className="ml-auto rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400">
              2× LP
            </span>
          </div>

          <div className="my-4 h-px bg-gray-800" />

          {data.dailyCompleted ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 p-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">오늘 완료!</p>
                  <p className="text-xs text-gray-500">내일 새 문제가 준비됩니다</p>
                </div>
              </div>
              <p className="text-center text-xs text-gray-600">내일 다시 도전하세요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-400">5문제 · 오늘만 LP 2배 적용</p>
              <Link
                href="/quiz/daily"
                className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white transition-opacity hover:opacity-90"
              >
                오늘의 퀴즈 시작
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 티어 올리기 */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10">
        <div className="p-5">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="#a78bfa"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="#a78bfa15"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">티어 올리기</h3>
              <p className="text-[10px] text-gray-500">무제한 · 기본 LP</p>
            </div>
            <span className="ml-auto rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-semibold text-purple-400">
              무제한
            </span>
          </div>

          <div className="my-4 h-px bg-gray-800" />

          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-400">언제든 연습하고 실력을 키우세요</p>
            <Link
              href="/quiz/practice"
              className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white transition-opacity hover:opacity-90"
            >
              연습 시작
            </Link>
          </div>
        </div>
      </div>

      {/* 오답 노트 */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10">
        <div className="p-5">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <path d="M12 8v4M12 16h.01" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">오답 노트</h3>
              <p className="text-[10px] text-gray-500">틀린 문제 다시 풀기</p>
            </div>
            <span className="ml-auto rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-400">
              복습
            </span>
          </div>

          <div className="my-4 h-px bg-gray-800" />

          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-400">최근에 틀린 문제를 다시 풀고 약점을 극복하세요</p>
            <Link
              href="/quiz/retry"
              className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-opacity hover:opacity-90"
            >
              오답 풀기
            </Link>
          </div>
        </div>
      </div>

      {/* 배치 테스트 카드 (완료 안됐을 때만) */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/30 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">배치 테스트</span>
          <span className="text-xs text-gray-600">첫 시작 티어 결정 · 완료됨</span>
        </div>
        <span className="ml-auto text-xs text-emerald-500">완료</span>
      </div>
    </div>
  );
}
