"use client";

import { useEffect, useRef } from "react";

// 전역 모달 스택 - 열린 모달의 ID를 순서대로 관리
const modalStack: string[] = [];

/**
 * 모달 히스토리 관리 훅
 * 모달이 열릴 때 히스토리에 상태를 추가하고, 뒤로 가기 시 모달을 닫습니다.
 *
 * @param isOpen - 모달이 열려있는지 여부
 * @param onClose - 모달을 닫는 함수
 * @param options - 옵션 객체
 * @param options.enabled - 히스토리 관리 활성화 여부 (기본값: true)
 * @param options.skipPushState - 모달이 열릴 때 pushState를 하지 않음 (기본값: false)
 * @param options.skipHistoryBack - 모달이 닫힐 때 history.back()을 하지 않음. boolean 또는 함수로 전달 가능 (기본값: false)
 * @param options.cleanupPreviousModalHistory - skipPushState가 true인 경우, 이전 모달의 히스토리 항목을 정리할지 여부 (기본값: false)
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * useModalHistory(isOpen, () => setIsOpen(false));
 * ```
 */
export const useModalHistory = (
  isOpen: boolean,
  onClose: () => void,
  options?: {
    enabled?: boolean;
    skipPushState?: boolean;
    skipHistoryBack?: boolean | (() => boolean);
    cleanupPreviousModalHistory?: boolean;
  }
) => {
  const enabled = options?.enabled ?? true;

  const isClosingByBackButton = useRef(false);
  const onCloseRef = useRef(onClose);
  const isOpenRef = useRef(isOpen);
  const modalIdRef = useRef<string | null>(null);
  const skipPushStateRef = useRef(options?.skipPushState ?? false);
  const enabledRef = useRef(enabled);
  const skipHistoryBackRef = useRef(options?.skipHistoryBack);

  // ref 업데이트 (항상 최신 값 유지)
  onCloseRef.current = onClose;
  isOpenRef.current = isOpen;
  enabledRef.current = enabled;
  skipPushStateRef.current = options?.skipPushState ?? false;
  skipHistoryBackRef.current = options?.skipHistoryBack;

  useEffect(() => {
    if (!enabledRef.current) {
      return;
    }

    if (isOpen) {
      if (!skipPushStateRef.current) {
        if (modalIdRef.current && modalStack.includes(modalIdRef.current)) {
          // 이미 등록됨
        } else {
          const modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          modalIdRef.current = modalId;
          modalStack.push(modalId);

          // sessionStorage에 저장 (Next.js 영향 안 받음)
          sessionStorage.setItem(`modal_${modalId}`, "open");

          // 간단한 pushState (state 없이)
          window.history.pushState(null, "");
        }
      }
      isClosingByBackButton.current = false;
    }

    const handlePopState = () => {
      if (skipPushStateRef.current) {
        if (isOpenRef.current) {
          isClosingByBackButton.current = true;
          onCloseRef.current();
        }
        return;
      }

      const isTopModal = modalIdRef.current && modalStack[modalStack.length - 1] === modalIdRef.current;
      if (!isTopModal) return;

      // sessionStorage에서 확인
      if (modalIdRef.current) {
        const isModalOpen = sessionStorage.getItem(`modal_${modalIdRef.current}`);

        if (isModalOpen) {
          // 모달이 열려있으면 닫기
          const index = modalStack.indexOf(modalIdRef.current);
          if (index > -1) {
            modalStack.splice(index, 1);
          }

          if (isOpenRef.current) {
            isClosingByBackButton.current = true;
            sessionStorage.removeItem(`modal_${modalIdRef.current}`);
            modalIdRef.current = null;
            onCloseRef.current();
          }
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      if (!isOpenRef.current && !isClosingByBackButton.current) {
        if (modalIdRef.current) {
          // ref를 통해 최신 skipHistoryBack 값 참조
          const shouldSkipHistoryBack =
            typeof skipHistoryBackRef.current === "function"
              ? skipHistoryBackRef.current()
              : (skipHistoryBackRef.current ?? false);

          if (!shouldSkipHistoryBack) {
            // sessionStorage 확인
            const isModalOpen = sessionStorage.getItem(`modal_${modalIdRef.current}`);

            if (isModalOpen) {
              const modalIdToRemove = modalIdRef.current;

              const handlePopStateForCleanup = () => {
                const index = modalStack.indexOf(modalIdToRemove);
                if (index > -1) {
                  modalStack.splice(index, 1);
                }
                sessionStorage.removeItem(`modal_${modalIdToRemove}`);
              };

              window.addEventListener("popstate", handlePopStateForCleanup, { once: true });
              window.history.back();
              modalIdRef.current = null;
            } else {
              const index = modalStack.indexOf(modalIdRef.current);
              if (index > -1) {
                modalStack.splice(index, 1);
              }
              modalIdRef.current = null;
            }
          } else {
            const index = modalStack.indexOf(modalIdRef.current);
            if (index > -1) {
              modalStack.splice(index, 1);
            }
            sessionStorage.removeItem(`modal_${modalIdRef.current}`);
            modalIdRef.current = null;
          }
        }
      }
    };
    // options를 dependency에서 제거하여 불필요한 재실행 방지
    // options의 값들은 ref를 통해 최신 값으로 접근
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
};
