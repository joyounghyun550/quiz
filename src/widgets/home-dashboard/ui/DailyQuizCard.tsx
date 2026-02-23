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
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
      <div className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-base">⚡</span>
          <h3 className="text-base font-semibold text-white">오늘의 퀴즈</h3>
        </div>

        {isCompleted ? (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-gray-400">오늘의 퀴즈를 완료했습니다!</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {correctCount}/{totalQuestions}
              </span>
              <span className="text-sm text-gray-400">정답</span>
            </div>
            <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-400">
              내일 새로운 문제가 준비됩니다
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
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
