import type { AchievementRow } from "@/shared/types/database.type";

export type AchievementWithStatus = AchievementRow & {
  earned: boolean;
  earnedAt: string | null;
};
