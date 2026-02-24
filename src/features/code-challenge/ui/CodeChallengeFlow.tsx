"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { CodeChallengeDetail } from "@/entities/code-challenge/model/types";

import { runCodeInSandbox, type TestResult } from "@/features/code-challenge/lib/code-runner.util";
import CodeEditor from "@/features/code-challenge/ui/CodeEditor";
import TestCasePanel from "@/features/code-challenge/ui/TestCasePanel";

type CodeChallengeFlowProps = {
  challenge: CodeChallengeDetail;
};

const CodeChallengeFlow = ({ challenge }: CodeChallengeFlowProps) => {
  const router = useRouter();
  const [code, setCode] = useState(challenge.initialCode);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await runCodeInSandbox(code, challenge.testCases, challenge.timeLimitMs);
      setTestResults(result.results);
    } catch {
      toast.error("코드 실행 중 오류가 발생했습니다");
    } finally {
      setIsRunning(false);
    }
  }, [code, challenge.testCases, challenge.timeLimitMs]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // 먼저 테스트 실행
      const result = await runCodeInSandbox(code, challenge.testCases, challenge.timeLimitMs);
      setTestResults(result.results);

      const timeSpentMs = Date.now() - startTime;

      const res = await fetch("/api/code-challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          code,
          passedCount: result.passedCount,
          totalTests: result.totalTests,
          timeSpentMs,
        }),
      });

      if (!res.ok) {
        toast.error("제출에 실패했습니다");
        return;
      }

      const data = await res.json();

      if (result.passedCount === result.totalTests) {
        toast.success(`모든 테스트 통과! +${data.lpChange} LP`, { duration: 4000 });
      } else {
        toast.info(`${result.passedCount}/${result.totalTests} 통과 · +${data.lpChange} LP`, { duration: 3000 });
      }

      // 업적 체크
      try {
        await fetch("/api/achievements/check", { method: "POST" });
      } catch {
        // 무시
      }

      router.push("/quiz/code-challenge");
    } catch {
      toast.error("제출 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, challenge, startTime, router]);

  const difficultyLabel =
    ["", "쉬움", "쉬움", "보통", "보통", "보통", "어려움", "어려움", "매우 어려움", "매우 어려움", "극한"][
      challenge.difficulty
    ] ?? "보통";
  const difficultyColor =
    challenge.difficulty <= 3 ? "text-emerald-400" : challenge.difficulty <= 6 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950 px-4 pb-8 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-300">
          ← 돌아가기
        </button>
        <span className={`text-xs font-semibold ${difficultyColor}`}>{difficultyLabel}</span>
      </div>

      {/* Title & Description */}
      <h1 className="mb-2 text-lg font-bold text-white">{challenge.title}</h1>
      <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-400">{challenge.description}</p>

      {/* Hints */}
      {challenge.hints && challenge.hints.length > 0 && (
        <details className="mb-4">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400">힌트 보기</summary>
          <ul className="mt-2 flex flex-col gap-1 pl-4">
            {challenge.hints.map((hint, i) => (
              <li key={i} className="list-disc text-xs text-gray-500">
                {hint}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Editor */}
      <div className="mb-4">
        <CodeEditor value={code} onChange={setCode} />
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className="flex-1 rounded-xl border border-gray-700 bg-gray-800 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {isRunning ? "실행 중..." : "테스트 실행"}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </div>

      {/* Test Results */}
      <TestCasePanel results={testResults} isRunning={isRunning} />
    </div>
  );
};

export default CodeChallengeFlow;
