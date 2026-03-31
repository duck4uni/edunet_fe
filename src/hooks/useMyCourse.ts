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
}

/** Map backend enrollment status to UI status */
const mapEnrollmentStatus = (enrollment: Enrollment): 'learning' | 'completed' | 'pending' => {
  if (enrollment.status === 'completed') return 'completed';
  if (enrollment.progress > 0) return 'learning';
  return 'pending';
};

const mapEnrollmentToCourse = (enrollment: Enrollment): MyCourseItem => {
  const course = enrollment.course;
  const totalLessons = course?.totalLessons || course?.lessons?.length || 0;
  const completedLessons = totalLessons > 0 ? Math.round((enrollment.progress / 100) * totalLessons) : 0;

  return {
    key: enrollment.id,
    id: enrollment.courseId,
    enrollmentId: enrollment.id,
    image: course?.thumbnail || 'https://placehold.co/400x250?text=Course',
    title: course?.title || 'Khóa học chưa có tên',
    teacher: course?.teacher
      ? `${course.teacher.firstName} ${course.teacher.lastName}`
      : 'Chưa rõ',
    status: mapEnrollmentStatus(enrollment),
    lessons: `${completedLessons}/${totalLessons}`,
    progress: enrollment.progress,
    category: course?.category?.name || 'Chung',
    completedDate: enrollment.completedAt,
    startDate: course?.startDate,
    level: course?.level,
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
    return data.data.map(mapEnrollmentToCourse);
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
    stats,
    getStatusConfig,
    isLoading,
    refetch,
  };
};
