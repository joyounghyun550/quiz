import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type ChallengeRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  times_served: number;
  times_solved: number;
};

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 챌린지 목록
  const { data: challenges } = (await supabase
    .from("code_challenges")
    .select("id, title, description, category, difficulty, times_served, times_solved")
    .eq("is_active", true)
    .order("difficulty", { ascending: true })) as { data: ChallengeRow[] | null };

  // 유저가 풀었는지 확인
  const { data: submissions } = await supabase
    .from("code_challenge_submissions")
    .select("challenge_id, is_solved")
    .eq("user_id", user.id)
    .eq("is_solved", true);

  const solvedSet = new Set((submissions ?? []).map((s) => s.challenge_id));

  const result = (challenges ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    difficulty: c.difficulty,
    isSolved: solvedSet.has(c.id),
    solveRate: c.times_served > 0 ? Math.round((c.times_solved / c.times_served) * 100) : 0,
  }));

  return NextResponse.json({ challenges: result });
}
