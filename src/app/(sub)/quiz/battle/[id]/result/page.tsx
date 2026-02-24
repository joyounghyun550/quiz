"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import type { BattleResult } from "@/entities/battle/model/types";

import BattleResultPanel from "@/features/battle/ui/BattleResultPanel";

export default function BattleResultPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;

  const [result, setResult] = useState<BattleResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await fetch(`/api/battle/${battleId}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error ?? "결과를 불러올 수 없습니다.");
          return;
        }

        if (data.battle.status !== "completed") {
          // 아직 완료되지 않았으면 대결 페이지로
          router.replace(`/quiz/battle/${battleId}`);
          return;
        }

        const battleResult: BattleResult = {
          battleId: data.battle.id,
          hostId: data.battle.hostId,
          hostName: data.battle.hostName,
          hostProfileImage: data.battle.hostProfileImage,
          hostScore: data.battle.hostScore,
          hostCorrect: data.battle.hostCorrect,
          hostTimeMs: data.battle.hostTimeMs,
          guestName: data.battle.guestName ?? "Unknown",
          guestProfileImage: data.battle.guestProfileImage,
          guestScore: data.battle.guestScore,
          guestCorrect: data.battle.guestCorrect,
          guestTimeMs: data.battle.guestTimeMs,
          winnerId: data.battle.winnerId,
          isHost: data.isHost,
        };

        setResult(battleResult);
      } catch {
        setError("결과를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [battleId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
          <p className="text-sm text-gray-400">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-950 px-6">
        <p className="text-gray-400">{error ?? "결과를 불러올 수 없습니다."}</p>
        <button
          type="button"
          onClick={() => router.push("/quiz/battle")}
          className="rounded-xl bg-gray-800 px-6 py-3 text-sm text-white"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return <BattleResultPanel result={result} />;
}
