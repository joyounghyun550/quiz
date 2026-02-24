export type SkillNodeStatus = "locked" | "in_progress" | "unlocked";

export type SkillNodeWithProgress = {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  icon: string;
  parentId: string | null;
  requiredCorrect: number;
  sortOrder: number;
  correctCount: number;
  totalAnswered: number;
  status: SkillNodeStatus;
  unlockedAt: string | null;
  progress: number; // 0-100
};
