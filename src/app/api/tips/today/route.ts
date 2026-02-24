import { NextResponse } from "next/server";

import type { DailyTipRow, TipBookmarkRow } from "@/shared/types/database.type";

import type { DailyTipWithBookmark } from "@/entities/tip/model/types";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // KST 기준 오늘 날짜
  const today = new Date().toISOString().split("T")[0];

  // 오늘의 팁 조회
  const { data: tipData, error: tipError } = (await supabase
    .from("daily_tips")
    .select("*")
    .eq("tip_date", today)
    .eq("is_active", true)
    .single()) as { data: DailyTipRow | null; error: unknown };

  if (tipError || !tipData) {
    return NextResponse.json({ tip: null });
  }

  // 북마크 여부 확인
  const { data: bookmarkData } = (await supabase
    .from("tip_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("tip_id", tipData.id)
    .single()) as { data: Pick<TipBookmarkRow, "id"> | null };

  const tip: DailyTipWithBookmark = {
    id: tipData.id,
    category: tipData.category,
    title: tipData.title,
    content: tipData.content,
    codeSnippet: tipData.code_snippet,
    referenceUrl: tipData.reference_url,
    tipDate: tipData.tip_date,
    isBookmarked: !!bookmarkData,
  };

  return NextResponse.json({ tip });
}
