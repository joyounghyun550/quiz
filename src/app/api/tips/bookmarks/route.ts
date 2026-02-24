import { NextRequest, NextResponse } from "next/server";

import type { DailyTipRow, TipBookmarkRow } from "@/shared/types/database.type";

import type { DailyTipWithBookmark } from "@/entities/tip/model/types";

import { createSupabaseServerClient } from "@/lib/supabase-server";

// 북마크한 팁 목록 조회
export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 북마크 목록 조회 (tip_bookmarks → daily_tips 조인)
  const { data: bookmarks, error } = (await supabase
    .from("tip_bookmarks")
    .select("*, daily_tips(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as {
    data: (TipBookmarkRow & { daily_tips: DailyTipRow })[] | null;
    error: unknown;
  };

  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
  }

  const tips: DailyTipWithBookmark[] = (bookmarks ?? []).map((b) => ({
    id: b.daily_tips.id,
    category: b.daily_tips.category,
    title: b.daily_tips.title,
    content: b.daily_tips.content,
    codeSnippet: b.daily_tips.code_snippet,
    referenceUrl: b.daily_tips.reference_url,
    tipDate: b.daily_tips.tip_date,
    isBookmarked: true,
  }));

  return NextResponse.json({ tips });
}

// 북마크 토글 (추가/삭제)
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tipId } = body as { tipId: string };

  if (!tipId) {
    return NextResponse.json({ error: "tipId가 필요합니다" }, { status: 400 });
  }

  // 기존 북마크 확인
  const { data: existing } = (await supabase
    .from("tip_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("tip_id", tipId)
    .single()) as { data: Pick<TipBookmarkRow, "id"> | null };

  if (existing) {
    // 이미 있으면 삭제
    const { error: deleteError } = await supabase
      .from("tip_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("tip_id", tipId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ bookmarked: false });
  } else {
    // 없으면 추가
    const { error: insertError } = await supabase.from("tip_bookmarks").insert({ user_id: user.id, tip_id: tipId });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ bookmarked: true });
  }
}
