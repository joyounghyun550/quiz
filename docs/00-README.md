# React + Next.js Boilerplate 코드 컨벤션 문서

> 📖 이 문서는 주제별로 분리된 문서입니다.
> **각 문서는 150-600줄 이하로 IDE에서 빠르게 로딩됩니다.**

**최종 업데이트**: 2026년 2월 4일
**기술 스택**: Next.js 14 + TypeScript + TanStack Query + Zustand + Tailwind CSS

> 💡 **이 문서에 대하여**
> 이 문서는 범용 React + Next.js Boilerplate를 위한 코드 컨벤션입니다.
> 새로운 프로젝트를 시작할 때 이 boilerplate를 복사하여 사용하고, 프로젝트에 맞게 커스터마이징하세요.

---

## 🎯 빠른 시작

### 신입 개발자라면?

1. [신입 개발자 가이드](./01-onboarding/신입-개발자-가이드.md) - 읽는 순서, 용어 정리
2. [Quick Start (5분)](./01-onboarding/Quick-Start.md) - 핵심만 빠르게 파악
3. [복사용 템플릿](./01-onboarding/복사용-템플릿.md) - 즉시 사용 가능한 코드 템플릿

### 구조를 이해하고 싶다면?

- [폴더 구조](./02-architecture/폴더-구조.md)
- [App Router 구조](./02-architecture/App-Router-구조.md)
- [레이어 의존성 규칙](./02-architecture/레이어-의존성.md)

### 코드를 작성하려면?

- [네이밍 규칙 총정리](./03-naming-conventions/네이밍-규칙-총정리.md)
- [컴포넌트 구조](./06-code-style/컴포넌트-구조.md)
- [TSDoc 작성 규칙](./05-documentation/TSDoc-작성-규칙.md)

---

## 📚 전체 문서 목록

### 01. 온보딩 & 시작하기 ⭐

- [신입 개발자 가이드](./01-onboarding/신입-개발자-가이드.md) - 처음 시작하는 분들을 위한 필독 가이드
- [Quick Start (5분 요약)](./01-onboarding/Quick-Start.md) - 5분만에 핵심 파악
- [복사용 템플릿](./01-onboarding/복사용-템플릿.md) - 컴포넌트, 훅, Query, Mutation 템플릿

### 02. 아키텍처 & 구조

- [폴더 구조](./02-architecture/폴더-구조.md) - 전체 src/ 디렉토리 구조 및 Assets vs Public
- [App Router 레이아웃 구조](./02-architecture/App-Router-구조.md) - Next.js 14 App Router 패턴
- [Hooks 폴더 구조 규칙](./02-architecture/Hooks-폴더-구조.md) - Query/Mutation/Custom 훅 조직화
- [레이어 의존성 규칙](./02-architecture/레이어-의존성.md) - app → layouts → features → shared

### 03. 네이밍 규칙

- [네이밍 규칙 총정리](./03-naming-conventions/네이밍-규칙-총정리.md) ⭐ - 모든 네이밍 규칙 한눈에
- [API 네이밍 규칙](./03-naming-conventions/API-네이밍.md) - API 함수 및 타입 네이밍
- [TanStack Query 네이밍](./03-naming-conventions/TanStack-Query-네이밍.md) - Query/Mutation 훅 및 Query Keys
- [이벤트 핸들러 네이밍](./03-naming-conventions/이벤트-핸들러-네이밍.md) - handle/on 패턴

### 04. 타입 시스템

- [타입 작성 규칙](./04-type-system/타입-작성-규칙.md) - Interface vs Type, Props 분리
- [타입 파일 구조](./04-type-system/타입-파일-구조.md) - 컴포넌트/도메인/API 타입 조직화

### 05. 문서화 & 주석 ⭐

- [TSDoc 작성 규칙](./05-documentation/TSDoc-작성-규칙.md) - 컴포넌트, 훅, API TSDoc 가이드
- [주석 작성 원칙](./05-documentation/주석-작성-원칙.md) - 좋은 주석 vs 나쁜 주석

### 06. 코드 스타일

- [컴포넌트 구조](./06-code-style/컴포넌트-구조.md) ⭐ - 컴포넌트 작성 패턴 및 Import 순서
- [Import 순서](./06-code-style/Import-순서.md) - React → 외부 → Shared → Features → Assets
- [Tailwind CSS 가이드](./06-code-style/Tailwind-CSS-가이드.md) - 클래스 순서, cn(), 반응형 디자인

### 07. Next.js 특화 규칙

- [Server vs Client Component](./07-nextjs-specific/Server-vs-Client-Component.md) ⭐ - 렌더링 전략 및 최적화
- [렌더링 최적화](./07-nextjs-specific/렌더링-최적화.md) - Streaming, Suspense, Dynamic Import
- [환경 변수 관리](./07-nextjs-specific/환경-변수.md) - NEXT*PUBLIC* 접두사, 타입 안전한 접근
- [미들웨어 설정](./07-nextjs-specific/미들웨어.md) - middleware.ts 사용법
- [Providers 설정](./07-nextjs-specific/Providers-설정.md) - QueryProvider, Providers.tsx

### 08. 상태 관리

- [Zustand 스토어 작성 규칙](./08-state-management/Zustand-스토어-규칙.md) - 스토어 구조, 미들웨어, 비동기 액션
- [TanStack Query 사용법](./08-state-management/TanStack-Query-사용법.md) - Query/Mutation 패턴

### 09. 라이브러리

- [라이브러리 가이드](./09-libraries/00-README.md) ⭐ - 필수 vs 선택적 라이브러리 구분
- [주요 라이브러리 개요](./09-libraries/주요-라이브러리.md) - TanStack Query, sonner, axios
- [선택적 라이브러리](./09-libraries/optional/) - 프로젝트 필요에 따라 추가 가능

### 10. 개발 도구

- [ESLint / Prettier 설정](./10-tooling/ESLint-Prettier-설정.md) - Lint 및 Format 설정
- [VS Code 설정](./10-tooling/VS-Code-설정.md) - 추천 익스텐션 및 워크스페이스 설정

### 11. 실전 예시

- [실전 예시](./11-examples/실전-예시.md) - Post, Chat, Auth 기능 예시
- [주의사항](./11-examples/주의사항.md) - 자주하는 실수, Server Actions, layouts 폴더

### 12. 체크리스트 & 참고자료

- [코드 작성 체크리스트](./12-checklists/코드-작성-체크리스트.md) - PR 전 필수 체크리스트
- [추가 리소스](./12-checklists/추가-리소스.md) - 외부 학습 자료 링크

---

## 🔍 상황별 문서 찾기

| 하고 싶은 일           | 참고 문서                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **새 컴포넌트 만들기** | [복사용 템플릿](./01-onboarding/복사용-템플릿.md) → [컴포넌트 구조](./06-code-style/컴포넌트-구조.md)                         |
| **새 API 훅 만들기**   | [복사용 템플릿](./01-onboarding/복사용-템플릿.md) → [TanStack Query 네이밍](./03-naming-conventions/TanStack-Query-네이밍.md) |
| **파일명 짓기**        | [네이밍 규칙 총정리](./03-naming-conventions/네이밍-규칙-총정리.md)                                                           |
| **TSDoc 작성하기**     | [TSDoc 작성 규칙](./05-documentation/TSDoc-작성-규칙.md)                                                                      |
| **Server/Client 결정** | [Server vs Client Component](./07-nextjs-specific/Server-vs-Client-Component.md)                                              |
| **전역 상태 관리**     | [Zustand 스토어 규칙](./08-state-management/Zustand-스토어-규칙.md)                                                           |
| **라이브러리 선택**    | [라이브러리 가이드](./09-libraries/00-README.md)                                                                              |
| **PR 전 체크**         | [코드 작성 체크리스트](./12-checklists/코드-작성-체크리스트.md)                                                               |

---

## 📌 핵심 원칙

1. **Server Component 우선** - 기본은 서버, 필요할 때만 클라이언트
2. **명확한 문서화** - 모든 export에 TSDoc, 호버로 즉시 이해 가능
3. **일관된 구조** - 폴더, 네이밍, 코드 구조의 일관성 유지
4. **타입 안정성** - 모든 코드에 명확한 타입 정의
5. **레이어 의존성** - app → layouts → features → shared

---

## 💡 문서 사용 팁

### IDE에서 빠르게 열기

각 문서는 150-600줄 이하로 작성되어 IDE에서 렉 없이 즉시 로딩됩니다.

### GitHub에서 보기

복잡한 구조를 한눈에 보고 싶다면 GitHub에서 보는 것을 추천합니다.

### 검색 활용

VS Code의 **Ctrl+P** 또는 **Cmd+P**로 파일명을 검색하여 빠르게 접근할 수 있습니다.

- `네이밍` 검색 → 네이밍 관련 문서들
- `Quick` 검색 → Quick Start
- `템플릿` 검색 → 복사용 템플릿

---

## 🔄 문서 업데이트 이력

- **2026년 2월 4일 (v2)**: Boilerplate 범용화
  - 프로젝트 특정 예시를 generic 패턴으로 변경
  - 선택적 라이브러리 분리 (09-libraries/optional/)
  - "참고용 예시" 섹션으로 실제 프로젝트 구현 사례 분리
- **2026년 2월 4일 (v1)**: 4,684줄 단일 파일을 34개 문서로 분할
  - IDE 성능 문제 해결 (Loading... 및 렉 제거)
  - 주제별 명확한 구분으로 검색 및 탐색 용이
  - 신입 개발자 온보딩 가이드 추가
  - 복사용 템플릿 추가

---

**메인 README**: [../README.md](../README.md)
