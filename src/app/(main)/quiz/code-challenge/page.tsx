"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { CodeChallengeListItem } from "@/entities/code-challenge/model/types";

export default function CodeChallengeListPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<CodeChallengeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/code-challenge");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setChallenges(data.challenges ?? []);
      } catch {
        // 에러
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

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
        <h1 className="text-xl font-bold text-white">코드 챌린지</h1>
        <span className="text-xs text-gray-500">
          {challenges.filter((c) => c.isSolved).length}/{challenges.length} 완료
        </span>
      </div>

      {challenges.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <span className="text-4xl">💻</span>
          <p className="text-sm">아직 코드 챌린지가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {challenges.map((challenge) => {
            const diffColor =
              challenge.difficulty <= 3
                ? "text-emerald-400 bg-emerald-500/10"
                : challenge.difficulty <= 6
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-red-400 bg-red-500/10";

            return (
              <Link
                key={challenge.id}
                href={`/quiz/code-challenge/${challenge.id}`}
                className={`rounded-xl border p-4 transition-colors hover:border-gray-700 ${
                  challenge.isSolved ? "border-emerald-500/20 bg-emerald-500/5" : "border-gray-800 bg-gray-900/50"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">{challenge.title}</h3>
                  {challenge.isSolved && <span className="text-xs font-semibold text-emerald-400">완료</span>}
                </div>
                <p className="mb-3 line-clamp-2 text-xs text-gray-400">{challenge.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${diffColor}`}>
                    Lv.{challenge.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-500">{challenge.category}</span>
                  {challenge.solveRate > 0 && (
                    <span className="ml-auto text-[10px] text-gray-500">풀이율 {challenge.solveRate}%</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
