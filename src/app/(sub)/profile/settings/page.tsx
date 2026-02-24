"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { UserRow } from "@/shared/types/database.type";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type PushPermission = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState<PushPermission>("default");
  const [isPushSubscribing, setIsPushSubscribing] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = (await supabase
        .from("users")
        .select("notification_enabled, notification_time")
        .eq("id", user.id)
        .single()) as { data: Pick<UserRow, "notification_enabled" | "notification_time"> | null };

      if (profile) {
        setNotificationEnabled(profile.notification_enabled);
        setNotificationTime(profile.notification_time?.slice(0, 5) ?? "09:00");
      }

      // 현재 브라우저 Push 권한 상태 확인
      if ("Notification" in window && "serviceWorker" in navigator) {
        setPushPermission(Notification.permission as PushPermission);
      } else {
        setPushPermission("unsupported");
      }

      setIsLoading(false);
    };

    loadSettings();
  }, [router, supabase]);

  const handleRequestPushPermission = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    setIsPushSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission as PushPermission);

      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("VAPID public key not set");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch (e) {
      console.error("Push subscription failed:", e);
    } finally {
      setIsPushSubscribing(false);
    }
  };

  const handleDisablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();
      }
      await fetch("/api/push/unsubscribe", { method: "DELETE" });
      setPushPermission("default");
    } catch (e) {
      console.error("Unsubscribe failed:", e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("users")
        .update({
          notification_enabled: notificationEnabled,
          notification_time: `${notificationTime}:00`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-5 pt-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg p-1 text-gray-400 hover:bg-gray-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12l7 7M5 12l7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">알림 설정</h1>
      </div>

      {/* 알림 설정 카드 */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-white">일일 퀴즈 알림</span>
            <span className="text-xs text-gray-500">매일 정해진 시간에 알림을 받습니다</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${notificationEnabled ? "bg-cyan-500" : "bg-gray-700"}`}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: notificationEnabled ? "22px" : "2px" }}
            />
          </button>
        </div>

        {/* Time Picker */}
        {notificationEnabled && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-300">알림 시간</span>
              <span className="text-xs text-gray-500">매일 이 시간에 알림을 보냅니다</span>
            </div>
            <input
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </div>
        )}
      </div>

      {/* Push 알림 권한 카드 */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-white">브라우저 푸시 알림</span>
          <span className="text-xs text-gray-500">웹사이트를 닫아도 알림을 받으려면 아래에서 권한을 허용해주세요</span>
        </div>

        {pushPermission === "unsupported" && (
          <p className="text-xs text-gray-500">이 브라우저에서는 푸시 알림을 지원하지 않습니다.</p>
        )}

        {pushPermission === "denied" && (
          <div className="rounded-lg bg-red-500/10 p-3">
            <p className="text-xs text-red-400">
              브라우저에서 알림이 차단되었습니다. 브라우저 설정에서 이 사이트의 알림을 허용해 주세요.
            </p>
          </div>
        )}

        {pushPermission === "granted" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-400">푸시 알림 활성화됨</span>
            </div>
            <button
              type="button"
              onClick={handleDisablePush}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-700"
            >
              비활성화
            </button>
          </div>
        )}

        {pushPermission === "default" && (
          <button
            type="button"
            disabled={isPushSubscribing}
            onClick={handleRequestPushPermission}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isPushSubscribing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                알림 허용하기
              </>
            )}
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="h-12 w-full rounded-xl bg-cyan-500 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
      >
        {isSaving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
