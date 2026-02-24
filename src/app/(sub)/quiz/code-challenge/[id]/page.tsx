"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import type { CodeChallengeDetail } from "@/entities/code-challenge/model/types";

import CodeChallengeFlow from "@/features/code-challenge/ui/CodeChallengeFlow";

export default function CodeChallengePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [challenge, setChallenge] = useState<CodeChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/code-challenge/${id}`);
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          router.replace("/quiz/code-challenge");
          return;
        }
        const data = await res.json();
        setChallenge(data.challenge);
      } catch {
        router.replace("/quiz/code-challenge");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, router]);

  if (isLoading || !challenge) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-gray-400">챌린지 로딩 중...</p>
        </div>
      </div>
    );
  }

  return <CodeChallengeFlow challenge={challenge} />;
}
