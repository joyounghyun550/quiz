/**
 * 공통 타입 정의
 */

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
