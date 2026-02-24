import { NextRequest, NextResponse } from "next/server";

import type { WeeklyChallengeRow } from "@/shared/types/database.type";

import { getCurrentWeekRange } from "@/features/weekly-challenge/lib/weekly.util";

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
  const challengeId = searchParams.get("challengeId");

  let targetChallengeId = challengeId;

  // challengeId 없으면 현재 주 챌린지 사용
  if (!targetChallengeId) {
    const { start, end } = getCurrentWeekRange();
    const { data: challenge } = (await supabase
      .from("weekly_challenges")
      .select("id")
      .eq("is_active", true)
      .lte("start_date", end)
      .gte("end_date", start)
      .order("start_date", { ascending: false })
      .limit(1)
      .single()) as { data: Pick<WeeklyChallengeRow, "id"> | null };

    if (!challenge) {
      return NextResponse.json({ users: [] });
    }
    targetChallengeId = challenge.id;
  }

  const { data: participants } = await supabase
    .from("weekly_challenge_participants")
    .select("*, users!inner(id, name, profile_image_url, current_lp, current_tier, current_tier_division)")
    .eq("challenge_id", targetChallengeId)
    .not("completed_at", "is", null)
    .order("score", { ascending: false })
    .limit(50);

  type ParticipantWithUser = {
    id: string;
    score: number;
    correct_count: number;
    total_time_ms: number;
    completed_at: string;
    users: {
      id: string;
      name: string;
      profile_image_url: string | null;
      current_lp: number;
      current_tier: string;
      current_tier_division: number;
    };
  };

  const typedParticipants = (participants ?? []) as unknown as ParticipantWithUser[];

  const users = typedParticipants.map((p) => ({
    id: p.users.id,
    name: p.users.name,
    profile_image_url: p.users.profile_image_url,
    current_lp: p.users.current_lp,
    current_tier: p.users.current_tier,
    current_tier_division: p.users.current_tier_division,
    score: p.score,
    correct_count: p.correct_count,
    total_time_ms: p.total_time_ms,
  }));

  return NextResponse.json({ users, currentUserId: user.id });
}
