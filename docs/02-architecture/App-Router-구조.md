# App Router 레이아웃 구조

📍 **위치**: [홈](../00-README.md) > [아키텍처](../02-architecture/) > App Router 구조

> 📌 **Note**: 이 문서의 라우트 예시는 참고용입니다.
> 실제 프로젝트에 맞춰 경로와 페이지 구조를 수정하세요.

---

## 1. 전역 루트 레이아웃 (app/layout.tsx)

```tsx
// app/layout.tsx
import type { Metadata } from "next";

import "@/app/globals.css";
import { Providers } from "@/providers/Providers";
// ConditionalLayout을 사용하여 경로에 따라 Header/Footer를 조건부로 렌더링
import ConditionalLayout from "@/layouts/ConditionalLayout";

export const metadata: Metadata = {
  title: "프로젝트명",
  description: "프로젝트에 대한 설명을 작성합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
```

**참고**: `ConditionalLayout`을 사용하지 않고 직접 레이아웃을 구성할 수도 있습니다. 이 경우 `app/layout.tsx`에서 직접 Header/Footer를 배치하거나, 필요한 곳에서만 레이아웃을 적용할 수 있습니다.

---

## 2. 조건부 레이아웃 - 경로에 따라 Header/Footer 표시

### app/layout.tsx

```tsx
// app/layout.tsx
import type { Metadata } from "next";

import "@/app/globals.css";
import { Providers } from "@/providers/Providers";
import ConditionalLayout from "@/layouts/ConditionalLayout";

export const metadata: Metadata = {
  title: "프로젝트명",
  description: "프로젝트에 대한 설명을 작성합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
```

### layouts/ConditionalLayout.tsx

```tsx
// layouts/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";

import type { ConditionalLayoutProps } from "@/layouts/ConditionalLayout.type";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

/**
 * 경로에 따라 Header와 Footer를 조건부로 렌더링하는 레이아웃 컴포넌트
 * 인증 페이지(/login, /register, /auth)에서는 Header와 Footer를 숨깁니다.
 */
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  // 인증 관련 페이지인지 확인
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth");

  return (
    <div className="flex min-h-screen flex-col">
      {/* 인증 페이지가 아닐 때만 Header 렌더링 */}
      {!isAuthPage && <Header />}
      <main className="flex-1 overflow-x-hidden">{children}</main>
      {/* 인증 페이지가 아닐 때만 Footer 렌더링 */}
      {!isAuthPage && <Footer />}
    </div>
  );
}
```

---

## 3. 특수 페이지 예시 (인증 페이지)

```tsx
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold">로그인</h1>
        {/* 로그인 폼 */}
      </div>
    </div>
  );
}
```

---

## 4. 일반 페이지 예시

### 패턴 1: 목록 페이지

```tsx
// app/items/page.tsx
import { ItemList } from "@/features/feature-a/components";

export default function ItemsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">아이템 목록</h1>
      <ItemList />
    </div>
  );
}
```

### 패턴 2: 상세 페이지

```tsx
// app/items/[id]/page.tsx
import { ItemDetail } from "@/features/feature-a/components";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <ItemDetail id={params.id} />
    </div>
  );
}
```

### 📌 실제 프로젝트 예시 (buildin-web-front)

```tsx
// app/posts/page.tsx - 게시글 목록
import { PostList } from "@/features/post/components";

export default function PostsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">게시글 목록</h1>
      <PostList />
    </div>
  );
}

// app/chat/page.tsx - 채팅 페이지
import { ChatContainer } from "@/features/chat/components";

export default function ChatPage() {
  return <ChatContainer />;
}
```

---

## 5. 에러 및 로딩 페이지

### 에러 페이지

```tsx
// app/error.tsx
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h2>에러가 발생했습니다</h2>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
```

### 로딩 페이지

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>로딩 중...</div>;
}
```

### 404 페이지

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>페이지를 찾을 수 없습니다</h2>
    </div>
  );
}
```

---

**관련 문서**:

- [폴더 구조](./폴더-구조.md)
- [Providers 설정](../07-nextjs-specific/Providers-설정.md)
- [Server vs Client Component](../07-nextjs-specific/Server-vs-Client-Component.md)

**최종 업데이트**: 2026년 2월 4일
