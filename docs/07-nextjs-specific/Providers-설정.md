# Providers 설정

📍 **위치**: [홈](../00-README.md) > [Next.js 특화](../07-nextjs-specific/) > Providers 설정

---

## Providers.tsx

````tsx
// providers/Providers.tsx
"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "@/libs/query-client";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * 전역 Provider 통합 컴포넌트
 *
 * 모든 Provider를 한 곳에서 관리합니다.
 * UI 라이브러리에 따라 ThemeProvider 등을 추가하세요.
 *
 * @example
 * ```tsx
 * // shadcn/ui 사용 시
 * import { ThemeProvider } from "next-themes";
 *
 * // Chakra UI 사용 시
 * import { ChakraProvider } from "@chakra-ui/react";
 * ```
 */
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryProvider>
      {/* UI 라이브러리의 Provider를 여기에 추가 */}
      {/* 예: <ThemeProvider>, <ChakraProvider> 등 */}
      {children}
      <Toaster /> {/* 토스트 알림 */}
    </QueryProvider>
  );
};
````

---

## QueryProvider (TanStack Query)

```tsx
// libs/query-client.tsx
"use client";

import { ReactNode } from "react";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";

declare global {
  interface Window {
    queryClient?: QueryClient;
  }
}

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5분
        refetchOnWindowFocus: false, // 창 포커스 시 재요청 비활성화
        retry: false, // 실패 시 재시도 하지 않음
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();

    // 전역에서 접근 가능하도록 window 객체에 추가
    if (typeof window !== "undefined") {
      window.queryClient = browserQueryClient;
    }

    return browserQueryClient;
  }
};

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
```

---

## layout.tsx에서 사용

```tsx
// app/layout.tsx
import { Providers } from "@/providers/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

**관련 문서**:

- [Zustand 스토어 규칙](../08-state-management/Zustand-스토어-규칙.md)
- [TanStack Query 사용법](../08-state-management/TanStack-Query-사용법.md)

**최종 업데이트**: 2026년 2월 4일
