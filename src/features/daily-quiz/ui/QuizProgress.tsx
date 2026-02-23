"use client";

import { cn } from "@/shared/utils/cn.util";

type QuizProgressProps = {
  current: number;
  total: number;
  answers: (boolean | null)[];
};

const QuizProgress = ({ current, total, answers }: QuizProgressProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const answer = answers[i];
        const isCurrent = i === current;

        return (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              isCurrent && "ring-1 ring-cyan-400 ring-offset-1 ring-offset-gray-950",
              answer === true && "bg-emerald-500",
              answer === false && "bg-red-500",
              answer === null && i < current && "bg-gray-600",
              answer === null && i >= current && "bg-gray-800"
            )}
          />
        );
      })}
    </div>
  );
};

export default QuizProgress;
