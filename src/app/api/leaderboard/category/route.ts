import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = request.nextUrl.searchParams.get("category");
  if (!category) {
    return NextResponse.json({ error: "category 파라미터가 필요합니다" }, { status: 400 });
  }

  // 어드민으로 RLS 우회하여 해당 카테고리 상위 유저 조회
  const adminSupabase = createSupabaseAdminClient();

  const { data: rows, error } = await adminSupabase
    .from("category_lp")
    .select("user_id, lp, total_answered, total_correct")
    .eq("category", category)
    .order("lp", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ users: [], currentUserId: user.id });
  }

  // 유저 정보 조회
  const userIds = rows.map((r) => r.user_id);
  const { data: userRows } = await adminSupabase
    .from("users")
    .select("id, name, profile_image_url, current_lp, current_tier, current_tier_division, current_streak")
    .in("id", userIds);

  const userMap = new Map((userRows ?? []).map((u) => [u.id, u]));

  const users = rows
    .map((row) => {
      const userInfo = userMap.get(row.user_id);
      if (!userInfo) return null;
      return {
        id: row.user_id,
        name: userInfo.name,
        profile_image_url: userInfo.profile_image_url,
        current_lp: userInfo.current_lp,
        current_tier: userInfo.current_tier,
        current_tier_division: userInfo.current_tier_division,
        current_streak: userInfo.current_streak,
        category_lp: row.lp,
        total_answered: row.total_answered,
        total_correct: row.total_correct,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ users, currentUserId: user.id });
}
