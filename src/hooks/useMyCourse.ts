import { useState, useMemo, useCallback } from 'react';
import { useGetMyEnrollmentsQuery } from '../services/courseApi';
import { getAccessToken } from '../services/axiosBaseQuery';
import type { Enrollment } from '../services/courseApi';

export interface MyCourseItem {
  key: string;
  id: string;
  enrollmentId: string;
  image: string;
  title: string;
  teacher: string;
  status: 'learning' | 'completed' | 'pending';
  lessons: string;
  progress: number;
  category: string;
  completedDate?: string;
  startDate?: string;
  level?: string;
  enrolledAt?: string;
}

/** Keep UI status consistent with backend enrollment status values. */
const mapEnrollmentStatus = (enrollment: Enrollment): 'learning' | 'completed' | 'pending' => {
  switch (enrollment.status) {
    case 'completed':
      return 'completed';
    case 'active':
      return 'learning';
    case 'pending':
    default:
      return 'pending';
  }
};

const getTeacherDisplayName = (enrollment: Enrollment): string => {
  const teacher = enrollment.course?.teacher;
  if (!teacher) return 'Chưa rõ';

  const fullName = [teacher.firstName, teacher.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || teacher.email || 'Chưa rõ';
};

const mapEnrollmentToCourse = (enrollment: Enrollment): MyCourseItem => {
  const course = enrollment.course;
  const lessonsFromRelation = course?.lessons?.length ?? 0;
  const totalLessons = (course?.totalLessons ?? 0) > 0 ? (course?.totalLessons ?? 0) : lessonsFromRelation;
  const progress = Math.min(100, Math.max(0, enrollment.progress ?? 0));
  const completedLessons = totalLessons > 0 ? Math.round((progress / 100) * totalLessons) : 0;

  return {
    key: enrollment.id,
    id: enrollment.courseId,
    enrollmentId: enrollment.id,
    image: course?.thumbnail || 'https://placehold.co/400x250?text=Course',
    title: course?.title || 'Khóa học chưa có tên',
    teacher: getTeacherDisplayName(enrollment),
    status: mapEnrollmentStatus(enrollment),
    lessons: `${completedLessons}/${totalLessons}`,
    progress,
    category: course?.category?.name || 'Chung',
    completedDate: enrollment.completedAt,
    startDate: course?.startDate,
    level: course?.level,
    enrolledAt: enrollment.createdAt,
  };
};

export const useMyCourse = () => {
  const hasToken = !!getAccessToken();
  const { data, isLoading, refetch } = useGetMyEnrollmentsQuery(undefined, {
    skip: !hasToken,
  });

  const [viewMode, setViewMode] = useState<string | number>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  const courses = useMemo<MyCourseItem[]>(() => {
    if (!data?.data) return [];
    return data.data
      .filter(e => e.status === 'active' || e.status === 'completed')
      .map(mapEnrollmentToCourse);
  }, [data]);

  const pendingCourses = useMemo<MyCourseItem[]>(() => {
    if (!data?.data) return [];
    return data.data
      .filter(e => e.status === 'pending')
      .map(mapEnrollmentToCourse);
  }, [data]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
      const matchesSearch = course.title.toLowerCase().includes(searchText.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [courses, filterStatus, searchText]);

  const stats = useMemo(() => ({
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'learning').length,
    completed: courses.filter(c => c.status === 'completed').length,
    notStarted: courses.filter(c => c.status === 'pending').length,
  }), [courses]);

  const getStatusConfig = useCallback((status: string) => {
    switch (status) {
      case 'learning':
        return { color: 'processing', text: 'Đang học' };
      case 'completed':
        return { color: 'success', text: 'Hoàn thành' };
      case 'pending':
        return { color: 'warning', text: 'Chưa bắt đầu' };
      default:
        return { color: 'default', text: 'Không rõ' };
    }
  }, []);

  return {
    viewMode,
    setViewMode,
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    filteredCourses,
    pendingCourses,
    stats,
    getStatusConfig,
    isLoading,
    refetch,
  };
};
