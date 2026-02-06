// use-media-query.ts
import { useEffect, useState } from "react";

// 브레이크포인트 타입 정의
type BreakpointKey = "detail-mobile" | "detail-desktop" | "xs" | "sm" | "md" | "lg";

interface BreakpointRange {
  min: string;
  max?: string;
}

interface Breakpoints {
  [key: string]: BreakpointRange;
}

// 실제 브레이크포인트 구성
const breakpoints: Breakpoints = {
  "detail-mobile": { min: "0px", max: "1365px" },
  "detail-desktop": { min: "1366px" },
  event: { min: "600px", max: "715px" },
  xs: { min: "0px", max: "599px" },
  sm: { min: "600px", max: "991px" },
  md: { min: "992px", max: "1199px" },
  lg: { min: "1200px" },
};

// 미디어 쿼리 결과 타입
interface MediaQueryState {
  isDetailMobile: boolean;
  isDetailDesktop: boolean;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isEvent: boolean;
  currentBreakpoint: BreakpointKey | null;
}

// 미디어 쿼리 문자열 생성 함수 (훅 외부로 이동하여 초기값 계산에서도 사용)
const createMediaQueryString = (range: BreakpointRange): string => {
  const minQuery = range.min ? `(min-width: ${range.min})` : "";
  const maxQuery = range.max ? `(max-width: ${range.max})` : "";

  if (minQuery && maxQuery) {
    return `${minQuery} and ${maxQuery}`;
  }

  return minQuery || maxQuery;
};

// 초기 상태 계산 함수 (첫 렌더링 시 레이아웃 시프트 방지)
const getInitialState = (): MediaQueryState => {
  // SSR 환경 체크
  if (typeof window === "undefined") {
    return {
      isDetailMobile: false,
      isDetailDesktop: false,
      isXs: false,
      isSm: false,
      isMd: false,
      isLg: false,
      isEvent: false,
      currentBreakpoint: null,
    };
  }

  // CSR: window.matchMedia로 즉시 계산
  const isDetailMobile = window.matchMedia(createMediaQueryString(breakpoints["detail-mobile"])).matches;
  const isDetailDesktop = window.matchMedia(createMediaQueryString(breakpoints["detail-desktop"])).matches;
  const isXs = window.matchMedia(createMediaQueryString(breakpoints["xs"])).matches;
  const isSm = window.matchMedia(createMediaQueryString(breakpoints["sm"])).matches;
  const isMd = window.matchMedia(createMediaQueryString(breakpoints["md"])).matches;
  const isLg = window.matchMedia(createMediaQueryString(breakpoints["lg"])).matches;
  const isEvent = window.matchMedia(createMediaQueryString(breakpoints["event"])).matches;

  // 현재 브레이크포인트 결정
  let currentBreakpoint: BreakpointKey | null = null;

  if (isDetailMobile) currentBreakpoint = "detail-mobile";
  else if (isDetailDesktop) currentBreakpoint = "detail-desktop";
  else if (isXs) currentBreakpoint = "xs";
  else if (isSm) currentBreakpoint = "sm";
  else if (isMd) currentBreakpoint = "md";
  else if (isLg) currentBreakpoint = "lg";

  return {
    isDetailMobile,
    isDetailDesktop,
    isXs,
    isSm,
    isMd,
    isLg,
    isEvent,
    currentBreakpoint,
  };
};

/**
 * 커스텀 미디어 쿼리 훅
 * @returns 현재 활성화된 미디어 쿼리 상태
 */
export function useMediaQuery(): MediaQueryState {
  // 미디어 쿼리 상태 관리 (초기값을 동기적으로 계산하여 레이아웃 시프트 방지)
  const [mediaQueryState, setMediaQueryState] = useState<MediaQueryState>(getInitialState);

  useEffect(() => {
    // 미디어 쿼리 객체 생성
    const detailMobileQuery = window.matchMedia(createMediaQueryString(breakpoints["detail-mobile"]));
    const detailDesktopQuery = window.matchMedia(createMediaQueryString(breakpoints["detail-desktop"]));
    const xsQuery = window.matchMedia(createMediaQueryString(breakpoints["xs"]));
    const smQuery = window.matchMedia(createMediaQueryString(breakpoints["sm"]));
    const mdQuery = window.matchMedia(createMediaQueryString(breakpoints["md"]));
    const lgQuery = window.matchMedia(createMediaQueryString(breakpoints["lg"]));
    const eventQuery = window.matchMedia(createMediaQueryString(breakpoints["event"]));
    // 상태 업데이트 함수
    const updateMediaQueries = (): void => {
      const isDetailMobile = detailMobileQuery.matches;
      const isDetailDesktop = detailDesktopQuery.matches;
      const isXs = xsQuery.matches;
      const isSm = smQuery.matches;
      const isMd = mdQuery.matches;
      const isLg = lgQuery.matches;
      const isEvent = eventQuery.matches;
      // 현재 브레이크포인트 결정
      let currentBreakpoint: BreakpointKey | null = null;

      if (isDetailMobile) currentBreakpoint = "detail-mobile";
      else if (isDetailDesktop) currentBreakpoint = "detail-desktop";
      else if (isXs) currentBreakpoint = "xs";
      else if (isSm) currentBreakpoint = "sm";
      else if (isMd) currentBreakpoint = "md";
      else if (isLg) currentBreakpoint = "lg";

      setMediaQueryState({
        isDetailMobile,
        isDetailDesktop,
        isXs,
        isSm,
        isMd,
        isLg,
        isEvent,
        currentBreakpoint,
      });
    };

    // 미디어 쿼리 리스너 등록
    const queries = [detailMobileQuery, detailDesktopQuery, xsQuery, smQuery, mdQuery, lgQuery, eventQuery];

    queries.forEach((query) => {
      // 모던 브라우저용 이벤트 리스너
      if (query.addEventListener) {
        query.addEventListener("change", updateMediaQueries);
      }
      // 레거시 브라우저 지원
      else {
        query.addListener(updateMediaQueries);
      }
    });

    // 클린업 함수
    return () => {
      queries.forEach((query) => {
        if (query.removeEventListener) {
          query.removeEventListener("change", updateMediaQueries);
        } else {
          query.removeListener(updateMediaQueries);
        }
      });
    };
  }, []);

  // 상태 객체를 직접 반환 (useState가 이미 최적화되어 있음)
  return mediaQueryState;
}
