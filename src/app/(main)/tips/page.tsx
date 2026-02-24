"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { DailyTipWithBookmark } from "@/entities/tip/model/types";

import DailyTipCard from "@/features/daily-tip/ui/DailyTipCard";
import TipBookmarkList from "@/features/daily-tip/ui/TipBookmarkList";

type TabKey = "latest" | "bookmarks";

const TABS: { key: TabKey; label: string }[] = [
  { key: "latest", label: "최신 팁" },
  { key: "bookmarks", label: "북마크" },
];

export default function TipsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("latest");
  const [latestTips, setLatestTips] = useState<DailyTipWithBookmark[]>([]);
  const [bookmarkedTips, setBookmarkedTips] = useState<DailyTipWithBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 최신 팁 로드
  const loadLatestTips = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const res = await fetch(`/api/tips/today?page=${pageNum}`);
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();

        // today endpoint returns single tip; for "latest" we use the full list
        // If the API returns a `tips` array (paginated), use that; otherwise wrap single tip
        if (data.tips) {
          const newTips = data.tips as DailyTipWithBookmark[];
          if (append) {
            setLatestTips((prev) => [...prev, ...newTips]);
          } else {
            setLatestTips(newTips);
          }
          setHasMore(newTips.length >= 10);
        } else if (data.tip && pageNum === 1) {
          setLatestTips(data.tip ? [data.tip] : []);
          setHasMore(false);
        }
      } catch {
        // error
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [router]
  );

  // 북마크 로드
  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tips/bookmarks");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setBookmarkedTips(data.tips ?? []);
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === "latest") {
      setPage(1);
      loadLatestTips(1);
    } else {
      loadBookmarks();
    }
  }, [activeTab, loadLatestTips, loadBookmarks]);

  // 북마크 토글
  const handleToggleBookmark = async (tipId: string) => {
    try {
      const res = await fetch("/api/tips/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId }),
      });

      if (!res.ok) return;

      const { bookmarked } = await res.json();

      // 최신 팁 목록 업데이트
      setLatestTips((prev) => prev.map((t) => (t.id === tipId ? { ...t, isBookmarked: bookmarked } : t)));

      // 북마크 목록 업데이트
      if (!bookmarked) {
        setBookmarkedTips((prev) => prev.filter((t) => t.id !== tipId));
      } else {
        // 북마크 추가 시: 최신 팁에서 해당 팁 찾아 추가
        const tip = latestTips.find((t) => t.id === tipId);
        if (tip) {
          setBookmarkedTips((prev) => [{ ...tip, isBookmarked: true }, ...prev]);
        }
      }
    } catch {
      // error
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadLatestTips(nextPage, true);
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">오늘의 한줄 팁</h1>
        <p className="text-xs text-gray-500">매일 새로운 개발 팁을 확인하세요</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-cyan-500/15 text-cyan-400"
                : "bg-gray-900/50 text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : activeTab === "latest" ? (
        <>
          {latestTips.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
              <span className="text-4xl">💡</span>
              <p className="text-sm">아직 등록된 팁이 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {latestTips.map((tip) => (
                <DailyTipCard key={tip.id} tip={tip} onToggleBookmark={handleToggleBookmark} />
              ))}

              {/* 더보기 버튼 */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="rounded-xl border border-gray-800 bg-gray-900/30 py-3 text-sm font-semibold text-gray-400 transition-colors hover:border-gray-700 hover:text-gray-300 disabled:opacity-40"
                >
                  {isLoadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <TipBookmarkList tips={bookmarkedTips} onToggleBookmark={handleToggleBookmark} />
      )}
    </div>
  );
}
