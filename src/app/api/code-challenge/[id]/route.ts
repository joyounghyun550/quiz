import { NextRequest, NextResponse } from "next/server";

import type { TestCase } from "@/shared/types/database.type";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type ChallengeDetailRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  initial_code: string;
  test_cases: TestCase[];
  hints: string[] | null;
  time_limit_ms: number;
  times_served: number;
};

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: challenge } = (await supabase
    .from("code_challenges")
    .select(
      "id, title, description, category, difficulty, initial_code, test_cases, hints, time_limit_ms, times_served"
    )
    .eq("id", params.id)
    .eq("is_active", true)
    .single()) as { data: ChallengeDetailRow | null };

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // served 카운트 업데이트
  await supabase
    .from("code_challenges")
    .update({ times_served: challenge.times_served + 1 })
    .eq("id", challenge.id);

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      difficulty: challenge.difficulty,
      initialCode: challenge.initial_code,
      testCases: challenge.test_cases,
      hints: challenge.hints,
      timeLimitMs: challenge.time_limit_ms,
    },
  });
}
