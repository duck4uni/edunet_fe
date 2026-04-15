import { useParams } from 'react-router-dom';
import { useGetCourseByIdQuery, useGetLessonsByCourseQuery, useGetReviewsByCourseQuery, useGetCourseReviewStatsQuery } from '../services/courseApi';
import type { Course } from '../models/course';

export const useCourseDetail = () => {
  const { id } = useParams<{ id: string }>();

  const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  };
  
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
  const normalizedReviews = Array.isArray(reviews) ? reviews : [];
  const normalizedLessons = Array.isArray(lessons) ? lessons : [];
  const normalizedAverageRating = toNumber(reviewStats?.averageRating ?? apiCourse?.rating);
  const normalizedTotalReviews = toNumber(reviewStats?.totalReviews ?? apiCourse?.totalReviews ?? normalizedReviews.length);

  // Transform API data to match expected frontend Course model format
  const transformedCourseData: Course = apiCourse ? {
    id: apiCourse.id,
    title: apiCourse.title,
    description: apiCourse.description,
    image: apiCourse.thumbnail || 'https://via.placeholder.com/800x400',
    price: toNumber(apiCourse.price),
    discountPrice: apiCourse.discountPrice == null ? null : toNumber(apiCourse.discountPrice),
    author: apiCourse.teacher ? `${apiCourse.teacher.firstName} ${apiCourse.teacher.lastName}` : 'Chưa rõ',
    lessons: toNumber(apiCourse.totalLessons),
    duration: apiCourse.duration || '0h',
    category: apiCourse.category?.name || 'Chung',
    goal: apiCourse.goal,
    teacher: apiCourse.teacher ? {
      name: `${apiCourse.teacher.firstName} ${apiCourse.teacher.lastName}`,
      avatar: apiCourse.teacher.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
      bio: apiCourse.teacher.bio,
    } : undefined,
    content: normalizedLessons
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({
        title: lesson.title,
        items: [lesson.description || lesson.content || lesson.title].filter(Boolean) as string[],
        duration: lesson.duration,
        isFree: lesson.isFree,
        type: lesson.type,
        order: lesson.order,
      })),
    reviews: normalizedReviews.map(review => ({
      id: review.id,
      user: review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Ẩn danh',
      avatar: review.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      rate: toNumber(review.rating),
      date: new Date(review.createdAt).toLocaleDateString(),
      content: review.comment || '',
      role: 'Học viên',
      images: [],
    })),
    rating: normalizedAverageRating,
    totalReviews: normalizedTotalReviews,
    totalStudents: toNumber(apiCourse.totalStudents),
    level: apiCourse.level,
    language: apiCourse.language,
    tags: Array.isArray(apiCourse.tags) ? apiCourse.tags : [],
    updatedAt: apiCourse.updatedAt,
    publishedAt: apiCourse.publishedAt,
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
    rating: 0,
    totalReviews: 0,
    totalStudents: 0,
    language: 'Vietnamese',
    tags: [],
  };

  const isLoading = isCourseLoading || isLessonsLoading || isReviewsLoading;

  return { 
    courseData: transformedCourseData, 
    id, 
    isLoading,
    error: courseError,
    rawCourse: apiCourse,
    lessons: normalizedLessons,
    reviews: normalizedReviews,
    reviewStats,
  };
};
