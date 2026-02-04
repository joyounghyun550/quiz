# Import 순서 규칙

📍 **위치**: [홈](../00-README.md) > [코드 스타일](../06-code-style/) > Import 순서

---

## 기본 Import 순서

```typescript
// 1. React & Next.js
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 2. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";
import { SolidPrimary, Modal } from "@itandsy/react-common";

// 3. Shared
import { cn } from "@/shared/utils/cn.util";
import { customThemeTokens } from "@/shared/config/theme";

// 4. Features
import { useCurrentUserProfileQuery } from "@/features/auth/hooks";
import { useDeleteChatSessionMutation } from "@/features/chat/hooks";
import { SideBar } from "@/features/sidebar/components";

// 5. Layouts
import ConditionalLayout from "@/layouts/ConditionalLayout";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

// 6. Assets
import chatIcon from "@/assets/icons/chat.svg";
import closeIcon from "@/assets/icons/close.svg";
import heroBanner from "@/assets/images/hero-banner.png";
import placeholder from "@/assets/images/placeholder.png";
```

---

## 복잡한 파일의 Import 섹션 구분 (권장)

10개 이상의 import가 있거나 복잡한 파일의 경우 구분선 주석을 사용합니다:

```typescript
// ============================================
// 1. React & Next.js
// ============================================
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// ============================================
// 2. 외부 라이브러리
// ============================================
import { useQuery, useMutation } from "@tanstack/react-query";
import { SolidPrimary, TextBox, Modal, Toast } from "@itandsy/react-common";
import { toast } from "sonner";

// ============================================
// 3. Shared (공통 리소스)
// ============================================
import { cn } from "@/shared/utils/cn.util";
import { customThemeTokens } from "@/shared/config/theme";
import { setCookie, getCookie, deleteCookie } from "@/shared/utils/cookie.util";

// ============================================
// 4. Features (기능별)
// ============================================
// Auth
import { useCurrentUserProfileQuery } from "@/features/auth/hooks";
import { useSaveTermsAgreementMutation } from "@/features/auth/hooks";
import type { UserProfile } from "@/features/auth/api/auth.api.type";

// Chat
import { useChatSession } from "@/features/chat/hooks";
import { useChatMessage } from "@/features/chat/hooks";
import { ChatContainer, ChatInput } from "@/features/chat/components";

// Post
import { usePostsQuery } from "@/features/post/hooks";
import { PostCard, PostList } from "@/features/post/components";

// ============================================
// 5. Layouts
// ============================================
import ConditionalLayout from "@/layouts/ConditionalLayout";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

// ============================================
// 6. Assets
// ============================================
import chatIcon from "@/assets/icons/chat.svg";
import closeIcon from "@/assets/icons/close.svg";
import menuIcon from "@/assets/icons/menu.svg";
import heroBanner from "@/assets/images/hero-banner.png";
import placeholder from "@/assets/images/placeholder.png";
```

---

## Import 순서 요약표

| 순서 | 카테고리        | 예시                                             |
| ---- | --------------- | ------------------------------------------------ |
| 1    | React & Next.js | `react`, `next/image`, `next/navigation`         |
| 2    | 외부 라이브러리 | `@tanstack/react-query`, `@itandsy/react-common` |
| 3    | Shared          | `@/shared/utils`, `@/shared/config`              |
| 4    | Features        | `@/features/auth`, `@/features/chat`             |
| 5    | Layouts         | `@/layouts/Header`, `@/layouts/Footer`           |
| 6    | Assets          | `@/assets/icons`, `@/assets/images`              |

---

## 타입 Import 규칙

- 타입 import는 `import type` 구문을 사용합니다
- 타입은 해당 카테고리 내에서 일반 import 다음에 배치합니다

```typescript
// ✅ 올바른 타입 import
import { useCurrentUserProfileQuery } from "@/features/auth/hooks";
import type { UserProfile } from "@/features/auth/api/auth.api.type";
import type { LoginFormProps } from "@/features/auth/components/LoginForm.type";

// ❌ 잘못된 타입 import (import type 없음)
import { UserProfile } from "@/features/auth/api/auth.api.type";
```

---

## ESLint 자동 정렬 설정

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling"], "index", "type"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
};
```

---

**관련 문서**:

- [컴포넌트 구조](./컴포넌트-구조.md)
- [ESLint / Prettier 설정](../10-tooling/ESLint-Prettier-설정.md)

**최종 업데이트**: 2026년 2월 4일
