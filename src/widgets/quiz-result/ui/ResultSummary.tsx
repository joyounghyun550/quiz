"use client";

import { motion } from "framer-motion";

import { cn } from "@/shared/utils/cn.util";

type ResultSummaryProps = {
  correctCount: number;
  totalQuestions: number;
  totalLpChange: number;
  tierLabel: string;
  tierDivisionLabel: string;
  tierColor: string;
  tierBgColor: string;
  tierChanged: boolean;
  promoted: boolean;
  newLp: number;
  progressPercent: number;
};

const ResultSummary = ({
  correctCount,
  totalQuestions,
  totalLpChange,
  tierLabel,
  tierDivisionLabel,
  tierColor,
  tierBgColor,
  tierChanged,
  promoted,
  newLp,
  progressPercent,
}: ResultSummaryProps) => {
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Score Circle */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex flex-col items-center gap-2"
      >
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="6" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={accuracy >= 80 ? "#10b981" : accuracy >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${accuracy * 2.83} 283`}
              initial={{ strokeDasharray: "0 283" }}
              animate={{ strokeDasharray: `${accuracy * 2.83} 283` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white">
              {correctCount}/{totalQuestions}
            </span>
            <span className="text-xs text-gray-400">{accuracy}%</span>
          </div>
        </div>
      </motion.div>

      {/* LP Change */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl p-4 text-center",
          totalLpChange >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
        )}
      >
        <span className={cn("text-2xl font-bold", totalLpChange >= 0 ? "text-emerald-400" : "text-red-400")}>
          {totalLpChange >= 0 ? "+" : ""}
          {totalLpChange} LP
        </span>
      </motion.div>

      {/* Tier Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col items-center gap-3"
      >
        {tierChanged && (
          <span className={cn("text-sm font-semibold", promoted ? "text-emerald-400" : "text-red-400")}>
            {promoted ? "승급!" : "강등..."}
          </span>
        )}
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ backgroundColor: tierBgColor, color: tierColor }}
          >
            {tierLabel} {tierDivisionLabel}
          </span>
          <span className="text-sm text-gray-400">{newLp} LP</span>
        </div>
        <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-800">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: tierColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, delay: 0.9 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ResultSummary;
