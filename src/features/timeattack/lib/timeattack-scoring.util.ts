import { TIMEATTACK_CONFIG } from "@/shared/constants/tier.constant";

export const calculateQuestionScore = ({
  isCorrect,
  timeRemainingMs,
  totalTimeMs,
  comboCount,
}: {
  isCorrect: boolean;
  timeRemainingMs: number;
  totalTimeMs: number;
  comboCount: number;
}): number => {
  if (!isCorrect) return 0;

  const timeRatio = Math.max(0, timeRemainingMs / totalTimeMs);
  const baseScore = TIMEATTACK_CONFIG.BASE_SCORE_PER_QUESTION;
  const timeBonus = Math.round(baseScore * timeRatio * TIMEATTACK_CONFIG.TIME_BONUS_MULTIPLIER);
  const comboBonus = comboCount * TIMEATTACK_CONFIG.COMBO_BONUS;

  return baseScore + timeBonus + comboBonus;
};

export const calculateTotalScore = (questionScores: number[]): number => {
  return questionScores.reduce((sum, s) => sum + s, 0);
};
