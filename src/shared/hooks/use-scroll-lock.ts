"use client";

import { useLayoutEffect, useRef } from "react";

interface UseScrollLockOptions {
  /**
   * body에 추가할 클래스 이름
   */
  className?: string;
}

/**
 * 스크롤 잠금 훅
 * 모달이나 사이드메뉴가 열릴 때 배경 스크롤을 막고 레이아웃 시프트를 방지합니다.
 *
 * @param isLocked - 스크롤을 잠글지 여부
 * @param options - 옵션 (className: body에 추가할 클래스 이름)
 * @param isDialog - 다이얼로그 여부 (true면 스크롤 잠금을 적용하지 않음)
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * useScrollLock(isOpen, { className: "dialog-open" });
 * ```
 */
export const useScrollLock = (isLocked: boolean, options?: UseScrollLockOptions, isDialog?: boolean) => {
  const scrollYRef = useRef<number>(0);
  const scrollRatioRef = useRef<number>(0);
  const hasLockedRef = useRef<boolean>(false); // 스크롤 잠금을 한 번이라도 실행했는지 추적
  const { className } = options || {};

  useLayoutEffect(() => {
    if (isDialog) {
      return;
    }
    if (isLocked) {
      // 다른 스크롤 잠금이 활성화되어 있는지 확인 (사이드메뉴 등)
      const hasOtherScrollLock = document.body.classList.contains("side-menu-open");

      // 다른 스크롤 잠금이 없을 때만 스크롤 잠금 적용
      if (!hasOtherScrollLock) {
        // 현재 스크롤 위치와 비율 저장 (가장 먼저!)
        const scrollY = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const maxScroll = scrollHeight - clientHeight;

        scrollYRef.current = scrollY;
        // 스크롤 위치를 비율로 저장 (전체 스크롤 가능한 높이 대비)
        scrollRatioRef.current = maxScroll > 0 ? scrollY / maxScroll : 0;
        hasLockedRef.current = true; // 스크롤 잠금을 실행했음을 기록

        // 실제로 스크롤이 있는지 확인
        const hasScroll = maxScroll > 0;

        // scrollbar-gutter: stable이 적용되어 있는지 확인
        const htmlElement = document.documentElement;
        const computedStyle = window.getComputedStyle(htmlElement);
        const hasScrollbarGutter = computedStyle.scrollbarGutter === "stable";

        // scrollbar-gutter가 있고 실제 스크롤도 있을 때만 임시로 제거 (나중에 복원용)
        if (hasScrollbarGutter && hasScroll) {
          htmlElement.setAttribute("data-original-scrollbar-gutter", htmlElement.style.scrollbarGutter || "stable");
          htmlElement.style.scrollbarGutter = "";
        }

        // 스크롤바 너비 계산 (overflow: hidden 적용 전에)
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // 스크롤바 너비를 CSS 변수로 설정
        if (scrollbarWidth > 0) {
          document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
        }

        // body에 클래스 추가
        if (className) {
          document.body.classList.add(className);
        }

        // padding-right를 직접 적용하여 레이아웃 시프트 방지
        // - scrollbar-gutter가 없는 경우: 항상 padding 추가
        // - scrollbar-gutter가 있고 스크롤도 있는 경우: gutter를 제거했으므로 padding 추가
        // - scrollbar-gutter가 있지만 스크롤 없는 경우: gutter가 이미 공간 확보하므로 padding 추가 안 함
        if (scrollbarWidth > 0 && (!hasScrollbarGutter || hasScroll)) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // 스크롤 위치 유지를 위해 body에 position: fixed와 top 적용
        // padding이 적용된 후에 position: fixed를 적용하여 레이아웃 시프트 방지
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.left = "0";
        document.body.style.right = "0";

        // overflow: hidden은 마지막에 적용
        document.documentElement.style.setProperty("overflow", "hidden", "important");
      } else {
        // 다른 스크롤 잠금이 있으면 클래스만 추가 (스타일은 적용하지 않음)
        if (className) {
          document.body.classList.add(className);
        }
      }
    } else {
      // 다른 스크롤 잠금이 활성화되어 있는지 확인 (사이드메뉴 등)
      const hasOtherScrollLock = document.body.classList.contains("side-menu-open");

      // 다른 스크롤 잠금이 없을 때만 스크롤 잠금 해제
      if (!hasOtherScrollLock) {
        // 닫을 때 모든 스타일 초기화
        if (className) {
          document.body.classList.remove(className);
        }
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        document.body.style.removeProperty("width");
        document.body.style.removeProperty("left");
        document.body.style.removeProperty("right");
        document.body.style.removeProperty("padding-right");
        document.documentElement.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("--scrollbar-width");

        // scrollbar-gutter 복원 (저장된 값이 있으면)
        const htmlElement = document.documentElement;
        const originalScrollbarGutter = htmlElement.getAttribute("data-original-scrollbar-gutter");
        if (originalScrollbarGutter) {
          htmlElement.style.scrollbarGutter = originalScrollbarGutter;
          htmlElement.removeAttribute("data-original-scrollbar-gutter");
        }

        // 원래 스크롤 위치로 복원 (비율 기반)
        // 단, 스크롤 잠금을 한 번이라도 실행한 경우에만 복원
        if (hasLockedRef.current) {
          // 스타일이 제거된 후 DOM이 업데이트될 때까지 기다린 후 스크롤 복원
          // 단일 requestAnimationFrame으로 변경하여 딜레이 감소
          requestAnimationFrame(() => {
            const newScrollHeight = document.documentElement.scrollHeight;
            const newClientHeight = document.documentElement.clientHeight;
            const newMaxScroll = newScrollHeight - newClientHeight;
            const restoredScrollY = scrollRatioRef.current * newMaxScroll;
            window.scrollTo(0, restoredScrollY);

            // 스크롤 복원 후 플래그 리셋 (다음 번에는 다시 저장부터 시작)
            hasLockedRef.current = false;
          });
        }
      } else {
        // 다른 스크롤 잠금이 있으면 클래스만 제거 (스타일은 유지)
        if (className) {
          document.body.classList.remove(className);
        }
      }
    }

    // cleanup: 컴포넌트 언마운트 시 스크롤 잠금 해제
    // 주의: cleanup 함수는 이전 effect의 cleanup이므로,
    // isLocked가 false로 변경될 때도 실행됩니다 (의존성 배열의 값이 변경될 때)
    return () => {
      // cleanup은 항상 실행되어 스크롤 잠금 해제 (언마운트 시 또는 의존성 변경 시)
      // 다른 스크롤 잠금이 활성화되어 있는지 확인 (사이드메뉴 등)
      const hasOtherScrollLock = document.body.classList.contains("side-menu-open");

      // 다른 스크롤 잠금이 없을 때만 스크롤 잠금 해제
      if (!hasOtherScrollLock) {
        if (className) {
          document.body.classList.remove(className);
        }
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        document.body.style.removeProperty("width");
        document.body.style.removeProperty("left");
        document.body.style.removeProperty("right");
        document.body.style.removeProperty("padding-right");
        document.documentElement.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("--scrollbar-width");

        // scrollbar-gutter 복원 (저장된 값이 있으면)
        const htmlElement = document.documentElement;
        const originalScrollbarGutter = htmlElement.getAttribute("data-original-scrollbar-gutter");
        if (originalScrollbarGutter) {
          htmlElement.style.scrollbarGutter = originalScrollbarGutter;
          htmlElement.removeAttribute("data-original-scrollbar-gutter");
        }

        // 원래 스크롤 위치로 복원 (비율 기반)
        // 단, 스크롤 잠금을 한 번이라도 실행한 경우에만 복원
        if (hasLockedRef.current) {
          // 단일 requestAnimationFrame으로 변경하여 딜레이 감소
          requestAnimationFrame(() => {
            const newScrollHeight = document.documentElement.scrollHeight;
            const newClientHeight = document.documentElement.clientHeight;
            const newMaxScroll = newScrollHeight - newClientHeight;
            const restoredScrollY = scrollRatioRef.current * newMaxScroll;
            window.scrollTo(0, restoredScrollY);
          });

          // 스크롤 복원 후 플래그 리셋 (다음 번에는 다시 저장부터 시작)
          hasLockedRef.current = false;
        }
      } else {
        // 다른 스크롤 잠금이 있으면 클래스만 제거 (스타일은 유지)
        if (className) {
          document.body.classList.remove(className);
        }
      }
    };
  }, [isLocked, className, isDialog]);
};
