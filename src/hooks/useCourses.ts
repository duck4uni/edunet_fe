import { useMemo } from 'react';
import { useGetCoursesQuery, useGetCategoriesQuery } from '../services/courseApi';
import type { Course, Category, QueryParams } from '../services/courseApi';

interface UseCoursesOptions {
  page?: number;
  size?: number;
  categoryId?: string;
  search?: string;
  level?: string;
  sort?: string;
  include?: string;
}

interface UseCoursesReturn {
  courses: Course[];
  categories: Category[];
  loading: boolean;
  error: unknown;
  totalCount: number;
  refetch: () => void;
}

export const useCourses = (options: UseCoursesOptions = {}): UseCoursesReturn => {
  const { page = 1, size = 10, categoryId, search, level, sort, include } = options;

  const queryParams: QueryParams = useMemo(() => {
    const filters: string[] = ['status:eq:published'];
    if (categoryId) filters.push(`categoryId:eq:${categoryId}`);
    if (search) filters.push(`title:like:${search}`);
    if (level && level !== 'all') filters.push(`level:eq:${level}`);

    return {
      page,
      size,
      ...(filters.length > 0 && { filter: filters.join('&&') }),
      ...(sort && { sort }),
      ...(include && { include }),
    };
  }, [page, size, categoryId, search, level, sort, include]);

  const { 
    data: coursesData, 
    isLoading: isCoursesLoading, 
    error: coursesError,
    refetch 
  } = useGetCoursesQuery(queryParams);

  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading 
  } = useGetCategoriesQuery({ size: 'unlimited' });

  const courses = coursesData?.data?.rows || [];
  const categories = categoriesData?.data?.rows || [];
  const totalCount = coursesData?.data?.count || 0;
  const loading = isCoursesLoading || isCategoriesLoading;

  return { 
    courses, 
    categories,
    loading, 
    error: coursesError,
    totalCount,
    refetch 
  };
};
