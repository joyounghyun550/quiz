import type { Database, TierName } from "@/shared/types/database.type";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export type TierInfo = {
  name: TierName;
  label: string;
  division: number;
  divisionLabel: string;
  lp: number;
  lpInTier: number;
  lpToNextTier: number;
  progressPercent: number;
  color: string;
  bgColor: string;
};
