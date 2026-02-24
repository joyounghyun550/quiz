import { NextResponse } from "next/server";

import type { BattleRow, UserRow } from "@/shared/types/database.type";

import { applyLpChange } from "@/entities/user/lib/lp.util";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const BATTLE_WIN_LP_BONUS = 15;

type SubmitRequest = {
  correct: number;
  timeMs: number;
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body: SubmitRequest = await request.json();
  const { correct, timeMs } = body;

  // 배틀 조회
  const { data: battle } = (await supabase.from("battles").select("*").eq("id", id).single()) as {
    data: BattleRow | null;
  };

  if (!battle) {
    return NextResponse.json({ error: "대결을 찾을 수 없습니다." }, { status: 404 });
  }

  const isHost = user.id === battle.host_id;
  const isGuest = user.id === battle.guest_id;

  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "이 대결의 참가자가 아닙니다." }, { status: 403 });
  }

  // 점수 기반 계산 (정답 수 * 100 + 시간 보너스)
  const score = correct * 100 + Math.max(0, Math.floor((300000 - timeMs) / 1000));

  // 호스트/게스트 점수 업데이트
  const updateData: Record<string, unknown> = {};

  // host_time_ms / guest_time_ms > 0 을 "제출 완료" 판단 기준으로 사용
  if (isHost) {
    if (battle.host_time_ms > 0) {
      return NextResponse.json({ error: "이미 결과를 제출했습니다." }, { status: 400 });
    }
    updateData.host_score = score;
    updateData.host_correct = correct;
    updateData.host_time_ms = timeMs;
  } else {
    if (battle.guest_time_ms > 0) {
      return NextResponse.json({ error: "이미 결과를 제출했습니다." }, { status: 400 });
    }
    updateData.guest_score = score;
    updateData.guest_correct = correct;
    updateData.guest_time_ms = timeMs;
  }

  // 양쪽 모두 제출 완료 확인
  const hostSubmitted = isHost ? true : battle.host_time_ms > 0;
  const guestSubmitted = isGuest ? true : battle.guest_time_ms > 0;
  const bothSubmitted = hostSubmitted && guestSubmitted;

  if (bothSubmitted) {
    // 최종 점수 결정
    const finalHostCorrect = isHost ? correct : battle.host_correct;
    const finalGuestCorrect = isGuest ? correct : battle.guest_correct;
    const finalHostTimeMs = isHost ? timeMs : battle.host_time_ms;
    const finalGuestTimeMs = isGuest ? timeMs : battle.guest_time_ms;
    // 승자 결정: 정답 수가 같으면 시간이 적은 사람이 승리
    let winnerId: string | null = null;
    if (finalHostCorrect > finalGuestCorrect) {
      winnerId = battle.host_id;
    } else if (finalGuestCorrect > finalHostCorrect) {
      winnerId = battle.guest_id;
    } else if (finalHostTimeMs < finalGuestTimeMs) {
      winnerId = battle.host_id;
    } else if (finalGuestTimeMs < finalHostTimeMs) {
      winnerId = battle.guest_id;
    }
    // 동점 + 동시간: 무승부 (winnerId = null)

    updateData.winner_id = winnerId;
    updateData.status = "completed";

    // LP 보너스 지급
    if (winnerId) {
      // 승자 LP 보너스
      const { data: winnerProfile } = (await supabase.from("users").select("*").eq("id", winnerId).single()) as {
        data: UserRow | null;
      };

      if (winnerProfile) {
        const winResult = applyLpChange(
          winnerProfile.current_lp,
          winnerProfile.current_tier as Parameters<typeof applyLpChange>[1],
          BATTLE_WIN_LP_BONUS,
          winnerProfile.demotion_shield_until
        );

        await supabase
          .from("users")
          .update({
            current_lp: winResult.newLp,
            current_tier: winResult.newTier,
            current_tier_division: winResult.newDivision,
            highest_lp: Math.max(winnerProfile.highest_lp, winResult.newLp),
            highest_tier: winResult.newLp > winnerProfile.highest_lp ? winResult.newTier : winnerProfile.highest_tier,
            updated_at: new Date().toISOString(),
          })
          .eq("id", winnerId);

        // LP 이력
        await supabase.from("lp_history").insert({
          user_id: winnerId,
          lp_before: winnerProfile.current_lp,
          lp_after: winResult.newLp,
          lp_change: BATTLE_WIN_LP_BONUS,
          reason: "battle_win",
        });
      }
    }
  }

  // 배틀 업데이트
  const { error: updateError } = await supabase.from("battles").update(updateData).eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "결과 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    submitted: true,
    bothCompleted: bothSubmitted,
    score,
  });
}
