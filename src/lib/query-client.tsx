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
