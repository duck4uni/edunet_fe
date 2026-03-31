import { useParams } from 'react-router-dom';
import { useGetCourseByIdQuery, useGetLessonsByCourseQuery, useGetReviewsByCourseQuery, useGetCourseReviewStatsQuery } from '../services/courseApi';
import type { Course } from '../models/course';

export const useCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: courseData, isLoading: isCourseLoading, error: courseError } = useGetCourseByIdQuery(
    { id: id || '', include: 'category|teacher' },
    { skip: !id },
  );

  const { data: lessonsData, isLoading: isLessonsLoading } = useGetLessonsByCourseQuery(id || '', {
    skip: !id,
  });

  const { data: reviewsData, isLoading: isReviewsLoading } = useGetReviewsByCourseQuery(id || '', {
    skip: !id,
  });

  const { data: reviewStatsData } = useGetCourseReviewStatsQuery(id || '', {
    skip: !id,
  });

  const apiCourse = courseData?.data;
  // Backend findByCourse returns { success, data: Lesson[] } (array directly, not paginated)
  const lessons = lessonsData?.data || [];
  const reviews = reviewsData?.data || [];
  const reviewStats = reviewStatsData?.data;

  // Transform API data to match expected frontend Course model format
  const transformedCourseData: Course = apiCourse ? {
    id: apiCourse.id,
    title: apiCourse.title,
    description: apiCourse.description,
    image: apiCourse.thumbnail || 'https://via.placeholder.com/800x400',
    price: apiCourse.price,
    discountPrice: apiCourse.discountPrice,
    author: apiCourse.teacher ? `${apiCourse.teacher.firstName} ${apiCourse.teacher.lastName}` : 'Chưa rõ',
    lessons: apiCourse.totalLessons,
    duration: apiCourse.duration || '0h',
    category: apiCourse.category?.name || 'Chung',
    goal: apiCourse.goal,
    teacher: apiCourse.teacher ? {
      name: `${apiCourse.teacher.firstName} ${apiCourse.teacher.lastName}`,
      avatar: apiCourse.teacher.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    } : undefined,
    content: (Array.isArray(lessons) ? lessons : []).map((lesson) => ({
      title: lesson.title,
      items: [lesson.description || lesson.title].filter(Boolean) as string[],
    })),
    reviews: (Array.isArray(reviews) ? reviews : []).map(review => ({
      id: review.id,
      user: review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Ẩn danh',
      avatar: review.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      rate: review.rating,
      date: new Date(review.createdAt).toLocaleDateString(),
      content: review.comment || '',
      role: 'Học viên',
      images: [],
    })),
    schedule: Array.isArray(apiCourse.schedule) ? apiCourse.schedule : [],
    startDate: apiCourse.startDate,
  } : {
    id: '',
    title: 'Đang tải...',
    description: '',
    image: '',
    price: 0,
    author: '',
    lessons: 0,
    duration: '',
    category: '',
  };

  const isLoading = isCourseLoading || isLessonsLoading || isReviewsLoading;

  return { 
    courseData: transformedCourseData, 
    id, 
    isLoading,
    error: courseError,
    rawCourse: apiCourse,
    lessons: Array.isArray(lessons) ? lessons : [],
    reviews: Array.isArray(reviews) ? reviews : [],
    reviewStats,
  };
};
