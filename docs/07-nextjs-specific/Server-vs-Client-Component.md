# Server vs Client Component

📍 **위치**: [홈](../00-README.md) > [Next.js 특화](../07-nextjs-specific/) > Server vs Client Component

---

## 개요

Next.js 14에서는 Server Component가 기본값이며, Client Component는 필요할 때만 사용해야 합니다.
올바른 컴포넌트 선택은 성능, 번들 크기, SEO에 직접적인 영향을 미칩니다.

---

## Server Component (기본값) - 가능한 많이 사용

### 언제 사용하는가

- 데이터 페칭만 하는 컴포넌트
- 정적 콘텐츠 표시
- SEO가 중요한 페이지
- 민감한 정보(API 키, 토큰) 처리
- 서버에만 있는 리소스 접근 (DB, 파일 시스템)

### 장점

- ✅ JavaScript 번들 크기 감소 (클라이언트로 전송 안됨)
- ✅ 초기 페이지 로드 속도 향상
- ✅ SEO 최적화 (완전한 HTML)
- ✅ 서버 리소스 직접 접근
- ✅ 민감한 정보 보호

### 예시

```tsx
// app/posts/page.tsx - Server Component (기본값)
import { PostList } from "@/features/post/components";

// async 함수로 서버에서 데이터 페칭
export default async function PostsPage() {
  // 서버에서 직접 데이터 페칭 가능
  const posts = await fetch("https://api.example.com/posts").then((res) => res.json());

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">게시글 목록</h1>
      <PostList initialData={posts} />
    </div>
  );
}
```

```tsx
// app/posts/[id]/page.tsx - Server Component with generateMetadata
import type { Metadata } from "next";
import { getPostById } from "@/features/post/api";

type Props = {
  params: { id: string };
};

// 동적 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostById(params.id);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.thumbnailUrl],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await getPostById(params.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

---

## Client Component ('use client' 필요) - 필요할 때만

### 언제 사용하는가

- React 훅 사용 (useState, useEffect, useCallback, useRef 등)
- 브라우저 API 접근 (localStorage, sessionStorage, window, document)
- 사용자 상호작용 처리 (onClick, onChange, onSubmit 등)
- 이벤트 리스너 등록 (addEventListener)
- TanStack Query 훅 사용 (useQuery, useMutation)
- 클라이언트 전용 Next.js 훅 (useRouter, usePathname, useSearchParams)

### 주의사항

- ❌ JavaScript가 클라이언트로 전송됨 (번들 크기 증가)
- ❌ 초기 렌더링 시 서버에서 실행 후 클라이언트에서 하이드레이션 필요
- ❌ 서버 전용 리소스 접근 불가

### 예시

```tsx
// features/auth/components/LoginForm.tsx - Client Component
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SolidPrimary } from "@itandsy/react-common";
import type { LoginFormProps } from "@/features/auth/components/LoginForm.type";

/**
 * 로그인 폼 컴포넌트
 * 소셜 로그인 (구글, 카카오, 네이버)을 제공합니다.
 */
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  // ✅ useState 사용 - Client Component 필요
  const [isLoading, setIsLoading] = useState(false);

  // ✅ useRouter 사용 - Client Component 필요
  const router = useRouter();

  // ✅ 사용자 상호작용 처리 - Client Component 필요
  const handleLogin = () => {
    setIsLoading(true);
    // 로그인 로직
  };

  return (
    <form>
      <SolidPrimary label="로그인" onClick={handleLogin} disabled={isLoading} />
    </form>
  );
};

export default LoginForm;
```

---

## 'use client' 경계 최소화 전략

Client Component는 컴포넌트 트리의 **리프 노드(말단)**에 배치하여 'use client' 경계를 최소화해야 합니다.

### ❌ 나쁜 예 - 전체가 Client Component

```tsx
// app/posts/page.tsx
"use client"; // ❌ 페이지 전체가 클라이언트 컴포넌트

import { useState } from "react";
import { PostList } from "@/features/post/components";

export default function PostsPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <h1>게시글 목록</h1>
      <button onClick={() => setFilter("published")}>게시됨</button>
      <PostList filter={filter} />
    </div>
  );
}
```

### ✅ 좋은 예 - Client Component를 최소화

```tsx
// app/posts/page.tsx - Server Component (기본값)
import { PostList } from "@/features/post/components";
import { PostFilter } from "@/features/post/components/PostFilter"; // Client Component

export default function PostsPage() {
  // 서버 컴포넌트 - 정적 콘텐츠
  return (
    <div>
      <h1>게시글 목록</h1>
      {/* ✅ 상호작용이 필요한 부분만 Client Component */}
      <PostFilter />
      <PostList />
    </div>
  );
}
```

```tsx
// features/post/components/PostFilter.tsx - Client Component
"use client";

import { useState } from "react";

export const PostFilter = () => {
  const [filter, setFilter] = useState("all");

  return <button onClick={() => setFilter("published")}>게시됨</button>;
};
```

---

## 컴포넌트 합성 패턴

Server Component는 Client Component를 자식으로 가질 수 있지만, Client Component는 Server Component를 import할 수 없습니다. 대신 **children prop**을 사용합니다.

### ❌ 불가능 - Client Component가 Server Component import

```tsx
// ClientComponent.tsx
"use client";

import ServerComponent from "./ServerComponent"; // ❌ 에러!

export default function ClientComponent() {
  return <ServerComponent />; // ❌ ServerComponent도 Client가 됨
}
```

### ✅ 가능 - children prop 사용

```tsx
// app/layout.tsx - Server Component
import ClientLayout from "@/layouts/ClientLayout";
import ServerSidebar from "@/features/sidebar/ServerSidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* ✅ Server Component를 Client Component의 children으로 전달 */}
        <ClientLayout sidebar={<ServerSidebar />}>{children}</ClientLayout>
      </body>
    </html>
  );
}
```

```tsx
// layouts/ClientLayout.tsx - Client Component
"use client";

import { useState } from "react";

export default function ClientLayout({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>토글</button>
      {isOpen && sidebar}
      <main>{children}</main>
    </div>
  );
}
```

---

## 핵심 원칙 요약

| 원칙                             | 설명                                            |
| -------------------------------- | ----------------------------------------------- |
| **기본은 Server Component**      | 'use client'가 없으면 서버 컴포넌트             |
| **필요할 때만 Client Component** | 상호작용, 브라우저 API, React 훅이 필요할 때    |
| **'use client' 경계 최소화**     | 트리의 리프 노드에 배치                         |
| **데이터 페칭은 서버에서**       | 더 빠르고 안전함                                |
| **children prop 활용**           | Server Component를 Client Component에 전달할 때 |

---

**관련 문서**:

- [렌더링 최적화](./렌더링-최적화.md)
- [컴포넌트 구조](../06-code-style/컴포넌트-구조.md)

**최종 업데이트**: 2026년 2월 4일
