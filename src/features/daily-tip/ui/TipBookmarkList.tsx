"use client";

import { useState } from "react";

import type { DailyTipWithBookmark } from "@/entities/tip/model/types";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  javascript: { bg: "bg-yellow-500/15", text: "text-yellow-400" },
  typescript: { bg: "bg-blue-500/15", text: "text-blue-400" },
  react: { bg: "bg-cyan-500/15", text: "text-cyan-400" },
  nextjs: { bg: "bg-white/10", text: "text-gray-300" },
  css: { bg: "bg-pink-500/15", text: "text-pink-400" },
  web_fundamentals: { bg: "bg-green-500/15", text: "text-green-400" },
  interview: { bg: "bg-purple-500/15", text: "text-purple-400" },
  certification: { bg: "bg-orange-500/15", text: "text-orange-400" },
};

const getCategoryStyle = (category: string) => {
  return CATEGORY_COLORS[category] ?? { bg: "bg-gray-500/15", text: "text-gray-400" };
};

type TipBookmarkListProps = {
  tips: DailyTipWithBookmark[];
  onToggleBookmark: (tipId: string) => void;
};

const TipBookmarkList = ({ tips, onToggleBookmark }: TipBookmarkListProps) => {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (tipId: string) => {
    if (togglingId) return;
    setTogglingId(tipId);
    try {
      onToggleBookmark(tipId);
    } finally {
      setTogglingId(null);
    }
  };

  if (tips.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
        <span className="text-4xl">📌</span>
        <p className="text-sm">아직 북마크한 팁이 없습니다</p>
        <p className="text-xs text-gray-600">유용한 팁을 북마크해서 모아보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tips.map((tip) => {
        const categoryStyle = getCategoryStyle(tip.category);
        return (
          <div
            key={tip.id}
            className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 transition-colors hover:border-gray-700"
          >
            {/* Top row: date + category + bookmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryStyle.bg} ${categoryStyle.text}`}
                >
                  {tip.category}
                </span>
                <span className="text-[10px] text-gray-600">{tip.tipDate}</span>
              </div>
              <button
                onClick={() => handleToggle(tip.id)}
                disabled={togglingId === tip.id}
                className="rounded-lg p-1 transition-colors hover:bg-gray-800"
                aria-label={tip.isBookmarked ? "북마크 해제" : "북마크 추가"}
              >
                {tip.isBookmarked ? (
                  <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Title */}
            <h3 className="mt-2 text-sm font-semibold text-white">{tip.title}</h3>

            {/* Content preview */}
            <p className="mt-1 line-clamp-2 text-xs text-gray-400">{tip.content}</p>

            {/* Code snippet preview */}
            {tip.codeSnippet && (
              <div className="mt-2 overflow-hidden rounded-lg bg-gray-800/80 p-2">
                <pre className="line-clamp-3 text-[10px] leading-relaxed text-gray-300">
                  <code className="font-mono">{tip.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TipBookmarkList;
