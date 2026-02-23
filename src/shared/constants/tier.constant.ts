import type { TierName } from "@/shared/types/database.type";

export type TierConfig = {
  name: TierName;
  label: string;
  icon: string;
  lpMin: number;
  lpMax: number;
  difficulty: number;
  color: string;
  bgColor: string;
};

export const TIERS: TierConfig[] = [
  {
    name: "inline",
    label: "인라인",
    icon: "🧱",
    lpMin: 0,
    lpMax: 99,
    difficulty: 1,
    color: "#9CA3AF",
    bgColor: "#1F2937",
  },
  {
    name: "element",
    label: "엘리먼트",
    icon: "🌱",
    lpMin: 100,
    lpMax: 299,
    difficulty: 2,
    color: "#6EE7B7",
    bgColor: "#064E3B",
  },
  {
    name: "selector",
    label: "셀렉터",
    icon: "🎯",
    lpMin: 300,
    lpMax: 599,
    difficulty: 3,
    color: "#60A5FA",
    bgColor: "#1E3A5F",
  },
  {
    name: "script",
    label: "스크립트",
    icon: "⚡",
    lpMin: 600,
    lpMax: 999,
    difficulty: 4,
    color: "#FBBF24",
    bgColor: "#78350F",
  },
  {
    name: "component",
    label: "컴포넌트",
    icon: "🔷",
    lpMin: 1000,
    lpMax: 1499,
    difficulty: 5,
    color: "#A78BFA",
    bgColor: "#4C1D95",
  },
  {
    name: "hook",
    label: "훅",
    icon: "🎣",
    lpMin: 1500,
    lpMax: 2099,
    difficulty: 6,
    color: "#F472B6",
    bgColor: "#831843",
  },
  {
    name: "architect",
    label: "아키텍트",
    icon: "🏗️",
    lpMin: 2100,
    lpMax: 2799,
    difficulty: 7,
    color: "#FB923C",
    bgColor: "#7C2D12",
  },
  {
    name: "deployer",
    label: "디플로이어",
    icon: "🚀",
    lpMin: 2800,
    lpMax: Infinity,
    difficulty: 8,
    color: "#F43F5E",
    bgColor: "#881337",
  },
];

export const TIER_MAP = Object.fromEntries(TIERS.map((tier) => [tier.name, tier])) as Record<TierName, TierConfig>;

export const LP_CONFIG = {
  BASE_REWARD: 15,
  BASE_PENALTY: 10,
  DAILY_QUIZ_MULTIPLIER: 2,
  DIFFICULTY_MULTIPLIER: {
    BELOW: 0.8,
    SAME: 1.0,
    ABOVE: 1.3,
  },
  STREAK_BONUS_PER_DAY: 0.05,
  STREAK_BONUS_MAX: 1.5,
  HINT_PENALTY: {
    HINT_1: 0.7,
    HINT_2: 0.5,
  },
  DEMOTION_SHIELD_DAYS: 3,
} as const;

export const PLACEMENT_CONFIG = {
  TOTAL_QUESTIONS: 10,
  DIFFICULTY_DISTRIBUTION: { easy: 2, medium: 3, hard: 3, expert: 2 },
  ADAPTIVE_STREAK_THRESHOLD: 3,
  MAX_STARTING_LP: 1499,
} as const;

export const DAILY_QUIZ_CONFIG = {
  QUESTIONS_PER_DAY: 5,
  WEAK_CATEGORY_COUNT: 1,
  STRONG_CATEGORY_COUNT: 1,
  RECENT_HISTORY_DAYS: 30,
} as const;

export const DIVISION_LABELS = ["IV", "III", "II", "I"] as const;
