export const API_ENDPOINTS = {
  AUTH: {
    CALLBACK: "/api/auth/callback",
  },
  QUIZ: {
    DAILY: "/api/quiz/daily",
    PLACEMENT: "/api/quiz/placement",
    SUBMIT: "/api/quiz/submit",
  },
  USER: {
    PROFILE: "/api/user/profile",
    STATS: "/api/user/stats",
  },
} as const;
