import { NextResponse } from "next/server";

import type { TierName, UserRow } from "@/shared/types/database.type";

import { calculateLpChange } from "@/entities/user/lib/lp.util";
import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type SubmitRequest = {
  challengeId: string;
  code: string;
  passedCount: number;
  totalTests: number;
  timeSpentMs: number;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SubmitRequest = await request.json();
  const { challengeId, code, passedCount, totalTests, timeSpentMs } = body;

  const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
    data: UserRow | null;
  };

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 챌린지 난이도 조회
  const { data: challenge } = await supabase
    .from("code_challenges")
    .select("difficulty, times_solved")
    .eq("id", challengeId)
    .single();

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const isSolved = passedCount === totalTests && totalTests > 0;
  const passRate = totalTests > 0 ? passedCount / totalTests : 0;

  // LP 계산: 통과율 기반
  const userTierDifficulty = getTierDifficulty(profile.current_tier as TierName);
  const baseLp = calculateLpChange({
    isCorrect: isSolved,
    questionDifficulty: (challenge as { difficulty: number }).difficulty,
    userTierDifficulty,
    currentStreak: profile.current_streak,
    hintLevel: 0,
  });

  // 부분 통과 시 LP 비례 적용
  const lpChange = isSolved ? baseLp : Math.round(baseLp * passRate * 0.5);

  // 제출 기록
  await supabase.from("code_challenge_submissions").insert({
    user_id: user.id,
    challenge_id: challengeId,
    code,
    passed_count: passedCount,
    total_tests: totalTests,
    is_solved: isSolved,
    lp_change: lpChange,
    time_spent_ms: timeSpentMs,
  });

  // 풀이 성공 시 times_solved 업데이트
  if (isSolved) {
    await supabase
      .from("code_challenges")
      .update({ times_solved: ((challenge as { times_solved: number }).times_solved ?? 0) + 1 })
      .eq("id", challengeId);
  }

  // LP 적용
  if (lpChange !== 0) {
    const newLp = Math.max(0, profile.current_lp + lpChange);
    await supabase
      .from("users")
      .update({
        current_lp: newLp,
        highest_lp: Math.max(profile.highest_lp, newLp),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await supabase.from("lp_history").insert({
      user_id: user.id,
      lp_before: profile.current_lp,
      lp_after: newLp,
      lp_change: lpChange,
      reason: "code_challenge",
    });
  }

  return NextResponse.json({ lpChange, isSolved, passedCount, totalTests });
}
