# Hybrid FSD-Lite 기반 Next.js 14 + TypeScript 프로젝트 코드 컨벤션

> Next.js 14.2.35 App Router + TypeScript + TanStack Query + Zustand + Tailwind CSS 환경

---

## 📁 폴더 구조

```
src/
├── app/                          # App Router 라우팅 (파일 시스템 기반)
│   ├── layout.tsx               # 전역 루트 레이아웃
│   ├── page.tsx                 # 홈페이지 (/)
│   ├── globals.css              # 전역 스타일
│   │
│   ├── (main)/                  # 라우트 그룹 - 헤더/푸터 포함
│   │   ├── layout.tsx           # 메인 레이아웃 (헤더/푸터)
│   │   ├── community/
│   │   │   ├── page.tsx         # /community
│   │   │   └── [id]/
│   │   │       └── page.tsx     # /community/[id]
│   │   ├── profile/
│   │   │   └── page.tsx         # /profile
│   │   └── about/
│   │       └── page.tsx         # /about
│   │
│   ├── (fullscreen)/            # 라우트 그룹 - 헤더/푸터 없음
│   │   ├── layout.tsx           # 전체화면 레이아웃
│   │   ├── calendar/
│   │   │   └── page.tsx         # /calendar
│   │   └── editor/
│   │       └── page.tsx         # /editor
│   │
│   └── api/                     # API Routes (선택적)
│       └── health/
│           └── route.ts
│
├── features/                     # 비즈니스 기능 단위
│   ├── post/
│   │   ├── api/
│   │   │   ├── post.api.ts
│   │   │   ├── post.api.type.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── query/                    # Query 훅
│   │   │   │   ├── use-posts-query.ts
│   │   │   │   ├── use-post-query.ts
│   │   │   │   └── index.ts
│   │   │   ├── mutation/                 # Mutation 훅
│   │   │   │   ├── use-create-post-mutation.ts
│   │   │   │   ├── use-update-post-mutation.ts
│   │   │   │   ├── use-delete-post-mutation.ts
│   │   │   │   └── index.ts
│   │   │   ├── use-post-form.ts          # 일반 훅 (루트에 직접)
│   │   │   ├── use-post-filter.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostCard.type.ts
│   │   │   ├── PostList.tsx
│   │   │   └── index.ts
│   │   ├── constants/                # Feature 전용 상수 (필요시)
│   │   │   ├── post.constant.ts
│   │   │   └── index.ts
│   │   ├── utils/                    # Feature 전용 유틸리티 (필요시)
│   │   │   ├── post.util.ts
│   │   │   └── index.ts
│   │   ├── store/                    # Feature 전용 스토어 (선택적)
│   │   │   ├── post.store.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── post.type.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── comment/
│   ├── auth/
│   └── like/
│
├── widgets/                      # 복합 기능 위젯 (features 조합)
│   ├── post-with-comments/
│   │   ├── api/                  # 위젯 전용 API (필요시)
│   │   │   ├── post-with-comments.api.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── query/
│   │   │   │   └── index.ts
│   │   │   ├── mutation/
│   │   │   │   └── index.ts
│   │   │   ├── use-post-with-comments.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── PostWithComments.tsx
│   │   │   ├── PostWithComments.type.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── post-with-comments.type.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── top-navigation/
│       ├── hooks/
│       │   ├── query/
│       │   ├── mutation/
│       │   ├── use-top-navigation-handlers.ts
│       │   └── index.ts
│       ├── components/
│       │   ├── TopNavigation.tsx
│       │   ├── TopNavigation.type.ts
│       │   └── index.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
│
├── shared/                       # 공유 리소스
│   ├── ui/                       # 공통 UI 컴포넌트
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.type.ts
│   │   │   └── index.ts
│   │   ├── input/
│   │   ├── card/
│   │   └── index.ts
│   │
│   ├── hooks/                    # 공통 커스텀 훅
│   │   ├── query/                # Query 훅 (필요시)
│   │   │   └── index.ts
│   │   ├── mutation/             # Mutation 훅 (필요시)
│   │   │   └── index.ts
│   │   ├── use-debounce.ts       # 일반 훅 (루트에 직접)
│   │   ├── use-intersection-observer.ts
│   │   └── index.ts
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   ├── format.util.ts
│   │   ├── validation.util.ts
│   │   ├── date.util.ts
│   │   └── index.ts
│   │
│   ├── constants/                # 공통 상수
│   │   ├── routes.constant.ts
│   │   ├── api.constant.ts
│   │   ├── query-keys.constant.ts  # 모든 Query Keys는 여기에 통합 관리
│   │   └── index.ts
│   │
│   │   ⚠️ **주의**: features 내 constants는 중복되는 경우 shared/constants에 작성
│   │   (리팩토링 시 shared로 이동 예정)
│   │
│   └── types/                    # 공통 타입
│       ├── common.type.ts
│       └── index.ts
│
├── layouts/                      # 레이아웃 컴포넌트 (선택적, app/layout.tsx에서 사용)
│   ├── main-layout/
│   │   ├── MainLayout.tsx       # 헤더/푸터 포함 레이아웃
│   │   └── index.ts
│   ├── fullscreen-layout/
│   │   ├── FullscreenLayout.tsx # 전체화면 레이아웃
│   │   └── index.ts
│   └── components/              # 레이아웃 전용 컴포넌트
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── index.ts
│
├── providers/                    # React Context Providers
│   ├── AppProviders.tsx         # 모든 Provider 통합
│   ├── QueryProvider.tsx        # TanStack Query Provider
│   ├── ThemeProvider.tsx        # 테마 Provider (선택적)
│   └── index.ts
│
├── lib/                          # 외부 라이브러리 설정
│   ├── query-client.ts
│   ├── axios.ts
│   └── index.ts
│
└── stores/                       # 글로벌 Zustand 스토어
    ├── ui.store.ts
    ├── theme.store.ts
    └── index.ts
```

---

## 🎯 App Router 레이아웃 구조

### 1. 전역 루트 레이아웃 (app/layout.tsx)

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "My Next.js App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

### 2. 메인 레이아웃 - 헤더/푸터 포함 (app/(main)/layout.tsx)

```tsx
// app/(main)/layout.tsx
import { MainLayout } from "@/layouts/main-layout";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
```

```tsx
// layouts/main-layout/MainLayout.tsx
import { Header } from "@/layouts/components/Header";
import { Footer } from "@/layouts/components/Footer";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
```

### 3. 전체화면 레이아웃 - 헤더/푸터 없음 (app/(fullscreen)/layout.tsx)

```tsx
// app/(fullscreen)/layout.tsx
import { FullscreenLayout } from "@/layouts/fullscreen-layout";

export default function FullscreenLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <FullscreenLayout>{children}</FullscreenLayout>;
}
```

```tsx
// layouts/fullscreen-layout/FullscreenLayout.tsx
export const FullscreenLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-screen w-full">{children}</div>;
};
```

### 4. 페이지 예시

```tsx
// app/(main)/community/page.tsx
import { PostList } from "@/features/post/components";

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">커뮤니티</h1>
      <PostList />
    </div>
  );
}
```

```tsx
// app/(fullscreen)/calendar/page.tsx
import { Calendar } from "@/features/calendar/components";

export default function CalendarPage() {
  return <Calendar />;
}
```

---

## 🎣 Hooks 폴더 구조 규칙

### 구조 원칙

`features`, `widgets`, `shared` 내의 비즈니스 기능 단위 폴더에서 hooks는 다음과 같이 분리합니다:

> **참고**:
>
> - **widgets**도 features와 동일하게 `api/`, `hooks/`, `components/`, `types/` 등의 폴더 구조를 가질 수 있습니다.
> - widgets는 복합 기능이므로 필요에 따라 이러한 폴더들을 활용합니다.
> - 예: `widgets/top-navigation/hooks/`, `widgets/post-with-comments/components/` 등

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

### 분류 기준

- **Query 훅** (`hooks/query/`): 데이터 조회용 훅
  - `useQuery`, `useSuspenseQuery`, `useInfiniteQuery` 등을 사용하는 훅
  - 예: `usePostsQuery`, `usePostQuery`, `usePostsInfiniteQuery`
- **Mutation 훅** (`hooks/mutation/`): 데이터 변경용 훅
  - `useMutation`을 사용하는 훅
  - 예: `useCreatePostMutation`, `useUpdatePostMutation`, `useDeletePostMutation`
- **일반 훅** (`hooks/` 루트): TanStack Query와 무관한 커스텀 훅
  - 폼 관리, 필터링, UI 상태 관리 등
  - 예: `usePostForm`, `usePostFilter`, `usePostMenu`

### Export 패턴

```typescript
// features/post/hooks/index.ts - 모든 훅을 통합 export
export * from "@/features/post/hooks/query";
export * from "@/features/post/hooks/mutation";
export { usePostForm } from "@/features/post/hooks/use-post-form";
export { usePostFilter } from "@/features/post/hooks/use-post-filter";

// features/post/hooks/query/index.ts
export { usePostsQuery } from "@/features/post/hooks/query/use-posts-query";
export { usePostQuery } from "@/features/post/hooks/query/use-post-query";

// features/post/hooks/mutation/index.ts
export { useCreatePostMutation } from "@/features/post/hooks/mutation/use-create-post-mutation";
export { useUpdatePostMutation } from "@/features/post/hooks/mutation/use-update-post-mutation";
```

### 사용 예시

```typescript
// ✅ 올바른 import
import { usePostsQuery } from "@/features/post/hooks/query/use-posts-query";
import { useCreatePostMutation } from "@/features/post/hooks/mutation/use-create-post-mutation";
import { usePostForm } from "@/features/post/hooks/use-post-form";

// ✅ 또는 index.ts를 통한 import (권장)
import { usePostsQuery, useCreatePostMutation, usePostForm } from "@/features/post/hooks";

// ✅ widgets도 동일한 패턴
import { useTopNavigationHandlers, useTopNavigationSearch } from "@/widgets/top-navigation/hooks";
```

---

## 🎯 레이어 의존성 규칙

```
app → layouts → widgets → features → shared
```

**핵심 원칙**: 상위 레이어는 하위 레이어만 import 가능

```tsx
// ✅ 올바른 의존성
import { PostWithComments } from "@/widgets/post-with-comments"; // app → widgets
import { PostCard } from "@/features/post/components"; // app → features
import { Button } from "@/shared/ui/button"; // features → shared
import { MainLayout } from "@/layouts/main-layout"; // app → layouts

// ❌ 잘못된 의존성
import { PostCard } from "@/features/post/components"; // shared → features (금지!)
import { CommentList } from "@/features/comment/components"; // features → features (금지!)
import { Header } from "@/layouts/components/Header"; // features → layouts (금지!)
```

---

## 📝 네이밍 규칙

### 기본 표기법

| 대상                  | 표기법           | 예시                                 |
| --------------------- | ---------------- | ------------------------------------ |
| 폴더명                | kebab-case       | `post-card/`, `user-profile/`        |
| 컴포넌트 파일         | PascalCase       | `PostCard.tsx`, `Button.tsx`         |
| 타입/훅/API/유틸 파일 | kebab-case       | `post.type.ts`, `use-posts-query.ts` |
| 컴포넌트명            | PascalCase       | `PostCard`, `UserProfile`            |
| 변수/함수             | camelCase        | `userName`, `fetchUsers`             |
| 상수                  | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_COUNT`          |
| 타입/인터페이스       | PascalCase       | `User`, `ApiResponse`                |

### 레이어별 네이밍 가이드

```tsx
// features - 도메인 접두사 사용
(PostCard.tsx, CommentList.tsx, AuthLoginForm.tsx);

// widgets - 복합 기능 명시
(PostWithComments.tsx, UserProfileCard.tsx);

// shared/ui - 순수 UI (도메인 접두사 없음)
(Button.tsx, Input.tsx, Card.tsx);

// app 폴더 - page.tsx, layout.tsx 고정
(page.tsx, layout.tsx, loading.tsx, error.tsx);

// layouts - Layout 접미사
(MainLayout.tsx, FullscreenLayout.tsx);
```

---

## 🔌 API 네이밍 규칙

### API 함수: `동작 + 엔티티 + 조건`

```typescript
// features/post/api/post.api.ts
export const getPosts = async (params: GetPostsRequest): Promise<GetPostsResponse> => { ... }
export const getPostById = async (id: string): Promise<Post> => { ... }
export const createPost = async (data: CreatePostRequest): Promise<Post> => { ... }
export const updatePost = async (id: string, data: UpdatePostRequest): Promise<Post> => { ... }
export const deletePost = async (id: string): Promise<void> => { ... }
```

### API 타입

```typescript
// features/post/api/post.api.type.ts
export type GetPostsRequest = { ... }
export type GetPostsResponse = { ... }
export type CreatePostRequest = { ... }
```

---

## 🎣 TanStack Query 네이밍 규칙

### Query/Mutation 훅 네이밍: `use + 엔티티 + 조건 + Query/Mutation`

```typescript
// features/post/hooks/query/
export const usePostsQuery = (page: number) => { ... }
export const usePostQuery = (id: string) => { ... }
export const usePostsSuspenseQuery = (page: number) => { ... }
export const usePostsInfiniteQuery = () => { ... }

// features/post/hooks/mutation/
export const useCreatePostMutation = () => { ... }
export const useUpdatePostMutation = () => { ... }
export const useDeletePostMutation = () => { ... }
```

> **참고**: Hooks 폴더 구조는 위의 "🎣 Hooks 폴더 구조 규칙" 섹션을 참고하세요.

### Query Keys

```typescript
// shared/constants/query-keys.constant.ts
// ⚠️ 모든 Query Keys는 shared/constants/query-keys.constant.ts에 통합 관리
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (page: number) => [...postKeys.lists(), page] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export const commentKeys = {
  all: ["comments"] as const,
  // ...
};
```

---

## 🎪 이벤트 핸들러 네이밍

- **정의할 때**: `handle + 동작명`
- **Props로 전달**: `on + 동작명`

```tsx
// PostList.type.ts
export type PostListProps = {
  onPostClick?: (postId: string) => void;
  onPostEdit?: (postId: string) => void;
};

// PostList.tsx
import type { PostListProps } from '@/features/post/components/PostList.type';

const PostList = ({ onPostClick, onPostEdit }: PostListProps) => {
  // ...
}

// 부모 컴포넌트
const handlePostClick = (postId: string) => { ... }
<PostList onPostClick={handlePostClick} />
```

---

## 📐 타입 작성 규칙

### 컴포넌트 Props 타입은 별도 파일로 분리

```typescript
// PostCard.type.ts
import type { Post } from "@/features/post/types/post.type";

export type PostCardProps = {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
};

// PostCard.tsx
import type { PostCardProps } from "@/features/post/components/PostCard.type";

const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  // ...
};
```

### Interface vs Type

```typescript
// ✅ Interface - 객체 구조, 확장 가능
interface User {
  id: string;
  name: string;
}

// ✅ Type - 유니온, 교차, Props
type UserStatus = "active" | "inactive";
type ApiResponse<T> = { data: T; status: number };
```

### 타입 파일 네이밍

- 컴포넌트 Props: `ComponentName.type.ts` (PascalCase + `.type.ts`) (예: `PostCard.type.ts`, `TopNavigation.type.ts`)
- 도메인 타입: `domain.type.ts` (kebab-case) (예: `post.type.ts`, `user.type.ts`)
- API 타입: `api-name.api.type.ts` (kebab-case) (예: `post.api.type.ts`)

---

## 🎨 코드 스타일

### 컴포넌트 구조

```typescript
// PostCard.tsx
// 1. Import
import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui';
import type { Post } from '@/features/post/types/post.type';
import type { PostCardProps } from '@/features/post/components/PostCard.type';

// 2. 상수
const DEFAULT_TITLE = '제목 없음';

// 3. 컴포넌트
const PostCard = ({ post }: PostCardProps) => {
  // 3-1. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 3-2. 함수
  const handleClick = () => { ... }

  // 3-3. useEffect
  useEffect(() => { ... }, []);

  // 3-4. 렌더링
  return ( ... );
}

// 4. Export
export default PostCard;
```

```typescript
// PostCard.type.ts
import type { Post } from "@/features/post/types/post.type";

export type PostCardProps = {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
};
```

### Import 순서

```typescript
// 1. React & Next.js
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 2. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";

// 3. Shared
import { Button, Card } from "@/shared/ui";
import { formatDate } from "@/shared/utils/date.util";

// 4. Features
import { usePostsQuery, useCreatePostMutation, usePostForm } from "@/features/post/hooks";

// 5. Widgets
import { PostWithComments } from "@/widgets/post-with-comments";

// 6. Layouts
import { MainLayout } from "@/layouts/main-layout";

// 7. Assets
import catIcon from "@/assets/icons/normal/cat.svg";
import bannerImage from "@/assets/image/banner/home-banner.svg";
```

---

## 📦 Export 규칙

### index.ts 패턴

```typescript
// features/post/index.ts - Feature Public API
export * from "@/features/post/api";
export * from "@/features/post/hooks";
export * from "@/features/post/components";
export * from "@/features/post/types";

// features/post/components/index.ts
export { default as PostCard } from "@/features/post/components/PostCard";
export { default as PostList } from "@/features/post/components/PostList";

// features/post/hooks/index.ts
export * from "@/features/post/hooks/query";
export * from "@/features/post/hooks/mutation";
export { usePostForm } from "@/features/post/hooks/use-post-form";
export { usePostFilter } from "@/features/post/hooks/use-post-filter";

// features/post/hooks/query/index.ts
export { usePostsQuery } from "@/features/post/hooks/query/use-posts-query";
export { usePostQuery } from "@/features/post/hooks/query/use-post-query";

// features/post/hooks/mutation/index.ts
export { useCreatePostMutation } from "@/features/post/hooks/mutation/use-create-post-mutation";
export { useUpdatePostMutation } from "@/features/post/hooks/mutation/use-update-post-mutation";
export { useDeletePostMutation } from "@/features/post/hooks/mutation/use-delete-post-mutation";

// shared/ui/index.ts
export { default as Button } from "@/shared/ui/button";
export { default as Input } from "@/shared/ui/input";

// layouts/index.ts
export { MainLayout } from "@/layouts/main-layout";
export { FullscreenLayout } from "@/layouts/fullscreen-layout";
```

### Export 방식

```typescript
// ✅ 컴포넌트 - Default Export
export default PostCard;

// ✅ 유틸/API/훅/Store - Named Export
export const formatDate = () => { ... }
export const getPosts = () => { ... }
export const usePostsQuery = () => { ... }
export const usePostStore = create<PostUIState>()( ... );

// ✅ 타입 - Named Export
export type Post = { ... }
export interface User { ... }
```

---

## 🚀 Next.js 14 App Router 특화 규칙

### 1. 서버/클라이언트 컴포넌트 분리

```tsx
// ✅ 서버 컴포넌트 (기본값)
// app/(main)/community/page.tsx
import { PostList } from "@/features/post/components";

export default async function CommunityPage() {
  // 서버에서 데이터 fetch 가능
  const initialData = await getPosts();

  return <PostList initialData={initialData} />;
}

// ✅ 클라이언트 컴포넌트 ('use client' 지시어 필요)
// features/post/components/PostList.tsx
("use client");

import { usePostsQuery } from "@/features/post/hooks";

export default function PostList({ initialData }) {
  const { data } = usePostsQuery({ initialData });
  // ...
}
```

### 2. 메타데이터 생성

```tsx
// app/(main)/community/[id]/page.tsx
import type { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostById(params.id);

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function PostDetailPage({ params }: Props) {
  // ...
}
```

### 3. 로딩 & 에러 처리

```tsx
// app/(main)/community/loading.tsx
export default function Loading() {
  return <div>로딩 중...</div>;
}

// app/(main)/community/error.tsx
("use client");

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h2>에러가 발생했습니다</h2>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
```

### 4. 라우트 그룹 활용

```
app/
├── (main)/          # URL에 영향 없음, 레이아웃만 공유
│   ├── layout.tsx
│   ├── about/page.tsx        → /about
│   └── contact/page.tsx      → /contact
└── (fullscreen)/    # URL에 영향 없음, 다른 레이아웃
    ├── layout.tsx
    └── calendar/page.tsx     → /calendar
```

### 5. 동적 라우트

```tsx
// app/(main)/community/[id]/page.tsx
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function PostDetailPage({ params, searchParams }: Props) {
  return <div>게시글 ID: {params.id}</div>;
}
```

---

## 🔧 Providers 설정

### AppProviders 통합

```tsx
// providers/AppProviders.tsx
"use client";

import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
};
```

```tsx
// providers/QueryProvider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

---

## ✅ 핵심 원칙

1. **레이어 의존성 준수**: `app → layouts → widgets → features → shared`
2. **일관된 네이밍**: 한 번 정한 규칙은 전체 적용
3. **Public API 관리**: 각 feature는 index.ts로 명확한 API 제공
4. **타입 안정성**: 모든 API, Props, Store에 타입 정의
5. **타입 분리**: 컴포넌트 Props 타입은 별도 `.type.ts` 파일로 분리
6. **절대경로 사용**: 모든 import는 절대경로(`@/`)를 사용하며, 상대경로(`./`, `../`)는 사용하지 않음
7. **기능 독립성**: 각 feature는 독립적으로 개발/테스트 가능
8. **서버/클라이언트 분리**: App Router의 서버/클라이언트 컴포넌트를 명확히 구분
9. **라우트 그룹 활용**: 레이아웃이 다른 페이지는 라우트 그룹으로 분리

---

## 📋 주요 변경사항 (React Router → Next.js App Router)

| 항목        | 기존 (React Router)     | 변경 (Next.js App Router)                        |
| ----------- | ----------------------- | ------------------------------------------------ |
| 라우팅 파일 | `src/app/Router.tsx`    | 파일 시스템 기반 (`app/` 폴더)                   |
| 페이지      | `src/pages/`            | `app/**/page.tsx`                                |
| 레이아웃    | `src/layouts/` 컴포넌트 | `app/**/layout.tsx` + `layouts/` 재사용 컴포넌트 |
| Provider    | `src/app/providers/`    | `src/providers/` + `app/layout.tsx`에서 사용     |
| 라우트 그룹 | ❌ 없음                 | `app/(group)/`                                   |
| 진입점      | `App.tsx`               | `app/layout.tsx` + `app/page.tsx`                |

---

## 🎯 실전 예시

### 커뮤니티 게시글 기능 구현

```
src/
├── app/
│   └── (main)/
│       ├── community/
│       │   ├── page.tsx                    # 게시글 목록
│       │   └── [id]/
│       │       └── page.tsx                # 게시글 상세
│
├── features/
│   └── post/
│       ├── api/
│       │   ├── post.api.ts
│       │   ├── post.api.type.ts
│       │   └── index.ts
│       ├── hooks/
│       │   ├── query/
│       │   │   ├── use-posts-query.ts
│       │   │   ├── use-post-query.ts
│       │   │   └── index.ts
│       │   ├── mutation/
│       │   │   ├── use-create-post-mutation.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── components/
│       │   ├── PostCard.tsx
│       │   ├── PostCard.type.ts
│       │   ├── PostList.tsx
│       │   ├── PostList.type.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── post.type.ts
│       │   └── index.ts
│       └── index.ts
```

```tsx
// app/(main)/community/page.tsx
import { PostList } from "@/features/post/components";

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">커뮤니티</h1>
      <PostList />
    </div>
  );
}
```

```tsx
// features/post/components/PostList.tsx
"use client";

import { usePostsQuery } from "@/features/post/hooks";
import { PostCard } from "@/features/post/components";

export default function PostList() {
  const { data: posts, isLoading } = usePostsQuery(1);

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

```tsx
// features/post/hooks/query/use-posts-query.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/features/post/api";
import { postKeys } from "@/shared/constants/query-keys.constant";

export const usePostsQuery = (page: number) => {
  return useQuery({
    queryKey: postKeys.list(page),
    queryFn: () => getPosts({ page }),
  });
};
```

---

## 🚨 주의사항

### 1. 'use client' 지시어

- TanStack Query 훅을 사용하는 컴포넌트는 반드시 `'use client'` 필요
- `useState`, `useEffect` 등 React 훅 사용 시에도 필요

### 2. async/await in Server Components

- `app/` 폴더의 page.tsx는 기본적으로 서버 컴포넌트
- 서버 컴포넌트에서는 직접 async/await 사용 가능

```tsx
// ✅ 서버 컴포넌트에서 직접 fetch
export default async function Page() {
  const data = await fetch("...");
  return <div>{data}</div>;
}
```

### 3. layouts 폴더 용도

- `layouts/` 폴더는 재사용 가능한 레이아웃 컴포넌트 저장소
- 실제 라우팅 레이아웃은 `app/**/layout.tsx`에서 정의
- `layouts/` 컴포넌트를 `app/**/layout.tsx`에서 import해서 사용

---

## 📚 추가 리소스

- [Next.js 14 App Router 공식 문서](https://nextjs.org/docs/app)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
