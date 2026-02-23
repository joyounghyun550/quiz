"use client";

import { cn } from "@/shared/utils/cn.util";

type ContributionCalendarProps = {
  completedDates: string[];
};

const ContributionCalendar = ({ completedDates }: ContributionCalendarProps) => {
  const completedSet = new Set(completedDates);

  // 최근 12주 (84일) 표시
  const today = new Date();
  const weeks: Date[][] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83);

  // 시작일을 일요일로 맞춤
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const currentDate = new Date(startDate);
  let currentWeek: Date[] = [];

  while (currentDate <= today) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">학습 기록</h3>
      <div className="flex gap-1 overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => {
              const dateStr = formatDate(day);
              const isCompleted = completedSet.has(dateStr);
              const isToday = dateStr === formatDate(today);
              const isFuture = day > today;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "h-3 w-3 rounded-sm",
                    isFuture && "bg-transparent",
                    !isFuture && !isCompleted && "bg-gray-800",
                    isCompleted && "bg-emerald-500",
                    isToday && !isCompleted && "ring-1 ring-gray-600"
                  )}
                  title={`${dateStr}${isCompleted ? " - 완료" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-gray-500">
        <span>적음</span>
        <div className="flex gap-0.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-gray-800" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-800" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
        </div>
        <span>많음</span>
      </div>
    </div>
  );
};

export default ContributionCalendar;
