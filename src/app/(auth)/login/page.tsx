"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    setIsInAppBrowser(/KAKAOTALK/i.test(navigator.userAgent));
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setIsKakaoLoading(false);
    }
  };

  const handleOpenExternal = () => {
    const url = window.location.href;
    if (/android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${url.replace(/https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end;`;
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
      alert("주소를 복사했습니다.\nSafari 브라우저에서 붙여넣기 후 접속해 주세요.");
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
          {/* 카카오 인앱 브라우저 안내 */}
          {isInAppBrowser && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
              <p className="text-xs leading-relaxed text-yellow-400">
                카카오톡 내에서는 Google 로그인이 지원되지 않습니다.
                <br />
                카카오 로그인을 사용하거나 외부 브라우저에서 열어주세요.
              </p>
            </div>
          )}

          {/* 카카오 로그인 */}
          <button
            type="button"
            disabled={isKakaoLoading}
            onClick={handleKakaoLogin}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] font-medium text-[#191919] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isKakaoLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#191919] border-t-transparent" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1.5C4.858 1.5 1.5 4.08 1.5 7.268c0 2.034 1.35 3.826 3.394 4.84l-.864 3.22a.281.281 0 0 0 .434.303l3.93-2.604c.196.024.397.038.606.038 4.142 0 7.5-2.58 7.5-5.768S13.142 1.5 9 1.5z"
                    fill="#191919"
                  />
                </svg>
                <span>카카오로 시작하기</span>
              </>
            )}
          </button>

          {/* Google 로그인 (인앱 브라우저에서는 외부 열기 버튼으로 대체) */}
          {!isInAppBrowser ? (
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleLogin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-medium text-gray-800 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isGoogleLoading ? (
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
          ) : (
            <button
              type="button"
              onClick={handleOpenExternal}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 font-medium text-gray-300 transition-opacity hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>외부 브라우저에서 열기</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">로그인 시 서비스 이용약관에 동의하는 것으로 간주됩니다</p>
      </div>
    </div>
  );
}
