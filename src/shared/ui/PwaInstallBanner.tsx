"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pwa-install-dismissed";

const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-gray-900 p-4 shadow-xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
        <span className="text-sm font-bold text-white">{"</>"}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">앱으로 설치하기</p>
        <p className="text-xs text-gray-400">홈 화면에서 바로 실행할 수 있어요</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          설치
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
