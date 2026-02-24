export const SEASON_CONFIG = {
  DURATION_MONTHS: 3,
  SOFT_RESET_RATIO: 0.6, // LP를 현재값의 60%로 리셋
  SEASON_QUARTERS: [
    { start: { month: 1, day: 1 }, end: { month: 3, day: 31 } },
    { start: { month: 4, day: 1 }, end: { month: 6, day: 30 } },
    { start: { month: 7, day: 1 }, end: { month: 9, day: 30 } },
    { start: { month: 10, day: 1 }, end: { month: 12, day: 31 } },
  ],
} as const;

export const getSeasonName = (number: number) => `시즌 ${number}`;

export const getSeasonDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
