import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * className 병합 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 클래스명을 병합합니다.
 *
 * @param inputs - 병합할 클래스명들
 * @returns 병합된 클래스명 문자열
 *
 * @example
 * ```tsx
 * cn("px-4", "py-2", "bg-red-500") // "px-4 py-2 bg-red-500"
 * cn("px-4", isActive && "bg-red-500") // "px-4 bg-red-500" (isActive가 true일 때)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
