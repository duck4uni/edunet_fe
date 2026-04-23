import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';
import type { ApiResponse } from './authApi';

export type ReportGroupBy = 'auto' | 'day' | 'week' | 'month';
export type ReportExportFormat = 'csv' | 'json';

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
  groupBy?: ReportGroupBy;
  userRole?: 'admin' | 'teacher' | 'student';
  courseStatus?: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'archived';
  enrollmentStatus?: 'pending' | 'active' | 'completed' | 'dropped' | 'expired' | 'rejected';
  ticketStatus?: 'open' | 'in_progress' | 'resolved' | 'closed';
  categoryId?: string;
}

export interface ReportWarning {
  code: 'LARGE_RANGE';
  message: string;
  suggestion: string;
}

export interface DashboardReport {
  generatedAt: string;
  range: {
    startDate: string;
    endDate: string;
    days: number;
    groupBy: 'day' | 'week' | 'month';
  };
  filters: ReportQueryParams;
  warnings: ReportWarning[];
  availability: {
    users: { hasData: boolean; reason?: string };
    courses: { hasData: boolean; reason?: string };
    enrollments: { hasData: boolean; reason?: string };
    tickets: { hasData: boolean; reason?: string };
    revenue: { hasData: boolean; reason?: string };
  };
  overview: {
    totalUsers: number;
    totalTeachers: number;
    totalCourses: number;
    newUsers: number;
    newCourses: number;
    publishedCourses: number;
    enrollments: number;
    tickets: number;
    openTickets: number;
    pendingCourses: number;
    grossRevenue: number;
    revenueEnrollments: number;
  };
  breakdowns: {
    usersByRole: Array<{ role: string; count: number }>;
    coursesByStatus: Array<{ status: string; count: number }>;
    enrollmentsByStatus: Array<{ status: string; count: number }>;
    ticketsByStatus: Array<{ status: string; count: number }>;
    revenueByCategory: Array<{
      categoryId: string | null;
      categoryName: string;
      revenue: number;
      enrollments: number;
    }>;
  };
  trends: {
    labels: string[];
    users: number[];
    courses: number[];
    enrollments: number[];
    tickets: number[];
    revenue: number[];
  };
  comparison: null | {
    range: {
      startDate: string;
      endDate: string;
      days: number;
    };
    overview: DashboardReport['overview'];
    delta: {
      newUsersPct: number;
      newCoursesPct: number;
      enrollmentsPct: number;
      ticketsPct: number;
      revenuePct: number;
      totalTeachersPct: number;
    };
  };
  widgets: {
    topCourses: Array<{
      id: string;
      title: string;
      thumbnail: string | null;
      totalStudents: number;
      rating: number;
      teacher: {
        id: string;
        name: string;
      };
    }>;
    topTeachers: Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
      totalCourses: number;
      totalStudents: number;
      rating: number;
    }>;
    recentTickets: Array<{
      id: string;
      ticketId: string;
      userName: string;
      subject: string;
      status: string;
      createdAt: string;
    }>;
    coursesChart: {
      labels: string[];
      datasets: Array<{ label: string; data: number[] }>;
    };
  };
  legacyStats: {
    totalUsers: number;
    totalTeachers: number;
    totalCourses: number;
    totalRevenue: number;
    newUsersToday: number;
    newCoursesToday: number;
    pendingApprovals: number;
    openTickets: number;
    usersGrowth: number;
    revenueGrowth: number;
    coursesGrowth: number;
    teachersGrowth: number;
  };
}

export interface ExportReportResponse {
  format: ReportExportFormat;
  fileName: string;
  mimeType: string;
  content: string | DashboardReport;
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    getDashboardReport: builder.query<ApiResponse<DashboardReport>, ReportQueryParams | void>({
      query: (params) => ({
        url: '/reports/dashboard',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Reports'],
    }),

    exportDashboardReport: builder.query<
      ApiResponse<ExportReportResponse>,
      (ReportQueryParams & { format?: ReportExportFormat }) | void
    >({
      query: (params) => ({
        url: '/reports/export',
        method: 'get',
        params: params || {},
      }),
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetDashboardReportQuery,
  useLazyGetDashboardReportQuery,
  useLazyExportDashboardReportQuery,
} = reportsApi;
