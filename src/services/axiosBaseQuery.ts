import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { type AxiosRequestConfig, AxiosError } from 'axios';

// Token storage utilities
const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';
const envApiBaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL)
    : '';

export const API_BASE_URL = (envApiBaseUrl.trim() || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

const TOKEN_KEY = 'edunet_access_token';
const REFRESH_TOKEN_KEY = 'edunet_refresh_token';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      // Add authorization header if token exists
      const token = getAccessToken();
      const authHeaders: Record<string, string> = {};
      if (token && token !== 'null' && token !== 'undefined') {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          ...authHeaders,
          ...headers,
        },
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
