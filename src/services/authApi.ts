import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'student' | 'teacher';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  role: 'student' | 'teacher' | 'admin';
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    rows: T[];
    count: number;
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'post',
        data: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'post',
        data,
      }),
    }),

    // Register Teacher (multipart/form-data — CV PDF required)
    registerTeacher: builder.mutation<ApiResponse<{ message: string }>, FormData>({
      query: (formData) => ({
        url: '/auth/register/teacher',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    // Get Profile
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => ({
        url: '/auth/profile',
        method: 'get',
      }),
      providesTags: ['User'],
    }),

    // Refresh Token
    refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'post',
        data,
      }),
    }),

    // Logout
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'post',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Forgot Password
    forgotPassword: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'post',
        data,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation<ApiResponse<null>, { token: string; password: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'post',
        data,
      }),
    }),

    // Update Profile
    updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (data) => ({
        url: `/users/${data.id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterTeacherMutation,
  useGetProfileQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} = authApi;
