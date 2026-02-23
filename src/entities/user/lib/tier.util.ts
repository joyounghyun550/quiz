import { DIVISION_LABELS, TIER_MAP, TIERS } from "@/shared/constants/tier.constant";
import type { TierName } from "@/shared/types/database.type";

import type { TierInfo } from "@/entities/user/model/types";

export const getTierByLp = (lp: number): TierName => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (lp >= TIERS[i].lpMin) {
      return TIERS[i].name;
    }
  }
  return "inline";
};

export const getDivisionByLp = (lp: number, tierName: TierName): number => {
  const tier = TIER_MAP[tierName];
  const range = tier.lpMax === Infinity ? 400 : tier.lpMax - tier.lpMin + 1;
  const lpInTier = lp - tier.lpMin;
  const divisionSize = range / 4;
  const division = Math.min(4, Math.max(1, 4 - Math.floor(lpInTier / divisionSize)));
  return division;
};

export const getTierInfo = (lp: number): TierInfo => {
  const tierName = getTierByLp(lp);
  const tier = TIER_MAP[tierName];
  const division = getDivisionByLp(lp, tierName);
  const tierIndex = TIERS.findIndex((t) => t.name === tierName);
  const nextTier = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null;

  const lpInTier = lp - tier.lpMin;
  const tierRange = nextTier ? nextTier.lpMin - tier.lpMin : 400;
  const lpToNextTier = nextTier ? nextTier.lpMin - lp : 0;
  const progressPercent = Math.min(100, (lpInTier / tierRange) * 100);

  return {
    name: tierName,
    label: tier.label,
    icon: tier.icon,
    division,
    divisionLabel: DIVISION_LABELS[division - 1],
    lp,
    lpInTier,
    lpToNextTier,
    progressPercent,
    color: tier.color,
    bgColor: tier.bgColor,
  };
};

export const getTierDifficulty = (tierName: TierName): number => {
  return TIER_MAP[tierName].difficulty;
};
