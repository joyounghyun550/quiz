"use client";

import type { SeasonInfo } from "@/entities/season/model/types";

type SeasonBannerProps = {
  season: SeasonInfo | null;
};

const SeasonBanner = ({ season }: SeasonBannerProps) => {
  if (!season) return null;

  const startDate = new Date(season.startDate);
  const endDate = new Date(season.endDate);
  const now = new Date();

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 p-4">
      {/* 그라데이션 보더 효과 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30"
        style={{
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">시즌</span>
          <span className="text-sm font-bold text-white">
            시즌 {season.seasonNumber} · D-{season.daysRemaining}
          </span>
        </div>
        <span className="text-xs text-gray-500">{progressPercent}% 진행</span>
      </div>

      <p className="mb-3 text-xs text-gray-400">
        {season.startDate.slice(0, 10)} ~ {season.endDate.slice(0, 10)}
      </p>

      {/* 시즌 진행률 바 */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default SeasonBanner;
