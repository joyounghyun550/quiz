"use client";

import { TIER_MAP } from "@/shared/constants/tier.constant";
import type { TierName } from "@/shared/types/database.type";

import type { SeasonRecord } from "@/entities/season/model/types";

type SeasonHistoryCardProps = {
  record: SeasonRecord;
};

const SeasonHistoryCard = ({ record }: SeasonHistoryCardProps) => {
  const tierConfig = TIER_MAP[record.finalTier as TierName];
  const accuracy = record.totalQuizzes > 0 ? Math.round((record.totalCorrect / record.totalQuizzes) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{record.seasonName}</h3>
        {record.rewardClaimed ? (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            보상 수령 완료
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
            보상 미수령
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-2">
        {tierConfig && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: tierConfig.bgColor, color: tierConfig.color }}
          >
            <span>{tierConfig.icon}</span>
            <span>{tierConfig.label}</span>
          </span>
        )}
        <span className="text-sm font-bold text-white">{record.finalLp} LP</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-gray-900/50 px-3 py-2 text-center">
          <p className="text-xs text-gray-500">순위</p>
          <p className="text-sm font-bold text-white">{record.finalRank != null ? `${record.finalRank}위` : "-"}</p>
        </div>
        <div className="rounded-lg bg-gray-900/50 px-3 py-2 text-center">
          <p className="text-xs text-gray-500">퀴즈</p>
          <p className="text-sm font-bold text-white">{record.totalQuizzes}회</p>
        </div>
        <div className="rounded-lg bg-gray-900/50 px-3 py-2 text-center">
          <p className="text-xs text-gray-500">정답률</p>
          <p className="text-sm font-bold text-white">{accuracy}%</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonHistoryCard;
