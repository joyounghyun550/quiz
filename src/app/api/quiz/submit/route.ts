import { NextResponse } from "next/server";

import { LP_CONFIG } from "@/shared/constants/tier.constant";
import type { CategoryStatRow, QuestionRow, QuizSessionRow, TierName, UserRow } from "@/shared/types/database.type";

import { applyLpChange, calculateLpChange } from "@/entities/user/lib/lp.util";
import { getTierDifficulty, getTierInfo } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type SubmitAnswer = {
  questionId: string;
  userAnswer: string;
  hint1Used: boolean;
  hint2Used: boolean;
  timeSpentMs: number;
};

type SubmitRequest = {
  sessionId: string;
  answers: SubmitAnswer[];
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
  const { sessionId, answers } = body;

  // 세션 확인
  const { data: session } = (await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single()) as { data: QuizSessionRow | null };

  if (!session || session.status === "completed") {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  // 유저 프로필
  const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
    data: UserRow | null;
  };

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userTierDifficulty = getTierDifficulty(profile.current_tier as TierName);

  // 문제 정보 가져오기
  const questionIds = answers.map((a) => a.questionId);
  const { data: questions } = (await supabase.from("questions").select("*").in("id", questionIds)) as {
    data: QuestionRow[] | null;
  };

  if (!questions) {
    return NextResponse.json({ error: "Questions not found" }, { status: 404 });
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // 각 답안 처리
  let totalLpChange = 0;
  let correctCount = 0;
  const answerResults = [];

  // 카테고리별 LP 변화 누적
  const categoryLpMap: Record<string, { lpDelta: number; answered: number; correct: number }> = {};

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const isCorrect = question.correct_answer === answer.userAnswer;
    if (isCorrect) correctCount++;

    const hintLevel = answer.hint2Used ? 2 : answer.hint1Used ? 1 : 0;

    const baseLpChange =
      session.session_type === "placement"
        ? 0
        : calculateLpChange({
            isCorrect,
            questionDifficulty: question.difficulty,
            userTierDifficulty,
            currentStreak: profile.current_streak,
            hintLevel: hintLevel as 0 | 1 | 2,
          });

    // 일일 퀴즈는 LP 2배
    const lpChange =
      session.session_type === "daily" ? Math.round(baseLpChange * LP_CONFIG.DAILY_QUIZ_MULTIPLIER) : baseLpChange;

    totalLpChange += lpChange;

    // 카테고리별 LP 누적
    const cat = question.category;
    if (!categoryLpMap[cat]) categoryLpMap[cat] = { lpDelta: 0, answered: 0, correct: 0 };
    categoryLpMap[cat].lpDelta += lpChange;
    categoryLpMap[cat].answered += 1;
    categoryLpMap[cat].correct += isCorrect ? 1 : 0;

    answerResults.push({
      questionId: answer.questionId,
      isCorrect,
      correctAnswer: question.correct_answer,
      lpChange,
      explanation: question.explanation,
      explanationCode: question.explanation_code,
    });

    // answer_history에 기록
    await supabase.from("answer_history").insert({
      user_id: user.id,
      question_id: answer.questionId,
      session_id: sessionId,
      user_answer: answer.userAnswer,
      is_correct: isCorrect,
      hint_1_used: answer.hint1Used,
      hint_2_used: answer.hint2Used,
      lp_change: lpChange,
      time_spent_ms: answer.timeSpentMs,
    });

    // category_stats 업데이트
    const { data: existingStat } = (await supabase
      .from("category_stats")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", question.category)
      .eq("subcategory", question.subcategory)
      .single()) as { data: CategoryStatRow | null };

    if (existingStat) {
      await supabase
        .from("category_stats")
        .update({
          total_answered: existingStat.total_answered + 1,
          total_correct: existingStat.total_correct + (isCorrect ? 1 : 0),
        })
        .eq("id", existingStat.id);
    } else {
      await supabase.from("category_stats").insert({
        user_id: user.id,
        category: question.category,
        subcategory: question.subcategory,
        total_answered: 1,
        total_correct: isCorrect ? 1 : 0,
      });
    }

    // question 통계 업데이트
    await supabase
      .from("questions")
      .update({
        times_served: question.times_served + 1,
        times_correct: question.times_correct + (isCorrect ? 1 : 0),
      })
      .eq("id", question.id);
  }

  // 4/5(80%) 이상 맞춰야 LP 증가 보장 — 스트릭·난이도 보너스로 역전되는 경우 방어
  if (session.session_type !== "placement") {
    const passMark = Math.ceil(answers.length * 0.8);
    if (correctCount < passMark && totalLpChange > 0) {
      const wrongCount = answers.length - correctCount;
      const penalty = wrongCount * LP_CONFIG.BASE_PENALTY;
      totalLpChange =
        session.session_type === "daily" ? -Math.round(penalty * LP_CONFIG.DAILY_QUIZ_MULTIPLIER) : -penalty;
    }
  }

  // 세션 완료 처리
  await supabase
    .from("quiz_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      correct_count: correctCount,
      lp_change: totalLpChange,
    })
    .eq("id", sessionId);

  // LP 및 티어 업데이트 (배치 테스트가 아닌 경우)
  let newTierInfo = getTierInfo(profile.current_lp);
  let tierChanged = false;
  let promoted = false;

  if (session.session_type !== "placement") {
    const result = applyLpChange(
      profile.current_lp,
      profile.current_tier as TierName,
      totalLpChange,
      profile.demotion_shield_until
    );

    // LP 이력 기록
    await supabase.from("lp_history").insert({
      user_id: user.id,
      lp_before: profile.current_lp,
      lp_after: result.newLp,
      lp_change: totalLpChange,
      reason: "daily_quiz",
    });

    // 스트릭 업데이트
    const today = new Date().toISOString().split("T")[0];
    const lastQuizDate = profile.last_quiz_completed_at;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = profile.current_streak;
    if (lastQuizDate === yesterdayStr) {
      newStreak = profile.current_streak + 1;
    } else if (lastQuizDate !== today) {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(profile.longest_streak, newStreak);
    const newHighestLp = Math.max(profile.highest_lp, result.newLp);
    const newHighestTier = result.newLp > profile.highest_lp ? result.newTier : (profile.highest_tier as TierName);

    // 유저 프로필 업데이트
    await supabase
      .from("users")
      .update({
        current_lp: result.newLp,
        current_tier: result.newTier,
        current_tier_division: result.newDivision,
        highest_tier: newHighestTier,
        highest_lp: newHighestLp,
        demotion_shield_until: result.demotionShieldUntil,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_quiz_completed_at: today,
        total_correct: profile.total_correct + correctCount,
        total_answered: profile.total_answered + answers.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // daily_quiz_log 완료 처리 (오늘의 퀴즈만)
    if (session.session_type === "daily") {
      await supabase
        .from("daily_quiz_log")
        .update({ is_completed: true })
        .eq("user_id", user.id)
        .eq("quiz_date", today);
    }

    newTierInfo = getTierInfo(result.newLp);
    tierChanged = result.tierChanged;
    promoted = result.promoted;

    // 카테고리별 LP 업데이트
    for (const [category, { lpDelta, answered, correct }] of Object.entries(categoryLpMap)) {
      const { data: catLp } = await supabase
        .from("category_lp")
        .select("id, lp, total_answered, total_correct")
        .eq("user_id", user.id)
        .eq("category", category)
        .single();

      if (catLp) {
        await supabase
          .from("category_lp")
          .update({
            lp: Math.max(0, catLp.lp + lpDelta),
            total_answered: catLp.total_answered + answered,
            total_correct: catLp.total_correct + correct,
            updated_at: new Date().toISOString(),
          })
          .eq("id", catLp.id);
      } else {
        await supabase.from("category_lp").insert({
          user_id: user.id,
          category,
          lp: Math.max(0, lpDelta),
          total_answered: answered,
          total_correct: correct,
        });
      }
    }
  }

  return NextResponse.json({
    answerResults,
    summary: {
      correctCount,
      totalQuestions: answers.length,
      totalLpChange,
      newTierInfo: {
        name: newTierInfo.name,
        label: newTierInfo.label,
        division: newTierInfo.division,
        divisionLabel: newTierInfo.divisionLabel,
        lp: newTierInfo.lp,
        progressPercent: newTierInfo.progressPercent,
        color: newTierInfo.color,
        bgColor: newTierInfo.bgColor,
      },
      tierChanged,
      promoted,
    },
  });
}
