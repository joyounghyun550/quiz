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

  const { data: categoryStats } = (await supabase.from("category_stats").select("*").eq("user_id", user.id)) as {
    data: CategoryStatRow[] | null;
  };

  const categories: QuestionCategory[] = VALID_CATEGORIES;
  const categoryAccuracy = categories.map((cat) => {
    const stats = categoryStats?.filter((s) => s.category === cat) ?? [];
    const totalAnswered = stats.reduce((sum, s) => sum + s.total_answered, 0);
    const totalCorrect = stats.reduce((sum, s) => sum + s.total_correct, 0);
    return {
      category: cat,
      accuracy: totalAnswered > 0 ? totalCorrect / totalAnswered : 0.5,
      totalAnswered,
    };
  });

  const sorted = [...categoryAccuracy].sort((a, b) => a.accuracy - b.accuracy);
  const weakCategory = focusCategory ?? sorted[0]?.category ?? "javascript";
  const strongCategory = focusCategory ?? sorted[sorted.length - 1]?.category ?? "react";

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DAILY_QUIZ_CONFIG.RECENT_HISTORY_DAYS);

  const { data: recentAnswers } = (await supabase
    .from("answer_history")
    .select("question_id")
    .eq("user_id", user.id)
    .gte("answered_at", thirtyDaysAgo.toISOString())) as {
    data: Pick<AnswerHistoryRow, "question_id">[] | null;
  };

  const recentQuestionIds = recentAnswers?.map((a) => a.question_id) ?? [];
  const selectedQuestions: QuestionRow[] = [];

  const { data: weakQuestions } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", weakCategory)
    .eq("is_active", true)
    .gte("difficulty", Math.max(1, tierDifficulty - 1))
    .lte("difficulty", Math.min(8, tierDifficulty + 1))
    .not(
      "id",
      "in",
      `(${recentQuestionIds.length > 0 ? recentQuestionIds.join(",") : "00000000-0000-0000-0000-000000000000"})`
    )
    .limit(5)) as { data: QuestionRow[] | null };

  if (weakQuestions && weakQuestions.length > 0) {
    selectedQuestions.push(weakQuestions[Math.floor(Math.random() * weakQuestions.length)]);
  }

  const { data: strongQuestions } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", strongCategory)
    .eq("is_active", true)
    .gte("difficulty", Math.max(1, tierDifficulty - 1))
    .lte("difficulty", Math.min(8, tierDifficulty + 1))
    .not(
      "id",
      "in",
      `(${[...recentQuestionIds, ...selectedQuestions.map((q) => q.id)].join(",") || "00000000-0000-0000-0000-000000000000"})`
    )
    .limit(5)) as { data: QuestionRow[] | null };

  if (strongQuestions && strongQuestions.length > 0) {
    selectedQuestions.push(strongQuestions[Math.floor(Math.random() * strongQuestions.length)]);
  }

  const remaining = DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY - selectedQuestions.length;
  const excludeIds = [...recentQuestionIds, ...selectedQuestions.map((q) => q.id)];

  const tierQuery = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .gte("difficulty", Math.max(1, tierDifficulty - 1))
    .lte("difficulty", Math.min(8, tierDifficulty + 1))
    .not("id", "in", `(${excludeIds.length > 0 ? excludeIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .limit(remaining * 3);

  if (focusCategory) tierQuery.eq("category", focusCategory);

  const { data: tierQuestions } = (await tierQuery) as { data: QuestionRow[] | null };

  if (tierQuestions) {
    const shuffled = tierQuestions.sort(() => Math.random() - 0.5);
    selectedQuestions.push(...shuffled.slice(0, remaining));
  }

  if (selectedQuestions.length < DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY) {
    const moreNeeded = DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY - selectedQuestions.length;
    const fallbackExcludeIds = [...selectedQuestions.map((q) => q.id), ...recentQuestionIds];

    const { data: fallbackQuestions } = (await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .not(
        "id",
        "in",
        `(${fallbackExcludeIds.length > 0 ? fallbackExcludeIds.join(",") : "00000000-0000-0000-0000-000000000000"})`
      )
      .limit(moreNeeded)) as { data: QuestionRow[] | null };

    if (fallbackQuestions) {
      selectedQuestions.push(...fallbackQuestions);
    }
  }

  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      session_type: "practice" as const,
      total_questions: selectedQuestions.length,
    })
    .select("id")
    .single()) as { data: { id: string } | null };

  return NextResponse.json({
    sessionId: session?.id,
    questions: selectedQuestions,
  });
}
