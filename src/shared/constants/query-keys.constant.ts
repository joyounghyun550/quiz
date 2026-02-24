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
  TIMEATTACK: {
    LEADERBOARD: ["timeattack", "leaderboard"] as const,
  },
  ACHIEVEMENTS: {
    ALL: ["achievements", "all"] as const,
    CHECK: ["achievements", "check"] as const,
  },
  WEEKLY: {
    CURRENT: ["weekly", "current"] as const,
    LEADERBOARD: ["weekly", "leaderboard"] as const,
  },
} as const;
