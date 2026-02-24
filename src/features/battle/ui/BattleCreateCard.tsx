"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/shared/utils/cn.util";

const BattleCreateCard = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/battle/create", { method: "POST" });
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error ?? "대결을 만들 수 없습니다.");
        return;
      }

      router.push(`/quiz/battle/${data.battle.id}`);
    } catch {
      alert("대결을 만들 수 없습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/10">
      <div className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke="#ec4899"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="7" r="4" stroke="#ec4899" strokeWidth="2" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">1:1 대결</h3>
            <p className="text-[10px] text-gray-500">친구와 실력 대결</p>
          </div>
          <span className="ml-auto rounded-full bg-pink-500/15 px-2.5 py-1 text-xs font-bold text-pink-400">VS</span>
        </div>

        <div className="my-4 h-px bg-gray-800" />

        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-400">초대 코드를 공유하고 친구와 5문제 대결!</p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl",
              "bg-gradient-to-r from-pink-600 to-rose-600",
              "font-semibold text-white transition-opacity hover:opacity-90",
              "disabled:opacity-50"
            )}
          >
            {isCreating ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "대결 만들기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleCreateCard;
