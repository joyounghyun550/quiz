import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "all";

  let query = supabase
    .from("timeattack_scores")
    .select(
      "*, users!inner(id, name, profile_image_url, current_lp, current_tier, current_tier_division, current_streak, total_answered, total_correct)"
    )
    .order("score", { ascending: false })
    .limit(100);

  if (period === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte("played_at", weekAgo.toISOString().split("T")[0]);
  } else if (period === "daily") {
    const today = new Date().toISOString().split("T")[0];
    query = query.eq("played_at", today);
  }

  const { data: scores } = await query;

  type ScoreWithUser = {
    id: string;
    user_id: string;
    score: number;
    total_time_ms: number;
    correct_count: number;
    combo_max: number;
    played_at: string;
    users: {
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
  };

  const typedScores = (scores ?? []) as ScoreWithUser[];

  // 유저별 최고 점수만 추출
  const bestScores = new Map<string, ScoreWithUser>();
  for (const score of typedScores) {
    const userId = score.user_id;
    const existing = bestScores.get(userId);
    if (!existing || score.score > existing.score) {
      bestScores.set(userId, score);
    }
  }

  const users = Array.from(bestScores.values())
    .sort((a, b) => b.score - a.score)
    .map((s) => ({
      id: s.users.id,
      name: s.users.name,
      profile_image_url: s.users.profile_image_url,
      current_lp: s.users.current_lp,
      current_tier: s.users.current_tier,
      current_tier_division: s.users.current_tier_division,
      score: s.score,
      correct_count: s.correct_count,
      combo_max: s.combo_max,
      total_time_ms: s.total_time_ms,
      played_at: s.played_at,
    }));

  return NextResponse.json({ users, currentUserId: user.id });
}
