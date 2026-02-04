# Hooks 폴더 구조 규칙

📍 **위치**: [홈](../00-README.md) > [아키텍처](../02-architecture/) > Hooks 폴더 구조

---

## 구조 원칙

`features`, `shared` 내의 비즈니스 기능 단위 폴더에서 hooks는 다음과 같이 분리합니다:

> **참고**:
>
> - **features**의 모든 기능 단위 폴더(auth, chat, post, sidebar 등)는 `api/`, `hooks/`, `components/`, `types/`, `utils/`, `constants/` 등의 폴더 구조를 가질 수 있습니다.
> - 예: `features/auth/hooks/`, `features/chat/components/`, `features/sidebar/actions/` 등

```
hooks/
├── query/              # TanStack Query의 useQuery, useSuspenseQuery 등
│   ├── use-posts-query.ts
│   ├── use-post-query.ts
│   └── index.ts
├── mutation/           # TanStack Query의 useMutation 등
│   ├── use-create-post-mutation.ts
│   ├── use-update-post-mutation.ts
│   └── index.ts
├── use-post-form.ts    # 일반 커스텀 훅 (TanStack Query와 무관)
├── use-post-filter.ts
└── index.ts            # 모든 훅을 re-export
```

---

## 분류 기준

### Query 훅 (`hooks/query/`)

데이터 조회용 훅

- `useQuery`, `useSuspenseQuery`, `useInfiniteQuery` 등을 사용하는 훅
- 예: `useCurrentUserProfileQuery`

### Mutation 훅 (`hooks/mutation/`)

데이터 변경용 훅

- `useMutation`을 사용하는 훅
- 예: `useSaveTermsAgreementMutation`, `useDeleteChatSessionMutation`, `useWithdrawMutation`

### 일반 훅 (`hooks/` 루트)

TanStack Query와 무관한 커스텀 훅

- 폼 관리, 필터링, UI 상태 관리 등
- 예: `useChatSetting`, `useConditionalLayout`

---

## Export 패턴

```typescript
// features/auth/hooks/index.ts - 모든 훅을 통합 export
export * from "@/features/auth/hooks/query";
export * from "@/features/auth/hooks/mutation";

// features/auth/hooks/query/index.ts
export { useCurrentUserProfileQuery } from "@/features/auth/hooks/query/use-current-user-profile-query";

// features/auth/hooks/mutation/index.ts
export { useSaveTermsAgreementMutation } from "@/features/auth/hooks/mutation/use-save-terms-agreement-mutation";
export { useSaveChatHistoryMutation } from "@/features/auth/hooks/mutation/use-save-chat-history-mutation";
export { useWithdrawMutation } from "@/features/auth/hooks/mutation/use-withdraw-mutation";

// features/sidebar/hooks/index.ts - 일반 훅만 있는 경우
export { useChatSetting } from "@/features/sidebar/hooks/use-chat-setting";
export { useConditionalLayout } from "@/features/sidebar/hooks/use-conditional-layout";
```

---

## 사용 예시

```typescript
// ✅ 올바른 import - 직접 경로
import { useCurrentUserProfileQuery } from "@/features/auth/hooks/query/use-current-user-profile-query";
import { useSaveTermsAgreementMutation } from "@/features/auth/hooks/mutation/use-save-terms-agreement-mutation";
import { useDeleteChatSessionMutation } from "@/features/chat/hooks/mutation/use-delete-chat-session-mutation";

// ✅ 올바른 import - index.ts를 통한 import (권장)
import { useCurrentUserProfileQuery, useSaveTermsAgreementMutation } from "@/features/auth/hooks";
import { useDeleteChatSessionMutation } from "@/features/chat/hooks";

// ✅ sidebar의 일반 훅 패턴
import { useChatSetting, useConditionalLayout } from "@/features/sidebar/hooks";
```

---

**관련 문서**:

- [폴더 구조](./폴더-구조.md)
- [TanStack Query 네이밍](../03-naming-conventions/TanStack-Query-네이밍.md)
- [복사용 템플릿](../01-onboarding/복사용-템플릿.md)

**최종 업데이트**: 2026년 2월 4일
