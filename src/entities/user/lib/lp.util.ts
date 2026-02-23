import { LP_CONFIG, TIER_MAP, TIERS } from "@/shared/constants/tier.constant";
import type { TierName } from "@/shared/types/database.type";

import { getDivisionByLp, getTierByLp } from "@/entities/user/lib/tier.util";

type LpCalculationParams = {
  isCorrect: boolean;
  questionDifficulty: number;
  userTierDifficulty: number;
  currentStreak: number;
  hintLevel: 0 | 1 | 2;
};

export const calculateLpChange = ({
  isCorrect,
  questionDifficulty,
  userTierDifficulty,
  currentStreak,
  hintLevel,
}: LpCalculationParams): number => {
  const difficultyDiff = questionDifficulty - userTierDifficulty;
  const difficultyMultiplier =
    difficultyDiff < 0
      ? LP_CONFIG.DIFFICULTY_MULTIPLIER.BELOW
      : difficultyDiff > 0
        ? LP_CONFIG.DIFFICULTY_MULTIPLIER.ABOVE
        : LP_CONFIG.DIFFICULTY_MULTIPLIER.SAME;

  if (!isCorrect) {
    return -Math.round(LP_CONFIG.BASE_PENALTY * difficultyMultiplier);
  }

  const streakBonus = Math.min(LP_CONFIG.STREAK_BONUS_MAX, 1 + currentStreak * LP_CONFIG.STREAK_BONUS_PER_DAY);

  const hintPenalty =
    hintLevel === 2
      ? LP_CONFIG.HINT_PENALTY.HINT_2
      : hintLevel === 1
        ? LP_CONFIG.HINT_PENALTY.HINT_1
        : 1;

  return Math.round(LP_CONFIG.BASE_REWARD * difficultyMultiplier * streakBonus * hintPenalty);
};

type LpUpdateResult = {
  newLp: number;
  newTier: TierName;
  newDivision: number;
  tierChanged: boolean;
  promoted: boolean;
  demotionShieldUntil: string | null;
};

export const applyLpChange = (
  currentLp: number,
  currentTier: TierName,
  lpChange: number,
  existingShield: string | null
): LpUpdateResult => {
  const newLp = Math.max(0, currentLp + lpChange);
  const newTier = getTierByLp(newLp);
  const newDivision = getDivisionByLp(newLp, newTier);

  const currentTierIndex = TIERS.findIndex((t) => t.name === currentTier);
  const newTierIndex = TIERS.findIndex((t) => t.name === newTier);
  const tierChanged = currentTier !== newTier;
  const promoted = newTierIndex > currentTierIndex;

  // 강등 보호: 신규 티어 진입 시 3일간 실드
  let demotionShieldUntil = existingShield;
  if (promoted) {
    const shieldDate = new Date();
    shieldDate.setDate(shieldDate.getDate() + LP_CONFIG.DEMOTION_SHIELD_DAYS);
    demotionShieldUntil = shieldDate.toISOString();
  }

  // 강등 보호 기간 중이면 티어 유지
  if (tierChanged && !promoted && existingShield) {
    const shieldExpiry = new Date(existingShield);
    if (new Date() < shieldExpiry) {
      return {
        newLp,
        newTier: currentTier,
        newDivision: getDivisionByLp(newLp, currentTier),
        tierChanged: false,
        promoted: false,
        demotionShieldUntil: existingShield,
      };
    }
  }

  return {
    newLp,
    newTier,
    newDivision,
    tierChanged,
    promoted,
    demotionShieldUntil: promoted ? demotionShieldUntil : existingShield,
  };
};

export const calculatePlacementLp = (results: { correct: boolean; difficulty: number }[]): number => {
  const weights: Record<number, number> = { 1: 20, 2: 20, 3: 30, 4: 30, 5: 40, 6: 40, 7: 50, 8: 50 };

  const totalLp = results.reduce((sum, { correct, difficulty }) => {
    if (!correct) return sum;
    return sum + (weights[difficulty] ?? 30);
  }, 0);

  return Math.min(totalLp, TIER_MAP.component.lpMax);
};
