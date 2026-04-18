// Course Management Hook — connected to real API
import { useState, useCallback, useMemo } from 'react';

import {
  useGetCoursesQuery,
  useGetReviewsQuery,
  useGetEnrollmentsByCourseQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
  useReviewCourseMutation,
  usePublishCourseByIdMutation,
} from '../services/courseApi';
import type { Course, QueryParams } from '../services/courseApi';

import { notify } from '../utils/notify';
interface Filters {
  status?: string;
  category?: string;
  teacher?: string;
  search?: string;
  timeStatus?: 'upcoming' | 'ended';
}

interface TableParams {
  page: number;
  pageSize: number;
}

export const useCourseManagement = (initialFilters: Filters = {}) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentCourseId, setEnrollmentCourseId] = useState<string | undefined>();

  // Build query params from filters
  const courseQueryParams: QueryParams = useMemo(() => {
    const filterParts: string[] = [];
    if (filters.status) {
      const statuses = filters.status
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (statuses.length > 1) {
        filterParts.push(`status:in:${statuses.join(',')}`);
      } else if (statuses.length === 1) {
        filterParts.push(`status:eq:${statuses[0]}`);
      }
    }
    if (filters.category) filterParts.push(`categoryId:eq:${filters.category}`);
    if (filters.teacher) filterParts.push(`teacherId:eq:${filters.teacher}`);
    if (filters.search) filterParts.push(`title:like:${filters.search}`);
    if (filters.timeStatus === 'upcoming') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      filterParts.push(`startDate:gte:${todayStart.toISOString()}`);
    }
    if (filters.timeStatus === 'ended') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      filterParts.push(`startDate:lt:${todayStart.toISOString()}`);
    }

    return {
      page: tableParams.page,
      size: tableParams.pageSize,
      include: 'category|teacher',
      ...(filterParts.length > 0 && { filter: filterParts.join('&&') }),
      sort: 'createdAt:desc',
    };
  }, [filters, tableParams]);

  // RTK Query hooks
  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    refetch: refetchCourses,
  } = useGetCoursesQuery(courseQueryParams);

  const {
    data: reviewsData,
    refetch: refetchReviews,
  } = useGetReviewsQuery({ size: 'unlimited', include: 'user|course' });

  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourseApi] = useDeleteCourseMutation();
  const [deleteReviewApi] = useDeleteReviewMutation();
  const [toggleVisibility] = useToggleReviewVisibilityMutation();
  const [approveEnrollmentApi] = useApproveEnrollmentMutation();
  const [rejectEnrollmentApi] = useRejectEnrollmentMutation();
  const [reviewCourseApi] = useReviewCourseMutation();
  const [publishCourseByIdApi] = usePublishCourseByIdMutation();

  // Enrollments for a specific course (used in enrollment management modal)
  const {
    data: enrollmentsByCourseData,
    isLoading: isEnrollmentsLoading,
    refetch: refetchEnrollments,
  } = useGetEnrollmentsByCourseQuery(enrollmentCourseId!, {
    skip: !enrollmentCourseId,
  });

  const courseEnrollments = enrollmentsByCourseData?.data || [];

  const courses = coursesData?.data?.rows || [];
  const totalCourses = coursesData?.data?.count || 0;
  const allReviews = reviewsData?.data?.rows || [];
  const loading = isCoursesLoading;

  // Get reviews for a specific course
  const getReviewsForCourse = useCallback((courseId?: string) => {
    if (courseId) {
      return allReviews.filter(r => r.courseId === courseId);
    }
    return allReviews;
  }, [allReviews]);

  const [reviewCourseId, setReviewCourseId] = useState<string | undefined>();
  const reviews = useMemo(() => getReviewsForCourse(reviewCourseId), [getReviewsForCourse, reviewCourseId]);

  const fetchReviews = useCallback(async (courseId?: string) => {
    setReviewCourseId(courseId);
    refetchReviews();
  }, [refetchReviews]);

  const approveCourse = useCallback(async (courseId: string) => {
    try {
      await reviewCourseApi({ id: courseId, status: 'approved' }).unwrap();
      notify.success('Đã duyệt khóa học');
      return { success: true };
    } catch {
      notify.error('Không thể duyệt khóa học');
      return { success: false };
    }
  }, [reviewCourseApi]);

  const rejectCourse = useCallback(async (courseId: string, reason: string) => {
    try {
      await reviewCourseApi({ id: courseId, status: 'rejected', rejectionReason: reason }).unwrap();
      notify.success('Đã từ chối khóa học');
      return { success: true };
    } catch {
      notify.error('Không thể từ chối khóa học');
      return { success: false };
    }
  }, [reviewCourseApi]);

  const publishCourse = useCallback(async (courseId: string) => {
    try {
      await publishCourseByIdApi(courseId).unwrap();
      notify.success('Đã xuất bản khóa học');
      return { success: true };
    } catch {
      notify.error('Không thể xuất bản khóa học');
      return { success: false };
    }
  }, [publishCourseByIdApi]);

  const toggleCourseLock = useCallback(async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      const newStatus = course?.status === 'archived' ? 'published' : 'archived';
      await updateCourse({ id: courseId, data: { status: newStatus } }).unwrap();
      notify.success('Đã cập nhật trạng thái khóa học');
      return { success: true };
    } catch {
      notify.error('Không thể cập nhật trạng thái');
      return { success: false };
    }
  }, [updateCourse, courses]);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      await deleteCourseApi(courseId).unwrap();
      notify.success('Đã xóa khóa học');
      return { success: true };
    } catch {
      notify.error('Không thể xóa khóa học');
      return { success: false };
    }
  }, [deleteCourseApi]);

  const hideReview = useCallback(async (reviewId: string) => {
    try {
      await toggleVisibility(reviewId).unwrap();
      notify.success('Đã ẩn đánh giá');
      return { success: true };
    } catch {
      notify.error('Không thể ẩn đánh giá');
      return { success: false };
    }
  }, [toggleVisibility]);

  const showReview = useCallback(async (reviewId: string) => {
    try {
      await toggleVisibility(reviewId).unwrap();
      notify.success('Đã hiển thị lại đánh giá');
      return { success: true };
    } catch {
      notify.error('Không thể hiển thị đánh giá');
      return { success: false };
    }
  }, [toggleVisibility]);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await deleteReviewApi(reviewId).unwrap();
      notify.success('Đã xóa đánh giá');
      return { success: true };
    } catch {
      notify.error('Không thể xóa đánh giá');
      return { success: false };
    }
  }, [deleteReviewApi]);

  const openEnrollmentManagement = useCallback((courseId: string) => {
    setEnrollmentCourseId(courseId);
  }, []);

  const approveEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      await approveEnrollmentApi(enrollmentId).unwrap();
      notify.success('Đã phê duyệt học viên');
      return { success: true };
    } catch {
      notify.error('Không thể phê duyệt học viên');
      return { success: false };
    }
  }, [approveEnrollmentApi]);

  const rejectEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      await rejectEnrollmentApi(enrollmentId).unwrap();
      notify.success('Đã từ chối học viên');
      return { success: true };
    } catch {
      notify.error('Không thể từ chối học viên');
      return { success: false };
    }
  }, [rejectEnrollmentApi]);

  const statistics = useMemo(() => ({
    total: totalCourses,
    published: courses.filter(c => c.status === 'published').length,
    pending: courses.filter(c => c.status === 'pending').length,
    approved: courses.filter(c => c.status === 'approved').length,
    rejected: courses.filter(c => c.status === 'rejected').length,
    archived: courses.filter(c => c.status === 'archived').length,
    totalRevenue: 0,
    totalStudents: courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0),
    flaggedReviews: allReviews.filter(r => r.isVisible === false).length,
  }), [courses, totalCourses, allReviews]);

  return {
    courses,
    allCourses: courses,
    reviews,
    loading,
    selectedCourse,
    setSelectedCourse,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    statistics,
    total: totalCourses,
    fetchCourses: refetchCourses,
    fetchReviews,
    approveCourse,
    rejectCourse,
    publishCourse,
    toggleCourseLock,
    deleteCourse,
    hideReview,
    showReview,
    deleteReview,
    // Enrollment management
    courseEnrollments,
    enrollmentCourseId,
    isEnrollmentsLoading,
    openEnrollmentManagement,
    approveEnrollment,
    rejectEnrollment,
    refetchEnrollments,
  };
};
