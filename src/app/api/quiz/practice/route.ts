import { NextRequest, NextResponse } from "next/server";

import { DAILY_QUIZ_CONFIG } from "@/shared/constants/tier.constant";
import type {
  AnswerHistoryRow,
  CategoryStatRow,
  QuestionCategory,
  QuestionRow,
  UserRow,
} from "@/shared/types/database.type";

import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID_CATEGORIES: QuestionCategory[] = ["javascript", "typescript", "react", "nextjs", "css", "web_fundamentals"];
const DUMMY_UUID = "00000000-0000-0000-0000-000000000000";
const makeNotIn = (ids: string[]) => `(${ids.length > 0 ? ids.join(",") : DUMMY_UUID})`;

export async function GET(request: NextRequest) {
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

  // 카테고리 집중 모드: ?category=javascript
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category") as QuestionCategory | null;
  const focusCategory = categoryParam && VALID_CATEGORIES.includes(categoryParam) ? categoryParam : null;

  const tierDifficulty = getTierDifficulty(profile.current_tier as Parameters<typeof getTierDifficulty>[0]);
  // 티어 난이도 ±2 범위로 충분한 문제 풀 확보
  const minDiff = Math.max(1, tierDifficulty - 2);
  const maxDiff = Math.min(8, tierDifficulty + 2);

  const { data: categoryStats } = (await supabase.from("category_stats").select("*").eq("user_id", user.id)) as {
    data: CategoryStatRow[] | null;
  };

  const categoryAccuracy = VALID_CATEGORIES.map((cat) => {
    const stats = categoryStats?.filter((s) => s.category === cat) ?? [];
    const totalAnswered = stats.reduce((sum, s) => sum + s.total_answered, 0);
    const totalCorrect = stats.reduce((sum, s) => sum + s.total_correct, 0);
    return { category: cat, accuracy: totalAnswered > 0 ? totalCorrect / totalAnswered : 0.5 };
  });

  const sorted = [...categoryAccuracy].sort((a, b) => a.accuracy - b.accuracy);
  const weakCategory = focusCategory ?? sorted[0]?.category ?? "javascript";
  const strongCategory = focusCategory ?? sorted[sorted.length - 1]?.category ?? "react";

  // ============ 제외 문제 ID 수집 ============
  // 1) 정답 맞춘 문제 → 7일간 제외
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: correctAnswers } = (await supabase
    .from("answer_history")
    .select("question_id")
    .eq("user_id", user.id)
    .eq("is_correct", true)
    .gte("answered_at", sevenDaysAgo.toISOString())) as {
    data: Pick<AnswerHistoryRow, "question_id">[] | null;
  };

  // 2) 24시간 내 풀었던 문제 → 맞든 틀리든 즉시 중복 방지
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const { data: recentAllAnswers } = (await supabase
    .from("answer_history")
    .select("question_id")
    .eq("user_id", user.id)
    .gte("answered_at", oneDayAgo.toISOString())) as {
    data: Pick<AnswerHistoryRow, "question_id">[] | null;
  };

  const excludeIds = Array.from(
    new Set([
      ...(correctAnswers ?? []).map((a) => a.question_id),
      ...(recentAllAnswers ?? []).map((a) => a.question_id),
    ])
  );

  // ============ 문제 선택 ============
  const selectedQuestions: QuestionRow[] = [];

  // 1. 약점/집중 카테고리 1문제
  const { data: weakQ } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", weakCategory)
    .eq("is_active", true)
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .not("id", "in", makeNotIn(excludeIds))
    .limit(5)) as { data: QuestionRow[] | null };

  if (weakQ && weakQ.length > 0) {
    selectedQuestions.push(weakQ[Math.floor(Math.random() * weakQ.length)]);
  }

  // 2. 강점/집중 카테고리 1문제
  const { data: strongQ } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", strongCategory)
    .eq("is_active", true)
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .not("id", "in", makeNotIn([...excludeIds, ...selectedQuestions.map((q) => q.id)]))
    .limit(5)) as { data: QuestionRow[] | null };

  if (strongQ && strongQ.length > 0) {
    selectedQuestions.push(strongQ[Math.floor(Math.random() * strongQ.length)]);
  }

  // 3. 나머지 문제들
  const remaining = DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY - selectedQuestions.length;
  let tierQuery = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .not("id", "in", makeNotIn([...excludeIds, ...selectedQuestions.map((q) => q.id)]))
    .limit(remaining * 3);

  if (focusCategory) tierQuery = tierQuery.eq("category", focusCategory);

  const { data: tierQ } = (await tierQuery) as { data: QuestionRow[] | null };

  if (tierQ) {
    const shuffled = tierQ.sort(() => Math.random() - 0.5);
    selectedQuestions.push(...shuffled.slice(0, remaining));
  }

  // 4. 부족하면 난이도 무시하고 추가
  if (selectedQuestions.length < DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY) {
    const moreNeeded = DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY - selectedQuestions.length;
    const { data: fallbackQ } = (await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .not("id", "in", makeNotIn([...excludeIds, ...selectedQuestions.map((q) => q.id)]))
      .limit(moreNeeded)) as { data: QuestionRow[] | null };

    if (fallbackQ) {
      selectedQuestions.push(...fallbackQ);
    }
  }

  // 세션 생성
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({ user_id: user.id, session_type: "practice" as const, total_questions: selectedQuestions.length })
    .select("id")
    .single()) as { data: { id: string } | null };

  return NextResponse.json({ sessionId: session?.id, questions: selectedQuestions });
}
