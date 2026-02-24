import { NextResponse } from "next/server";

import type { WeeklyChallengeRow } from "@/shared/types/database.type";

import { getCurrentWeekRange } from "@/features/weekly-challenge/lib/weekly.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { start, end } = getCurrentWeekRange();
  const { data: challenge } = (await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", end)
    .gte("end_date", start)
    .order("start_date", { ascending: false })
    .limit(1)
    .single()) as { data: WeeklyChallengeRow | null };

  if (!challenge) {
    return NextResponse.json({ challenge: null });
  }

  // 참여자 수
  const { count } = await supabase
    .from("weekly_challenge_participants")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challenge.id);

  // 현재 유저 참여 여부
  const { data: myParticipation } = await supabase
    .from("weekly_challenge_participants")
    .select("id")
    .eq("challenge_id", challenge.id)
    .eq("user_id", user.id)
    .limit(1);

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      endDate: challenge.end_date,
      participantCount: count ?? 0,
      hasParticipated: (myParticipation ?? []).length > 0,
    },
  });
}
