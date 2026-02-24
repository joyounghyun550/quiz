"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { BattleInfo } from "@/entities/battle/model/types";

type BattleWaitingRoomProps = {
  battle: BattleInfo;
  isHost: boolean;
};

const BattleWaitingRoom = ({ battle, isHost }: BattleWaitingRoomProps) => {
  const router = useRouter();
  const [currentBattle, setCurrentBattle] = useState<BattleInfo>(battle);
  const [copied, setCopied] = useState(false);

  const pollBattleStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/battle/${battle.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.battle) {
        setCurrentBattle(data.battle);
      }
    } catch {
      // 폴링 실패 무시
    }
  }, [battle.id]);

  useEffect(() => {
    if (currentBattle.status !== "waiting") return;

    const interval = setInterval(pollBattleStatus, 3000);
    return () => clearInterval(interval);
  }, [currentBattle.status, pollBattleStatus]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentBattle.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 실패
    }
  };

  const handleKakaoInvite = () => {
    if (typeof window === "undefined" || !window.Kakao?.Share) return;

    window.Kakao.Share.sendCustom({
      templateId: 129774,
      templateArgs: { battleCode: currentBattle.inviteCode },
    });
  };

  const handleStartBattle = () => {
    router.refresh();
  };

  const guestJoined = !!currentBattle.guestId;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-5">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">{guestJoined ? "대결 준비 완료!" : "상대를 기다리는 중..."}</h1>
          <p className="mt-2 text-sm text-gray-400">
            {guestJoined ? "상대가 참가했습니다. 대결을 시작하세요!" : "초대 코드를 공유하여 친구를 초대하세요"}
          </p>
        </div>

        {/* 초대 코드 */}
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">초대 코드</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-4xl font-bold tracking-[0.3em] text-white">{currentBattle.inviteCode}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 transition-colors hover:bg-gray-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
            </svg>
            {copied ? "복사됨!" : "코드 복사하기"}
          </button>
        </div>

        {/* 카카오 초대 */}
        {!guestJoined && (
          <button
            type="button"
            onClick={handleKakaoInvite}
            className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] font-semibold text-[#191919] transition-opacity hover:opacity-90 active:opacity-80"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5C4.858 1.5 1.5 4.08 1.5 7.268c0 2.034 1.35 3.826 3.394 4.84l-.864 3.22a.281.281 0 0 0 .434.303l3.93-2.604c.196.024.397.038.606.038 4.142 0 7.5-2.58 7.5-5.768S13.142 1.5 9 1.5z"
                fill="#191919"
              />
            </svg>
            카카오로 초대
          </button>
        )}

        {/* 참가자 */}
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
          <p className="mb-4 text-center text-xs font-medium text-gray-500">참가자</p>
          <div className="flex items-center justify-around">
            {/* 호스트 */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {currentBattle.hostProfileImage ? (
                  <img
                    src={currentBattle.hostProfileImage}
                    alt={currentBattle.hostName}
                    className="h-16 w-16 rounded-full border-2 border-cyan-500 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-500 bg-gray-800 text-xl text-gray-400">
                    {currentBattle.hostName.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  HOST
                </span>
              </div>
              <span className="text-sm font-medium text-white">{currentBattle.hostName}</span>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-600">VS</span>
            </div>

            {/* 게스트 */}
            <div className="flex flex-col items-center gap-2">
              {guestJoined ? (
                <>
                  <div className="relative">
                    {currentBattle.guestProfileImage ? (
                      <img
                        src={currentBattle.guestProfileImage}
                        alt={currentBattle.guestName ?? ""}
                        className="h-16 w-16 rounded-full border-2 border-rose-500 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-500 bg-gray-800 text-xl text-gray-400">
                        {currentBattle.guestName?.charAt(0) ?? "?"}
                      </div>
                    )}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      GUEST
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{currentBattle.guestName}</span>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-gray-600 bg-gray-800/50">
                    <span className="text-xl text-gray-600">?</span>
                  </div>
                  <span className="text-sm text-gray-500">대기 중...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 대결 시작 버튼 */}
        {guestJoined && isHost && (
          <button
            type="button"
            onClick={handleStartBattle}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-lg font-bold text-white transition-opacity hover:opacity-90"
          >
            대결 시작!
          </button>
        )}

        {guestJoined && !isHost && (
          <div className="rounded-xl bg-gray-800/50 p-4 text-center">
            <p className="text-sm text-gray-400">호스트가 대결을 시작할 때까지 기다려주세요</p>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {!guestJoined && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleWaitingRoom;
