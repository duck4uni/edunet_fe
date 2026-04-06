import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';
import type { ApiResponse, PaginatedResponse } from './authApi';
import type {
  WeeklyScheduleResponse,
  RecurringScheduleRequest,
  RecurringScheduleResponse,
  PostponeScheduleRequest,
} from '../types/schedule';

// Material Types
export interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'document' | 'link' | 'image';
  downloadUrl: string;
  size?: string;
  courseId: string;
  createdAt: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  maxGrade: number;
  attachments?: object;
  feedback?: string;
  submissionUrl?: string;
  submittedAt?: string;
  courseId: string;
  studentId?: string;
  createdAt: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  questions?: object;
  totalQuestions: number;
  maxAttempts: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  courseId: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers?: object;
  score?: number;
  correctAnswers: number;
  totalAnswered: number;
  status: 'in_progress' | 'completed' | 'timed_out';
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  quiz?: Quiz;
}

// Schedule Types
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  type: 'class' | 'exam' | 'assignment' | 'event';
  /** Backend status */
  status?: 'scheduled' | 'cancelled' | 'postponed';
  cancelReason?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  isOnline: boolean;
  courseId?: string;
  teacherId?: string;
}

export interface QueryParams {
  page?: number;
  size?: number | string;
  filter?: string;
  sort?: string;
  include?: string;
}

export const learningApi = createApi({
  reducerPath: 'learningApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Materials', 'Assignments', 'Quizzes', 'QuizAttempts', 'Schedules'],
  endpoints: (builder) => ({
    // ============ MATERIALS ============
    getMaterials: builder.query<PaginatedResponse<Material>, QueryParams | void>({
      query: (params) => ({
        url: '/materials',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Materials'],
    }),

    getMaterialsByCourse: builder.query<ApiResponse<Material[]>, string>({
      query: (courseId) => ({
        url: `/materials/course/${courseId}`,
        method: 'get',
      }),
      providesTags: ['Materials'],
    }),

    getMaterialById: builder.query<ApiResponse<Material>, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Materials', id }],
    }),

    createMaterial: builder.mutation<ApiResponse<Material>, Partial<Material> & { courseId: string; title: string; downloadUrl: string }>({
      query: (data) => ({
        url: '/materials',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Materials'],
    }),

    deleteMaterial: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Materials'],
    }),

    updateMaterial: builder.mutation<ApiResponse<Material>, { id: string; data: Partial<Material> }>({
      query: ({ id, data }) => ({
        url: `/materials/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Materials'],
    }),

    // ============ ASSIGNMENTS ============
    getAssignments: builder.query<PaginatedResponse<Assignment>, QueryParams | void>({
      query: (params) => ({
        url: '/assignments',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Assignments'],
    }),

    getAssignmentsByCourse: builder.query<ApiResponse<Assignment[]>, string>({
      query: (courseId) => ({
        url: `/assignments/course/${courseId}`,
        method: 'get',
      }),
      providesTags: ['Assignments'],
    }),

    getMyAssignments: builder.query<ApiResponse<Assignment[]>, string>({
      query: (studentId) => ({
        url: `/assignments/student/${studentId}`,
        method: 'get',
      }),
      providesTags: ['Assignments'],
    }),

    getAssignmentById: builder.query<ApiResponse<Assignment>, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Assignments', id }],
    }),

    submitAssignment: builder.mutation<ApiResponse<Assignment>, { id: string; submissionUrl: string }>({
      query: ({ id, submissionUrl }) => ({
        url: `/assignments/${id}/submit`,
        method: 'post',
        data: { submissionUrl },
      }),
      invalidatesTags: ['Assignments'],
    }),

    createAssignment: builder.mutation<ApiResponse<Assignment>, Partial<Assignment> & { courseId: string; title: string; dueDate: string }>({
      query: (data) => ({
        url: '/assignments',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Assignments'],
    }),

    updateAssignment: builder.mutation<ApiResponse<Assignment>, { id: string; data: Partial<Assignment> }>({
      query: ({ id, data }) => ({
        url: `/assignments/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Assignments'],
    }),

    deleteAssignment: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Assignments'],
    }),

    gradeAssignment: builder.mutation<ApiResponse<Assignment>, { id: string; grade: number; feedback?: string }>({
      query: ({ id, ...data }) => ({
        url: `/assignments/${id}/grade`,
        method: 'post',
        data,
      }),
      invalidatesTags: ['Assignments'],
    }),

    // ============ QUIZZES ============
    getQuizzes: builder.query<PaginatedResponse<Quiz>, QueryParams | void>({
      query: (params) => ({
        url: '/quizzes',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Quizzes'],
    }),

    getQuizzesByCourse: builder.query<ApiResponse<Quiz[]>, string>({
      query: (courseId) => ({
        url: `/quizzes/course/${courseId}`,
        method: 'get',
      }),
      providesTags: ['Quizzes'],
    }),

    getQuizById: builder.query<ApiResponse<Quiz>, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Quizzes', id }],
    }),

    createQuiz: builder.mutation<ApiResponse<Quiz>, Partial<Quiz> & { courseId: string; title: string }>({
      query: (data) => ({
        url: '/quizzes',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Quizzes'],
    }),

    updateQuiz: builder.mutation<ApiResponse<Quiz>, { id: string; data: Partial<Quiz> }>({
      query: ({ id, data }) => ({
        url: `/quizzes/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Quizzes'],
    }),

    deleteQuiz: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Quizzes'],
    }),

    startQuizAttempt: builder.mutation<ApiResponse<QuizAttempt>, string>({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/start`,
        method: 'post',
      }),
      invalidatesTags: ['QuizAttempts'],
    }),

    submitQuizAttempt: builder.mutation<
      ApiResponse<QuizAttempt>,
      { attemptId: string; answers: object; score: number; correctAnswers: number }
    >({
      query: ({ attemptId, ...data }) => ({
        url: `/quizzes/attempts/${attemptId}/submit`,
        method: 'post',
        data,
      }),
      invalidatesTags: ['QuizAttempts'],
    }),

    getQuizAttempts: builder.query<ApiResponse<QuizAttempt[]>, string>({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/attempts`,
        method: 'get',
      }),
      providesTags: ['QuizAttempts'],
    }),

    getQuizAttemptById: builder.query<ApiResponse<QuizAttempt>, string>({
      query: (attemptId) => ({
        url: `/quizzes/attempts/${attemptId}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'QuizAttempts', id }],
    }),

    getQuizBestScore: builder.query<ApiResponse<{ bestScore: number }>, string>({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/best-score`,
        method: 'get',
      }),
      providesTags: ['QuizAttempts'],
    }),

    // ============ SCHEDULES ============
    getSchedules: builder.query<PaginatedResponse<Schedule>, QueryParams | void>({
      query: (params) => ({
        url: '/schedules',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Schedules'],
    }),

    getUpcomingSchedules: builder.query<ApiResponse<Schedule[]>, number | void>({
      query: (days) => ({
        url: '/schedules/upcoming',
        method: 'get',
        params: days ? { days } : {},
      }),
      providesTags: ['Schedules'],
    }),

    getSchedulesByDateRange: builder.query<ApiResponse<Schedule[]>, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/schedules/date-range',
        method: 'get',
        params: { startDate, endDate },
      }),
      providesTags: ['Schedules'],
    }),

    getSchedulesByCourse: builder.query<ApiResponse<Schedule[]>, string>({
      query: (courseId) => ({
        url: `/schedules/course/${courseId}`,
        method: 'get',
      }),
      providesTags: ['Schedules'],
    }),

    getScheduleById: builder.query<ApiResponse<Schedule>, string>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Schedules', id }],
    }),

    getSchedulesByTeacher: builder.query<ApiResponse<Schedule[]>, string>({
      query: (teacherId) => ({
        url: `/schedules/teacher/${teacherId}`,
        method: 'get',
      }),
      providesTags: ['Schedules'],
    }),

    createSchedule: builder.mutation<ApiResponse<Schedule>, Partial<Schedule> & { title: string; date: string; startTime: string; endTime: string }>({
      query: (data) => ({
        url: '/schedules',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Schedules'],
    }),

    updateSchedule: builder.mutation<ApiResponse<Schedule>, { id: string; data: Partial<Schedule> }>({
      query: ({ id, data }) => ({
        url: `/schedules/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Schedules'],
    }),

    deleteSchedule: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Schedules'],
    }),

    getMySchedules: builder.query<ApiResponse<Schedule[]>, void>({
      query: () => ({
        url: '/schedules/my',
        method: 'get',
      }),
      providesTags: ['Schedules'],
    }),

    getWeeklySchedules: builder.query<WeeklyScheduleResponse, { weekStart: string; courseId?: string; teacherId?: string }>({
      query: ({ weekStart, courseId, teacherId }) => ({
        url: '/schedules/weekly',
        method: 'get',
        params: { weekStart, ...(courseId && { courseId }), ...(teacherId && { teacherId }) },
      }),
      providesTags: ['Schedules'],
    }),

    cancelSchedule: builder.mutation<ApiResponse<Schedule>, { id: string; cancelReason?: string }>({
      query: ({ id, cancelReason }) => ({
        url: `/schedules/${id}/cancel`,
        method: 'patch',
        data: cancelReason ? { cancelReason } : {},
      }),
      invalidatesTags: ['Schedules'],
    }),

    postponeSchedule: builder.mutation<ApiResponse<Schedule>, { id: string } & PostponeScheduleRequest>({
      query: ({ id, ...body }) => ({
        url: `/schedules/${id}/postpone`,
        method: 'patch',
        data: body,
      }),
      invalidatesTags: ['Schedules'],
    }),

    createRecurringSchedule: builder.mutation<ApiResponse<RecurringScheduleResponse>, RecurringScheduleRequest>({
      query: (data) => ({
        url: '/schedules/recurring',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Schedules'],
    }),
  }),
});

export const {
  // Materials
  useGetMaterialsQuery,
  useGetMaterialsByCourseQuery,
  useGetMaterialByIdQuery,
  useCreateMaterialMutation,
  useDeleteMaterialMutation,
  useUpdateMaterialMutation,
  // Assignments
  useGetAssignmentsQuery,
  useGetAssignmentsByCourseQuery,
  useGetMyAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useSubmitAssignmentMutation,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGradeAssignmentMutation,
  // Quizzes
  useGetQuizzesQuery,
  useGetQuizzesByCourseQuery,
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useStartQuizAttemptMutation,
  useSubmitQuizAttemptMutation,
  useGetQuizAttemptsQuery,
  useGetQuizAttemptByIdQuery,
  useGetQuizBestScoreQuery,
  // Schedules
  useGetSchedulesQuery,
  useGetUpcomingSchedulesQuery,
  useGetSchedulesByDateRangeQuery,
  useGetSchedulesByCourseQuery,
  useGetScheduleByIdQuery,
  useGetSchedulesByTeacherQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetMySchedulesQuery,
  useGetWeeklySchedulesQuery,
  useCancelScheduleMutation,
  usePostponeScheduleMutation,
  useCreateRecurringScheduleMutation,
} = learningApi;
