import type { Database, QuestionOption } from "@/shared/types/database.type";

export type Question = Database["public"]["Tables"]["questions"]["Row"];

export type QuizQuestion = Question & {
  selectedAnswer?: string;
  hint1Used?: boolean;
  hint2Used?: boolean;
  timeSpentMs?: number;
};

export type { QuestionOption };
