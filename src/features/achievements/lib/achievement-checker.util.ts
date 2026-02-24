/**
 * 업적 체크 유틸: 서버사이드에서 조건 체크 후 새로 달성한 업적을 반환
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/types/database.type";

type CheckContext = {
  userId: string;
  supabase: SupabaseClient<Database>;
};

type AchievementCondition = {
  key: string;
  check: (ctx: CheckContext) => Promise<boolean>;
};

const CONDITIONS: AchievementCondition[] = [
  // 스트릭
  { key: "streak_3", check: async (ctx) => (await getStreak(ctx)) >= 3 },
  { key: "streak_7", check: async (ctx) => (await getStreak(ctx)) >= 7 },
  { key: "streak_14", check: async (ctx) => (await getStreak(ctx)) >= 14 },
  { key: "streak_30", check: async (ctx) => (await getStreak(ctx)) >= 30 },
  { key: "streak_100", check: async (ctx) => (await getStreak(ctx)) >= 100 },

  // 정답률
  {
    key: "first_perfect",
    check: async (ctx) => {
      const { data } = await ctx.supabase
        .from("quiz_sessions")
        .select("id, total_questions, correct_count")
        .eq("user_id", ctx.userId)
        .eq("status", "completed")
        .gt("total_questions", 0);

      return (data ?? []).some((s) => s.correct_count === s.total_questions);
    },
  },
  {
    key: "perfect_10",
    check: async (ctx) => {
      const { data } = await ctx.supabase
        .from("quiz_sessions")
        .select("id, total_questions, correct_count")
        .eq("user_id", ctx.userId)
        .eq("status", "completed")
        .gt("total_questions", 0);

      const perfects = (data ?? []).filter((s) => s.correct_count === s.total_questions);
      return perfects.length >= 10;
    },
  },

  // 티어
  { key: "tier_element", check: async (ctx) => (await getLp(ctx)) >= 100 },
  { key: "tier_selector", check: async (ctx) => (await getLp(ctx)) >= 500 },
  { key: "tier_script", check: async (ctx) => (await getLp(ctx)) >= 1200 },
  { key: "tier_component", check: async (ctx) => (await getLp(ctx)) >= 2400 },
  { key: "tier_hook", check: async (ctx) => (await getLp(ctx)) >= 4400 },
  { key: "tier_architect", check: async (ctx) => (await getLp(ctx)) >= 8000 },
  { key: "tier_deployer", check: async (ctx) => (await getLp(ctx)) >= 14000 },

  // 문제 수
  { key: "quiz_10", check: async (ctx) => (await getTotalAnswered(ctx)) >= 10 },
  { key: "quiz_50", check: async (ctx) => (await getTotalAnswered(ctx)) >= 50 },
  { key: "quiz_100", check: async (ctx) => (await getTotalAnswered(ctx)) >= 100 },
  { key: "quiz_500", check: async (ctx) => (await getTotalAnswered(ctx)) >= 500 },

  // 속도
  {
    key: "speed_10s",
    check: async (ctx) => {
      const { data } = await ctx.supabase
        .from("answer_history")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("is_correct", true)
        .lte("time_spent_ms", 10000)
        .limit(1);

      return (data ?? []).length > 0;
    },
  },
  {
    key: "timeattack_first",
    check: async (ctx) => {
      const { data } = await ctx.supabase
        .from("quiz_sessions")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("session_type", "timeattack")
        .eq("status", "completed")
        .limit(1);

      return (data ?? []).length > 0;
    },
  },

  // 특별
  { key: "welcome", check: async () => true },
  {
    key: "first_quiz",
    check: async (ctx) => {
      const { data } = await ctx.supabase
        .from("quiz_sessions")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("status", "completed")
        .limit(1);

      return (data ?? []).length > 0;
    },
  },
  {
    key: "first_community",
    check: async (ctx) => {
      const { data } = await ctx.supabase.from("community_posts").select("id").eq("author_id", ctx.userId).limit(1);

      return (data ?? []).length > 0;
    },
  },
];

// 캐시 헬퍼
let cachedStreak: number | null = null;
let cachedLp: number | null = null;
let cachedTotalAnswered: number | null = null;

async function getStreak(ctx: CheckContext): Promise<number> {
  if (cachedStreak !== null) return cachedStreak;
  const { data } = await ctx.supabase.from("users").select("current_streak").eq("id", ctx.userId).single();
  cachedStreak = data?.current_streak ?? 0;
  return cachedStreak;
}

async function getLp(ctx: CheckContext): Promise<number> {
  if (cachedLp !== null) return cachedLp;
  const { data } = await ctx.supabase.from("users").select("current_lp").eq("id", ctx.userId).single();
  cachedLp = data?.current_lp ?? 0;
  return cachedLp;
}

async function getTotalAnswered(ctx: CheckContext): Promise<number> {
  if (cachedTotalAnswered !== null) return cachedTotalAnswered;
  const { data } = await ctx.supabase.from("users").select("total_answered").eq("id", ctx.userId).single();
  cachedTotalAnswered = data?.total_answered ?? 0;
  return cachedTotalAnswered;
}

/**
 * 유저의 업적을 체크하고 새로 달성한 업적 key 배열을 반환
 */
export async function checkAndGrantAchievements(ctx: CheckContext): Promise<string[]> {
  // 캐시 초기화
  cachedStreak = null;
  cachedLp = null;
  cachedTotalAnswered = null;

  // 이미 달성한 업적 조회
  const { data: earnedRows } = await ctx.supabase
    .from("user_achievements")
    .select("achievement_id, achievements!inner(key)")
    .eq("user_id", ctx.userId);

  const earnedKeys = new Set((earnedRows ?? []).map((r) => (r.achievements as unknown as { key: string }).key));

  // 전체 업적 조회
  const { data: allAchievements } = await ctx.supabase.from("achievements").select("id, key");

  const achievementMap = new Map((allAchievements ?? []).map((a) => [a.key, a.id]));

  const newlyEarned: string[] = [];

  for (const condition of CONDITIONS) {
    if (earnedKeys.has(condition.key)) continue;
    if (!achievementMap.has(condition.key)) continue;

    try {
      const passed = await condition.check(ctx);
      if (passed) {
        const achievementId = achievementMap.get(condition.key) ?? "";
        await ctx.supabase.from("user_achievements").insert({
          user_id: ctx.userId,
          achievement_id: achievementId,
        });
        newlyEarned.push(condition.key);
      }
    } catch {
      // 개별 업적 체크 실패 시 스킵
    }
  }

  return newlyEarned;
}
