"use client";

type QuickStatsProps = {
  totalAnswered: number;
  totalCorrect: number;
  longestStreak: number;
};

const QuickStats = ({ totalAnswered, totalCorrect, longestStreak }: QuickStatsProps) => {
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-3">
        <span className="text-lg font-bold text-white">{totalAnswered}</span>
        <span className="text-[10px] text-gray-500">풀은 문제</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-3">
        <span className="text-lg font-bold text-white">{accuracy}%</span>
        <span className="text-[10px] text-gray-500">정답률</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/50 p-3">
        <span className="text-lg font-bold text-white">{longestStreak}</span>
        <span className="text-[10px] text-gray-500">최장 스트릭</span>
      </div>
    </div>
  );
};

export default QuickStats;
