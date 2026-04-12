import React from 'react';
import { Spin, Empty } from 'antd';
import { useCourseDetail } from '../../../hooks/useCourseDetail';
import OverviewTab from '../../../components/DetailCourse/OverviewTab';
import ContentTab from '../../../components/DetailCourse/ContentTab';
import DescriptionTab from '../../../components/DetailCourse/DescriptionTab';
import ReviewsTab from '../../../components/DetailCourse/ReviewsTab';
import CourseSidebar from '../../../components/DetailCourse/CourseSidebar';
import CourseHeader from '../../../components/DetailCourse/CourseHeader';
import './detail-course.css';

const DetailCourse: React.FC = () => {
  const { courseData, isLoading, error, reviewStats } = useCourseDetail();

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
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
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
