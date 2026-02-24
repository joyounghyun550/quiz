export type AchievementCategory = "streak" | "accuracy" | "tier" | "quiz_count" | "speed" | "special";

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { label: string; color: string; bgColor: string }> = {
  streak: { label: "스트릭", color: "#F97316", bgColor: "#F9731618" },
  accuracy: { label: "정답률", color: "#3B82F6", bgColor: "#3B82F618" },
  tier: { label: "티어", color: "#A855F7", bgColor: "#A855F718" },
  quiz_count: { label: "문제 수", color: "#10B981", bgColor: "#10B98118" },
  speed: { label: "속도", color: "#EF4444", bgColor: "#EF444418" },
  special: { label: "특별", color: "#F59E0B", bgColor: "#F59E0B18" },
};
