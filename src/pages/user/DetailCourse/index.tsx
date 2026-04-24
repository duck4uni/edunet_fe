import React from 'react';
import { Spin, Empty } from 'antd';
import { useCourseDetail } from '../../../hooks/useCourseDetail';
import { useSeo } from '../../../hooks/useSeo';
import OverviewTab from '../../../components/DetailCourse/OverviewTab';
import ContentTab from '../../../components/DetailCourse/ContentTab';
import DescriptionTab from '../../../components/DetailCourse/DescriptionTab';
import ReviewsTab from '../../../components/DetailCourse/ReviewsTab';
import CourseSidebar from '../../../components/DetailCourse/CourseSidebar';
import CourseHeader from '../../../components/DetailCourse/CourseHeader';
import './detail-course.css';

const DetailCourse: React.FC = () => {
  const { courseData, isLoading, error, reviewStats, rawCourse } = useCourseDetail();

  const seoDescription = (courseData.description || courseData.goal || 'Chi tiết khóa học tại Academix.')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

  const seoKeywords = [
    'Academix',
    'khóa học',
    courseData.category,
    courseData.level || '',
    courseData.language || '',
    ...(courseData.tags || []),
  ].filter(Boolean);

  const structuredData = courseData.id
    ? {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: courseData.title,
        description: seoDescription,
        provider: {
          '@type': 'Organization',
          name: 'Academix',
          sameAs: window.location.origin,
        },
        instructor: courseData.teacher?.name
          ? {
              '@type': 'Person',
              name: courseData.teacher.name,
            }
          : undefined,
        educationalLevel: courseData.level,
        inLanguage: courseData.language,
        image: courseData.image,
        aggregateRating:
          Number(courseData.totalReviews || 0) > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: Number(reviewStats?.averageRating || courseData.rating || 0).toFixed(1),
                reviewCount: Number(courseData.totalReviews || 0),
              }
            : undefined,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: Number(courseData.discountPrice ?? courseData.price ?? 0),
          availability: 'https://schema.org/InStock',
          url: window.location.href,
        },
      }
    : null;

  useSeo({
    title: courseData.id
      ? `${courseData.title} | Khóa học | Academix`
      : 'Chi tiết khóa học | Academix',
    description: seoDescription || 'Chi tiết khóa học trên nền tảng Academix.',
    keywords: seoKeywords,
    image: rawCourse?.thumbnail || courseData.image,
    type: 'article',
    canonicalPath: courseData.id ? `/courses/${courseData.id}` : '/courses',
    structuredData,
  });

  if (isLoading) {
    return (
      <div className="detail-course-page flex items-center justify-center px-6">
        <div className="detail-course-surface w-full max-w-sm py-12 text-center">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !courseData.id) {
    return (
      <div className="detail-course-page flex items-center justify-center px-6">
        <div className="detail-course-surface w-full max-w-lg py-12 text-center">
          <Empty description="Không tìm thấy khóa học" />
        </div>
      </div>
    );
  }

  const items = [
    {
      key: '1',
      label: 'Tổng quan',
      children: <OverviewTab description={courseData.description || ''} />,
    },
    {
      key: '2',
      label: 'Nội dung khóa học',
      children: <ContentTab content={courseData.content || []} />,
    },
    {
      key: '3',
      label: 'Mô tả',
      children: <DescriptionTab goal={courseData.goal || ''} />,
    },
    {
      key: '4',
      label: 'Đánh giá',
      children: <ReviewsTab reviews={courseData.reviews || []} stats={reviewStats} />,
    },
  ];

  return (
    <div className="detail-course-page">
      <div className="detail-course-container">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <CourseHeader course={courseData} items={items} />
          </div>

          <div>
            <CourseSidebar course={courseData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCourse;
