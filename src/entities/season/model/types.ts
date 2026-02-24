export type SeasonInfo = {
  id: string;
  name: string;
  seasonNumber: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
};

export type SeasonRecord = {
  seasonId: string;
  seasonName: string;
  seasonNumber: number;
  finalLp: number;
  finalTier: string;
  finalRank: number | null;
  totalQuizzes: number;
  totalCorrect: number;
  rewardClaimed: boolean;
};
