import { NextResponse } from "next/server";

import type { QuestionRow, QuizSessionRow } from "@/shared/types/database.type";

import { generatePlacementDifficulties } from "@/features/placement-test/lib/placement-scoring.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const difficulties = generatePlacementDifficulties();

  // 각 난이도별로 랜덤 문제 선택 (중복 방지)
  const questions: QuestionRow[] = [];
  const usedIds: string[] = [];

  for (const difficulty of difficulties) {
    let query = supabase.from("questions").select("*").eq("difficulty", difficulty).eq("is_active", true);

    if (usedIds.length > 0) {
      query = query.not("id", "in", `(${usedIds.join(",")})`);
    }

    const { data } = (await query.limit(10)) as { data: QuestionRow[] | null };

    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const selected = data[randomIndex];
      questions.push(selected);
      usedIds.push(selected.id);
    }
  }

  // 세션 생성
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      session_type: "placement" as const,
      total_questions: questions.length,
    })
    .select("id")
    .single()) as { data: Pick<QuizSessionRow, "id"> | null };

  return NextResponse.json({
    sessionId: session?.id,
    questions: questions.map(({ correct_answer: _ca, ...q }) => ({
      ...q,
    })),
    _answers: questions.map((q) => ({ id: q.id, correct_answer: q.correct_answer })),
  });
}
