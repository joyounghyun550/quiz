import { NextResponse } from "next/server";

import { checkAndGrantAchievements } from "@/features/achievements/lib/achievement-checker.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newlyEarned = await checkAndGrantAchievements({
    userId: user.id,
    supabase,
  });

  // 새로 달성한 업적의 상세 정보 반환
  if (newlyEarned.length > 0) {
    const { data: achievements } = await supabase.from("achievements").select("*").in("key", newlyEarned);

    return NextResponse.json({ newAchievements: achievements ?? [] });
  }

  return NextResponse.json({ newAchievements: [] });
}
