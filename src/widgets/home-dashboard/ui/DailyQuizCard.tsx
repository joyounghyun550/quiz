"use client";

import Link from "next/link";

import { cn } from "@/shared/utils/cn.util";

type DailyQuizCardProps = {
  isCompleted: boolean;
  correctCount?: number;
  totalQuestions?: number;
};

const DailyQuizCard = ({ isCompleted, correctCount, totalQuestions }: DailyQuizCardProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-cyan-500/10 via-gray-900/50 to-purple-500/10">
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="#06b6d410"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">오늘의 퀴즈</h3>
            <p className="text-[10px] text-gray-500">하루 1회 · LP 2배</p>
          </div>
          <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            2× LP
          </span>
        </div>

        {isCompleted ? (
          <div className="flex flex-col gap-3">
            {typeof correctCount === "number" && typeof totalQuestions === "number" && (
              <div className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-white">{correctCount}</span>
                  <span className="text-base text-gray-500">/ {totalQuestions}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-300">정답</span>
                  <span className="text-[10px] text-gray-500">
                    정답률 {Math.round((correctCount / totalQuestions) * 100)}%
                  </span>
                </div>
                <span className="ml-auto text-sm text-emerald-400">완료</span>
              </div>
            )}
            <div className="rounded-xl bg-emerald-500/5 p-3 text-center">
              <p className="text-xs text-emerald-500">오늘의 퀴즈 완료!</p>
              <p className="mt-0.5 text-[10px] text-gray-600">내일 새로운 문제가 준비됩니다</p>
            </div>
            <Link
              href="/quiz"
              className={cn(
                "flex h-11 items-center justify-center rounded-xl",
                "border border-gray-700 bg-gray-800/50",
                "text-sm text-gray-300 transition-colors hover:bg-gray-800"
              )}
            >
              티어 올리기 연습하기 →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-400">5문제가 당신을 기다리고 있습니다</p>
            <Link
              href="/quiz/daily"
              className={cn(
                "flex h-12 items-center justify-center rounded-xl",
                "bg-gradient-to-r from-cyan-500 to-blue-500",
                "font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
              )}
            >
              퀴즈 시작하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuizCard;
