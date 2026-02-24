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

type DailyTipCardProps = {
  tip: DailyTipWithBookmark | null;
  onToggleBookmark?: (tipId: string) => void;
};

const DailyTipCard = ({ tip, onToggleBookmark }: DailyTipCardProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleBookmark = async () => {
    if (!tip || !onToggleBookmark || isToggling) return;
    setIsToggling(true);
    try {
      onToggleBookmark(tip.id);
    } finally {
      setIsToggling(false);
    }
  };

  if (!tip) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-sm font-semibold text-white">오늘의 한줄 팁</span>
        </div>
        <p className="mt-3 text-center text-sm text-gray-500">오늘의 팁이 아직 준비되지 않았습니다</p>
      </div>
    );
  }

  const categoryStyle = getCategoryStyle(tip.category);

  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-sm font-semibold text-white">오늘의 한줄 팁</span>
        </div>
        <button
          onClick={handleBookmark}
          disabled={isToggling}
          className="rounded-lg p-1.5 transition-colors hover:bg-gray-800"
          aria-label={tip.isBookmarked ? "북마크 해제" : "북마크 추가"}
        >
          {tip.isBookmarked ? (
            <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-gray-500"
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

      {/* Category badge */}
      <div className="mt-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${categoryStyle.bg} ${categoryStyle.text}`}>
          {tip.category}
        </span>
      </div>

      {/* Title & Content */}
      <h3 className="mt-2 text-sm font-bold text-white">{tip.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-400">{tip.content}</p>

      {/* Code snippet */}
      {tip.codeSnippet && (
        <div className="mt-3 overflow-x-auto rounded-lg bg-gray-800/80 p-3">
          <pre className="text-xs leading-relaxed text-gray-300">
            <code className="font-mono">{tip.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Reference URL */}
      {tip.referenceUrl && (
        <a
          href={tip.referenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[10px] text-cyan-500 hover:text-cyan-400"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          참고 자료
        </a>
      )}
    </div>
  );
};

export default DailyTipCard;
