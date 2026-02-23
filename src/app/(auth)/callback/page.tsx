"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // /auth/callback Route Handler가 유저 생성 및 라우팅을 모두 처리합니다.
    // 이 페이지에 직접 접근하는 경우 홈으로 이동합니다.
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="text-sm text-gray-400">로그인 처리 중...</p>
      </div>
    </div>
  );
}
