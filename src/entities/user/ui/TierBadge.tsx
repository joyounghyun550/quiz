"use client";

import { cn } from "@/shared/utils/cn.util";

import type { TierInfo } from "@/entities/user/model/types";

type TierBadgeProps = {
  tierInfo: TierInfo;
  size?: "sm" | "md" | "lg" | "xl";
  showDivision?: boolean;
  showIcon?: boolean;
};

const TierBadge = ({ tierInfo, size = "md", showDivision = true, showIcon = true }: TierBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
    xl: "px-5 py-2 text-lg gap-2",
  };

  const iconSizes = {
    sm: "text-[10px]",
    md: "text-sm",
    lg: "text-base",
    xl: "text-xl",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full font-semibold", sizeClasses[size])}
      style={{ backgroundColor: tierInfo.bgColor, color: tierInfo.color }}
    >
      {showIcon && <span className={iconSizes[size]}>{tierInfo.icon}</span>}
      <span>{tierInfo.label}</span>
      {showDivision && <span className="opacity-70">{tierInfo.divisionLabel}</span>}
    </span>
  );
};

export default TierBadge;
