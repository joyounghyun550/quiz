"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { AchievementWithStatus } from "@/entities/achievement/model/types";
import AchievementGrid from "@/entities/achievement/ui/AchievementGrid";

import AchievementModal from "@/features/achievements/ui/AchievementModal";

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [selected, setSelected] = useState<AchievementWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/achievements");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setAchievements(data.achievements ?? []);
      } catch {
        // 에러
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  const earnedCount = achievements.filter((a) => a.earned).length;

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">업적</h1>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-400">
          {earnedCount}/{achievements.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
          style={{ width: `${achievements.length > 0 ? (earnedCount / achievements.length) * 100 : 0}%` }}
        />
      </div>

      <AchievementGrid achievements={achievements} onSelect={setSelected} />

      {selected && <AchievementModal achievement={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
