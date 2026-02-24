import { NextResponse } from "next/server";

import type { QuestionRow, UserRow } from "@/shared/types/database.type";

import { getTierDifficulty } from "@/entities/user/lib/tier.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const DUMMY_UUID = "00000000-0000-0000-0000-000000000000";
const BATTLE_QUESTION_COUNT = 5;
const BATTLE_EXPIRY_HOURS = 24;

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export async function POST() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 유저 프로필 조회
  const { data: profile } = (await supabase.from("users").select("*").eq("id", user.id).single()) as {
    data: UserRow | null;
  };

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 티어 기반 난이도
  const tierDifficulty = getTierDifficulty(profile.current_tier as Parameters<typeof getTierDifficulty>[0]);
  const minDiff = Math.max(1, tierDifficulty - 2);
  const maxDiff = Math.min(8, tierDifficulty + 2);

  // 랜덤 문제 선택
  const { data: candidateQuestions } = (await supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .not("id", "in", `(${DUMMY_UUID})`)
    .limit(BATTLE_QUESTION_COUNT * 3)) as { data: QuestionRow[] | null };

  if (!candidateQuestions || candidateQuestions.length < BATTLE_QUESTION_COUNT) {
    // 폴백: 난이도 무시
    const { data: fallbackQuestions } = (await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .limit(BATTLE_QUESTION_COUNT * 3)) as { data: QuestionRow[] | null };

    if (!fallbackQuestions || fallbackQuestions.length < BATTLE_QUESTION_COUNT) {
      return NextResponse.json({ error: "문제가 부족합니다." }, { status: 500 });
    }

    candidateQuestions?.push(...fallbackQuestions);
  }

  // 셔플 후 5문제 선택
  const shuffled = (candidateQuestions ?? []).sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, BATTLE_QUESTION_COUNT);

  // 초대 코드 생성 (중복 체크)
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("battles")
      .select("id")
      .eq("invite_code", inviteCode)
      .eq("status", "waiting")
      .single();

    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  // 만료 시간 설정
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + BATTLE_EXPIRY_HOURS);

  // 배틀 생성
  const { data: battle, error: battleError } = await supabase
    .from("battles")
    .insert({
      invite_code: inviteCode,
      host_id: user.id,
      status: "waiting",
      question_count: BATTLE_QUESTION_COUNT,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, invite_code")
    .single();

  if (battleError || !battle) {
    return NextResponse.json({ error: "대결을 만들 수 없습니다." }, { status: 500 });
  }

  // 배틀 문제 연결
  const battleQuestions = selectedQuestions.map((q, index) => ({
    battle_id: battle.id,
    question_id: q.id,
    question_order: index + 1,
  }));

  const { error: questionsError } = await supabase.from("battle_questions").insert(battleQuestions);

  if (questionsError) {
    // 롤백: 배틀 삭제
    await supabase.from("battles").delete().eq("id", battle.id);
    return NextResponse.json({ error: "문제 설정에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    battle: {
      id: battle.id,
      inviteCode: battle.invite_code,
    },
  });
}
