"use client";

import { cn } from "@/shared/utils/cn.util";

import type { TierInfo } from "@/entities/user/model/types";

type LpBarProps = {
  tierInfo: TierInfo;
  className?: string;
};

const LpBar = ({ tierInfo, className }: LpBarProps) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{tierInfo.lp} LP</span>
        {tierInfo.lpToNextTier > 0 && (
          <span className="text-gray-500">다음 티어까지 {tierInfo.lpToNextTier} LP</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${tierInfo.progressPercent}%`,
            backgroundColor: tierInfo.color,
          }}
        />
      </div>
    </div>
  );
};

export default LpBar;
