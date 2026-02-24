import { NextResponse } from "next/server";

import type { AnswerHistoryRow, QuestionRow, UserRow } from "@/shared/types/database.type";

import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const QUESTIONS_PER_SESSION = 5;
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
  const minDiff = Math.max(1, tierDifficulty - 2);
  const maxDiff = Math.min(8, tierDifficulty + 2);

  // 최근 24시간 내 푼 문제 제외
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const { data: recentAnswers } = (await supabase
    .from("answer_history")
    .select("question_id")
    .eq("user_id", user.id)
    .gte("answered_at", oneDayAgo.toISOString())) as {
    data: Pick<AnswerHistoryRow, "question_id">[] | null;
  };

  const excludeIds = (recentAnswers ?? []).map((a) => a.question_id);

  // 면접 카테고리 문제 조회
  const { data: questions } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", "interview")
    .eq("is_active", true)
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .not("id", "in", makeNotIn(excludeIds))
    .limit(QUESTIONS_PER_SESSION * 3)) as { data: QuestionRow[] | null };

  const selectedQuestions = (questions ?? []).sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_SESSION);

  // 부족하면 난이도 무시
  if (selectedQuestions.length < QUESTIONS_PER_SESSION) {
    const moreNeeded = QUESTIONS_PER_SESSION - selectedQuestions.length;
    const { data: fallbackQ } = (await supabase
      .from("questions")
      .select("*")
      .eq("category", "interview")
      .eq("is_active", true)
      .not("id", "in", makeNotIn([...excludeIds, ...selectedQuestions.map((q) => q.id)]))
      .limit(moreNeeded)) as { data: QuestionRow[] | null };

    if (fallbackQ) selectedQuestions.push(...fallbackQ);
  }

  // 세션 생성
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({ user_id: user.id, session_type: "interview" as const, total_questions: selectedQuestions.length })
    .select("id")
    .single()) as { data: { id: string } | null };

  return NextResponse.json({ sessionId: session?.id, questions: selectedQuestions });
}
