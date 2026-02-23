"use client";

import { cn } from "@/shared/utils/cn.util";

type CategoryStat = {
  category: string;
  label: string;
  totalAnswered: number;
  totalCorrect: number;
};

type CategoryBreakdownProps = {
  stats: CategoryStat[];
};

const CategoryBreakdown = ({ stats }: CategoryBreakdownProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <h3 className="text-sm font-semibold text-white">카테고리별 정확도</h3>
      <div className="flex flex-col gap-3">
        {stats.map((stat) => {
          const accuracy = stat.totalAnswered > 0 ? Math.round((stat.totalCorrect / stat.totalAnswered) * 100) : 0;
          const barWidth = accuracy;

          return (
            <div key={stat.category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{stat.label}</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    accuracy >= 80 ? "text-emerald-400" : accuracy >= 50 ? "text-amber-400" : "text-red-400"
                  )}
                >
                  {stat.totalAnswered > 0 ? `${accuracy}%` : "-"}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    accuracy >= 80 ? "bg-emerald-500" : accuracy >= 50 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
