"use client";

import { motion } from "framer-motion";

import { cn } from "@/shared/utils/cn.util";

type AnswerFeedbackProps = {
  isCorrect: boolean;
  lpChange: number;
  explanation: string;
  explanationCode?: string | null;
  onNext: () => void;
  isLast: boolean;
};

const AnswerFeedback = ({ isCorrect, lpChange, explanation, explanationCode, onNext, isLast }: AnswerFeedbackProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Result Banner */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl p-4",
          isCorrect ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isCorrect ? "O" : "X"}</span>
          <span className={cn("text-base font-semibold", isCorrect ? "text-emerald-400" : "text-red-400")}>
            {isCorrect ? "정답입니다!" : "오답입니다"}
          </span>
        </div>
        <span
          className={cn(
            "rounded-lg px-3 py-1 text-sm font-bold",
            lpChange >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}
        >
          {lpChange >= 0 ? "+" : ""}
          {lpChange} LP
        </span>
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-300">해설</h3>
        <p className="text-sm leading-relaxed text-gray-400">{explanation}</p>
        {explanationCode && (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-3">
            <code className="text-xs text-gray-300">{explanationCode}</code>
          </pre>
        )}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        className="h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600 active:bg-cyan-700"
      >
        {isLast ? "결과 보기" : "다음 문제"}
      </button>
    </motion.div>
  );
};

export default AnswerFeedback;
