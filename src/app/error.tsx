"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">오류가 발생했어요</h1>
      <p className="mb-8 text-sm text-gray-400">일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="flex h-12 items-center justify-center rounded-xl border border-gray-700 font-semibold text-gray-300 transition-colors hover:bg-gray-800"
        >
          홈으로
        </a>
      </div>
    </div>
  );
};

export default Error;
