# TanStack Query 사용법

📍 **위치**: [홈](../00-README.md) > [상태 관리](../08-state-management/) > TanStack Query 사용법

---

## 개요

TanStack Query는 서버 상태 관리를 위한 라이브러리입니다. API 데이터 페칭, 캐싱, 동기화를 자동으로 처리합니다.

---

## 기본 사용법

### useQuery - 데이터 조회

```tsx
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/libs/axios";

const usePostsQuery = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axiosInstance.get("/posts");
      return response.data;
    },
  });
};

// 사용
const { data, isLoading, error } = usePostsQuery();
```

### useMutation - 데이터 변경

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/libs/axios";

const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await axiosInstance.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      // 성공 시 posts 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// 사용
const { mutate, isPending } = useDeletePostMutation();
mutate("post-id-123");
```

---

## Query Key 네이밍 규칙

```typescript
// ✅ 권장 패턴
queryKey: ["posts"]; // 목록
queryKey: ["posts", postId]; // 단일 항목
queryKey: ["posts", { status: "published" }]; // 필터링된 목록
queryKey: ["users", userId, "posts"]; // 관계형 데이터

// ❌ 피해야 할 패턴
queryKey: ["getPostsData"]; // 동사 사용 지양
queryKey: ["post-list"]; // kebab-case 지양
```

---

## 훅 네이밍 규칙

| 타입        | 네이밍 패턴                    | 예시                                            |
| ----------- | ------------------------------ | ----------------------------------------------- |
| Query 훅    | `use + 대상 + Query`           | `usePostsQuery`, `useUserProfileQuery`          |
| Mutation 훅 | `use + 동작 + 대상 + Mutation` | `useDeletePostMutation`, `useSaveTermsMutation` |

---

## 파일 구조

```
features/
└── post/
    └── hooks/
        ├── query/
        │   ├── use-posts-query.ts
        │   ├── use-post-detail-query.ts
        │   └── index.ts
        ├── mutation/
        │   ├── use-create-post-mutation.ts
        │   ├── use-delete-post-mutation.ts
        │   └── index.ts
        └── index.ts
```

---

## 실전 예시

### Query 훅

````typescript
// features/post/hooks/query/use-posts-query.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/features/post/api";
import type { Post } from "@/features/post/api/post.api.type";

/**
 * 게시글 목록을 조회하는 Query 훅
 *
 * @param filter - 필터 옵션 (선택)
 * @returns 게시글 목록과 로딩/에러 상태
 *
 * @example
 * ```tsx
 * const { data: posts, isLoading } = usePostsQuery({ status: "published" });
 * ```
 */
export const usePostsQuery = (filter?: { status?: string }) => {
  return useQuery({
    queryKey: ["posts", filter],
    queryFn: () => getPosts(filter),
  });
};
````

### Mutation 훅

````typescript
// features/post/hooks/mutation/use-delete-post-mutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "@/features/post/api";
import { toast } from "sonner";

/**
 * 게시글을 삭제하는 Mutation 훅
 *
 * @returns mutate 함수와 로딩/에러 상태
 *
 * @example
 * ```tsx
 * const { mutate: deletePost, isPending } = useDeletePostMutation();
 * deletePost("post-id-123");
 * ```
 */
export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("게시글이 삭제되었습니다");
    },
    onError: (error) => {
      toast.error("삭제에 실패했습니다");
      console.error("Delete post error:", error);
    },
  });
};
````

---

## Zustand vs TanStack Query 선택 기준

| 상태 유형                | 사용할 도구              | 예시                            |
| ------------------------ | ------------------------ | ------------------------------- |
| **서버 상태**            | TanStack Query           | API 데이터, 사용자 정보         |
| **클라이언트 상태**      | Zustand                  | UI 상태, 폼 상태, 사이드바 열림 |
| **전역 상태 + API 연동** | Zustand + TanStack Query | 복잡한 상태 관리                |

### 서버 상태 (TanStack Query)

```typescript
// 서버에서 가져온 데이터
const { data: posts } = usePostsQuery();
const { data: user } = useUserProfileQuery();
```

### 클라이언트 상태 (Zustand)

```typescript
// 클라이언트에서만 사용하는 UI 상태
const { isOpen, toggle } = useSidebarStore();
const { theme, setTheme } = useThemeStore();
```

---

## QueryClient 설정

```tsx
// libs/query-client.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
```

---

## 주의사항

| 항목                | 설명                                  |
| ------------------- | ------------------------------------- |
| `'use client'` 필수 | TanStack Query 훅을 사용하는 컴포넌트 |
| Query Key 일관성    | 동일한 데이터는 동일한 Query Key 사용 |
| 캐시 무효화         | Mutation 성공 후 관련 Query 무효화    |
| 에러 처리           | `onError` 콜백에서 사용자 피드백 제공 |

---

**관련 문서**:

- [Zustand 스토어 규칙](./Zustand-스토어-규칙.md)
- [TanStack Query 네이밍](../03-naming-conventions/TanStack-Query-네이밍.md)
- [Providers 설정](../07-nextjs-specific/Providers-설정.md)

**최종 업데이트**: 2026년 2월 4일
