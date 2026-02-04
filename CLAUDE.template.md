# CLAUDE.md - 프로젝트 컨텍스트

<!--
  CLAUDE.md 템플릿
  - {플레이스홀더}를 실제 값으로 교체하세요
  - [선택] 표시된 섹션은 필요 없으면 삭제하세요
  - 이 주석 블록은 완성 후 삭제하세요
-->

## 프로젝트 개요

- **프로젝트**: {프로젝트명}
- **기술 스택**: {기술스택}
  <!-- 예시: Next.js 14 (App Router) + TypeScript + TanStack Query + Zustand + Tailwind CSS -->
  <!-- 예시: React 18 + TypeScript + Redux Toolkit + Styled Components -->
  <!-- 예시: Node.js + Express + TypeScript + Prisma + PostgreSQL -->
- **패키지 매니저**: {패키지매니저}
  <!-- npm | yarn | pnpm | bun -->

---

## 핵심 컨벤션 요약

<!-- 프로젝트에서 가장 중요한 규칙들을 나열하세요 -->

### 1. {핵심규칙1 제목}

- {규칙 설명}
- 상세: [docs/{관련문서}.md](./docs/{관련문서}.md)

### 2. 폴더 구조

```
src/
├── {폴더1}/           # {설명}
├── {폴더2}/           # {설명}
├── {폴더3}/           # {설명}
└── {폴더4}/           # {설명}
```

<!--
일반적인 폴더 구조 예시:

[Next.js App Router]
src/
├── app/           # App Router 라우팅
├── features/      # 비즈니스 기능 단위
├── shared/        # 공유 리소스 (ui, hooks, utils)
├── layouts/       # 레이아웃 컴포넌트
├── providers/     # React Context Providers
├── libs/          # 외부 라이브러리 설정
├── stores/        # 상태 관리 스토어
└── assets/        # 정적 리소스

[React SPA]
src/
├── components/    # 공통 컴포넌트
├── pages/         # 페이지 컴포넌트
├── features/      # 기능별 모듈
├── hooks/         # 커스텀 훅
├── utils/         # 유틸리티 함수
├── services/      # API 서비스
├── stores/        # 상태 관리
└── types/         # 타입 정의

[Node.js Backend]
src/
├── controllers/   # 컨트롤러
├── services/      # 비즈니스 로직
├── repositories/  # 데이터 접근 계층
├── models/        # 데이터 모델
├── middlewares/   # 미들웨어
├── routes/        # 라우트 정의
├── utils/         # 유틸리티
└── types/         # 타입 정의
-->

- 상세: [docs/{폴더구조문서}.md](./docs/{폴더구조문서}.md)

### 3. [선택] 레이어 의존성

```
{상위레이어} → {중간레이어} → {하위레이어}
(상위 레이어만 하위 레이어를 import 가능)
```

### 4. 네이밍 규칙

| 대상    | 규칙   | 예시     |
| ------- | ------ | -------- |
| {대상1} | {규칙} | `{예시}` |
| {대상2} | {규칙} | `{예시}` |
| {대상3} | {규칙} | `{예시}` |
| {대상4} | {규칙} | `{예시}` |

<!--
일반적인 네이밍 규칙 예시:

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `LoginForm.tsx` |
| 훅 파일 | kebab-case + use- | `use-auth.ts` |
| 유틸리티 파일 | kebab-case + .util | `date.util.ts` |
| 타입 파일 | 동일 이름 + .type | `LoginForm.type.ts` |
| 상수 파일 | kebab-case + .constant | `api.constant.ts` |
| 테스트 파일 | 동일 이름 + .test | `LoginForm.test.tsx` |
-->

- 상세: [docs/{네이밍규칙문서}.md](./docs/{네이밍규칙문서}.md)

### 5. [선택] Import 순서

```tsx
// 1. React/프레임워크
import { useState } from "react";

// 2. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";

// 3. 내부 모듈 (절대경로)
import { cn } from "@/shared/utils";

// 4. 상대경로 import
import { useAuth } from "../hooks";

// 5. 타입
import type { Props } from "./Component.type";
```

---

## [선택] 코드 컨벤션 문서

전체 컨벤션 문서는 `docs/` 폴더에 있습니다.

### 문서 인덱스

- [docs/README.md](./docs/README.md) - 전체 문서 목록

### 주요 문서

| 상황    | 참고 문서                    |
| ------- | ---------------------------- |
| {상황1} | [{문서명}](./docs/{경로}.md) |
| {상황2} | [{문서명}](./docs/{경로}.md) |
| {상황3} | [{문서명}](./docs/{경로}.md) |

### [선택] 문서 폴더 구조

```
docs/
├── {폴더1}/    # {설명}
├── {폴더2}/    # {설명}
└── {폴더3}/    # {설명}
```

---

## 명령어

```bash
# 개발 서버
{패키지매니저} {dev명령어}

# 빌드
{패키지매니저} {build명령어}

# 린트
{패키지매니저} {lint명령어}

# 테스트
{패키지매니저} {test명령어}
```

<!--
패키지 매니저별 예시:

[pnpm]
pnpm dev
pnpm build
pnpm lint
pnpm test

[npm]
npm run dev
npm run build
npm run lint
npm run test

[yarn]
yarn dev
yarn build
yarn lint
yarn test
-->

---

## [선택] 추가 컨텍스트

<!--
Claude가 알아야 할 추가 정보를 여기에 작성하세요:
- 특별한 환경 설정
- 외부 서비스 연동 정보
- 프로젝트 특이사항
- 자주 사용하는 패턴
-->

---

# <!--

# CLAUDE.md 템플릿 사용 가이드

1. 이 파일을 프로젝트 루트에 CLAUDE.md로 복사
2. {플레이스홀더}를 실제 값으로 교체
3. [선택] 표시된 섹션 중 불필요한 것 삭제
4. 모든 주석 블록 삭제
5. docs/ 폴더가 있다면 링크 경로 확인

팁:

- 핵심 컨벤션은 3-6개 정도가 적당
- 너무 상세하면 Claude가 혼란스러워할 수 있음
- 가장 중요한 규칙 위주로 간결하게 작성
- 상세 내용은 docs/ 폴더 문서로 연결
  -->
