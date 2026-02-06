/**
 * 쿠키 설정
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param days 만료일 (기본값: 365일, null이면 세션 쿠키)
 */
export const setCookie = (name: string, value: string, days: number | null = 365): void => {
  let cookieString = `${name}=${value}; path=/; SameSite=Lax`;

  // 현재 프로토콜이 HTTPS인지 확인
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";

  if (isSecure) {
    cookieString += "; Secure";
  }

  if (days !== null) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }
  // days가 null이면 세션 쿠키 (만료 시간 없음)

  document.cookie = cookieString;
};

/**
 * 쿠키 읽기
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

/**
 * 쿠키 삭제
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * 모든 인증 관련 쿠키 삭제
 */
export const deleteAllAuthCookies = (): void => {
  deleteCookie("webAccessToken");
  deleteCookie("webUserInfo");
};

/**
 * 유저 정보 타입 (쿠키에 저장할 정보)
 * userId는 userInfo에 포함되어 별도 쿠키로 저장하지 않음
 */
export type UserInfoCookie = {
  id: string; // userId (API 응답의 id 필드)
  email: string;
  name: string;
  profileImageUrl: string;
  provider: string;
  phoneNumber: string | null;
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  isMarketingAgreed: boolean;
};

/**
 * 유저 정보를 쿠키에 저장
 */
export const setUserInfoCookie = (userInfo: UserInfoCookie, days: number | null = 365): void => {
  const jsonString = JSON.stringify(userInfo);
  // 한글 및 특수문자 처리를 위해 URL 인코딩
  const encodedValue = encodeURIComponent(jsonString);
  setCookie("webUserInfo", encodedValue, days);
};

/**
 * 쿠키에서 유저 정보 조회
 */
export const getUserInfoCookie = (): UserInfoCookie | null => {
  const cookieValue = getCookie("webUserInfo");
  if (!cookieValue) return null;

  try {
    // URL 디코딩 후 JSON 파싱
    const decodedValue = decodeURIComponent(cookieValue);
    return JSON.parse(decodedValue) as UserInfoCookie;
  } catch (error) {
    console.error("유저 정보 쿠키 파싱 실패:", error);
    return null;
  }
};
