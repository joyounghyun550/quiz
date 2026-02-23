import { PLACEMENT_CONFIG } from "@/shared/constants/tier.constant";

import { calculatePlacementLp } from "@/entities/user/lib/lp.util";
import { getTierInfo } from "@/entities/user/lib/tier.util";

type PlacementResult = {
  questionId: string;
  correct: boolean;
  difficulty: number;
};

export const calculatePlacementResult = (results: PlacementResult[]) => {
  const lp = calculatePlacementLp(results.map((r) => ({ correct: r.correct, difficulty: r.difficulty })));
  const tierInfo = getTierInfo(lp);
  const correctCount = results.filter((r) => r.correct).length;
  const totalQuestions = results.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return {
    lp,
    tierInfo,
    correctCount,
    totalQuestions,
    accuracy,
  };
};

export const getAdaptiveDifficulty = (
  currentDifficulty: number,
  consecutiveCorrect: number
): number => {
  if (consecutiveCorrect >= PLACEMENT_CONFIG.ADAPTIVE_STREAK_THRESHOLD) {
    return Math.min(8, currentDifficulty + 1);
  }
  return currentDifficulty;
};

export const generatePlacementDifficulties = (): number[] => {
  const { DIFFICULTY_DISTRIBUTION } = PLACEMENT_CONFIG;
  const difficulties: number[] = [];

  // easy: difficulty 1-2
  for (let i = 0; i < DIFFICULTY_DISTRIBUTION.easy; i++) {
    difficulties.push(i % 2 === 0 ? 1 : 2);
  }
  // medium: difficulty 3-4
  for (let i = 0; i < DIFFICULTY_DISTRIBUTION.medium; i++) {
    difficulties.push(i % 2 === 0 ? 3 : 4);
  }
  // hard: difficulty 5-6
  for (let i = 0; i < DIFFICULTY_DISTRIBUTION.hard; i++) {
    difficulties.push(i % 2 === 0 ? 5 : 6);
  }
  // expert: difficulty 7-8
  for (let i = 0; i < DIFFICULTY_DISTRIBUTION.expert; i++) {
    difficulties.push(i % 2 === 0 ? 7 : 8);
  }

  return difficulties;
};
