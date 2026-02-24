"use client";

import type { AchievementWithStatus } from "@/entities/achievement/model/types";

type AchievementBadgeProps = {
  achievement: AchievementWithStatus;
  size?: "sm" | "md";
  onClick?: () => void;
};

const AchievementBadge = ({ achievement, size = "md", onClick }: AchievementBadgeProps) => {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
        achievement.earned
          ? "border-gray-700 bg-gray-900/50 hover:border-gray-600"
          : "border-gray-800/50 bg-gray-900/20 opacity-40 grayscale"
      } ${isSm ? "min-w-[60px]" : "min-w-[80px]"}`}
    >
      <span className={isSm ? "text-xl" : "text-3xl"}>{achievement.icon}</span>
      <span
        className={`text-center font-medium leading-tight ${isSm ? "text-[10px]" : "text-xs"} ${achievement.earned ? "text-gray-300" : "text-gray-600"}`}
      >
        {achievement.title}
      </span>
      {!achievement.earned && (
        <svg
          className={`text-gray-600 ${isSm ? "h-3 w-3" : "h-4 w-4"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )}
    </button>
  );
};

export default AchievementBadge;
