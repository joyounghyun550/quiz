"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { formatTimeRemaining, getTimeRemaining } from "@/features/weekly-challenge/lib/weekly.util";

type WeeklyChallengeCardProps = {
  challenge: {
    id: string;
    title: string;
    description: string;
    category: string;
    endDate: string;
    participantCount: number;
    hasParticipated: boolean;
  } | null;
};

const WeeklyChallengeCard = ({ challenge }: WeeklyChallengeCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!challenge) return;

    const update = () => {
      const ms = getTimeRemaining(challenge.endDate);
      setTimeLeft(formatTimeRemaining(ms));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [challenge]);

  if (!challenge) return null;

  return (
    <Link
      href="/quiz/weekly"
      className="block rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 transition-colors hover:border-purple-500/50"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
          위클리 챌린지
        </span>
        <span className="text-xs text-gray-500">{timeLeft}</span>
      </div>
      <h3 className="mb-1 text-sm font-bold text-white">{challenge.title}</h3>
      <p className="mb-3 text-xs text-gray-400">{challenge.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{challenge.participantCount}명 참여</span>
        {challenge.hasParticipated ? (
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            참여 완료
          </span>
        ) : (
          <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
            도전하기 →
          </span>
        )}
      </div>
    </Link>
  );
};

export default WeeklyChallengeCard;
