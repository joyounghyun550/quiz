"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { UserRow } from "@/shared/types/database.type";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    };

    loadSettings();
  }, [router, supabase]);

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
        <button type="button" onClick={() => router.back()} className="text-gray-400">
          ←
        </button>
        <h1 className="text-xl font-bold text-white">알림 설정</h1>
      </div>

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
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        {/* Time Picker */}
        {notificationEnabled && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <span className="text-sm text-gray-300">알림 시간</span>
            <input
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </div>
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
