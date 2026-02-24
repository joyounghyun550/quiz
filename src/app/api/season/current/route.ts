import { NextResponse } from "next/server";

import { getSeasonDaysRemaining } from "@/shared/constants/season.constant";
import type { SeasonRow } from "@/shared/types/database.type";

import type { SeasonInfo } from "@/entities/season/model/types";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: seasonRow } = (await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .order("season_number", { ascending: false })
    .limit(1)
    .single()) as { data: SeasonRow | null };

  if (!seasonRow) {
    return NextResponse.json({ season: null });
  }

  const season: SeasonInfo = {
    id: seasonRow.id,
    name: seasonRow.name,
    seasonNumber: seasonRow.season_number,
    startDate: seasonRow.start_date,
    endDate: seasonRow.end_date,
    daysRemaining: getSeasonDaysRemaining(seasonRow.end_date),
    isActive: seasonRow.is_active,
  };

  return NextResponse.json({ season });
}
