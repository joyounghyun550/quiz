import { NextRequest, NextResponse } from "next/server";

import type { CommunityPostRow } from "@/shared/types/database.type";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";

// 게시글 목록 조회
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type"); // 'question' | 'discussion' | null (all)
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const adminSupabase = createSupabaseAdminClient();

  let query = adminSupabase
    .from("community_posts")
    .select("*")
    .is("parent_id", null) // 최상위 글만 (답글 제외)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type === "question" || type === "discussion") {
    query = query.eq("type", type);
  } else {
    query = query.in("type", ["question", "discussion"]);
  }

  const { data: posts, error } = (await query) as { data: CommunityPostRow[] | null; error: unknown };

  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
  }

  // 유저 정보 조회
  const userIds = Array.from(new Set((posts ?? []).map((p) => p.user_id)));
  const { data: users } = await adminSupabase
    .from("users")
    .select("id, name, profile_image_url, current_lp, current_tier")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  // 답글 수 조회
  const postIds = (posts ?? []).map((p) => p.id);
  const replyCounts: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: replies } = (await adminSupabase
      .from("community_posts")
      .select("parent_id")
      .in("parent_id", postIds)) as { data: Pick<CommunityPostRow, "parent_id">[] | null };

    for (const r of replies ?? []) {
      if (r.parent_id) {
        replyCounts[r.parent_id] = (replyCounts[r.parent_id] ?? 0) + 1;
      }
    }
  }

  const result = (posts ?? []).map((post) => ({
    ...post,
    author: userMap.get(post.user_id) ?? null,
    replyCount: replyCounts[post.id] ?? 0,
  }));

  return NextResponse.json({ posts: result, currentUserId: user.id });
}

// 게시글/댓글 작성
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, title, content, questionId, parentId } = body as {
    type: "comment" | "question" | "discussion";
    title?: string;
    content: string;
    questionId?: string;
    parentId?: string;
  };

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
  }

  if ((type === "question" || type === "discussion") && !parentId && (!title || title.trim().length === 0)) {
    return NextResponse.json({ error: "제목을 입력해주세요" }, { status: 400 });
  }

  const { data: post, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      type,
      title: title?.trim() ?? null,
      content: content.trim(),
      question_id: questionId ?? null,
      parent_id: parentId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post });
}
