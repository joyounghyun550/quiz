import { NextResponse } from "next/server";

import type { QuestionRow, UserRow, WeeklyChallengeRow } from "@/shared/types/database.type";

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

  const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
    data: UserRow | null;
  };

  if (!profile?.has_completed_placement) {
    return NextResponse.json({ error: "배치 테스트를 먼저 완료해주세요" }, { status: 400 });
  }

  // 현재 주 활성 챌린지 조회
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
    return NextResponse.json({ error: "이번 주 챌린지가 없습니다" }, { status: 404 });
  }

  // 이미 참여했는지 확인
  const { data: participation } = await supabase
    .from("weekly_challenge_participants")
    .select("id")
    .eq("challenge_id", challenge.id)
    .eq("user_id", user.id)
    .limit(1);

  if (participation && participation.length > 0) {
    return NextResponse.json({ error: "이미 이번 주 챌린지에 참여했습니다", alreadyParticipated: true });
  }

  // 난이도 계산: 유저 티어 기반 + difficulty_bonus
  const tierDifficultyMap: Record<string, number> = {
    inline: 1,
    element: 2,
    selector: 3,
    script: 4,
    component: 5,
    hook: 6,
    architect: 7,
    deployer: 8,
  };

  const baseDifficulty = tierDifficultyMap[profile.current_tier] ?? 3;
  const targetDifficulty = Math.min(10, Math.max(1, baseDifficulty + challenge.difficulty_bonus));

  // 문제 조회
  const { data: questions } = (await supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .gte("difficulty", targetDifficulty - 1)
    .lte("difficulty", targetDifficulty + 1)
    .limit(challenge.question_count)
    .order("times_served", { ascending: true })) as { data: QuestionRow[] | null };

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "문제를 찾을 수 없습니다" }, { status: 500 });
  }

  // 문제 가공을 먼저 수행 (참가자 등록 전에 검증)
  const clientQuestions = questions.map((q) => {
    const opts = q.options as { id: string; text: string; isCorrect: boolean }[] | null;
    return {
      id: q.id,
      title: q.title,
      options: opts ? opts.map(({ id, text }: { id: string; text: string }) => ({ id, text })) : null,
      category: q.category,
      difficulty: q.difficulty,
      code_snippet: q.code_snippet,
      code_language: q.code_language,
      hint_1: q.hint_1,
      hint_2: q.hint_2,
      format: q.format,
      correct_answer: q.format === "true_false" ? undefined : undefined,
    };
  });

  // 세션 생성
  const { data: session } = await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      session_type: "weekly",
      total_questions: questions.length,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (!session) {
    return NextResponse.json({ error: "세션 생성 실패" }, { status: 500 });
  }

  // 참여자 등록 (문제 가공 + 세션 생성 성공 후)
  await supabase.from("weekly_challenge_participants").insert({
    challenge_id: challenge.id,
    user_id: user.id,
    session_id: session.id,
  });

  // served 카운트 업데이트
  for (const q of questions) {
    await supabase
      .from("questions")
      .update({ times_served: (q.times_served ?? 0) + 1 })
      .eq("id", q.id);
  }

  return NextResponse.json({
    questions: clientQuestions,
    sessionId: session.id,
    challenge: {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      lpMultiplier: challenge.lp_multiplier,
    },
  });
}
