# TanStack Query 네이밍 규칙

📍 **위치**: [홈](../00-README.md) > [네이밍 규칙](../03-naming-conventions/) > TanStack Query 네이밍

---

## Query/Mutation 훅 네이밍: `use + 엔티티 + 조건 + Query/Mutation`

### Query 훅 (조회)

```typescript
// features/auth/hooks/query/
export const useCurrentUserProfileQuery = () => { ... }

// features/post/hooks/query/
export const usePostsQuery = (params: GetPostsRequest) => { ... }
export const usePostQuery = (id: string) => { ... }

// features/chat/hooks/query/
export const useChatSessionsQuery = () => { ... }
export const useChatSessionQuery = (id: string) => { ... }
```

### Mutation 훅 (변경)

```typescript
// features/auth/hooks/mutation/
export const useSaveTermsAgreementMutation = () => { ... }
export const useSaveChatHistoryMutation = () => { ... }
export const useWithdrawMutation = () => { ... }

// features/chat/hooks/mutation/
export const useDeleteChatSessionMutation = () => { ... }
export const useSendChatMessageMutation = () => { ... }

// features/post/hooks/mutation/
export const useCreatePostMutation = () => { ... }
export const useUpdatePostMutation = () => { ... }
export const useDeletePostMutation = () => { ... }
```

---

## Query Keys

> ⚠️ **중요**: 모든 Query Keys는 `shared/constants/query-keys.constant.ts`에 통합 관리

### Query Keys 구조

```typescript
// shared/constants/query-keys.constant.ts

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export const chatKeys = {
  all: ["chat"] as const,
  sessions: () => [...chatKeys.all, "sessions"] as const,
  session: (id: string) => [...chatKeys.sessions(), id] as const,
};

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (page: number) => [...postKeys.lists(), page] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
```

### Query Keys 사용 예시

```typescript
// features/post/hooks/query/use-posts-query.ts
import { useQuery } from "@tanstack/react-query";
import { postKeys } from "@/shared/constants/query-keys.constant";
import { getPosts } from "@/features/post/api";

export const usePostsQuery = (page: number) => {
  return useQuery({
    queryKey: postKeys.list(page),
    queryFn: () => getPosts({ page }),
  });
};

// features/post/hooks/query/use-post-query.ts
import { useQuery } from "@tanstack/react-query";
import { postKeys } from "@/shared/constants/query-keys.constant";
import { getPostById } from "@/features/post/api";

export const usePostQuery = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
};
```

---

## 폴더 구조

```
features/[도메인]/hooks/
├── query/                           # useQuery 훅
│   ├── use-[entity]-query.ts
│   ├── use-[entities]-query.ts
│   └── index.ts
├── mutation/                        # useMutation 훅
│   ├── use-create-[entity]-mutation.ts
│   ├── use-update-[entity]-mutation.ts
│   ├── use-delete-[entity]-mutation.ts
│   └── index.ts
└── index.ts                         # 모든 훅 re-export
```

---

## 네이밍 패턴 요약

### Query 훅 (조회)

| 용도             | 패턴                             | 예시                         |
| ---------------- | -------------------------------- | ---------------------------- |
| 목록 조회        | `use + 엔티티(복수) + Query`     | `usePostsQuery`              |
| 단일 조회        | `use + 엔티티(단수) + Query`     | `usePostQuery`               |
| 현재 사용자/세션 | `use + Current + 엔티티 + Query` | `useCurrentUserProfileQuery` |

### Mutation 훅 (변경)

| 용도 | 패턴                               | 예시                            |
| ---- | ---------------------------------- | ------------------------------- |
| 생성 | `use + Create + 엔티티 + Mutation` | `useCreatePostMutation`         |
| 수정 | `use + Update + 엔티티 + Mutation` | `useUpdatePostMutation`         |
| 삭제 | `use + Delete + 엔티티 + Mutation` | `useDeletePostMutation`         |
| 저장 | `use + Save + 엔티티 + Mutation`   | `useSaveTermsAgreementMutation` |
| 전송 | `use + Send + 엔티티 + Mutation`   | `useSendChatMessageMutation`    |

---

**관련 문서**:

- [API 네이밍](./API-네이밍.md)
- [Hooks 폴더 구조](../02-architecture/Hooks-폴더-구조.md)
- [복사용 템플릿](../01-onboarding/복사용-템플릿.md)

**최종 업데이트**: 2026년 2월 4일
