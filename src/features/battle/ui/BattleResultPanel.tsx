"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/shared/utils/cn.util";

import type { BattleResult } from "@/entities/battle/model/types";

type BattleResultPanelProps = {
  result: BattleResult;
};

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${remaining}초` : `${remaining}초`;
};

const BattleResultPanel = ({ result }: BattleResultPanelProps) => {
  const router = useRouter();

  const isDraw = result.winnerId === null;
  const hostWon = result.winnerId === result.hostId;
  const guestWon = result.winnerId !== null && !hostWon;

  const isWinner = result.isHost ? hostWon : guestWon;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 pb-8 pt-6">
      {/* 결과 헤더 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">대결 결과</h1>
        <p
          className={cn(
            "mt-2 text-lg font-bold",
            isDraw ? "text-gray-400" : isWinner ? "text-amber-400" : "text-gray-500"
          )}
        >
          {isDraw ? "무승부!" : isWinner ? "승리!" : "패배..."}
        </p>
      </div>

      {/* VS 비교 */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <div className="flex items-stretch">
          {/* 호스트 */}
          <div
            className={cn(
              "flex flex-1 flex-col items-center gap-3 rounded-xl p-4",
              hostWon && "border-2 border-amber-500/30 bg-amber-500/5"
            )}
          >
            {hostWon && <span className="text-xs font-bold text-amber-400">승리</span>}
            {result.hostProfileImage ? (
              <img
                src={result.hostProfileImage}
                alt={result.hostName}
                className={cn(
                  "h-14 w-14 rounded-full object-cover",
                  hostWon ? "ring-2 ring-amber-400" : "ring-1 ring-gray-700"
                )}
              />
            ) : (
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-lg text-gray-400",
                  hostWon ? "ring-2 ring-amber-400" : "ring-1 ring-gray-700"
                )}
              >
                {result.hostName.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-white">{result.hostName}</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-white">{result.hostCorrect}</span>
              <span className="text-xs text-gray-500">/5 정답</span>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>{formatTime(result.hostTimeMs)}</p>
            </div>
          </div>

          {/* VS 구분자 */}
          <div className="flex flex-col items-center justify-center px-3">
            <div className="h-full w-px bg-gray-800" />
            <span className="my-2 text-lg font-bold text-gray-600">VS</span>
            <div className="h-full w-px bg-gray-800" />
          </div>

          {/* 게스트 */}
          <div
            className={cn(
              "flex flex-1 flex-col items-center gap-3 rounded-xl p-4",
              guestWon && "border-2 border-amber-500/30 bg-amber-500/5"
            )}
          >
            {guestWon && <span className="text-xs font-bold text-amber-400">승리</span>}
            {result.guestProfileImage ? (
              <img
                src={result.guestProfileImage}
                alt={result.guestName}
                className={cn(
                  "h-14 w-14 rounded-full object-cover",
                  guestWon ? "ring-2 ring-amber-400" : "ring-1 ring-gray-700"
                )}
              />
            ) : (
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-lg text-gray-400",
                  guestWon ? "ring-2 ring-amber-400" : "ring-1 ring-gray-700"
                )}
              >
                {result.guestName.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-white">{result.guestName}</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-white">{result.guestCorrect}</span>
              <span className="text-xs text-gray-500">/5 정답</span>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>{formatTime(result.guestTimeMs)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 비교 */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="mb-4 text-center text-sm font-semibold text-gray-300">상세 비교</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 px-4 py-2.5">
            <span className="text-sm font-medium text-white">{result.hostCorrect}문제</span>
            <span className="text-xs text-gray-500">정답 수</span>
            <span className="text-sm font-medium text-white">{result.guestCorrect}문제</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 px-4 py-2.5">
            <span className="text-sm font-medium text-white">{formatTime(result.hostTimeMs)}</span>
            <span className="text-xs text-gray-500">소요 시간</span>
            <span className="text-sm font-medium text-white">{formatTime(result.guestTimeMs)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 px-4 py-2.5">
            <span className="text-sm font-medium text-white">{result.hostScore}점</span>
            <span className="text-xs text-gray-500">점수</span>
            <span className="text-sm font-medium text-white">{result.guestScore}점</span>
          </div>
        </div>
      </div>

      {/* 보너스 LP */}
      {isWinner && (
        <div className="rounded-xl bg-amber-500/10 p-3 text-center">
          <p className="text-sm font-semibold text-amber-400">+15 LP 보너스!</p>
          <p className="mt-0.5 text-xs text-gray-500">대결 승리 보너스</p>
        </div>
      )}

      {/* 한판 더 */}
      <button
        type="button"
        onClick={() => router.push("/quiz/battle")}
        className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-semibold text-white transition-opacity hover:opacity-90"
      >
        한판 더
      </button>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex h-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 transition-colors hover:bg-gray-700"
      >
        홈으로
      </button>
    </div>
  );
};

export default BattleResultPanel;
