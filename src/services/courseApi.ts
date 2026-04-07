import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';
import type { ApiResponse, PaginatedResponse } from './authApi';

// Course Types — aligned with backend Course entity
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  duration?: string;
  totalLessons: number;
  totalStudents?: number;
  rating?: number;
  totalReviews?: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'archived';
  language?: string;
  tags?: string[];
  goal?: string;
  schedule?: string[];
  startDate?: string;
  publishedAt?: string;
  rejectionReason?: string;
  categoryId?: string;
  category?: Category;
  teacherId: string;
  teacher?: CourseTeacher;
  lessons?: Lesson[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

// The teacher relation on Course points to the User entity
export interface CourseTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  courses?: Course[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  specialization?: string[];
  qualification?: string;
  experience?: number;
  rating?: number;
  totalCourses?: number;
  totalStudents?: number;
  status?: string;
  bio?: string;
  cvUrl?: string;
  rejectionReason?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  earnings?: number;
  userId: string;
  user?: CourseTeacher;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration?: string;
  order: number;
  videoUrl?: string;
  isFree: boolean;
  isVisible: boolean;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  status: 'pending' | 'active' | 'completed' | 'dropped' | 'rejected' | 'expired';
  progress: number;
  completedAt?: string;
  lastAccessedAt?: string;
  course?: Course;
  user?: CourseTeacher;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isVisible?: boolean;
  courseId: string;
  userId: string;
  course?: Course;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

/** Query params aligned with backend decorators: page, size, filter, sort, include */
export interface QueryParams {
  page?: number;
  size?: number | string;
  filter?: string;
  sort?: string;
  include?: string;
}

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Courses', 'Categories', 'Lessons', 'Enrollments', 'Reviews', 'Teachers'],
  endpoints: (builder) => ({
    // ============ CATEGORIES ============
    getCategories: builder.query<PaginatedResponse<Category>, QueryParams | void>({
      query: (params) => ({
        url: '/categories',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Categories'],
    }),

    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Categories', id }],
    }),

    createCategory: builder.mutation<ApiResponse<Category>, Partial<Category>>({
      query: (data) => ({
        url: '/categories',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<ApiResponse<Category>, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Categories'],
    }),

    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Categories'],
    }),

    // ============ COURSES ============
    getCourses: builder.query<PaginatedResponse<Course>, QueryParams | void>({
      query: (params) => ({
        url: '/courses',
        method: 'get',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses', id: 'LIST' },
            ]
          : [{ type: 'Courses', id: 'LIST' }],
    }),

    getCourseById: builder.query<ApiResponse<Course>, { id: string; include?: string }>({
      query: ({ id, include }) => ({
        url: `/courses/${id}`,
        method: 'get',
        params: include ? { include } : {},
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Courses', id }],
    }),

    createCourse: builder.mutation<ApiResponse<Course>, Partial<Course>>({
      query: (data) => ({
        url: '/courses',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Courses', id: 'LIST' }],
    }),

    updateCourse: builder.mutation<ApiResponse<Course>, { id: string; data: Partial<Course> }>({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Courses', id }, { type: 'Courses', id: 'LIST' }],
    }),

    deleteCourse: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'Courses', id: 'LIST' }],
    }),

    // ============ TEACHERS ============
    getTeachers: builder.query<PaginatedResponse<Teacher>, QueryParams | void>({
      query: (params) => ({
        url: '/teachers',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Teachers'],
    }),

    getTeacherById: builder.query<ApiResponse<Teacher>, string>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Teachers', id }],
    }),

    createTeacher: builder.mutation<ApiResponse<Teacher>, { userId: string; specialization?: string[]; qualification?: string; experience?: number; status?: string; bio?: string; socialLinks?: { linkedin?: string; twitter?: string; website?: string } }>({
      query: (data) => ({
        url: '/teachers',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Teachers'],
    }),

    updateTeacher: builder.mutation<ApiResponse<Teacher>, { id: string; data: Partial<Teacher> }>({
      query: ({ id, data }) => ({
        url: `/teachers/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Teachers'],
    }),

    approveTeacher: builder.mutation<ApiResponse<Teacher>, string>({
      query: (id) => ({
        url: `/teachers/${id}/approve`,
        method: 'patch',
      }),
      invalidatesTags: ['Teachers'],
    }),

    rejectTeacher: builder.mutation<ApiResponse<Teacher>, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/teachers/${id}/reject`,
        method: 'patch',
        data: { rejectionReason },
      }),
      invalidatesTags: ['Teachers'],
    }),

    deleteTeacher: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Teachers'],
    }),

    // ============ LESSONS ============
    getLessons: builder.query<PaginatedResponse<Lesson>, QueryParams | void>({
      query: (params) => ({
        url: '/lessons',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Lessons'],
    }),

    getLessonsByCourse: builder.query<ApiResponse<Lesson[]>, string>({
      query: (courseId) => ({
        url: `/lessons/course/${courseId}`,
        method: 'get',
      }),
      providesTags: ['Lessons'],
    }),

    getLessonById: builder.query<ApiResponse<Lesson>, string>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Lessons', id }],
    }),

    createLesson: builder.mutation<ApiResponse<Lesson>, Partial<Lesson>>({
      query: (data) => ({
        url: '/lessons',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Lessons'],
    }),

    updateLesson: builder.mutation<ApiResponse<Lesson>, { id: string; data: Partial<Lesson> }>({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Lessons'],
    }),

    deleteLesson: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Lessons'],
    }),

    // ============ ENROLLMENTS ============
    getEnrollments: builder.query<PaginatedResponse<Enrollment>, QueryParams | void>({
      query: (params) => ({
        url: '/enrollments',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Enrollments'],
    }),

    getUserEnrollments: builder.query<ApiResponse<Enrollment[]>, string>({
      query: (userId) => ({
        url: `/enrollments/user/${userId}`,
        method: 'get',
      }),
      providesTags: ['Enrollments'],
    }),

    /** Get current user's enrollments with full course details */
    getMyEnrollments: builder.query<ApiResponse<Enrollment[]>, void>({
      query: () => ({
        url: '/enrollments/my-enrollments',
        method: 'get',
      }),
      providesTags: ['Enrollments'],
    }),

    /** Get all enrollments for a course (with user details) - for classroom */
    getEnrollmentsByCourse: builder.query<ApiResponse<Enrollment[]>, string>({
      query: (courseId) => ({
        url: `/enrollments/course/${courseId}`,
        method: 'get',
      }),
      providesTags: (_result, _error, courseId) => [{ type: 'Enrollments', id: `course-${courseId}` }],
    }),

    /** Check if current user is enrolled in a course */
    checkEnrollment: builder.query<ApiResponse<{ enrolled: boolean; isPending: boolean; enrollment: Enrollment | null }>, string>({
      query: (courseId) => ({
        url: `/enrollments/check/${courseId}`,
        method: 'get',
      }),
      providesTags: (_result, _error, courseId) => [{ type: 'Enrollments', id: courseId }],
    }),

    /** Enroll the current user in a course */
    enrollMe: builder.mutation<ApiResponse<Enrollment>, string>({
      query: (courseId) => ({
        url: '/enrollments/enroll',
        method: 'post',
        data: { courseId },
      }),
      invalidatesTags: ['Enrollments', 'Courses'],
    }),

    enrollCourse: builder.mutation<ApiResponse<Enrollment>, { courseId: string; userId: string }>({
      query: (data) => ({
        url: '/enrollments',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Enrollments'],
    }),

    updateEnrollment: builder.mutation<ApiResponse<Enrollment>, { id: string; data: Partial<Enrollment> }>({
      query: ({ id, data }) => ({
        url: `/enrollments/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Enrollments'],
    }),

    updateEnrollmentProgress: builder.mutation<ApiResponse<Enrollment>, { id: string; progress: number }>({
      query: ({ id, progress }) => ({
        url: `/enrollments/${id}/progress`,
        method: 'patch',
        data: { progress },
      }),
      invalidatesTags: ['Enrollments'],
    }),

    getEnrollmentById: builder.query<ApiResponse<Enrollment>, string>({
      query: (id) => ({
        url: `/enrollments/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Enrollments', id }],
    }),

    deleteEnrollment: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/enrollments/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Enrollments'],
    }),

    /** Approve a pending enrollment (admin/teacher only) */
    approveEnrollment: builder.mutation<ApiResponse<Enrollment>, string>({
      query: (id) => ({
        url: `/enrollments/${id}/approve`,
        method: 'patch',
      }),
      invalidatesTags: (_result, _error, id) => ['Enrollments', { type: 'Enrollments', id }],
    }),

    /** Reject a pending enrollment (admin/teacher only) */
    rejectEnrollment: builder.mutation<ApiResponse<Enrollment>, string>({
      query: (id) => ({
        url: `/enrollments/${id}/reject`,
        method: 'patch',
      }),
      invalidatesTags: (_result, _error, id) => ['Enrollments', { type: 'Enrollments', id }],
    }),

    // ============ REVIEWS ============
    getReviews: builder.query<PaginatedResponse<Review>, QueryParams | void>({
      query: (params) => ({
        url: '/reviews',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Reviews'],
    }),

    getReviewsByCourse: builder.query<ApiResponse<Review[]>, string>({
      query: (courseId) => ({
        url: `/reviews/course/${courseId}`,
        method: 'get',
      }),
      providesTags: ['Reviews'],
    }),

    getCourseReviewStats: builder.query<ApiResponse<{ averageRating: number; totalReviews: number }>, string>({
      query: (courseId) => ({
        url: `/reviews/course/${courseId}/stats`,
        method: 'get',
      }),
      providesTags: ['Reviews'],
    }),

    createReview: builder.mutation<ApiResponse<Review>, { courseId: string; rating: number; comment?: string }>({
      query: (data) => ({
        url: '/reviews',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Reviews', 'Courses'],
    }),

    updateReview: builder.mutation<ApiResponse<Review>, { id: string; data: Partial<Review> }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: ['Reviews'],
    }),

    deleteReview: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['Reviews'],
    }),

    toggleReviewVisibility: builder.mutation<ApiResponse<Review>, string>({
      query: (id) => ({
        url: `/reviews/${id}/toggle-visibility`,
        method: 'patch',
      }),
      invalidatesTags: ['Reviews'],
    }),

    // ============ COURSE APPROVAL FLOW ============
    /** Teacher: submit draft/rejected course for admin review */
    submitCourseForReview: builder.mutation<ApiResponse<Course>, string>({
      query: (id) => ({
        url: `/courses/${id}/submit`,
        method: 'patch',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Courses', id }, { type: 'Courses', id: 'LIST' }],
    }),

    /** Admin: approve or reject a pending course */
    reviewCourse: builder.mutation<ApiResponse<Course>, { id: string; status: 'approved' | 'rejected'; rejectionReason?: string }>({
      query: ({ id, status, rejectionReason }) => ({
        url: `/courses/${id}/review`,
        method: 'patch',
        data: { status, ...(rejectionReason ? { rejectionReason } : {}) },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Courses', id }, { type: 'Courses', id: 'LIST' }],
    }),

    /** Admin: publish an approved course */
    publishCourseById: builder.mutation<ApiResponse<Course>, string>({
      query: (id) => ({
        url: `/courses/${id}/publish`,
        method: 'patch',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Courses', id }, { type: 'Courses', id: 'LIST' }],
    }),
  }),
});

export const {
  // Categories
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  // Courses
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  // Teachers
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  // Lessons
  useGetLessonsQuery,
  useGetLessonsByCourseQuery,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  // Enrollments
  useGetEnrollmentsQuery,
  useGetUserEnrollmentsQuery,
  useGetMyEnrollmentsQuery,
  useGetEnrollmentsByCourseQuery,
  useCheckEnrollmentQuery,
  useEnrollMeMutation,
  useEnrollCourseMutation,
  useUpdateEnrollmentMutation,
  useUpdateEnrollmentProgressMutation,
  useGetEnrollmentByIdQuery,
  useDeleteEnrollmentMutation,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
  // Reviews
  useGetReviewsQuery,
  useGetReviewsByCourseQuery,
  useGetCourseReviewStatsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation,
  // Course Approval Flow
  useSubmitCourseForReviewMutation,
  useReviewCourseMutation,
  usePublishCourseByIdMutation,
} = courseApi;
