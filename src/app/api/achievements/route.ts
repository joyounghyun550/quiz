import { NextResponse } from "next/server";

import type { AchievementRow } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 전체 업적 조회
  const { data: achievements } = (await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true })) as { data: AchievementRow[] | null };

  // 유저 달성 업적 조회
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", user.id);

  const earnedMap = new Map((userAchievements ?? []).map((ua) => [ua.achievement_id, ua.earned_at]));

  const result = (achievements ?? []).map((a) => ({
    ...a,
    earned: earnedMap.has(a.id),
    earnedAt: earnedMap.get(a.id) ?? null,
  }));

  return NextResponse.json({ achievements: result });
}
