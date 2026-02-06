/**
 * API 엔드포인트 상수 정의
 *
 * - 환경별 기본 URL을 통일된 형태로 가공합니다.
 * - 화면/도메인에서 필요한 REST 경로를 한 곳에 모아 재사용성을 높입니다.
 */

/**
 * 환경 변수에서 API 베이스 URL을 읽어옵니다.
 * - Next.js 환경 변수(`NEXT_PUBLIC_API_BASE_URL`)는 빌드 타임에 인라인 되므로 존재 여부를 반드시 확인합니다.
 */
const envApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!envApiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다.");
}

/**
 * API 기본 URL을 계산합니다.
 * - 상대 경로(`api/v1`)로 전달되면 절대 경로(`/api/v1`)로 변환합니다.
 * - 절대 경로(`/api/v1`)로 전달되면 그대로 사용합니다.
 * - 절대 URL(https://...)이면 그대로 사용합니다.
 */
const API_BASE_URL = envApiBaseUrl.startsWith("http")
  ? envApiBaseUrl // 절대 URL (https://...)
  : envApiBaseUrl.startsWith("/")
    ? envApiBaseUrl // 이미 절대 경로 (/api/v1)
    : `/${envApiBaseUrl}`; // 상대 경로를 절대 경로로 변환 (api/v1 → /api/v1)

/**
 * 서비스 전반에서 사용하는 REST 엔드포인트 모음입니다.
 * - UI 코드에서는 하드코딩 대신 `API_ENDPOINTS`를 이용해 URL을 구성합니다.
 * - 경로 변경 시 한 곳에서 수정할 수 있습니다.
 */
export const API_ENDPOINTS = {
  // 예시
  AUTH: {
    SOCIAL: {
      KAKAO: "/auth/kakao",
      APPLE: "/auth/apple",
      NAVER: "/auth/naver",
      GOOGLE: "/auth/google",
    },
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },
  USER: {
    TERMS: "/users/me/terms",
    SETTINGS: "/users/me/settings",
    CHAT_HISTORY_SETTING: "/users/me/settings/chat-history",
    WITHDRAWAL: "/users/me",
  },
} as const;

export const API_BASE_URL_CONST = API_BASE_URL;
