import { NextResponse } from "next/server";

import type { AnswerHistoryRow, QuestionRow } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 최근 틀린 답안 조회 (최신순)
  const { data: wrongAnswers } = (await supabase
    .from("answer_history")
    .select("question_id, answered_at")
    .eq("user_id", user.id)
    .eq("is_correct", false)
    .order("answered_at", { ascending: false })
    .limit(100)) as { data: Pick<AnswerHistoryRow, "question_id" | "answered_at">[] | null };

  if (!wrongAnswers || wrongAnswers.length === 0) {
    return NextResponse.json({ empty: true, questions: [] });
  }

  // 중복 제거 (최신 오답 기준 최대 10문제)
  const seen = new Set<string>();
  const uniqueWrongIds: string[] = [];
  for (const row of wrongAnswers) {
    if (!seen.has(row.question_id)) {
      seen.add(row.question_id);
      uniqueWrongIds.push(row.question_id);
      if (uniqueWrongIds.length >= 10) break;
    }
  }

  // 실제 문제 조회
  const { data: questions } = (await supabase
    .from("questions")
    .select("*")
    .in("id", uniqueWrongIds)
    .eq("is_active", true)) as { data: QuestionRow[] | null };

  if (!questions || questions.length === 0) {
    return NextResponse.json({ empty: true, questions: [] });
  }

  // 오답 순서대로 정렬
  const ordered = uniqueWrongIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is QuestionRow => q !== undefined);

  // 세션 생성
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      session_type: "practice" as const,
      total_questions: ordered.length,
    })
    .select("id")
    .single()) as { data: { id: string } | null };

  return NextResponse.json({ sessionId: session?.id, questions: ordered });
}
