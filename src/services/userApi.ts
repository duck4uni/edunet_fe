import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';
import type { ApiResponse, PaginatedResponse, User } from './authApi';

// Student Types
export interface Student {
  id: string;
  studentId?: string;
  userId: string;
  school?: string;
  grade?: string;
  totalCoursesEnrolled?: number;
  totalCoursesCompleted?: number;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryParams {
  page?: number;
  size?: number | string;
  filter?: string;
  sort?: string;
  include?: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Users', 'Students'],
  endpoints: (builder) => ({
    // ============ USERS ============
    getUsers: builder.query<PaginatedResponse<User>, QueryParams | void>({
      query: (params) => ({
        url: '/users',
        method: 'get',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
    }),

    deleteUser: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    // ============ STUDENTS ============
    getStudents: builder.query<PaginatedResponse<Student>, QueryParams | void>({
      query: (params) => ({
        url: '/students',
        method: 'get',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }) => ({ type: 'Students' as const, id })),
              { type: 'Students', id: 'LIST' },
            ]
          : [{ type: 'Students', id: 'LIST' }],
    }),

    getStudentById: builder.query<ApiResponse<Student>, string>({
      query: (id) => ({
        url: `/students/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Students', id }],
    }),

    createStudent: builder.mutation<ApiResponse<Student>, { userId: string; school?: string; grade?: string }>({
      query: (data) => ({
        url: '/students',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Students', id: 'LIST' }],
    }),

    updateStudent: builder.mutation<ApiResponse<Student>, { id: string; data: Partial<Student> }>({
      query: ({ id, data }) => ({
        url: `/students/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Students', id }, { type: 'Students', id: 'LIST' }],
    }),

    deleteStudent: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/students/${id}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'Students', id: 'LIST' }],
    }),
  }),
});

export const {
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Students
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = userApi;
