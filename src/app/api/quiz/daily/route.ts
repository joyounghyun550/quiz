import { NextResponse } from "next/server";

import { DAILY_QUIZ_CONFIG } from "@/shared/constants/tier.constant";
import type {
  AnswerHistoryRow,
  CategoryStatRow,
  DailyQuizLogRow,
  QuestionCategory,
  QuestionRow,
  QuizSessionRow,
  UserRow,
} from "@/shared/types/database.type";

import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 유저 프로필 가져오기
  const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
    data: UserRow | null;
  };

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 오늘 이미 퀴즈를 완료했는지 확인
  const today = new Date().toISOString().split("T")[0];
  const { data: todayLog } = (await supabase
    .from("daily_quiz_log")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_date", today)
    .single()) as { data: DailyQuizLogRow | null };

  if (todayLog?.is_completed) {
    return NextResponse.json({ error: "Already completed today", completed: true }, { status: 400 });
  }

  // 기존 미완성 세션이 있으면 해당 세션의 문제를 다시 반환
  if (todayLog?.session_id) {
    const { data: existingSession } = (await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", todayLog.session_id)
      .single()) as { data: QuizSessionRow | null };

    if (existingSession && existingSession.status === "in_progress") {
      // 기존 세션의 문제들 반환
      const { data: answers } = (await supabase
        .from("answer_history")
        .select("question_id")
        .eq("session_id", existingSession.id)) as {
        data: Pick<AnswerHistoryRow, "question_id">[] | null;
      };

      // 기존 세션의 답변된 문제는 무시하고 새로운 문제를 생성
      void answers;
    }
  }

  const tierDifficulty = getTierDifficulty(profile.current_tier as Parameters<typeof getTierDifficulty>[0]);

  // 카테고리 통계 가져오기
  const { data: categoryStats } = (await supabase
    .from("category_stats")
    .select("*")
    .eq("user_id", user.id)) as { data: CategoryStatRow[] | null };

  // 약점/강점 카테고리 계산
  const categories: QuestionCategory[] = ["javascript", "typescript", "react", "nextjs", "css", "web_fundamentals"];
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
  const weakCategory = sorted[0]?.category ?? "javascript";
  const strongCategory = sorted[sorted.length - 1]?.category ?? "react";

  // 최근 30일 내 출제된 문제 ID 가져오기
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

  // 문제 선택
  const selectedQuestions: QuestionRow[] = [];

  // 1. 약점 카테고리 1문제
  const { data: weakQuestions } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", weakCategory)
    .eq("is_active", true)
    .gte("difficulty", Math.max(1, tierDifficulty - 1))
    .lte("difficulty", Math.min(8, tierDifficulty + 1))
    .not("id", "in", `(${recentQuestionIds.length > 0 ? recentQuestionIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .limit(5)) as { data: QuestionRow[] | null };

  if (weakQuestions && weakQuestions.length > 0) {
    selectedQuestions.push(weakQuestions[Math.floor(Math.random() * weakQuestions.length)]);
  }

  // 2. 강점 카테고리 1문제
  const { data: strongQuestions } = (await supabase
    .from("questions")
    .select("*")
    .eq("category", strongCategory)
    .eq("is_active", true)
    .gte("difficulty", Math.max(1, tierDifficulty - 1))
    .lte("difficulty", Math.min(8, tierDifficulty + 1))
    .not("id", "in", `(${[...recentQuestionIds, ...selectedQuestions.map((q) => q.id)].join(",") || "00000000-0000-0000-0000-000000000000"})`)
    .limit(5)) as { data: QuestionRow[] | null };

  if (strongQuestions && strongQuestions.length > 0) {
    selectedQuestions.push(strongQuestions[Math.floor(Math.random() * strongQuestions.length)]);
  }

  // 3. 나머지 문제들 (티어 난이도)
  const remaining = DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY - selectedQuestions.length;
  const excludeIds = [...recentQuestionIds, ...selectedQuestions.map((q) => q.id)];

  const { data: tierQuestions } = (await supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .gte("difficulty", Math.max(1, tierDifficulty - 1))
    .lte("difficulty", Math.min(8, tierDifficulty + 1))
    .not("id", "in", `(${excludeIds.length > 0 ? excludeIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .limit(remaining * 3)) as { data: QuestionRow[] | null };

  if (tierQuestions) {
    const shuffled = tierQuestions.sort(() => Math.random() - 0.5);
    selectedQuestions.push(...shuffled.slice(0, remaining));
  }

  // 문제가 부족한 경우 난이도 제한 없이 추가
  if (selectedQuestions.length < DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY) {
    const moreNeeded = DAILY_QUIZ_CONFIG.QUESTIONS_PER_DAY - selectedQuestions.length;
    const currentIds = selectedQuestions.map((q) => q.id);

    const { data: fallbackQuestions } = (await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .not("id", "in", `(${currentIds.length > 0 ? currentIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
      .limit(moreNeeded)) as { data: QuestionRow[] | null };

    if (fallbackQuestions) {
      selectedQuestions.push(...fallbackQuestions);
    }
  }

  // 세션 생성
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      session_type: "daily" as const,
      total_questions: selectedQuestions.length,
    })
    .select("id")
    .single()) as { data: Pick<QuizSessionRow, "id"> | null };

  // 오늘의 퀴즈 로그 생성/업데이트
  if (!todayLog) {
    await supabase.from("daily_quiz_log").insert({
      user_id: user.id,
      quiz_date: today,
      session_id: session?.id,
    });
  } else {
    await supabase.from("daily_quiz_log").update({ session_id: session?.id }).eq("id", todayLog.id);
  }

  return NextResponse.json({
    sessionId: session?.id,
    questions: selectedQuestions,
  });
}
