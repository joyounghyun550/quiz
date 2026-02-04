# Quick Start (5분 요약)

📍 **위치**: [홈](../00-README.md) > [온보딩](../01-onboarding/) > Quick Start

> 💡 **핵심만 빠르게** - 자세한 내용은 각 섹션 참조

---

## 폴더 구조 핵심

```
src/
├── app/           # 라우팅 (페이지)
├── features/      # 비즈니스 기능 (auth, chat, post...)
├── shared/        # 공통 유틸, 훅, 설정
├── layouts/       # 레이아웃 컴포넌트
├── stores/        # Zustand 전역 스토어
└── assets/        # 이미지, 아이콘
```

[자세한 폴더 구조 보기](../02-architecture/폴더-구조.md)

---

## 파일 네이밍 규칙

| 유형        | 규칙                    | 예시                          |
| ----------- | ----------------------- | ----------------------------- |
| 폴더        | kebab-case              | `user-profile/`               |
| 컴포넌트    | PascalCase              | `UserProfile.tsx`             |
| 훅/유틸/API | kebab-case              | `use-auth.ts`, `date.util.ts` |
| 타입        | kebab-case + `.type.ts` | `user.type.ts`                |

[전체 네이밍 규칙 보기](../03-naming-conventions/네이밍-규칙-총정리.md)

---

## 컴포넌트 작성 순서

```tsx
// 1. 'use client' (필요시)
"use client";

// 2. Import (React → 외부 → 내부 → 타입)
import { useState } from "react";
import { SolidPrimary } from "@itandsy/react-common";
import { useAuthStore } from "@/stores/auth.store";
import type { Props } from "./Component.type";

// 3. 상수 (컴포넌트 외부)
const MAX_LENGTH = 100;

// 4. 컴포넌트
const Component = ({ prop }: Props) => {
  // 4-1. Hooks
  // 4-2. 함수
  // 4-3. useEffect
  // 4-4. return
};

// 5. Export
export default Component;
```

[상세 컴포넌트 구조 보기](../06-code-style/컴포넌트-구조.md)

---

## Server vs Client Component

| Server Component (기본값) | Client Component (`'use client'` 필요) |
| ------------------------- | -------------------------------------- |
| 데이터 페칭               | useState, useEffect                    |
| 백엔드 리소스 접근        | onClick 등 이벤트 핸들러               |
| 민감한 정보 처리          | 브라우저 API (window, localStorage)    |

[Server vs Client 상세 가이드](../07-nextjs-specific/Server-vs-Client-Component.md)

---

## TSDoc 필수 항목

```tsx
/**
 * 컴포넌트 한 줄 설명
 *
 * @param props - Props 설명
 * @example
 * <Component prop="value" />
 */
```

[TSDoc 작성 규칙 보기](../05-documentation/TSDoc-작성-규칙.md)

---

## @itandsy/react-common 주요 컴포넌트

| 컴포넌트         | 용도            | 사용법                                                   |
| ---------------- | --------------- | -------------------------------------------------------- |
| `SolidPrimary`   | 주요 버튼       | `<SolidPrimary label="저장" onClick={handleSave} />`     |
| `SolidSecondary` | 보조 버튼       | `<SolidSecondary label="취소" onClick={handleCancel} />` |
| `TextBox`        | 텍스트 입력     | `<TextBox value={value} onChange={setValue} />`          |
| `Modal`          | 모달 다이얼로그 | `<Modal open={isOpen} onClose={handleClose}>...</Modal>` |

[전체 컴포넌트 가이드 보기](../09-libraries/itandsy-react-common.md)

---

## 자주 하는 실수

| ❌ 하지 마세요                               | ✅ 이렇게 하세요                                  |
| -------------------------------------------- | ------------------------------------------------- |
| `<SolidPrimary>텍스트</SolidPrimary>`        | `<SolidPrimary label="텍스트" />`                 |
| `onChange={(e) => setValue(e.target.value)}` | `onChange={setValue}` (TextBox는 value 직접 전달) |
| 페이지 전체에 `'use client'`                 | Client는 리프 컴포넌트에만                        |
| import 순서 무시                             | React → 외부 → Shared → Features → Assets         |

---

## 다음 단계

코드를 작성할 준비가 되셨나요? 아래 템플릿을 사용하세요:

- **[복사용 템플릿](./복사용-템플릿.md)** - 컴포넌트, 훅, Query, Mutation 템플릿

---

**관련 문서**:

- [신입 개발자 가이드](./신입-개발자-가이드.md)
- [복사용 템플릿](./복사용-템플릿.md)
- [컴포넌트 구조](../06-code-style/컴포넌트-구조.md)

**최종 업데이트**: 2026년 2월 4일
