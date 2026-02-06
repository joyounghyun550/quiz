import { cookies } from "next/headers";

import type { UserInfoCookie } from "@/shared/utils/cookie.util";

/**
 * 사이드바 크기 타입 (shared 레이어에서 features를 import할 수 없으므로 직접 정의)
 */
type SideBarSize = "default" | "small";

/**
 * 사이드바 타입 (shared 레이어에서 features를 import할 수 없으므로 직접 정의)
 */
type SideBarVariant = "default" | "guest" | "settings1" | "settings2" | "chatSetting";

/**
 * 서버 사이드에서 쿠키 읽기
 * Next.js 14 App Router의 cookies() 함수 사용
 */
export const getCookieServer = (name: string): string | null => {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value || null;
};

/**
 * 서버 사이드에서 유저 정보 쿠키 읽기
 */
export const getUserInfoCookieServer = (): UserInfoCookie | null => {
  const cookieValue = getCookieServer("webUserInfo");
  if (!cookieValue) return null;

  try {
    // Next.js cookies()는 자동으로 디코딩하지만, 안전하게 처리
    // 이미 디코딩된 값이거나 인코딩된 값일 수 있으므로 try-catch로 처리
    let decodedValue = cookieValue;
    try {
      // URL 디코딩 시도 (인코딩된 경우)
      decodedValue = decodeURIComponent(cookieValue);
    } catch {
      // 이미 디코딩된 경우 그대로 사용
      decodedValue = cookieValue;
    }
    return JSON.parse(decodedValue) as UserInfoCookie;
  } catch (error) {
    console.error("유저 정보 쿠키 파싱 실패:", error);
    return null;
  }
};

/**
 * 서버 사이드에서 사이드바 크기 쿠키 읽기
 */
export const getSidebarSizeCookieServer = (): SideBarSize => {
  const cookieValue = getCookieServer("sidebarSize");
  // 유효한 값인지 확인
  if (cookieValue === "default" || cookieValue === "small") {
    return cookieValue;
  }
  // 기본값 반환
  return "small";
};

/**
 * 서버 사이드에서 사이드바 타입 쿠키 읽기
 */
export const getSidebarTypeCookieServer = (): SideBarVariant | null => {
  const cookieValue = getCookieServer("sidebarType");
  // 유효한 값인지 확인
  if (
    cookieValue === "default" ||
    cookieValue === "guest" ||
    cookieValue === "settings1" ||
    cookieValue === "settings2" ||
    cookieValue === "chatSetting"
  ) {
    return cookieValue;
  }
  // 기본값 반환
  return null;
};
