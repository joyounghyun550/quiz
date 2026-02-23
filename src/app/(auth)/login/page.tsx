"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const handleSocialLogin = async (provider: "kakao" | "google") => {
    setIsLoading(provider);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500">
            <span className="text-2xl font-bold text-white">{"</>"}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">DevRank</h1>
          <p className="text-center text-sm text-gray-400">
            Frontend Developer Quiz
            <br />
            매일 5문제로 실력을 키우세요
          </p>
        </div>

        {/* Tier Preview */}
        <div className="flex items-center gap-2 rounded-full bg-gray-800/50 px-4 py-2">
          <span className="text-xs text-gray-500">Inline</span>
          <span className="text-gray-600">→</span>
          <span className="text-xs text-gray-400">Element</span>
          <span className="text-gray-600">→</span>
          <span className="text-xs text-gray-300">Script</span>
          <span className="text-gray-600">→</span>
          <span className="text-xs font-semibold text-cyan-400">Deployer</span>
        </div>

        {/* Login Buttons */}
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            disabled={isLoading !== null}
            onClick={() => handleSocialLogin("kakao")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] font-medium text-[#191919] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading === "kakao" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#191919"
                    d="M9 1C4.582 1 1 3.87 1 7.404c0 2.196 1.403 4.13 3.543 5.283l-.905 3.396c-.08.3.262.54.52.366l3.964-2.64c.284.026.573.04.878.04 4.418 0 8-2.87 8-6.404C17 3.87 13.418 1 9 1"
                  />
                </svg>
                <span>카카오로 시작하기</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isLoading !== null}
            onClick={() => handleSocialLogin("google")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-medium text-gray-800 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading === "google" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
                <span>Google로 시작하기</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">
          로그인 시 서비스 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
