# Zustand 스토어 작성 규칙

📍 **위치**: [홈](../00-README.md) > [상태 관리](../08-state-management/) > Zustand 스토어 규칙

---

## 기본 구조

```typescript
// stores/user.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserState {
  // 상태
  user: User | null;
  isAuthenticated: boolean;

  // 액션
  setUser: (user: User) => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
        reset: () => set(initialState),
      }),
      { name: "user-storage" } // localStorage 키
    ),
    { name: "UserStore" } // Redux DevTools 표시명
  )
);
```

---

## 네이밍 규칙

| 항목    | 규칙                | 예시                              |
| ------- | ------------------- | --------------------------------- |
| 파일명  | `[도메인].store.ts` | `user.store.ts`, `cart.store.ts`  |
| 훅 이름 | `use[Domain]Store`  | `useUserStore`, `useCartStore`    |
| 액션    | `동사 + 명사`       | `setUser`, `addItem`, `clearCart` |

---

## Store vs TanStack Query 사용 기준

| 상황                     | 권장 도구         | 이유                              |
| ------------------------ | ----------------- | --------------------------------- |
| 서버에서 가져온 데이터   | TanStack Query    | 캐싱, 동기화, 백그라운드 업데이트 |
| UI 상태 (모달, 사이드바) | Zustand           | 서버 동기화 불필요                |
| 사용자 인증 정보         | Zustand + persist | 로컬 지속성 필요                  |
| 폼 입력 상태             | React useState    | 컴포넌트 로컬 상태                |
| 전역 설정 (테마, 언어)   | Zustand + persist | 전역 공유 + 지속성                |

---

## 미들웨어 사용 가이드

```typescript
// 1. devtools - 개발 시 Redux DevTools로 상태 디버깅
devtools(store, { name: "StoreName" })

// 2. persist - localStorage/sessionStorage 지속성
persist(store, {
  name: "storage-key",
  partialize: (state) => ({ user: state.user }), // 일부만 저장
})

// 3. immer - 불변성 관리 (복잡한 중첩 객체)
immer(store)

// 조합 예시 (바깥에서 안쪽으로 적용)
create<State>()(
  devtools(
    persist(
      immer((set) => ({ ... })),
      { name: "key" }
    ),
    { name: "StoreName" }
  )
)
```

---

## 선택적 구독 (성능 최적화)

```typescript
// ❌ 전체 스토어 구독 - 모든 상태 변경에 리렌더링
const { user, cart } = useUserStore();

// ✅ 필요한 상태만 선택 구독
const user = useUserStore((state) => state.user);
const addItem = useCartStore((state) => state.addItem);

// ✅ 여러 값을 shallow로 구독
import { useShallow } from "zustand/react/shallow";

const { user, isAuthenticated } = useUserStore(
  useShallow((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }))
);
```

---

## 비동기 액션

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const user = await authApi.login(credentials);
        set({ user, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },
  }))
);
```

---

**관련 문서**:

- [TanStack Query 사용법](./TanStack-Query-사용법.md)
- [폴더 구조](../02-architecture/폴더-구조.md)

**최종 업데이트**: 2026년 2월 4일
