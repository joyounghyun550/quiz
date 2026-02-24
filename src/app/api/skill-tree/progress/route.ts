import { NextResponse } from "next/server";

import type { SkillNodeRow, UserSkillProgressRow } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { category, subcategory, correctCount, totalAnswered } = body as {
    category: string;
    subcategory: string;
    correctCount: number;
    totalAnswered: number;
  };

  if (!category || !subcategory || correctCount == null || totalAnswered == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 해당 카테고리/서브카테고리에 해당하는 스킬 노드 조회
  const { data: matchingNodes } = (await supabase
    .from("skill_nodes")
    .select("*")
    .eq("category", category)
    .eq("subcategory", subcategory)) as { data: SkillNodeRow[] | null };

  if (!matchingNodes || matchingNodes.length === 0) {
    return NextResponse.json({ updated: true, newlyUnlocked: [] });
  }

  const newlyUnlocked: string[] = [];

  for (const node of matchingNodes) {
    // 기존 진행도 조회
    const { data: existing } = (await supabase
      .from("user_skill_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("node_id", node.id)
      .single()) as { data: UserSkillProgressRow | null };

    const newCorrectCount = (existing?.correct_count ?? 0) + correctCount;
    const newTotalAnswered = (existing?.total_answered ?? 0) + totalAnswered;
    const wasUnlocked = existing?.is_unlocked ?? false;
    const isNowUnlocked = newCorrectCount >= node.required_correct;

    if (existing) {
      // 업데이트
      await supabase
        .from("user_skill_progress")
        .update({
          correct_count: newCorrectCount,
          total_answered: newTotalAnswered,
          is_unlocked: isNowUnlocked || wasUnlocked,
          unlocked_at: isNowUnlocked && !wasUnlocked ? new Date().toISOString() : existing.unlocked_at,
        })
        .eq("id", existing.id);
    } else {
      // 새로 삽입
      await supabase.from("user_skill_progress").insert({
        user_id: user.id,
        node_id: node.id,
        correct_count: newCorrectCount,
        total_answered: newTotalAnswered,
        is_unlocked: isNowUnlocked,
        unlocked_at: isNowUnlocked ? new Date().toISOString() : null,
      });
    }

    if (isNowUnlocked && !wasUnlocked) {
      newlyUnlocked.push(node.name);
    }
  }

  return NextResponse.json({ updated: true, newlyUnlocked });
}
