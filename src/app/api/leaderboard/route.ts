import { NextResponse } from "next/server";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 어드민 클라이언트로 RLS 우회하여 전체 유저 조회
  const adminSupabase = createSupabaseAdminClient();
  const { data: users, error } = await adminSupabase
    .from("users")
    .select(
      "id, name, profile_image_url, current_lp, current_tier, current_tier_division, current_streak, total_answered, total_correct"
    )
    .order("current_lp", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: users ?? [], currentUserId: user.id });
}
