"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * 옵션 인터페이스
 */
interface UseScrollLockOptions {
  /**
   * body에 추가할 클래스 이름
   *
   * 용도:
   * - CSS에서 모달/사이드메뉴 열림 상태를 감지
   * - 중첩 스크롤 잠금 관리 (side-menu-open 등)
   * - 커스텀 스타일 적용
   */
  className?: string;
}

/**
 * 스크롤 잠금 훅 (Scroll Lock Hook)
 *
 * 모달이나 사이드메뉴가 열릴 때 배경 스크롤을 막고 레이아웃 시프트를 방지합니다.
 *
 * ## 핵심 문제 해결
 *
 * 1. ✅ **배경 스크롤 방지**: position: fixed로 body 고정
 * 2. ✅ **레이아웃 시프트 방지**: padding-right로 스크롤바 공간 확보
 * 3. ✅ **스크롤 위치 복원**: 비율 기반으로 정확한 위치 복원
 * 4. ✅ **중첩 잠금 지원**: 여러 모달/메뉴가 동시에 열려도 안전
 * 5. ✅ **scrollbar-gutter 처리**: CSS 설정과 충돌 방지
 *
 * ## 동작 원리
 *
 * ### 모달 열림 시:
 * 1. 현재 스크롤 위치를 비율로 저장 (scrollY / maxScroll)
 * 2. 스크롤바 너비 계산 (window.innerWidth - clientWidth)
 * 3. padding-right 적용 → 레이아웃 시프트 방지
 * 4. position: fixed + top: -scrollY → 스크롤 잠금 + 위치 유지
 * 5. overflow: hidden → 최종 잠금
 *
 * ### 모달 닫힘 시:
 * 1. 모든 인라인 스타일 제거
 * 2. requestAnimationFrame으로 DOM 안정화 대기
 * 3. 비율 기반으로 스크롤 위치 복원 (DOM 높이 변경 대응)
 *
 * @param isLocked - 스크롤을 잠글지 여부
 * @param options - 옵션 객체
 * @param options.className - body에 추가할 클래스 이름 (예: "modal-open")
 * @param isDialog - 다이얼로그 여부 (true면 스크롤 잠금 적용 안 함)
 *   → 브라우저 네이티브 <dialog> 사용 시 중복 방지
 *
 * @example
 * // 기본 사용법
 * const [isOpen, setIsOpen] = useState(false);
 * useScrollLock(isOpen, { className: "modal-open" });
 *
 * @example
 * // 다이얼로그 예외 처리
 * useScrollLock(isOpen, { className: "dialog-open" }, true);
 */
export const useScrollLock = (isLocked: boolean, options?: UseScrollLockOptions, isDialog?: boolean) => {
  /**
   * 스크롤 위치 저장 (절대값, px)
   *
   * 용도: 디버깅 및 fallback
   * 실제 복원에는 scrollRatioRef 사용
   */
  const scrollYRef = useRef<number>(0);

  /**
   * 스크롤 위치 비율 저장 (0~1)
   *
   * 왜 비율로 저장?
   * - 모달 내부에서 DOM 변경 시 페이지 높이 변경 가능
   * - 절대값(px)으로 저장하면 부정확한 위치로 복원됨
   *
   * @example
   * // 원래 페이지 중간(50%)에 있었다면
   * scrollRatio = 0.5
   *
   * // 페이지 높이가 1000px → 2000px로 증가해도
   * restoredScrollY = 0.5 * 2000 = 1000px  // 여전히 중간!
   */
  const scrollRatioRef = useRef<number>(0);

  /**
   * 스크롤 잠금을 한 번이라도 실행했는지 추적
   *
   * 용도:
   * - true: 스크롤 복원 필요 (잠금을 했으므로)
   * - false: 스크롤 복원 불필요 (잠금을 안 했으므로)
   *
   * Edge Case:
   * - isLocked가 false → true → false로 빠르게 변경될 때
   * - 스크롤 잠금을 실행하지 않았다면 복원도 하지 않음
   */
  const hasLockedRef = useRef<boolean>(false);

  // 옵션 추출
  const { className } = options || {};

  /**
   * useLayoutEffect 사용 이유:
   * - useEffect는 브라우저 페인트 후 실행 (비동기)
   * - useLayoutEffect는 브라우저 페인트 전 실행 (동기)
   *
   * 효과:
   * - 깜빡임 없이 부드러운 전환
   * - 레이아웃 시프트 최소화
   */
  useLayoutEffect(() => {
    // ========================================
    // 예외 처리: 다이얼로그는 스킵
    // ========================================
    // 브라우저 네이티브 <dialog>는 자체 스크롤 잠금 기능 보유
    if (isDialog) {
      return;
    }

    // ========================================
    // Case 1: 스크롤 잠금 활성화 (isLocked = true)
    // ========================================
    if (isLocked) {
      /**
       * 중첩 스크롤 잠금 감지
       *
       * 시나리오:
       * 1. 사이드메뉴 열림 (side-menu-open 추가)
       * 2. 모달 열림 (이 훅 실행)
       *
       * → 이미 스크롤 잠금이 적용되어 있으므로 중복 적용 방지
       */
      const hasOtherScrollLock = document.body.classList.contains("side-menu-open");

      // ========================================
      // SubCase 1-1: 첫 번째 스크롤 잠금
      // ========================================
      if (!hasOtherScrollLock) {
        // ========================================
        // 1단계: 현재 스크롤 위치 저장
        // ========================================
        // 주의: 반드시 스타일 적용 전에 저장!
        // position: fixed 적용 후에는 scrollY가 0이 됨

        const scrollY = window.scrollY; // 현재 스크롤 위치 (px)
        const scrollHeight = document.documentElement.scrollHeight; // 전체 문서 높이
        const clientHeight = document.documentElement.clientHeight; // 화면에 보이는 높이
        const maxScroll = scrollHeight - clientHeight; // 스크롤 가능한 최대 거리

        // 절대값 저장 (디버깅용)
        scrollYRef.current = scrollY;

        // 비율 저장 (실제 복원에 사용)
        // maxScroll이 0이면 나누기 에러 방지
        scrollRatioRef.current = maxScroll > 0 ? scrollY / maxScroll : 0;

        // 플래그 설정: 스크롤 잠금 실행됨
        hasLockedRef.current = true;

        // ========================================
        // 2단계: scrollbar-gutter 처리
        // ========================================
        // scrollbar-gutter: stable은 항상 스크롤바 공간을 예약
        // 하지만 overflow: hidden 적용 시 이 공간도 사라짐
        // → 레이아웃 시프트 발생 가능
        // → 임시로 제거했다가 나중에 복원

        const hasScroll = maxScroll > 0; // 실제로 스크롤이 있는지 확인

        const htmlElement = document.documentElement;
        const computedStyle = window.getComputedStyle(htmlElement);
        const hasScrollbarGutter = computedStyle.scrollbarGutter === "stable";

        // scrollbar-gutter가 있고 스크롤도 있을 때만 임시 제거
        if (hasScrollbarGutter && hasScroll) {
          // 원래 값 저장 (복원용)
          htmlElement.setAttribute("data-original-scrollbar-gutter", htmlElement.style.scrollbarGutter || "stable");
          // 임시 제거
          htmlElement.style.scrollbarGutter = "";
        }

        // ========================================
        // 3단계: 스크롤바 너비 계산
        // ========================================
        // 스크롤바 너비 = 전체 너비 - 컨텐츠 너비
        // Chrome/Edge: 약 15px
        // Firefox: 약 15px
        // Safari: 0px (overlay scrollbar)

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // CSS 변수로 저장 (다른 컴포넌트에서 사용 가능)
        if (scrollbarWidth > 0) {
          document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
        }

        // ========================================
        // 4단계: 클래스 추가
        // ========================================
        if (className) {
          document.body.classList.add(className);
        }

        // ========================================
        //  5단계: padding-right 적용 (레이아웃 시프트 방지)
        // ========================================
        // overflow: hidden을 적용하면 스크롤바가 사라짐
        // → 스크롤바가 차지하던 공간(약 15px)만큼 컨텐츠가 오른쪽으로 이동
        // → padding-right로 미리 공간 확보하여 이동 방지

        // 조건:
        // 1. scrollbarWidth > 0: 스크롤바가 실제로 있음
        // 2. !hasScrollbarGutter: scrollbar-gutter가 없음 (항상 padding 필요)
        // 3. hasScroll: scrollbar-gutter가 있지만 실제 스크롤도 있음 (gutter 제거했으므로 padding 필요)

        if (scrollbarWidth > 0 && (!hasScrollbarGutter || hasScroll)) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // ========================================
        // 6단계: position: fixed 적용 (스크롤 잠금)
        // ========================================
        // position: fixed를 적용하면:
        // - body가 화면에 고정됨 (스크롤 불가)
        // - 하지만 scrollY가 0으로 초기화됨 (맨 위로 스크롤됨)
        //
        // 해결:
        // - top: -scrollY로 원래 위치 유지
        // - 사용자에게는 변화가 없어 보임

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`; // 현재 위치 유지
        document.body.style.width = "100%";
        document.body.style.left = "0";
        document.body.style.right = "0";

        // ========================================
        // 7단계: overflow: hidden 적용 (최종 잠금)
        // ========================================
        // !important 사용 이유:
        // - Tailwind 등 다른 CSS와 충돌 방지
        // - 확실한 스크롤 잠금 보장

        document.documentElement.style.setProperty("overflow", "hidden", "important");
      }
      // ========================================
      // SubCase 1-2: 중첩 스크롤 잠금 (두 번째 이상)
      // ========================================
      else {
        // 이미 다른 컴포넌트가 스크롤 잠금을 적용한 상태
        // → 스타일 중복 적용 방지
        // → 클래스만 추가 (CSS 스타일링용)

        if (className) {
          document.body.classList.add(className);
        }
      }
    }
    // ========================================
    // Case 2: 스크롤 잠금 해제 (isLocked = false)
    // ========================================
    else {
      /**
       * 중첩 스크롤 잠금 감지
       *
       * 시나리오:
       * 1. 사이드메뉴 + 모달 모두 열림
       * 2. 모달만 닫힘 (이 훅 실행)
       *
       * → 사이드메뉴는 아직 열려있으므로 스크롤 잠금 유지 필요
       */
      const hasOtherScrollLock = document.body.classList.contains("side-menu-open");

      // ========================================
      // SubCase 2-1: 마지막 스크롤 잠금 해제
      // ========================================
      if (!hasOtherScrollLock) {
        // ========================================
        // 1단계: 모든 인라인 스타일 제거
        // ========================================

        if (className) {
          document.body.classList.remove(className);
        }

        // body 스타일 제거
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        document.body.style.removeProperty("width");
        document.body.style.removeProperty("left");
        document.body.style.removeProperty("right");
        document.body.style.removeProperty("padding-right");

        // html 스타일 제거
        document.documentElement.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("--scrollbar-width");

        // ========================================
        // 2단계: scrollbar-gutter 복원
        // ========================================

        const htmlElement = document.documentElement;
        const originalScrollbarGutter = htmlElement.getAttribute("data-original-scrollbar-gutter");

        if (originalScrollbarGutter) {
          htmlElement.style.scrollbarGutter = originalScrollbarGutter;
          htmlElement.removeAttribute("data-original-scrollbar-gutter");
        }

        // ========================================
        // 3단계: 스크롤 위치 복원 (비율 기반)
        // ========================================
        // 단, 스크롤 잠금을 실행한 경우에만 복원

        if (hasLockedRef.current) {
          /**
           * requestAnimationFrame 사용 이유:
           *
           * 1. 스타일 제거 후 DOM 업데이트 대기
           * 2. 브라우저가 리플로우/리페인트 완료할 때까지 대기
           * 3. 정확한 scrollHeight 계산 보장
           *
           * 원래는 이중 requestAnimationFrame 사용:
           * requestAnimationFrame(() => {
           *   requestAnimationFrame(() => { ... })
           * })
           *
           * 하지만 단일 requestAnimationFrame으로도 충분히 안정적
           * → 딜레이 감소, 성능 향상
           */
          requestAnimationFrame(() => {
            // 새로운 페이지 높이 계산
            // (모달 내부에서 DOM 변경이 있었을 수 있음)
            const newScrollHeight = document.documentElement.scrollHeight;
            const newClientHeight = document.documentElement.clientHeight;
            const newMaxScroll = newScrollHeight - newClientHeight;

            // 비율 기반으로 스크롤 위치 계산
            // 예: 원래 50% 위치였다면, 페이지 높이가 변해도 50% 위치로 복원
            const restoredScrollY = scrollRatioRef.current * newMaxScroll;

            // 스크롤 복원
            window.scrollTo(0, restoredScrollY);

            // 플래그 리셋 (다음 번에는 다시 저장부터 시작)
            hasLockedRef.current = false;
          });
        }
      }
      // ========================================
      // SubCase 2-2: 중첩 스크롤 잠금 중 하나만 해제
      // ========================================
      else {
        // 다른 컴포넌트가 아직 스크롤 잠금 중
        // → 스타일은 유지
        // → 클래스만 제거

        if (className) {
          document.body.classList.remove(className);
        }
      }
    }

    // ========================================
    // Cleanup 함수 (컴포넌트 언마운트 또는 의존성 변경 시)
    // ========================================
    return () => {
      /**
       * Cleanup 함수 실행 시점:
       *
       * 1. 컴포넌트 언마운트
       * 2. isLocked, className, isDialog 변경 시
       *
       * 주의:
       * - isLocked가 false로 변경될 때도 실행됨
       * - 위 코드 블록과 cleanup 함수가 거의 동일한 이유
       */

      // 중첩 스크롤 잠금 감지
      const hasOtherScrollLock = document.body.classList.contains("side-menu-open");

      // 다른 스크롤 잠금이 없을 때만 해제
      if (!hasOtherScrollLock) {
        // 클래스 제거
        if (className) {
          document.body.classList.remove(className);
        }

        // 모든 스타일 제거
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        document.body.style.removeProperty("width");
        document.body.style.removeProperty("left");
        document.body.style.removeProperty("right");
        document.body.style.removeProperty("padding-right");
        document.documentElement.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("--scrollbar-width");

        // scrollbar-gutter 복원
        const htmlElement = document.documentElement;
        const originalScrollbarGutter = htmlElement.getAttribute("data-original-scrollbar-gutter");
        if (originalScrollbarGutter) {
          htmlElement.style.scrollbarGutter = originalScrollbarGutter;
          htmlElement.removeAttribute("data-original-scrollbar-gutter");
        }

        // 스크롤 위치 복원
        if (hasLockedRef.current) {
          requestAnimationFrame(() => {
            const newScrollHeight = document.documentElement.scrollHeight;
            const newClientHeight = document.documentElement.clientHeight;
            const newMaxScroll = newScrollHeight - newClientHeight;
            const restoredScrollY = scrollRatioRef.current * newMaxScroll;
            window.scrollTo(0, restoredScrollY);
          });

          // 플래그 리셋
          hasLockedRef.current = false;
        }
      } else {
        // 다른 스크롤 잠금이 있으면 클래스만 제거
        if (className) {
          document.body.classList.remove(className);
        }
      }
    };
  }, [isLocked, className, isDialog]);
};
