import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useCourses } from '../../../hooks/useCourses';
import FilterSidebar from '../../../components/ListCourse/FilterSidebar';
import SortAndSearch from '../../../components/ListCourse/SortAndSearch';
import CourseGrid from '../../../components/ListCourse/CourseGrid';
import type { Course as ApiCourse } from '../../../services/courseApi';
import type { Course as CardCourse } from '../../../models/course';
import './list-course.css';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'popular' | 'rating' | 'price-low' | 'price-high';
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const DEFAULT_PRICE_RANGE: [number, number] = [0, 500000];
const SEARCH_DEBOUNCE_MS = 450;

const toNumber = (value: number | string | null | undefined): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const normalizeDuration = (duration?: string): string => {
  if (!duration) return '0h';
  return /^\d+(\.\d+)?$/.test(duration) ? `${duration} giờ` : duration;
};

const toCardCourse = (course: ApiCourse): CardCourse => ({
  id: course.id,
  title: course.title,
  author: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Giảng viên đang cập nhật',
  image: course.thumbnail || 'https://via.placeholder.com/400x200',
  price: toNumber(course.price),
  discountPrice: course.discountPrice ? toNumber(course.discountPrice) : null,
  lessons: course.totalLessons,
  duration: normalizeDuration(course.duration),
  category: course.category?.name || 'Danh mục chung',
  startDate: course.startDate,
  description: course.description,
  rating: toNumber(course.rating),
  totalReviews: course.totalReviews || 0,
  totalStudents: course.totalStudents || 0,
  level: course.level,
  language: course.language,
  publishedAt: course.publishedAt,
  updatedAt: course.updatedAt,
});

const getCourseTimestamp = (course: CardCourse): number => {
  const timeSource = course.publishedAt || course.startDate || course.updatedAt;
  if (!timeSource) return 0;
  return new Date(timeSource).getTime();
};

const ListCourse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category') || undefined;
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [minimumRating, setMinimumRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSearchTerm(searchValue.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [searchValue]);
  
  const { courses, loading, totalCount } = useCourses({ 
    page: 1, 
    size: 60,
    categoryId: selectedCategoryId,
    search: searchTerm,
    include: 'category|teacher',
  });

  const transformedCourses = useMemo(() => courses.map(toCardCourse), [courses]);

  const maxPrice = useMemo(() => {
    const maxCoursePrice = transformedCourses.reduce((acc, course) => {
      return Math.max(acc, toNumber(course.price));
    }, 0);

    const roundedMax = Math.ceil(maxCoursePrice / 1000) * 1000;
    return Math.max(DEFAULT_PRICE_RANGE[1], roundedMax);
  }, [transformedCourses]);

  const normalizedPriceRange = useMemo<[number, number]>(() => [
    Math.min(priceRange[0], maxPrice),
    Math.min(priceRange[1], maxPrice),
  ], [priceRange, maxPrice]);

  const filteredCourses = useMemo(() => {
    return transformedCourses.filter((course) => {
      const coursePrice = toNumber(course.price);
      const courseRating = toNumber(course.rating);
      const matchesPrice = coursePrice >= normalizedPriceRange[0] && coursePrice <= normalizedPriceRange[1];
      const matchesRating = courseRating >= minimumRating;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      return matchesPrice && matchesRating && matchesLevel;
    });
  }, [transformedCourses, normalizedPriceRange, minimumRating, selectedLevel]);

  const displayedCourses = useMemo(() => {
    const sortedCourses = [...filteredCourses];

    sortedCourses.sort((courseA, courseB) => {
      const priceA = toNumber(courseA.price);
      const priceB = toNumber(courseB.price);
      const ratingA = toNumber(courseA.rating);
      const ratingB = toNumber(courseB.rating);
      const studentsA = toNumber(courseA.totalStudents);
      const studentsB = toNumber(courseB.totalStudents);

      switch (sortOption) {
        case 'popular':
          return studentsB - studentsA;
        case 'rating':
          return ratingB - ratingA;
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'newest':
        default:
          return getCourseTimestamp(courseB) - getCourseTimestamp(courseA);
      }
    });

    return sortedCourses;
  }, [filteredCourses, sortOption]);

  const handleCategoryChange = (categoryId?: string) => {
    const params = new URLSearchParams(searchParams);

    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSelectedLevel('all');
    setMinimumRating(0);
    setPriceRange([0, maxPrice]);
    handleCategoryChange(undefined);
  };

  return (
    <section className="bg-[linear-gradient(155deg,var(--primaryColor50),#ffffff_38%,#f2fcff_100%)] py-4 lg:h-[calc(100vh-11rem)] lg:overflow-hidden lg:py-5">
      <div className="container mx-auto h-full px-4 md:px-6">
        <Row gutter={[16, 16]} className="h-full">
          <Col xs={24} lg={6} xl={5} className="h-full">
            <FilterSidebar
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              minimumRating={minimumRating}
              onMinimumRatingChange={setMinimumRating}
              priceRange={normalizedPriceRange}
              maxPrice={maxPrice}
              onPriceRangeChange={(value) => setPriceRange(value)}
              onReset={handleResetFilters}
            />
          </Col>

          <Col xs={24} lg={18} xl={19} className="h-full">
            <div className="flex h-full min-h-[60vh] flex-col">
              <SortAndSearch
                totalCourses={displayedCourses.length}
                totalFromApi={totalCount}
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                view={viewMode}
                onViewChange={setViewMode}
                sortValue={sortOption}
                onSortChange={setSortOption}
              />
              <CourseGrid
                courses={displayedCourses}
                loading={loading}
                view={viewMode}
                className="mt-3 flex-1"
              />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default ListCourse;
