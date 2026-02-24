"use client";

import type { TestResult } from "@/features/code-challenge/lib/code-runner.util";

type TestCasePanelProps = {
  results: TestResult[] | null;
  isRunning: boolean;
};

const TestCasePanel = ({ results, isRunning }: TestCasePanelProps) => {
  if (isRunning) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <span className="text-sm text-gray-400">테스트 실행 중...</span>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-center text-sm text-gray-500">코드를 실행하면 테스트 결과가 여기에 표시됩니다</p>
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold ${passedCount === results.length ? "text-emerald-400" : "text-amber-400"}`}
        >
          {passedCount}/{results.length} 통과
        </span>
      </div>
      {results.map((result, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 ${
            result.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className={`text-xs font-semibold ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
              {result.passed ? "PASS" : "FAIL"}
            </span>
            <span className="text-xs text-gray-400">{result.description}</span>
          </div>
          {!result.passed && (
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className="flex gap-2">
                <span className="text-gray-500">Expected:</span>
                <code className="text-emerald-400">{result.expected}</code>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500">Actual:</span>
                <code className="text-red-400">{result.actual || "(empty)"}</code>
              </div>
              {result.error && <div className="mt-1 text-red-400">Error: {result.error}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestCasePanel;
