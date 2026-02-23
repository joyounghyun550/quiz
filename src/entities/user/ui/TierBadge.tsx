"use client";

import { cn } from "@/shared/utils/cn.util";

import type { TierInfo } from "@/entities/user/model/types";

type TierBadgeProps = {
  tierInfo: TierInfo;
  size?: "sm" | "md" | "lg";
  showDivision?: boolean;
};

const TierBadge = ({ tierInfo, size = "md", showDivision = true }: TierBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full font-semibold", sizeClasses[size])}
      style={{ backgroundColor: tierInfo.bgColor, color: tierInfo.color }}
    >
      <span>{tierInfo.label}</span>
      {showDivision && <span className="opacity-70">{tierInfo.divisionLabel}</span>}
    </span>
  );
};

export default TierBadge;
