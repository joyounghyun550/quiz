# FSD Lite 아키텍처

이 프로젝트는 Feature-Sliced Design (FSD) Lite 아키텍처를 따릅니다.

## 폴더 구조

```
src/
├── app/              # Next.js App Router (라우팅, 레이아웃)
├── shared/           # 공유 레이어 (재사용 가능한 코드)
│   ├── ui/           # 공유 UI 컴포넌트 (Button, Input, Card 등)
│   ├── lib/          # 공유 유틸리티 함수
│   ├── api/          # 공유 API 클라이언트
│   └── model/        # 공유 타입 및 모델
├── entities/          # 엔티티 레이어 (비즈니스 엔티티)
│   └── [entity]/      # 예: user/, product/, order/
│       ├── ui/       # 엔티티 관련 UI 컴포넌트
│       ├── lib/      # 엔티티 관련 유틸리티
│       ├── api/      # 엔티티 관련 API
│       └── model/    # 엔티티 타입 및 모델
├── features/         # 기능 레이어 (사용자 액션)
│   └── [feature]/    # 예: login/, cart/, checkout/
│       ├── ui/       # 기능 관련 UI 컴포넌트
│       ├── lib/      # 기능 관련 유틸리티
│       ├── api/      # 기능 관련 API
│       └── model/    # 기능 타입 및 모델
├── widgets/          # 위젯 레이어 (복합 컴포넌트)
│   └── [widget]/     # 예: header/, sidebar/, product-list/
│       ├── ui/       # 위젯 UI 컴포넌트
│       ├── lib/      # 위젯 관련 유틸리티
│       └── model/    # 위젯 타입
└── assets/           # 정적 파일 (이미지, 폰트 등)
```

## 레이어 규칙

### Import 규칙

- 하위 레이어는 상위 레이어를 import할 수 없습니다
- 같은 레이어 내에서는 import 가능합니다
- 상위 레이어는 하위 레이어를 import할 수 있습니다

**Import 순서:**

```
app → widgets → features → entities → shared
```

### 예시

```typescript
// ✅ 올바른 import
// features/login에서 entities/user 사용
import { User } from "@/entities/user/model";

// ✅ 올바른 import
// widgets/header에서 features/login 사용
import { LoginButton } from "@/features/login/ui";

// ❌ 잘못된 import
// entities/user에서 features/login 사용 (금지)
import { LoginButton } from "@/features/login/ui";
```

## Path Alias

TypeScript path alias가 설정되어 있습니다:

- `@/app/*` → `src/app/*`
- `@/shared/*` → `src/shared/*`
- `@/entities/*` → `src/entities/*`
- `@/features/*` → `src/features/*`
- `@/widgets/*` → `src/widgets/*`
- `@/assets/*` → `src/assets/*`

## 사용 예시

### Shared UI 컴포넌트 생성

```typescript
// src/shared/ui/Button.tsx
export const Button = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};
```

### Entity 생성

```typescript
// src/entities/user/model/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

### Feature 생성

```typescript
// src/features/login/ui/LoginForm.tsx
import { Button } from "@/shared/ui/Button";
import { User } from "@/entities/user/model";

export const LoginForm = () => {
  // ...
};
```

### Widget 생성

```typescript
// src/widgets/header/ui/Header.tsx
import { LoginForm } from "@/features/login/ui";
import { UserProfile } from "@/entities/user/ui";

export const Header = () => {
  // ...
};
```

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Lite 가이드](https://feature-sliced.design/docs/get-started/quick-start)
