"use client";

import { AnimatePresence, motion } from "framer-motion";

type TimeAttackScoreDisplayProps = {
  score: number;
  comboCount: number;
  lastScoreGain: number | null;
};

const TimeAttackScoreDisplay = ({ score, comboCount, lastScoreGain }: TimeAttackScoreDisplayProps) => {
  const comboEmoji =
    comboCount >= 5 ? "🔥" : comboCount >= 4 ? "⚡" : comboCount >= 3 ? "✨" : comboCount >= 2 ? "🎯" : "";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold tabular-nums text-white">{score.toLocaleString()}</span>
        <span className="text-xs text-gray-500">점</span>
        <AnimatePresence mode="popLayout">
          {lastScoreGain !== null && lastScoreGain > 0 && (
            <motion.span
              key={score}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-bold text-emerald-400"
            >
              +{lastScoreGain}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {comboCount >= 2 && (
        <motion.div
          key={comboCount}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1"
        >
          <span className="text-base">{comboEmoji}</span>
          <span className="text-xs font-bold text-amber-400">{comboCount}콤보</span>
        </motion.div>
      )}
    </div>
  );
};

export default TimeAttackScoreDisplay;
