import { NextResponse } from "next/server";

import type { SkillNodeRow, UserSkillProgressRow } from "@/shared/types/database.type";

import type { SkillNodeStatus, SkillNodeWithProgress } from "@/entities/skill/model/types";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 전체 스킬 노드 조회
  const { data: skillNodes } = (await supabase
    .from("skill_nodes")
    .select("*")
    .order("sort_order", { ascending: true })) as { data: SkillNodeRow[] | null };

  // 유저 스킬 진행도 조회
  const { data: userProgress } = (await supabase.from("user_skill_progress").select("*").eq("user_id", user.id)) as {
    data: UserSkillProgressRow[] | null;
  };

  const progressMap = new Map((userProgress ?? []).map((p) => [p.node_id, p]));

  // 해금된 노드 id 셋
  const unlockedNodeIds = new Set((userProgress ?? []).filter((p) => p.is_unlocked).map((p) => p.node_id));

  // 각 노드의 상태 계산
  const nodes: SkillNodeWithProgress[] = (skillNodes ?? []).map((node) => {
    const progress = progressMap.get(node.id);
    const correctCount = progress?.correct_count ?? 0;
    const totalAnswered = progress?.total_answered ?? 0;
    const isUnlocked = progress?.is_unlocked ?? false;

    // 상태 결정
    let status: SkillNodeStatus;

    if (isUnlocked) {
      status = "unlocked";
    } else if (node.parent_id && !unlockedNodeIds.has(node.parent_id)) {
      // 부모가 있고, 부모가 아직 해금되지 않은 경우 -> 잠김
      status = "locked";
    } else if (totalAnswered > 0) {
      // 부모가 없거나 부모가 해금됨 + 답변 기록이 있음 -> 진행 중
      status = "in_progress";
    } else if (!node.parent_id) {
      // 부모가 없는 루트 노드이고 답변 기록이 없음 -> 진행 중 (바로 시작 가능)
      status = "in_progress";
    } else {
      // 부모가 해금됨 + 답변 기록 없음 -> 진행 중 (시작 가능)
      status = "in_progress";
    }

    const progressPercent =
      node.required_correct > 0 ? Math.min(Math.round((correctCount / node.required_correct) * 100), 100) : 0;

    return {
      id: node.id,
      category: node.category,
      subcategory: node.subcategory,
      name: node.name,
      description: node.description,
      icon: node.icon,
      parentId: node.parent_id,
      requiredCorrect: node.required_correct,
      sortOrder: node.sort_order,
      correctCount,
      totalAnswered,
      status,
      unlockedAt: progress?.unlocked_at ?? null,
      progress: progressPercent,
    };
  });

  return NextResponse.json({ nodes });
}
