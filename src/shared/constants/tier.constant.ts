import type { TierName } from "@/shared/types/database.type";

export type TierConfig = {
  name: TierName;
  label: string;
  icon: string;
  description: string;
  lpMin: number;
  lpMax: number;
  difficulty: number;
  color: string;
  bgColor: string;
  glowColor: string;
};

export const TIERS: TierConfig[] = [
  {
    name: "inline",
    label: "코드 원시인",
    icon: "🪨",
    description: "HTML도 모르던 그 시절",
    lpMin: 0,
    lpMax: 99,
    difficulty: 1,
    color: "#9CA3AF",
    bgColor: "#1F2937",
    glowColor: "rgba(156,163,175,0.2)",
  },
  {
    name: "element",
    label: "태그 탐험가",
    icon: "🗺️",
    description: "DOM을 정복하는 여정",
    lpMin: 100,
    lpMax: 299,
    difficulty: 2,
    color: "#6EE7B7",
    bgColor: "#064E3B",
    glowColor: "rgba(110,231,183,0.2)",
  },
  {
    name: "selector",
    label: "CSS 전사",
    icon: "⚔️",
    description: "스타일 전쟁의 용사",
    lpMin: 300,
    lpMax: 599,
    difficulty: 3,
    color: "#60A5FA",
    bgColor: "#1E3A5F",
    glowColor: "rgba(96,165,250,0.2)",
  },
  {
    name: "script",
    label: "JS 마법사",
    icon: "🪄",
    description: "비동기의 신비를 다루는 자",
    lpMin: 600,
    lpMax: 999,
    difficulty: 4,
    color: "#FBBF24",
    bgColor: "#78350F",
    glowColor: "rgba(251,191,36,0.25)",
  },
  {
    name: "component",
    label: "리액트 영웅",
    icon: "🦸",
    description: "컴포넌트 제국의 건설자",
    lpMin: 1000,
    lpMax: 1499,
    difficulty: 5,
    color: "#A78BFA",
    bgColor: "#4C1D95",
    glowColor: "rgba(167,139,250,0.25)",
  },
  {
    name: "hook",
    label: "훅 연금술사",
    icon: "🔮",
    description: "상태와 효과를 마음대로",
    lpMin: 1500,
    lpMax: 2099,
    difficulty: 6,
    color: "#F472B6",
    bgColor: "#831843",
    glowColor: "rgba(244,114,182,0.25)",
  },
  {
    name: "architect",
    label: "시스템 현자",
    icon: "🧙",
    description: "아키텍처를 설계하는 성인",
    lpMin: 2100,
    lpMax: 2799,
    difficulty: 7,
    color: "#FB923C",
    bgColor: "#7C2D12",
    glowColor: "rgba(251,146,60,0.25)",
  },
  {
    name: "deployer",
    label: "배포 신",
    icon: "👑",
    description: "프로덕션을 지배하는 신화",
    lpMin: 2800,
    lpMax: Infinity,
    difficulty: 8,
    color: "#F43F5E",
    bgColor: "#881337",
    glowColor: "rgba(244,63,94,0.3)",
  },
];

export const TIER_MAP = Object.fromEntries(TIERS.map((tier) => [tier.name, tier])) as Record<TierName, TierConfig>;

export const LP_CONFIG = {
  BASE_REWARD: 10,
  BASE_PENALTY: 16,
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
