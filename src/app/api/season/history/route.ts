import { NextResponse } from "next/server";

import type { SeasonRecordRow, SeasonRow } from "@/shared/types/database.type";

import type { SeasonRecord } from "@/entities/season/model/types";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 유저의 시즌 기록 조회
  const { data: recordRows } = (await supabase.from("season_records").select("*").eq("user_id", user.id)) as {
    data: SeasonRecordRow[] | null;
  };

  if (!recordRows || recordRows.length === 0) {
    return NextResponse.json({ records: [] });
  }

  // 관련 시즌 정보 조회
  const seasonIds = recordRows.map((r) => r.season_id);
  const { data: seasonRows } = (await supabase
    .from("seasons")
    .select("*")
    .in("id", seasonIds)
    .order("season_number", { ascending: false })) as { data: SeasonRow[] | null };

  const seasonMap = new Map((seasonRows ?? []).map((s) => [s.id, s]));

  const records: SeasonRecord[] = recordRows
    .map((r) => {
      const season = seasonMap.get(r.season_id);
      if (!season) return null;

      return {
        seasonId: r.season_id,
        seasonName: season.name,
        seasonNumber: season.season_number,
        finalLp: r.final_lp,
        finalTier: r.final_tier,
        finalRank: r.final_rank,
        totalQuizzes: r.total_quizzes,
        totalCorrect: r.total_correct,
        rewardClaimed: r.reward_claimed,
      };
    })
    .filter((r): r is SeasonRecord => r !== null)
    .sort((a, b) => b.seasonNumber - a.seasonNumber);

  return NextResponse.json({ records });
}
