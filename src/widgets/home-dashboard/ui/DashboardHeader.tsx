"use client";

import type { TierInfo } from "@/entities/user/model/types";
import LpBar from "@/entities/user/ui/LpBar";
import TierBadge from "@/entities/user/ui/TierBadge";

type DashboardHeaderProps = {
  name: string;
  tierInfo: TierInfo;
  streak: number;
};

const DashboardHeader = ({ name, tierInfo, streak }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-400">안녕하세요,</p>
          <p className="text-lg font-bold text-white">{name}</p>
        </div>
        <TierBadge tierInfo={tierInfo} size="lg" />
      </div>

      <LpBar tierInfo={tierInfo} />

      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2">
          <span className="text-base">🔥</span>
          <span className="text-sm font-medium text-orange-400">{streak}일 연속 도전 중!</span>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
