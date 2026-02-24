import { NextResponse } from "next/server";

import type { BattleRow, QuestionRow, UserRow } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type JoinRequest = {
  inviteCode: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: JoinRequest = await request.json();
  const { inviteCode } = body;

  if (!inviteCode || inviteCode.length !== 6) {
    return NextResponse.json({ error: "유효하지 않은 초대 코드입니다." }, { status: 400 });
  }

  // 배틀 조회
  const { data: battle } = (await supabase
    .from("battles")
    .select("*")
    .eq("invite_code", inviteCode.toUpperCase())
    .eq("status", "waiting")
    .single()) as { data: BattleRow | null };

  if (!battle) {
    return NextResponse.json({ error: "대결을 찾을 수 없습니다. 코드를 확인해주세요." }, { status: 404 });
  }

  // 만료 확인
  if (new Date(battle.expires_at) < new Date()) {
    await supabase.from("battles").update({ status: "expired" }).eq("id", battle.id);
    return NextResponse.json({ error: "만료된 대결입니다." }, { status: 400 });
  }

  // 이미 참가한 게스트 확인
  if (battle.guest_id) {
    return NextResponse.json({ error: "이미 다른 사람이 참가한 대결입니다." }, { status: 400 });
  }

  // 자기 자신과 대결 불가
  if (battle.host_id === user.id) {
    return NextResponse.json({ error: "자신이 만든 대결에는 참가할 수 없습니다." }, { status: 400 });
  }

  // 게스트 참가 및 상태 업데이트
  const { error: updateError } = await supabase
    .from("battles")
    .update({
      guest_id: user.id,
      status: "both_playing",
    })
    .eq("id", battle.id);

  if (updateError) {
    return NextResponse.json({ error: "참가에 실패했습니다." }, { status: 500 });
  }

  // 배틀 문제 조회
  const { data: battleQuestions } = await supabase
    .from("battle_questions")
    .select("question_id, question_order")
    .eq("battle_id", battle.id)
    .order("question_order", { ascending: true });

  const questionIds = (battleQuestions ?? []).map((bq) => bq.question_id);

  const { data: questions } = (await supabase.from("questions").select("*").in("id", questionIds)) as {
    data: QuestionRow[] | null;
  };

  // 문제 순서 정렬
  const orderedQuestions = (battleQuestions ?? [])
    .sort((a, b) => a.question_order - b.question_order)
    .map((bq) => (questions ?? []).find((q) => q.id === bq.question_id))
    .filter(Boolean);

  // 호스트/게스트 정보
  const { data: hostProfile } = (await supabase
    .from("users")
    .select("name, profile_image_url")
    .eq("id", battle.host_id)
    .single()) as { data: Pick<UserRow, "name" | "profile_image_url"> | null };

  const { data: guestProfile } = (await supabase
    .from("users")
    .select("name, profile_image_url")
    .eq("id", user.id)
    .single()) as { data: Pick<UserRow, "name" | "profile_image_url"> | null };

  return NextResponse.json({
    battle: {
      id: battle.id,
      inviteCode: battle.invite_code,
      status: "both_playing",
      hostId: battle.host_id,
      hostName: hostProfile?.name ?? "Unknown",
      hostProfileImage: hostProfile?.profile_image_url ?? null,
      guestId: user.id,
      guestName: guestProfile?.name ?? "Unknown",
      guestProfileImage: guestProfile?.profile_image_url ?? null,
      questionCount: battle.question_count,
      category: battle.category,
      createdAt: battle.created_at,
      expiresAt: battle.expires_at,
    },
    questions: orderedQuestions,
  });
}
