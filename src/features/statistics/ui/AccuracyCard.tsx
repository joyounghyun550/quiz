"use client";

import { cn } from "@/shared/utils/cn.util";

type AccuracyCardProps = {
  totalAnswered: number;
  totalCorrect: number;
};

const AccuracyCard = ({ totalAnswered, totalCorrect }: AccuracyCardProps) => {
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const accentColor = accuracy >= 80 ? "text-emerald-400" : accuracy >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <h3 className="text-sm font-semibold text-white">전체 정답률</h3>
      <div className="flex items-end gap-2">
        <span className={cn("text-4xl font-bold", accentColor)}>{accuracy}%</span>
        <span className="mb-1 text-sm text-gray-500">
          ({totalCorrect}/{totalAnswered})
        </span>
      </div>
    </div>
  );
};

export default AccuracyCard;
