# BuildIn Web Front

BuildIn 웹 프론트엔드 프로젝트입니다.

## 기술 스택

### 핵심 프레임워크

- **Next.js**: `14.2.35` - React 기반 풀스택 프레임워크
- **React**: `^18` - UI 라이브러리
- **TypeScript**: `^5` - 타입 안정성

### 스타일링

- **Tailwind CSS**: `^3.4.19` - 유틸리티 퍼스트 CSS 프레임워크
- **@itandsy/react-common**: `^1.6.0` - 공통 컴포넌트 라이브러리

### 상태 관리 & 데이터 페칭

- **@tanstack/react-query**: `^5.x` - 서버 상태 관리 및 데이터 페칭
- **axios**: `^1.13.2` - HTTP 클라이언트

### 코드 품질

- **ESLint**: `^8` - 코드 린팅
- **Prettier**: `^3.4.1` - 코드 포맷팅
- **Husky**: `^9.1.7` - Git 훅 관리
- **lint-staged**: `^16.2.7` - Staged 파일만 검사

### 개발 도구

- **PostCSS**: `^8.5.6` - CSS 후처리
- **Autoprefixer**: `^10.4.23` - CSS 벤더 프리픽스 자동 추가

## 주요 기능

- ✅ **FSD Lite 아키텍처** - 확장 가능한 폴더 구조
- ✅ **TypeScript** - 타입 안정성 보장
- ✅ **Tailwind CSS** - 빠른 스타일링
- ✅ **React Query** - 효율적인 서버 상태 관리
- ✅ **커스텀 테마** - 브랜드 색상 커스터마이징
- ✅ **반응형 디자인** - 미디어 쿼리 훅 제공
- ✅ **코드 품질 관리** - ESLint + Prettier + Husky
- ✅ **자동 Import 정렬** - Import 순서 자동 관리

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지 (레이아웃 없음)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── shared/                 # 공유 레이어
│   ├── ui/                # 공유 UI 컴포넌트
│   ├── lib/               # 공유 유틸리티 (axios, query-client 등)
│   ├── hooks/             # 공유 훅 (use-media-query 등)
│   ├── types/             # 공유 타입
│   ├── constants/         # 공유 상수
│   ├── config/            # 설정 파일 (theme 등)
│   └── styles/            # 전역 스타일
├── entities/              # 엔티티 레이어 (비즈니스 엔티티)
├── features/              # 기능 레이어 (사용자 액션)
├── widgets/               # 위젯 레이어 (복합 컴포넌트)
└── assets/                # 정적 파일 (이미지, 폰트 등)
```

자세한 아키텍처 설명은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 개발 환경 설정

### 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_API_BASE_URL=http://your-api-url.com
```

### Path Alias

프로젝트는 절대경로 import를 사용합니다:

```typescript
// ✅ 권장
import { Button } from "@/shared/ui/Button";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

// ❌ 비권장 (ESLint 에러)
import { Button } from "../../shared/ui/Button";
```

사용 가능한 Path Alias:

- `@/app/*` → `src/app/*`
- `@/shared/*` → `src/shared/*`
- `@/entities/*` → `src/entities/*`
- `@/features/*` → `src/features/*`
- `@/widgets/*` → `src/widgets/*`
- `@/assets/*` → `src/assets/*`

### 테마 커스터마이징

프로젝트의 브랜드 색상을 변경하려면 `src/shared/config/theme.ts`를 수정하세요:

```typescript
export const customThemeTokens = {
  colors: {
    "color-alias-primary-normal": "#0066FF", // 프라이머리 색상
    "color-alias-primary-strong": "#005EEB",
    "color-alias-primary-heavy": "#0054D1",
  },
};
```

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `.next` 폴더에 생성됩니다.

### 프로덕션 서버 실행

```bash
npm start
```

### 타입 체크

```bash
npm run type-check
```

## 코드 컨벤션

### ESLint

프로젝트는 엄격한 ESLint 규칙을 사용합니다:

```bash
# 린트 검사
npm run lint

# 자동 수정
npm run lint -- --fix
```

주요 규칙:

- 절대경로 사용 강제 (`@/` 사용)
- Import 순서 자동 정렬
- 컴포넌트는 화살표 함수 + default export
- 훅/API/유틸은 named export
- 레이어 의존성 검사

### Prettier

코드 포맷팅은 Prettier를 사용합니다:

```bash
# 포맷팅
npm run format

# 포맷팅 체크
npm run format:check
```

### Git Hooks

커밋 시 자동으로 코드 품질 검사가 실행됩니다:

- **pre-commit**: ESLint 자동 수정 + Prettier 포맷팅
- **pre-push**: TypeScript 타입 체크

### 파일 네이밍 규칙

- **컴포넌트**: PascalCase (예: `Button.tsx`, `UserProfile.tsx`)
- **훅**: kebab-case (예: `use-media-query.ts`)
- **유틸/API**: kebab-case (예: `format-date.ts`, `user.api.ts`)
- **타입**: kebab-case (예: `user.type.ts`)

## 주요 라이브러리

### @itandsy/react-common

공통 컴포넌트 라이브러리로, 다양한 UI 컴포넌트와 테마 시스템을 제공합니다.

**주요 컴포넌트:**

- `SolidPrimary`, `OutlinedPrimary`, `TextPrimary` - 버튼 컴포넌트
- `Badge` - 배지 컴포넌트
- `Dialog` - 다이얼로그 컴포넌트
- `ThemeProvider`, `useTheme` - 테마 관리

**사용 예시:**

```typescript
import { SolidPrimary, Badge, useTheme } from "@itandsy/react-common";

const MyComponent = () => {
  const { theme } = useTheme();

  return (
    <div>
      <SolidPrimary size="medium" label="클릭하세요" />
      <Badge variant="number" number={10} />
    </div>
  );
};
```

### @tanstack/react-query

서버 상태 관리 및 데이터 페칭을 위한 라이브러리입니다.

**사용 예시:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/lib/axios";

const usePostsQuery = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axiosInstance.get("/posts");
      return response.data;
    },
  });
};
```

### Tailwind CSS 커스텀 토큰

프로젝트는 커스텀 Tailwind 토큰을 사용합니다:

```typescript
// 색상
<div className="text-color-alias-primary-normal" />
<div className="bg-color-alias-primary-normal" />

// 타이포그래피
<h1 className="text-heading1-bold">제목</h1>
<p className="text-body1-regular">본문</p>

// Spacing
<div className="p-space-lg gap-space-md" />
```

## 스크립트

| 명령어                  | 설명                 |
| ----------------------- | -------------------- |
| `npm run dev`           | 개발 서버 실행       |
| `npm run build`         | 프로덕션 빌드        |
| `npm run start`         | 프로덕션 서버 실행   |
| `npm run lint`          | ESLint 검사          |
| `npm run lint -- --fix` | ESLint 자동 수정     |
| `npm run format`        | Prettier 포맷팅      |
| `npm run format:check`  | Prettier 포맷팅 체크 |
| `npm run type-check`    | TypeScript 타입 체크 |

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [FSD Lite 가이드](./ARCHITECTURE.md)
- [React Query 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
