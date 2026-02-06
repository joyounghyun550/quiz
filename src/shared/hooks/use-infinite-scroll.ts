"use client";

import { useEffect, useRef } from "react";

import type { UseInfiniteScrollParams } from "./use-infinite-scroll.type";

/**
 * 무한 스크롤 훅
 * @param fetchNextPage - 다음 페이지를 가져오는 함수
 * @param hasNextPage - 다음 페이지가 있는지 여부
 * @param isFetchingNextPage - 다음 페이지를 가져오는 중인지 여부
 * @param enabled - 무한 스크롤 활성화 여부
 */
export const useInfiniteScroll = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  enabled = true,
}: UseInfiniteScrollParams) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 마지막 요소가 뷰포트에 들어왔고, 다음 페이지가 있고, 로딩 중이 아닐 때
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1, // 10% 보이면 트리거
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return observerTarget;
};
