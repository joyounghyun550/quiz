import { NextRequest, NextResponse } from "next/server";

import type { CommunityPostRow } from "@/shared/types/database.type";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";

// 게시글 상세 + 답글 조회
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createSupabaseAdminClient();

  // 원글 조회
  const { data: post, error } = (await adminSupabase.from("community_posts").select("*").eq("id", id).single()) as {
    data: CommunityPostRow | null;
    error: unknown;
  };

  if (error || !post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다" }, { status: 404 });
  }

  // 답글 조회
  const { data: replies } = (await adminSupabase
    .from("community_posts")
    .select("*")
    .eq("parent_id", id)
    .order("created_at", { ascending: true })) as { data: CommunityPostRow[] | null };

  // 유저 정보
  const allUserIds = [post.user_id, ...(replies ?? []).map((r) => r.user_id)];
  const uniqueUserIds = Array.from(new Set(allUserIds));

  const { data: users } = await adminSupabase
    .from("users")
    .select("id, name, profile_image_url, current_lp, current_tier")
    .in("id", uniqueUserIds);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  return NextResponse.json({
    post: { ...post, author: userMap.get(post.user_id) ?? null },
    replies: (replies ?? []).map((r) => ({ ...r, author: userMap.get(r.user_id) ?? null })),
    currentUserId: user.id,
  });
}

// 게시글 삭제
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("community_posts").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
