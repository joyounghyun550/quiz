"use client";

import { cn } from "@/shared/utils/cn.util";

type StreakDisplayProps = {
  currentStreak: number;
  longestStreak: number;
};

const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <h3 className="text-sm font-semibold text-white">커밋 스트릭</h3>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl",
              currentStreak > 0 ? "bg-orange-500/10" : "bg-gray-800"
            )}
          >
            <span className="text-2xl font-bold text-orange-400">{currentStreak}</span>
          </div>
          <span className="text-[10px] text-gray-500">현재 연속</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
            <span className="text-2xl font-bold text-gray-300">{longestStreak}</span>
          </div>
          <span className="text-[10px] text-gray-500">최장 기록</span>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
