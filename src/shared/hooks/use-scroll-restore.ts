"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 스크롤 복원 훅의 파라미터 타입
 */
export type UseScrollRestoreParams = {
  /** sessionStorage에 저장된 스크롤 위치의 키 */
  sessionStorageKey: string;
  /** 무한 스크롤 데이터 (데이터가 준비되었는지 확인용) */
  infiniteData: unknown;
  /** 모바일 아이템 배열 (데이터가 준비되었는지 확인용) */
  mobileItems: unknown[];
  /** 모바일 환경 여부 */
  isXs: boolean;
};

/**
 * 스크롤 복원 훅
 * 뒤로가기 시 이전 스크롤 위치를 복원합니다.
 * 모바일 환경에서만 작동하며, 깜빡임 방지를 위해 복원 중에는 화면을 숨깁니다.
 *
 * @param params - 스크롤 복원 파라미터
 * @returns isRestoringScroll - 스크롤 복원 중인지 여부 (화면 숨김용)
 */
export const useScrollRestore = ({
  sessionStorageKey,
  infiniteData,
  mobileItems,
  isXs,
}: UseScrollRestoreParams): boolean => {
  // 스크롤 복원이 이미 실행되었는지 추적
  const hasRestoredScroll = useRef(false);

  // 스크롤 복원 중인지 여부 (화면 숨김용)
  // 초기 렌더링 시 sessionStorage를 확인하여 스크롤 복원이 필요한 경우 즉시 화면 숨김
  const [isRestoringScroll, setIsRestoringScroll] = useState(() => {
    if (typeof window !== "undefined") {
      return !!sessionStorage.getItem(sessionStorageKey);
    }
    return false;
  });

  // 모바일이 아닐 때는 화면 숨김 해제
  useEffect(() => {
    if (!isXs && isRestoringScroll) {
      setIsRestoringScroll(false);
    }
  }, [isXs, isRestoringScroll]);

  // 뒤로가기 시 스크롤 위치 복원 (모바일 환경에서만)
  useEffect(() => {
    // 모바일 환경이 아닐 때는 스크롤 복원하지 않음
    if (!isXs) return;

    // 이미 복원했으면 다시 실행하지 않음
    if (hasRestoredScroll.current) return;

    // 데이터가 로드되지 않았으면 스크롤 복원하지 않음
    if (!infiniteData || !Array.isArray(mobileItems) || mobileItems.length === 0) return;

    // sessionStorage에서 저장된 스크롤 위치 가져오기
    const savedScrollPosition = sessionStorage.getItem(sessionStorageKey);

    if (savedScrollPosition) {
      // 화면은 이미 초기 state에서 숨겨져 있음 (깜빡임 방지)

      // DOM이 완전히 렌더링된 후 스크롤 위치 복원
      // requestAnimationFrame을 여러 번 사용하여 레이아웃이 완전히 완료된 후 실행
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: Number(savedScrollPosition),
              behavior: "instant" as ScrollBehavior,
            });
            // 복원 후 저장된 값 삭제 (다음 방문 시에는 초기화)
            sessionStorage.removeItem(sessionStorageKey);
            hasRestoredScroll.current = true;

            // 스크롤 복원 완료 - 화면 표시
            // 약간의 지연을 주어 스크롤이 완전히 적용된 후 화면을 보이게 함
            requestAnimationFrame(() => {
              setIsRestoringScroll(false);
            });
          });
        });
      });
    }
  }, [isXs, infiniteData, mobileItems, sessionStorageKey]);

  // 페이지를 떠날 때 복원 플래그 리셋
  useEffect(() => {
    return () => {
      hasRestoredScroll.current = false;
    };
  }, []);

  return isRestoringScroll;
};
