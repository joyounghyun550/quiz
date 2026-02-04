# Tailwind CSS 스타일 가이드

📍 **위치**: [홈](../00-README.md) > [코드 스타일](../06-code-style/) > Tailwind CSS 가이드

---

## 클래스 순서 규칙

일관된 클래스 순서를 유지하여 가독성을 높입니다. `prettier-plugin-tailwindcss`를 사용하면 자동 정렬됩니다.

```tsx
// 권장 순서: 레이아웃 → 크기 → 간격 → 타이포그래피 → 색상 → 효과 → 상태
<div
  className={cn(
    // 1. 레이아웃 (display, position, flex/grid)
    "flex items-center justify-between",
    "relative",

    // 2. 크기 (width, height)
    "w-full h-12",

    // 3. 간격 (padding, margin, gap)
    "px-4 py-2 gap-2",

    // 4. 타이포그래피
    "text-sm font-medium",

    // 5. 색상 (배경, 텍스트, 테두리)
    "bg-white text-gray-900 border border-gray-200",

    // 6. 효과 (shadow, opacity, transform)
    "shadow-sm rounded-lg",

    // 7. 상태 (hover, focus, disabled)
    "hover:bg-gray-50 focus:ring-2 focus:ring-blue-500",

    // 8. 반응형 (sm:, md:, lg:, xl:)
    "md:w-auto md:px-6",

    // 9. 다크 모드
    "dark:bg-gray-800 dark:text-white"
  )}
>
```

---

## cn 유틸리티 활용

```typescript
// shared/utils/cn.util.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 조건부로 결합합니다.
 * clsx로 조건부 클래스를 처리하고, twMerge로 충돌하는 클래스를 병합합니다.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 조건부 스타일 패턴

```tsx
// ✅ cn 유틸리티로 조건부 클래스 적용
<button
  className={cn(
    "rounded-lg px-4 py-2 font-medium transition-colors",
    // 조건부 스타일
    variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
    variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
    variant === "ghost" && "bg-transparent hover:bg-gray-100",
    // disabled 상태
    disabled && "cursor-not-allowed opacity-50",
    // 외부에서 전달받은 className 병합
    className
  )}
>
  {children}
</button>;

// ✅ variants 패턴 (cva 라이브러리 또는 직접 구현)
const buttonVariants = {
  variant: {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  },
  size: {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  },
};
```

---

## 반응형 디자인 패턴 (Mobile First)

```tsx
// ✅ Mobile First - 기본값은 모바일, 큰 화면에서 오버라이드
<div className="
  flex flex-col          // 모바일: 세로 정렬
  md:flex-row            // 태블릿 이상: 가로 정렬
  gap-4 md:gap-8         // 모바일: 작은 간격, 태블릿 이상: 큰 간격
  px-4 md:px-8 lg:px-16  // 화면 크기에 따른 패딩
">

// 브레이크포인트 참고
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
```

---

## className prop 전달 패턴

```tsx
// 컴포넌트에서 외부 className을 받아 병합
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={cn(
        // 기본 스타일 (항상 적용)
        "rounded-lg border bg-white p-4 shadow-sm",
        // 외부에서 전달받은 클래스 (오버라이드 가능)
        className
      )}
    >
      {children}
    </div>
  );
};

// 사용
<Card className="p-6 shadow-lg"> // p-4가 p-6으로 오버라이드됨 내용</Card>;
```

---

## 자주 사용하는 패턴

```tsx
// 1. 중앙 정렬 컨테이너
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

// 2. Flexbox 센터링
<div className="flex items-center justify-center">

// 3. 절대 중앙 배치
<div className="absolute inset-0 flex items-center justify-center">

// 4. Grid 레이아웃
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// 5. 텍스트 말줄임
<p className="truncate">        // 한 줄 말줄임
<p className="line-clamp-2">    // 두 줄 말줄임

// 6. 스크롤 컨테이너
<div className="overflow-y-auto max-h-96">

// 7. 호버 효과
<button className="transition-colors hover:bg-gray-100">

// 8. 포커스 링
<input className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

---

**관련 문서**:

- [컴포넌트 구조](./컴포넌트-구조.md)
- [@itandsy/react-common 가이드](../09-libraries/itandsy-react-common.md)

**최종 업데이트**: 2026년 2월 4일
