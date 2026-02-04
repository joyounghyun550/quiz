# TSDoc 작성 규칙

📍 **위치**: [홈](../00-README.md) > [문서화](../05-documentation/) > TSDoc 작성 규칙

---

## 핵심 원칙

> **모든 export된 요소(컴포넌트, 함수, 훅, 타입)는 반드시 TSDoc 주석을 작성해야 합니다.**
>
> - import 시 호버로 사용법을 즉시 파악할 수 있어야 함
> - 처음 코드를 보는 개발자도 쉽게 이해할 수 있어야 함
> - Props의 의미, 필수/옵션 여부, 기본값이 명확해야 함

---

## 주석 작성 레벨

프로젝트에서는 다음 3가지 레벨의 주석을 사용합니다:

| 레벨                      | 적용 대상       | 포함 내용                    |
| ------------------------- | --------------- | ---------------------------- |
| **Level 1 (필수)**        | 모든 export     | 최소한의 설명                |
| **Level 2 (권장)**        | 대부분의 export | @param, @returns 추가        |
| **Level 3 (복잡한 경우)** | 복잡한 로직     | @example, @throws, @see 추가 |

---

## 1. 컴포넌트 TSDoc 작성 규칙

모든 컴포넌트는 다음 형식의 TSDoc을 작성합니다:

````typescript
/**
 * 컴포넌트의 한 줄 요약 설명
 *
 * 컴포넌트의 상세한 설명. 이 컴포넌트가 하는 일,
 * 어떤 상황에서 사용되는지, 주요 기능은 무엇인지 설명합니다.
 *
 * ## 주요 기능 (선택적)
 * - 기능 1
 * - 기능 2
 *
 * ## 사용 시 주의사항 (필요시)
 * - 주의사항 1
 * - 주의사항 2
 *
 * @param props - 컴포넌트 Props
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={true} />
 * ```
 *
 * @see {@link ComponentNameProps} Props 타입 정의
 */
````

### 실제 예시

````typescript
// features/auth/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SolidPrimary } from "@itandsy/react-common";
import type { LoginFormProps } from "@/features/auth/components/LoginForm.type";

/**
 * 로그인 폼 컴포넌트
 *
 * 소셜 로그인 (구글, 카카오, 네이버)을 제공하는 폼입니다.
 * OAuth 2.0 방식으로 인증 서버로 리다이렉트합니다.
 *
 * ## 주요 기능
 * - 구글, 카카오, 네이버 소셜 로그인
 * - 로딩 상태 표시
 * - 로그인 성공 시 콜백 실행
 *
 * @param props - LoginFormProps
 *
 * @example
 * ```tsx
 * <LoginForm onSuccess={() => router.push('/dashboard')} />
 * ```
 *
 * @see {@link LoginFormProps}
 */
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (provider: "google" | "kakao" | "naver") => {
    setIsLoading(true);
    // 로그인 로직
  };

  return (
    <div className="flex flex-col gap-3">
      <SolidPrimary label="구글로 로그인" onClick={() => handleLogin("google")} disabled={isLoading} />
      <SolidPrimary label="카카오로 로그인" onClick={() => handleLogin("kakao")} disabled={isLoading} />
      <SolidPrimary label="네이버로 로그인" onClick={() => handleLogin("naver")} disabled={isLoading} />
    </div>
  );
};

export default LoginForm;
````

---

## 2. Props 타입 TSDoc 작성 규칙

Props 타입의 각 필드는 다음을 명확히 설명해야 합니다:

- **무엇을 하는가** (용도)
- **필수인가 옵션인가** (`?` 표시)
- **기본값이 있는가** (`@default` 태그)
- **어떻게 사용하는가** (필요시 `@example`)

````typescript
/**
 * ComponentName 컴포넌트의 Props 타입
 */
export type ComponentNameProps = {
  /**
   * Props 필드 설명
   * 추가 설명이 필요한 경우 여러 줄로 작성합니다.
   *
   * @default 기본값 (옵션인 경우)
   *
   * @example
   * ```tsx
   * <Component field="example" />
   * ```
   */
  field: string;

  /**
   * 옵션 필드 설명
   * 옵션 필드는 ? 표시와 함께 기본값을 명시합니다.
   *
   * @default false
   */
  optionalField?: boolean;

  /**
   * 콜백 함수 설명
   * 언제 호출되는지, 무엇을 전달받는지 설명합니다.
   *
   * @param param - 콜백 파라미터 설명
   *
   * @example
   * ```tsx
   * <Component onAction={(data) => console.log(data)} />
   * ```
   */
  onAction?: (param: string) => void;
};
````

### 실제 예시

````typescript
// features/auth/components/LoginForm.type.ts

/**
 * LoginForm 컴포넌트의 Props 타입
 */
export type LoginFormProps = {
  /**
   * 로그인 성공 시 호출되는 콜백 함수
   * 사용자 프로필 조회 및 리다이렉트가 완료된 후 호출됩니다.
   *
   * @example
   * ```tsx
   * <LoginForm onSuccess={() => {
   *   console.log('로그인 성공!');
   *   router.push('/dashboard');
   * }} />
   * ```
   */
  onSuccess?: () => void;

  /**
   * 로그인 버튼 비활성화 여부
   * true인 경우 모든 소셜 로그인 버튼이 비활성화됩니다.
   *
   * @default false
   */
  disabled?: boolean;
};
````

---

## 3. 훅(Hook) TSDoc 작성 규칙

커스텀 훅은 다음을 명확히 설명해야 합니다:

- **용도** (무엇을 하는가)
- **주요 기능** (어떤 기능을 제공하는가)
- **파라미터** (`@param`)
- **반환값** (`@returns` - 각 필드별로)
- **사용 예시** (`@example`)
- **관련 타입** (`@see`)

````typescript
/**
 * 훅의 한 줄 요약
 *
 * 상세한 설명. 이 훅이 무엇을 하는지, 언제 사용하는지,
 * 내부적으로 어떤 로직을 처리하는지 설명합니다.
 *
 * ## 주요 기능
 * - 기능 1
 * - 기능 2
 *
 * @param param1 - 파라미터 설명
 * @param param2 - 파라미터 설명
 *
 * @returns 반환값 설명
 * @returns field1 - 반환값 필드 1 설명
 * @returns field2 - 반환값 필드 2 설명
 *
 * @example
 * ```tsx
 * const { field1, field2 } = useCustomHook(param1, param2);
 * ```
 *
 * @see {@link RelatedType}
 */
````

### 실제 예시

````typescript
// shared/hooks/use-debounce.ts
"use client";

import { useState, useEffect } from "react";

/**
 * 값의 변경을 지연시키는 디바운스 훅
 *
 * 빠르게 변하는 값(검색어 입력 등)을 지연 처리하여
 * 불필요한 API 호출이나 리렌더링을 방지합니다.
 *
 * ## 주요 기능
 * - 지정된 시간 동안 값 변경을 지연
 * - 지연 시간 내 새 값이 들어오면 타이머 리셋
 * - 제네릭 타입 지원으로 모든 타입의 값에 사용 가능
 *
 * ## 동작 방식
 * 1. value가 변경되면 타이머 시작
 * 2. delay 시간 동안 새 value가 없으면 debouncedValue 업데이트
 * 3. delay 시간 내 새 value가 들어오면 타이머 리셋
 *
 * @typeParam T - 디바운스할 값의 타입
 * @param value - 디바운스할 원본 값
 * @param delay - 지연 시간 (밀리초, 기본값: 500ms)
 *
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * // debouncedSearchTerm이 변경될 때만 API 호출
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchApi(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 *
 * return (
 *   <input
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     placeholder="검색어 입력..."
 *   />
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
````

---

## 4. API 함수 TSDoc 작성 규칙

API 함수는 다음을 명확히 설명해야 합니다:

- **용도** (무엇을 하는가)
- **파라미터** (`@param`)
- **반환값** (`@returns`)
- **발생 가능한 에러** (`@throws`)
- **사용 예시** (`@example`)

````typescript
/**
 * API 함수의 한 줄 요약
 *
 * 상세한 설명. 어떤 엔드포인트를 호출하는지,
 * 인증이 필요한지, 어떤 데이터를 주고받는지 설명합니다.
 *
 * @param param - 파라미터 설명
 *
 * @returns 반환값 설명
 *
 * @throws {AxiosError} 에러 코드 - 에러 설명
 * @throws {AxiosError} 에러 코드 - 에러 설명
 *
 * @example
 * ```typescript
 * try {
 *   const result = await apiFunction(param);
 *   console.log(result);
 * } catch (error) {
 *   if (error.response?.status === 401) {
 *     // 에러 처리
 *   }
 * }
 * ```
 *
 * @see {@link RequestType}
 * @see {@link ResponseType}
 */
````

### 실제 예시

````typescript
// features/auth/api/auth.api.ts
import { axiosInstance } from "@/libs/axios";
import type { UserProfile, SaveTermsAgreementRequest } from "@/features/auth/api/auth.api.type";

/**
 * 현재 로그인된 사용자의 프로필을 조회합니다
 *
 * 서버에서 인증 토큰을 확인하여 사용자 정보를 반환합니다.
 * 쿠키에 저장된 webAccessToken을 자동으로 사용하며,
 * 토큰이 없거나 만료된 경우 401 에러가 발생합니다.
 *
 * @returns 사용자 프로필 정보 (ID, 이름, 이메일, 약관 동의 여부 등)
 *
 * @throws {AxiosError} 401 - 인증 토큰이 없거나 만료됨
 * @throws {AxiosError} 500 - 서버 내부 에러
 *
 * @example
 * ```typescript
 * try {
 *   const profile = await getCurrentUserProfile();
 *   console.log(profile.name);
 *
 *   if (!profile.isTermsAgreed) {
 *     // 약관 동의 페이지로 이동
 *     router.push('/terms');
 *   }
 * } catch (error) {
 *   if (error.response?.status === 401) {
 *     // 로그인 페이지로 리다이렉트
 *     router.push('/login');
 *   }
 * }
 * ```
 *
 * @see {@link UserProfile}
 */
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get("/api/user/profile");
  return response.data;
};

/**
 * 사용자의 약관 동의를 저장합니다
 *
 * 회원가입 또는 약관 업데이트 시 사용자의 동의 여부를 서버에 저장합니다.
 * 필수 약관에 동의하지 않으면 400 에러가 발생합니다.
 *
 * @param data - 약관 동의 정보
 * @param data.termsAgreed - 이용약관 동의 여부 (필수)
 * @param data.privacyAgreed - 개인정보 처리방침 동의 여부 (필수)
 * @param data.marketingAgreed - 마케팅 정보 수신 동의 여부 (선택)
 *
 * @returns 저장 성공 여부 (void)
 *
 * @throws {AxiosError} 400 - 필수 약관에 동의하지 않음
 * @throws {AxiosError} 401 - 인증되지 않음
 * @throws {AxiosError} 500 - 서버 내부 에러
 *
 * @example
 * ```typescript
 * try {
 *   await saveTermsAgreement({
 *     termsAgreed: true,
 *     privacyAgreed: true,
 *     marketingAgreed: false
 *   });
 *
 *   console.log('약관 동의 저장 완료');
 *   router.push('/dashboard');
 * } catch (error) {
 *   if (error.response?.status === 400) {
 *     alert('필수 약관에 동의해주세요');
 *   }
 * }
 * ```
 *
 * @see {@link SaveTermsAgreementRequest}
 */
export const saveTermsAgreement = async (data: SaveTermsAgreementRequest): Promise<void> => {
  await axiosInstance.post("/api/user/terms", data);
};
````

---

## 5. 유틸리티 함수 TSDoc 작성 규칙

유틸리티 함수는 간결하되 명확한 설명이 필요합니다:

````typescript
/**
 * 함수의 한 줄 요약
 *
 * 상세한 설명 (필요시)
 *
 * @param param - 파라미터 설명
 *
 * @returns 반환값 설명
 *
 * @example
 * ```typescript
 * const result = utilFunction(param);
 * ```
 */
````

### 실제 예시

````typescript
// shared/utils/cn.util.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스명을 병합하는 유틸리티 함수
 *
 * clsx와 tailwind-merge를 결합하여 조건부 클래스명과
 * 중복 클래스명을 자동으로 처리합니다.
 * 동일한 속성의 클래스가 중복되면 마지막 값이 적용됩니다.
 *
 * @param inputs - 병합할 클래스명 배열 (문자열, 객체, 배열, undefined 허용)
 *
 * @returns 병합되고 최적화된 클래스명 문자열
 *
 * @example
 * ```typescript
 * // 기본 사용
 * cn('px-4 py-2', 'bg-blue-500')
 * // => "px-4 py-2 bg-blue-500"
 *
 * // 조건부 클래스
 * cn('px-4 py-2', isActive && 'bg-blue-500', { 'text-white': isActive })
 * // => "px-4 py-2 bg-blue-500 text-white" (isActive가 true일 때)
 *
 * // 중복 클래스 병합 (마지막 값 적용)
 * cn('px-4 py-2', 'px-6')
 * // => "py-2 px-6"
 * ```
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
````

````typescript
// shared/utils/string.util.ts

/**
 * 문자열을 지정된 길이로 자르고 말줄임표를 추가합니다
 *
 * 텍스트가 최대 길이를 초과하면 잘라내고 '...'을 추가합니다.
 * UI에서 긴 텍스트를 표시할 때 사용됩니다.
 *
 * @param text - 원본 문자열
 * @param maxLength - 최대 길이 (말줄임표 포함)
 * @param suffix - 말줄임 문자 (기본값: '...')
 *
 * @returns 잘린 문자열
 *
 * @example
 * ```typescript
 * truncate("Hello World", 8);      // "Hello..."
 * truncate("Short", 10);           // "Short"
 * truncate("긴 텍스트입니다", 6);   // "긴 텍..."
 * ```
 */
export const truncate = (text: string, maxLength: number, suffix: string = "..."): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};
````

---

## TSDoc 태그 참조

| 태그         | 용도             | 예시                              |
| ------------ | ---------------- | --------------------------------- |
| `@param`     | 파라미터 설명    | `@param value - 입력값`           |
| `@returns`   | 반환값 설명      | `@returns 변환된 문자열`          |
| `@throws`    | 발생 가능한 에러 | `@throws {Error} 401 - 인증 실패` |
| `@example`   | 사용 예시        | 코드 블록으로 예시 제공           |
| `@see`       | 관련 참조        | `@see {@link UserProfile}`        |
| `@default`   | 기본값           | `@default false`                  |
| `@typeParam` | 제네릭 타입 설명 | `@typeParam T - 데이터 타입`      |

---

**관련 문서**:

- [주석 작성 원칙](./주석-작성-원칙.md)
- [컴포넌트 구조](../06-code-style/컴포넌트-구조.md)
- [타입 작성 규칙](../04-type-system/타입-작성-규칙.md)

**최종 업데이트**: 2026년 2월 4일
