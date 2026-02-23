export const QUERY_KEYS = {
  USER: {
    PROFILE: ["user", "profile"] as const,
    STATS: ["user", "stats"] as const,
    LP_HISTORY: ["user", "lp-history"] as const,
    STREAK: ["user", "streak"] as const,
  },
  QUIZ: {
    DAILY: ["quiz", "daily"] as const,
    PLACEMENT: ["quiz", "placement"] as const,
  },
} as const;