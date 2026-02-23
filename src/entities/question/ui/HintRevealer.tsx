"use client";

import { useState } from "react";

import { cn } from "@/shared/utils/cn.util";

type HintRevealerProps = {
  hint1: string | null;
  hint2: string | null;
  hint1Used: boolean;
  hint2Used: boolean;
  onRevealHint: (level: 1 | 2) => void;
};

const HintRevealer = ({ hint1, hint2, hint1Used, hint2Used, onRevealHint }: HintRevealerProps) => {
  const [confirmingHint, setConfirmingHint] = useState<1 | 2 | null>(null);

  const handleHintClick = (level: 1 | 2) => {
    if (level === 1 && hint1Used) return;
    if (level === 2 && hint2Used) return;
    if (level === 2 && !hint1Used) return;

    if (confirmingHint === level) {
      onRevealHint(level);
      setConfirmingHint(null);
    } else {
      setConfirmingHint(level);
    }
  };

  if (!hint1 && !hint2) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Hint 1 */}
      {hint1 && (
        <div className="overflow-hidden rounded-xl border border-gray-700">
          {hint1Used ? (
            <div className="bg-amber-500/5 p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-amber-400">Hint 1 — 개념 힌트</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">LP -30%</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">{hint1}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleHintClick(1)}
              className={cn(
                "flex w-full items-center justify-between p-4 text-left transition-colors",
                confirmingHint === 1 ? "bg-amber-500/10" : "bg-gray-800/50 hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {confirmingHint === 1 ? "한 번 더 탭하면 힌트가 공개됩니다" : "Hint 1 — 개념 힌트"}
                </span>
              </div>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">LP -30%</span>
            </button>
          )}
        </div>
      )}

      {/* Hint 2 */}
      {hint2 && (
        <div className="overflow-hidden rounded-xl border border-gray-700">
          {hint2Used ? (
            <div className="bg-orange-500/5 p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-orange-400">Hint 2 — 상세 힌트</span>
                <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] text-orange-400">LP -50%</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">{hint2}</p>
            </div>
          ) : (
            <button
              type="button"
              disabled={!hint1Used}
              onClick={() => handleHintClick(2)}
              className={cn(
                "flex w-full items-center justify-between p-4 text-left transition-colors",
                !hint1Used
                  ? "cursor-not-allowed bg-gray-800/30 opacity-40"
                  : confirmingHint === 2
                    ? "bg-orange-500/10"
                    : "bg-gray-800/50 hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {!hint1Used
                    ? "Hint 1을 먼저 공개하세요"
                    : confirmingHint === 2
                      ? "한 번 더 탭하면 힌트가 공개됩니다"
                      : "Hint 2 — 상세 힌트"}
                </span>
              </div>
              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] text-orange-400">LP -50%</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HintRevealer;
