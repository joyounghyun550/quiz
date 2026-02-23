"use client";

import Link from "next/link";

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
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-gray-500">안녕하세요,</p>
          <p className="text-lg font-bold text-white">{name}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <TierBadge tierInfo={tierInfo} size="md" />
          <Link
            href="/leaderboard"
            className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-300"
          >
            순위 보기 →
          </Link>
        </div>
      </div>

      <LpBar tierInfo={tierInfo} />

      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2">
          <span className="text-sm">🔥</span>
          <div className="flex flex-col gap-0">
            <span className="text-sm font-semibold text-orange-400">{streak}일 연속 도전 중!</span>
            <span className="text-[10px] text-orange-500/70">스트릭 보너스 +{Math.min(50, streak * 5)}% LP</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
