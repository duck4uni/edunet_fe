import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useCourses } from '../../../hooks/useCourses';
import FilterSidebar from '../../../components/ListCourse/FilterSidebar';
import SortAndSearch from '../../../components/ListCourse/SortAndSearch';
import CourseGrid from '../../../components/ListCourse/CourseGrid';

const ListCourse: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category') || undefined;
  const [searchTerm, setSearchTerm] = useState('');
  
  const { courses, loading, totalCount } = useCourses({ 
    page: 1, 
    size: 20,
    categoryId,
    search: searchTerm,
    include: 'category|teacher',
  });

  // Transform API data to match CourseGrid expected format
  const transformedCourses = courses.map(course => ({
    id: course.id,
    title: course.title,
    author: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Chưa rõ',
    image: course.thumbnail || 'https://via.placeholder.com/400x200',
    price: course.price,
    lessons: course.totalLessons,
    duration: course.duration || '0h',
    category: course.category?.name || 'Chung',
    startDate: course.startDate,
  }));

  const onSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">
        <Row gutter={[32, 32]}>
          {/* Sidebar Filters */}
          <Col xs={24} lg={6}>
            <FilterSidebar />
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={18}>
            <SortAndSearch onSearch={onSearch} totalCourses={totalCount} />
            <CourseGrid courses={transformedCourses} loading={loading} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ListCourse;
