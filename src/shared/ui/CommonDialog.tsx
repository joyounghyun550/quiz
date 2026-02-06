"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Dialog, Dimmer } from "@itandsy/react-common";

import { useModalHistory, useScrollLock } from "@/shared/hooks";
import type { CommonDialogProps } from "@/shared/types/common.type";

const CommonDialog = ({
  isOpen,
  onClose,
  onActionClick,
  heading,
  fixed = false,
  summary,
  description,
  content,
  mainButton,
  subAction,
  mainButtonColor,
  mainButtonDisable,
  adminRadius = true,
  borderAdmin = true,
  bottomSpace = true,
  caption,
  priority,
  close = true,
  useHistoryManagement = false,
  historyOptions,
  scrollLockClassName = "dialog-open",
  isMobileDialog = false,
  showCustomScrollbar = false,
}: CommonDialogProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isStyleReady, setIsStyleReady] = useState(false);
  // content key를 state로 관리하여 강제 리렌더링 트리거
  const [contentKey, setContentKey] = useState(0);

  // historyOptions에서 개별 속성 추출 (참조 안정성 확보)
  const skipPushState = historyOptions?.skipPushState;
  const skipHistoryBack = historyOptions?.skipHistoryBack;
  const cleanupPreviousModalHistory = historyOptions?.cleanupPreviousModalHistory;

  // 스크롤 잠금 (다이얼로그가 열릴 때 배경 스크롤 방지)
  useScrollLock(isOpen, { className: scrollLockClassName });

  // 히스토리 관리 (옵션이 활성화된 경우에만)
  useModalHistory(
    isOpen, // ← useHistoryManagement && isOpen이 아니라 그냥 isOpen
    onClose ?? (() => void 0),
    skipPushState !== undefined || skipHistoryBack !== undefined || cleanupPreviousModalHistory !== undefined
      ? {
          enabled: useHistoryManagement,
          skipPushState,
          skipHistoryBack,
          cleanupPreviousModalHistory,
        }
      : { enabled: useHistoryManagement }
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 다이얼로그가 열릴 때 스타일 준비 상태 관리
  useEffect(() => {
    if (isOpen) {
      // 스타일이 적용되지 않은 상태로 초기화
      setIsStyleReady(false);

      // 즉시 리렌더링
      setContentKey((prev) => prev + 1);

      // 레이아웃 안정화를 위한 지연 후 재렌더링 (isXs 화면 대응)
      const timer = setTimeout(() => {
        setContentKey((prev) => prev + 1);
        // 스타일 적용 완료
        setIsStyleReady(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // 다이얼로그가 닫힐 때 key 초기화
      setContentKey(0);
      setIsStyleReady(false);
    }
  }, [isOpen]);

  const dialog = (
    <Dimmer isActive={isOpen} onClick={onClose}>
      <div style={{ opacity: isStyleReady ? 1 : 0, transition: "opacity 150ms ease-in-out" }}>
        <Dialog
          className={`${isMobileDialog ? "py-[12px]" : ""}`}
          isBuildIn
          isOpen={isOpen}
          onClose={onClose ?? (() => void 0)}
          heading={heading}
          fixed={fixed}
          {...(summary ? { summary } : {})}
          actions={true}
          description={description}
          content={content ? <div key={contentKey}>{content}</div> : undefined}
          mainButton={mainButton}
          subAction={subAction}
          adminRadius={adminRadius}
          borderAdmin={borderAdmin}
          mainButtonColor={mainButtonColor}
          mainButtonDisable={mainButtonDisable}
          bottomSpace={bottomSpace}
          close={close}
          onActionClick={onActionClick}
          caption={caption}
          priority={priority}
          showCustomScrollbar={showCustomScrollbar}
        />
      </div>
    </Dimmer>
  );

  if (!isMounted || typeof document === "undefined") return null;

  return createPortal(dialog, document.body);
};

export default CommonDialog;
