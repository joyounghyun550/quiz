import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

import { ApiError } from "@/shared/types";

/**
 * Axios 인스턴스 생성
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // 401 에러 시 토큰 갱신 또는 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      // TODO: 토큰 갱신 로직 또는 로그인 페이지로 리다이렉트
      localStorage.removeItem("accessToken");
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
