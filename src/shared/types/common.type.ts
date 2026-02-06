/**
 * 공통 타입 정의
 */

import { Priority } from "@itandsy/react-common";

export type ApiResponse<T> = {
  data: T;
  message?: string;
  statusCode: number;
};

export type ApiError = {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
};

export type CommonDialogProps = {
  isOpen: boolean;
  onClose?: () => void;
  onActionClick: (buttonType: "main" | "subaction" | "alternative") => void;
  heading?: string;
  summary?: string;
  description?: string;
  content?: React.ReactNode;
  fixed?: boolean;
  mainButton?: string;
  subAction?: string;
  mainButtonColor?: string;
  mainButtonDisable?: boolean;
  caption?: string;
  priority?: Priority;
  adminRadius?: boolean;
  borderAdmin?: boolean;
  bottomSpace?: boolean;
  close?: boolean;
  useHistoryManagement?: boolean;
  historyOptions?: {
    skipPushState?: boolean;
    skipHistoryBack?: boolean | (() => boolean);
    cleanupPreviousModalHistory?: boolean;
  };
  scrollLockClassName?: string;
  isMobileDialog?: boolean;
  showCustomScrollbar?: boolean;
};
