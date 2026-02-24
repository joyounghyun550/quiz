"use client";

import { ACHIEVEMENT_CATEGORIES, type AchievementCategory } from "@/shared/constants/achievement.constant";

import type { AchievementWithStatus } from "@/entities/achievement/model/types";

type AchievementModalProps = {
  achievement: AchievementWithStatus;
  onClose: () => void;
};

const AchievementModal = ({ achievement, onClose }: AchievementModalProps) => {
  const catMeta = ACHIEVEMENT_CATEGORIES[achievement.category as AchievementCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6" onClick={onClose}>
      <div
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-5xl">{achievement.icon}</span>
        <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
        <p className="text-center text-sm text-gray-400">{achievement.description}</p>

        {catMeta && (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ color: catMeta.color, backgroundColor: catMeta.bgColor }}
          >
            {catMeta.label}
          </span>
        )}

        {achievement.earned && achievement.earnedAt && (
          <p className="text-xs text-gray-500">{new Date(achievement.earnedAt).toLocaleDateString("ko-KR")} 획득</p>
        )}

        {!achievement.earned && <p className="text-xs text-gray-600">아직 달성하지 못했습니다</p>}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-gray-800 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;
