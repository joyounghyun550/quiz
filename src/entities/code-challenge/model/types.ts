import type { TestCase } from "@/shared/types/database.type";

export type CodeChallengeListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  isSolved: boolean;
  solveRate: number;
};

export type CodeChallengeDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  initialCode: string;
  testCases: TestCase[];
  hints: string[] | null;
  timeLimitMs: number;
};
