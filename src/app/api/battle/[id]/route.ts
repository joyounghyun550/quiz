import { NextResponse } from "next/server";

import type { BattleRow, QuestionRow, UserRow } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // 배틀 조회
  const { data: battle } = (await supabase.from("battles").select("*").eq("id", id).single()) as {
    data: BattleRow | null;
  };

  if (!battle) {
    return NextResponse.json({ error: "대결을 찾을 수 없습니다." }, { status: 404 });
  }

  // 호스트 정보
  const { data: hostProfile } = (await supabase
    .from("users")
    .select("name, profile_image_url")
    .eq("id", battle.host_id)
    .single()) as { data: Pick<UserRow, "name" | "profile_image_url"> | null };

  // 게스트 정보
  let guestProfile: Pick<UserRow, "name" | "profile_image_url"> | null = null;
  if (battle.guest_id) {
    const { data: gp } = (await supabase
      .from("users")
      .select("name, profile_image_url")
      .eq("id", battle.guest_id)
      .single()) as { data: Pick<UserRow, "name" | "profile_image_url"> | null };
    guestProfile = gp;
  }

  const battleInfo = {
    id: battle.id,
    inviteCode: battle.invite_code,
    status: battle.status,
    hostId: battle.host_id,
    hostName: hostProfile?.name ?? "Unknown",
    hostProfileImage: hostProfile?.profile_image_url ?? null,
    guestId: battle.guest_id,
    guestName: guestProfile?.name ?? null,
    guestProfileImage: guestProfile?.profile_image_url ?? null,
    questionCount: battle.question_count,
    category: battle.category,
    createdAt: battle.created_at,
    expiresAt: battle.expires_at,
    hostScore: battle.host_score,
    hostCorrect: battle.host_correct,
    hostTimeMs: battle.host_time_ms,
    guestScore: battle.guest_score,
    guestCorrect: battle.guest_correct,
    guestTimeMs: battle.guest_time_ms,
    winnerId: battle.winner_id,
  };

  // 호스트 또는 게스트인 경우에만 문제 포함
  let questions: QuestionRow[] = [];
  if (user.id === battle.host_id || user.id === battle.guest_id) {
    const { data: battleQuestions } = await supabase
      .from("battle_questions")
      .select("question_id, question_order")
      .eq("battle_id", battle.id)
      .order("question_order", { ascending: true });

    if (battleQuestions && battleQuestions.length > 0) {
      const questionIds = battleQuestions.map((bq) => bq.question_id);

      const { data: qs } = (await supabase.from("questions").select("*").in("id", questionIds)) as {
        data: QuestionRow[] | null;
      };

      // 순서대로 정렬
      questions = battleQuestions
        .sort((a, b) => a.question_order - b.question_order)
        .map((bq) => (qs ?? []).find((q) => q.id === bq.question_id))
        .filter((q): q is QuestionRow => q !== undefined);
    }
  }

  return NextResponse.json({
    battle: battleInfo,
    questions,
    isHost: user.id === battle.host_id,
  });
}
