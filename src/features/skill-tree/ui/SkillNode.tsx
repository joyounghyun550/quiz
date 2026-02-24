"use client";

import type { SkillNodeWithProgress } from "@/entities/skill/model/types";

type SkillNodeProps = {
  node: SkillNodeWithProgress;
  onClick: () => void;
};

const SkillNode = ({ node, onClick }: SkillNodeProps) => {
  const isLocked = node.status === "locked";
  const isInProgress = node.status === "in_progress";
  const isUnlocked = node.status === "unlocked";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
        isLocked
          ? "border-gray-800 bg-gray-800/50 opacity-50"
          : isInProgress
            ? "border-blue-500/30 bg-blue-500/10"
            : "border-amber-500/30 bg-amber-500/10 shadow-lg shadow-amber-500/20"
      }`}
    >
      {/* 아이콘 */}
      <div className="relative">
        <span className={`text-3xl ${isLocked ? "grayscale" : ""}`}>{node.icon}</span>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg">🔒</span>
          </div>
        )}
        {isUnlocked && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-black">
            ✓
          </div>
        )}
      </div>

      {/* 이름 */}
      <span
        className={`text-center text-xs font-semibold leading-tight ${
          isLocked ? "text-gray-500" : isUnlocked ? "text-amber-300" : "text-white"
        }`}
      >
        {node.name}
      </span>

      {/* 진행도 텍스트 */}
      {!isLocked && (
        <span className={`text-[10px] font-medium ${isUnlocked ? "text-amber-400" : "text-blue-400"}`}>
          {node.correctCount}/{node.requiredCorrect}
        </span>
      )}

      {/* 진행 바 (in_progress일 때만) */}
      {isInProgress && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${node.progress}%` }}
          />
        </div>
      )}

      {/* 완료 바 (unlocked일 때) */}
      {isUnlocked && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-amber-500/30">
          <div className="h-full w-full rounded-full bg-amber-500" />
        </div>
      )}
    </button>
  );
};

export default SkillNode;
