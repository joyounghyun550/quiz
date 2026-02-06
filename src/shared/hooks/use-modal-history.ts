"use client";

import { useEffect, useRef } from "react";

/**
 * 전역 모달 스택 - 현재 열린 모달들의 ID를 순서대로 관리
 *
 * @example
 * ["modal-1701234567890-abc123", "modal-1701234590123-def456"]
 *        ↑ 첫 번째 모달              ↑ 두 번째 모달 (최상위)
 *
 * 스택 구조를 사용하여 중첩 모달을 지원:
 * - push: 모달 열릴 때 ID 추가
 * - pop: 뒤로 가기 시 최상위 모달만 제거
 */
const modalStack: string[] = [];

/**
 * 모달 히스토리 관리 훅
 *
 * 브라우저의 "뒤로 가기" 버튼으로 모달을 닫을 수 있게 만드는 훅입니다.
 * 모바일 앱의 UX를 웹에서 구현합니다.
 *
 * ## 핵심 동작 원리
 *
 * 1. **모달 열림**: `window.history.pushState()`로 히스토리 항목 추가
 * 2. **뒤로 가기**: `popstate` 이벤트를 감지하여 모달만 닫기 (페이지 이동 X)
 * 3. **모달 직접 닫기**: `history.back()`으로 히스토리 정리
 *
 * ## 주요 기능
 *
 * - ✅ 중첩 모달 지원 (모달 위에 모달)
 * - ✅ sessionStorage로 새로고침에도 안전
 * - ✅ React Strict Mode 호환
 * - ✅ 메모리 누수 방지 (cleanup)
 *
 * @param isOpen - 모달이 열려있는지 여부
 * @param onClose - 모달을 닫는 콜백 함수
 * @param options - 옵션 객체
 * @param options.enabled - 히스토리 관리 활성화 여부 (기본값: true)
 * @param options.skipPushState - 모달이 열릴 때 pushState를 하지 않음 (기본값: false)
 *   → 사용 예: 뒤로 가기 감지만 필요한 Drawer 컴포넌트
 * @param options.skipHistoryBack - 모달이 닫힐 때 history.back()을 하지 않음 (기본값: false)
 *   → boolean 또는 함수로 전달 가능 (동적 제어)
 * @param options.cleanupPreviousModalHistory - skipPushState가 true인 경우, 이전 모달의 히스토리 항목을 정리할지 여부 (기본값: false)
 *   → 현재 미사용 (향후 확장용)
 *
 * @example
 * // 기본 사용법
 * const [isOpen, setIsOpen] = useState(false);
 * useModalHistory(isOpen, () => setIsOpen(false));
 *
 * @example
 * // Drawer 컴포넌트 (pushState 없이 뒤로 가기만 감지)
 * useModalHistory(isDrawerOpen, closeDrawer, {
 *   skipPushState: true
 * });
 *
 * @example
 * // 조건부 히스토리 관리
 * useModalHistory(isOpen, onClose, {
 *   skipHistoryBack: () => someCondition
 * });
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
  // 옵션 기본값 설정
  const enabled = options?.enabled ?? true;

  /**
   * 뒤로 가기 버튼으로 닫혔는지 여부를 추적
   *
   * 용도: 모달 닫힐 때 history.back()을 호출할지 결정
   * - true: 뒤로 가기로 닫힘 → history.back() 불필요
   * - false: X 버튼 등으로 직접 닫힘 → history.back() 호출 필요
   */
  const isClosingByBackButton = useRef(false);

  /**
   * 최신 onClose 함수를 참조하는 ref
   *
   * 이유: useEffect의 의존성 배열에서 제외하여 불필요한 재실행 방지
   * 클로저 문제(stale closure) 해결
   */
  const onCloseRef = useRef(onClose);

  /**
   * 최신 isOpen 상태를 참조하는 ref
   *
   * 이유: 이벤트 리스너 내부에서 항상 최신 상태 접근
   */
  const isOpenRef = useRef(isOpen);

  /**
   * 현재 모달의 고유 ID를 저장하는 ref
   *
   * 형식: "modal-{타임스탬프}-{랜덤문자열}"
   * 예: "modal-1701234567890-5k3j2x9a1"
   *
   * 용도:
   * - modalStack에서 현재 모달 식별
   * - sessionStorage 키로 사용
   */
  const modalIdRef = useRef<string | null>(null);

  /**
   * skipPushState 옵션 값을 저장하는 ref
   */
  const skipPushStateRef = useRef(options?.skipPushState ?? false);

  /**
   * enabled 옵션 값을 저장하는 ref
   */
  const enabledRef = useRef(enabled);

  /**
   * skipHistoryBack 옵션 값을 저장하는 ref
   */
  const skipHistoryBackRef = useRef(options?.skipHistoryBack);

  /**
   * 모든 ref를 렌더링마다 최신 값으로 업데이트
   *
   * 이렇게 하면:
   * - useEffect 의존성 배열에 함수를 넣지 않아도 됨
   * - 불필요한 이벤트 리스너 재등록 방지
   * - 성능 최적화
   */
  onCloseRef.current = onClose;
  isOpenRef.current = isOpen;
  enabledRef.current = enabled;
  skipPushStateRef.current = options?.skipPushState ?? false;
  skipHistoryBackRef.current = options?.skipHistoryBack;

  useEffect(() => {
    // 훅이 비활성화되면 아무것도 하지 않음
    if (!enabledRef.current) {
      return;
    }

    // ========================================
    // 모달 열림 처리
    // ========================================
    if (isOpen) {
      // skipPushState가 false일 때만 히스토리 추가
      if (!skipPushStateRef.current) {
        // React Strict Mode 대응: 중복 등록 방지
        if (modalIdRef.current && modalStack.includes(modalIdRef.current)) {
          // 이미 등록된 모달 → 아무것도 하지 않음
          // Strict Mode에서는 useEffect가 2번 실행되므로 필요
        } else {
          // ========================================
          // 신규 모달 등록 프로세스
          // ========================================

          // 1. 고유 ID 생성 (타임스탬프 + 랜덤 문자열)
          const modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          modalIdRef.current = modalId;

          // 2. 전역 스택에 추가 (중첩 모달 관리용)
          modalStack.push(modalId);

          // 3. sessionStorage에 저장 (새로고침에도 안전)
          // 브라우저 새로고침 시에도 모달 상태를 추적할 수 있음
          sessionStorage.setItem(`modal_${modalId}`, "open");

          // 4. 브라우저 히스토리에 가짜 항목 추가
          // state: null → 실제 페이지 이동이 아님을 표시
          // 이제 뒤로 가기를 누르면 이 항목이 pop됨
          window.history.pushState(null, "");
        }
      }

      // 뒤로 가기 플래그 초기화 (모달이 열린 상태에서는 항상 false)
      isClosingByBackButton.current = false;
    }

    /**
     * popstate 이벤트 핸들러
     *
     * 브라우저의 뒤로 가기/앞으로 가기 버튼을 누르면 발생
     *
     * 주요 역할:
     * 1. 페이지 이동 대신 모달만 닫기
     * 2. 중첩 모달 중 최상위만 닫기
     * 3. sessionStorage 정리
     */
    const handlePopState = () => {
      // ========================================
      // Case 1: skipPushState 모드
      // ========================================
      // pushState를 하지 않았으므로 단순히 모달만 닫기
      if (skipPushStateRef.current) {
        if (isOpenRef.current) {
          isClosingByBackButton.current = true;
          onCloseRef.current();
        }
        return;
      }

      // ========================================
      // Case 2: 일반 모드 (pushState 사용)
      // ========================================

      // 현재 모달이 최상위 모달인지 확인
      const isTopModal = modalIdRef.current && modalStack[modalStack.length - 1] === modalIdRef.current;

      // 최상위가 아니면 무시 (하위 모달은 뒤로 가기로 닫히지 않음)
      if (!isTopModal) return;

      // sessionStorage에서 모달 상태 확인
      if (modalIdRef.current) {
        const isModalOpen = sessionStorage.getItem(`modal_${modalIdRef.current}`);

        if (isModalOpen) {
          // ========================================
          // 모달 닫기 프로세스
          // ========================================

          // 1. 스택에서 제거
          const index = modalStack.indexOf(modalIdRef.current);
          if (index > -1) {
            modalStack.splice(index, 1);
          }

          // 2. 모달이 열려있다면 닫기
          if (isOpenRef.current) {
            isClosingByBackButton.current = true; // 뒤로 가기로 닫힘을 표시
            sessionStorage.removeItem(`modal_${modalIdRef.current}`); // 저장소 정리
            modalIdRef.current = null; // ID 초기화
            onCloseRef.current(); // 실제 모달 닫기 (부모 컴포넌트의 setState 호출)
          }
        }
      }
    };

    // popstate 이벤트 리스너 등록
    window.addEventListener("popstate", handlePopState);

    // ========================================
    // Cleanup 함수 (useEffect 종료 시 실행)
    // ========================================
    return () => {
      // 1. 이벤트 리스너 제거 (메모리 누수 방지)
      window.removeEventListener("popstate", handlePopState);

      // ========================================
      // Case: 모달이 직접 닫힘 (X 버튼 클릭 등)
      // ========================================
      // 조건: 모달이 닫혀있고(isOpenRef.current === false)
      //       뒤로 가기로 닫힌 게 아님(isClosingByBackButton.current === false)
      if (!isOpenRef.current && !isClosingByBackButton.current) {
        if (modalIdRef.current) {
          // skipHistoryBack 옵션 확인
          // 함수일 경우 실행하여 boolean 값 얻기
          const shouldSkipHistoryBack =
            typeof skipHistoryBackRef.current === "function"
              ? skipHistoryBackRef.current()
              : (skipHistoryBackRef.current ?? false);

          if (!shouldSkipHistoryBack) {
            // ========================================
            // 히스토리 정리 프로세스
            // ========================================
            // 모달 열 때 추가한 히스토리 항목을 제거하여
            // 이후 뒤로 가기가 정상 작동하도록 함

            // sessionStorage에서 모달 상태 확인
            const isModalOpen = sessionStorage.getItem(`modal_${modalIdRef.current}`);

            if (isModalOpen) {
              // 모달이 아직 열린 상태로 기록되어 있으면 정리 필요
              const modalIdToRemove = modalIdRef.current;

              /**
               * 히스토리 정리용 일회성 이벤트 핸들러
               *
               * history.back() 호출 시 발생하는 popstate에서
               * 스택과 sessionStorage 정리
               */
              const handlePopStateForCleanup = () => {
                // 스택에서 제거
                const index = modalStack.indexOf(modalIdToRemove);
                if (index > -1) {
                  modalStack.splice(index, 1);
                }
                // sessionStorage 정리
                sessionStorage.removeItem(`modal_${modalIdToRemove}`);
              };

              // once: true → 한 번만 실행 후 자동 제거 (성능 최적화)
              window.addEventListener("popstate", handlePopStateForCleanup, { once: true });

              // 히스토리 뒤로 가기 (모달 열 때 추가한 항목 제거)
              window.history.back();

              // ID 초기화
              modalIdRef.current = null;
            } else {
              // sessionStorage에 없으면 스택만 정리
              const index = modalStack.indexOf(modalIdRef.current);
              if (index > -1) {
                modalStack.splice(index, 1);
              }
              modalIdRef.current = null;
            }
          } else {
            // ========================================
            // skipHistoryBack가 true인 경우
            // ========================================
            // history.back() 없이 스택과 sessionStorage만 정리
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

    // ========================================
    // 의존성 배열
    // ========================================
    // isOpen만 포함:
    // - onClose는 ref로 관리하므로 제외
    // - options도 ref로 관리하므로 제외
    // - 불필요한 재실행 방지로 성능 최적화
    //
    // eslint-disable 이유:
    // - exhaustive-deps 규칙은 ref 패턴을 이해하지 못함
    // - ref를 통해 최신 값을 안전하게 접근하므로 문제없음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
};
