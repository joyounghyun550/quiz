"use client";

import { ACHIEVEMENT_CATEGORIES, type AchievementCategory } from "@/shared/constants/achievement.constant";

import type { AchievementWithStatus } from "@/entities/achievement/model/types";
import AchievementBadge from "@/entities/achievement/ui/AchievementBadge";

type AchievementGridProps = {
  achievements: AchievementWithStatus[];
  onSelect?: (achievement: AchievementWithStatus) => void;
};

const AchievementGrid = ({ achievements, onSelect }: AchievementGridProps) => {
  const categories = Object.entries(ACHIEVEMENT_CATEGORIES) as [
    AchievementCategory,
    (typeof ACHIEVEMENT_CATEGORIES)[AchievementCategory],
  ][];
  const grouped = categories
    .map(([key, meta]) => ({
      key,
      ...meta,
      items: achievements.filter((a) => a.category === key),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {grouped.map((group) => (
        <div key={group.key}>
          <div className="mb-3 flex items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{ color: group.color, backgroundColor: group.bgColor }}
            >
              {group.label}
            </span>
            <span className="text-xs text-gray-500">
              {group.items.filter((a) => a.earned).length}/{group.items.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {group.items.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                onClick={() => onSelect?.(achievement)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementGrid;
