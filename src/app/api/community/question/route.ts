import { NextRequest, NextResponse } from "next/server";

import type { CommunityPostRow } from "@/shared/types/database.type";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";

// 특정 문제에 대한 댓글 조회
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questionId = request.nextUrl.searchParams.get("questionId");
  if (!questionId) {
    return NextResponse.json({ error: "questionId 파라미터가 필요합니다" }, { status: 400 });
  }

  const adminSupabase = createSupabaseAdminClient();

  const { data: comments, error } = (await adminSupabase
    .from("community_posts")
    .select("*")
    .eq("question_id", questionId)
    .eq("type", "comment")
    .is("parent_id", null)
    .order("created_at", { ascending: true })) as { data: CommunityPostRow[] | null; error: unknown };

  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
  }

  // 유저 정보
  const userIds = Array.from(new Set((comments ?? []).map((c) => c.user_id)));
  const { data: users } = await adminSupabase
    .from("users")
    .select("id, name, profile_image_url, current_lp, current_tier")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const result = (comments ?? []).map((c) => ({
    ...c,
    author: userMap.get(c.user_id) ?? null,
  }));

  return NextResponse.json({ comments: result, currentUserId: user.id });
}
