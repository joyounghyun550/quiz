import { NextResponse } from "next/server";

import type { SeasonRecordRow } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type RewardRequest = {
  seasonId: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RewardRequest = await request.json();
  const { seasonId } = body;

  if (!seasonId) {
    return NextResponse.json({ error: "seasonId는 필수입니다" }, { status: 400 });
  }

  // 시즌 기록 확인
  const { data: record } = (await supabase
    .from("season_records")
    .select("*")
    .eq("season_id", seasonId)
    .eq("user_id", user.id)
    .single()) as { data: SeasonRecordRow | null };

  if (!record) {
    return NextResponse.json({ error: "시즌 기록을 찾을 수 없습니다" }, { status: 404 });
  }

  if (record.reward_claimed) {
    return NextResponse.json({ error: "이미 보상을 수령했습니다" }, { status: 400 });
  }

  // 보상 수령 처리
  await supabase.from("season_records").update({ reward_claimed: true }).eq("id", record.id);

  return NextResponse.json({ success: true, message: "시즌 보상이 수령되었습니다" });
}
