"use client";

import { useEffect, useRef, useState } from "react";

type TimeAttackTimerProps = {
  totalMs: number;
  onTimeUp: () => void;
  isPaused: boolean;
  onTick?: (remainingMs: number) => void;
};

const TimeAttackTimer = ({ totalMs, onTimeUp, isPaused, onTick }: TimeAttackTimerProps) => {
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isPaused) {
      pausedAtRef.current = remainingMs;
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const pausedRemaining = pausedAtRef.current || totalMs;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, pausedRemaining - elapsed);
      setRemainingMs(newRemaining);
      onTick?.(newRemaining);

      if (newRemaining <= 0) {
        onTimeUp();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, totalMs, onTimeUp, onTick]);

  const seconds = Math.ceil(remainingMs / 1000);
  const progress = remainingMs / totalMs;
  const isUrgent = seconds <= 10;
  const isCritical = seconds <= 5;

  const barColor = isCritical ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-cyan-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-2 rounded-full transition-colors ${barColor} ${isCritical ? "animate-pulse" : ""}`}
          style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }}
        />
      </div>
      <span
        className={`min-w-[3rem] text-right text-lg font-bold tabular-nums ${
          isCritical ? "animate-pulse text-red-400" : isUrgent ? "text-amber-400" : "text-cyan-400"
        }`}
      >
        {seconds}s
      </span>
    </div>
  );
};

export default TimeAttackTimer;
