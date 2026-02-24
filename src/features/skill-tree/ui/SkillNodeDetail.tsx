"use client";

import Link from "next/link";

import type { SkillNodeWithProgress } from "@/entities/skill/model/types";

type SkillNodeDetailProps = {
  node: SkillNodeWithProgress | null;
  parentName?: string | null;
  onClose: () => void;
};

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  locked: { label: "잠김", color: "#6B7280", bgColor: "#6B728018" },
  in_progress: { label: "진행 중", color: "#3B82F6", bgColor: "#3B82F618" },
  unlocked: { label: "완료", color: "#F59E0B", bgColor: "#F59E0B18" },
};

const SkillNodeDetail = ({ node, parentName, onClose }: SkillNodeDetailProps) => {
  if (!node) return null;

  const statusMeta = STATUS_LABELS[node.status];
  const progressPercent =
    node.requiredCorrect > 0 ? Math.min(Math.round((node.correctCount / node.requiredCorrect) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="flex w-full max-w-lg flex-col gap-4 rounded-t-2xl border border-gray-800 bg-gray-900 p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아이콘 + 이름 */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{node.icon}</span>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">{node.name}</h3>
            <span className="text-xs text-gray-500">{node.subcategory}</span>
          </div>
          {/* 상태 배지 */}
          <span
            className="ml-auto rounded-full px-3 py-1 text-xs font-semibold"
            style={{ color: statusMeta.color, backgroundColor: statusMeta.bgColor }}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* 설명 */}
        <p className="text-sm leading-relaxed text-gray-400">{node.description}</p>

        {/* 진행도 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">진행도</span>
            <span className="text-sm font-semibold text-white">
              {node.correctCount}/{node.requiredCorrect}
              <span className="ml-1 text-xs text-gray-500">({progressPercent}%)</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                node.status === "unlocked"
                  ? "bg-amber-500"
                  : node.status === "in_progress"
                    ? "bg-blue-500"
                    : "bg-gray-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 총 답변 수 */}
        {node.totalAnswered > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-gray-800/50 px-3 py-2">
            <span className="text-xs text-gray-500">총 답변 수</span>
            <span className="text-sm font-semibold text-gray-300">{node.totalAnswered}문제</span>
          </div>
        )}

        {/* 잠김 + 선행 스킬 필요 */}
        {node.status === "locked" && node.parentId && parentName && (
          <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/30 px-3 py-2.5">
            <span className="text-sm">🔒</span>
            <span className="text-xs text-gray-400">
              선행 스킬 필요: <span className="font-semibold text-gray-300">{parentName}</span>
            </span>
          </div>
        )}

        {/* 해금 날짜 */}
        {node.status === "unlocked" && node.unlockedAt && (
          <p className="text-xs text-gray-500">{new Date(node.unlockedAt).toLocaleDateString("ko-KR")} 해금 완료</p>
        )}

        {/* 관련 문제 풀기 링크 */}
        {node.status !== "locked" && (
          <Link
            href={`/quiz/practice?category=${node.category}`}
            className="flex items-center justify-center rounded-xl bg-blue-500/10 py-2.5 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            관련 문제 풀기
          </Link>
        )}

        {/* 닫기 */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-gray-800 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default SkillNodeDetail;
