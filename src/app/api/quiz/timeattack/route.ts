import { NextResponse } from "next/server";

import { TIMEATTACK_CONFIG } from "@/shared/constants/tier.constant";
import type { AnswerHistoryRow, QuestionRow, UserRow } from "@/shared/types/database.type";

import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const DUMMY_UUID = "00000000-0000-0000-0000-000000000000";
const makeNotIn = (ids: string[]) => `(${ids.length > 0 ? ids.join(",") : DUMMY_UUID})`;

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
    data: UserRow | null;
  };

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tierDifficulty = getTierDifficulty(profile.current_tier as Parameters<typeof getTierDifficulty>[0]);
  const minDiff = Math.max(1, tierDifficulty - 1);
  const maxDiff = Math.min(8, tierDifficulty + 1);

  // 24시간 내 풀었던 문제 제외
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const { data: recentAnswers } = (await supabase
    .from("answer_history")
    .select("question_id")
    .eq("user_id", user.id)
    .gte("answered_at", oneDayAgo.toISOString())) as {
    data: Pick<AnswerHistoryRow, "question_id">[] | null;
  };

  const excludeIds = Array.from(new Set((recentAnswers ?? []).map((a) => a.question_id)));

  // 문제 선택: 티어 난이도 ±1 범위, 10문제
  const { data: questions } = (await supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .not("id", "in", makeNotIn(excludeIds))
    .limit(TIMEATTACK_CONFIG.TOTAL_QUESTIONS * 3)) as { data: QuestionRow[] | null };

  const shuffled = (questions ?? []).sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, TIMEATTACK_CONFIG.TOTAL_QUESTIONS);

  if (selectedQuestions.length === 0) {
    return NextResponse.json({ error: "Not enough questions available" }, { status: 404 });
  }

  // 세션 생성
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      session_type: "timeattack" as const,
      total_questions: selectedQuestions.length,
    })
    .select("id")
    .single()) as { data: { id: string } | null };

  return NextResponse.json({ sessionId: session?.id, questions: selectedQuestions });
}
