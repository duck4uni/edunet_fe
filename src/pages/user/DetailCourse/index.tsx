import React from 'react';
import { Spin, Empty } from 'antd';
import { useCourseDetail } from '../../../hooks/useCourseDetail';
import OverviewTab from '../../../components/DetailCourse/OverviewTab';
import ContentTab from '../../../components/DetailCourse/ContentTab';
import DescriptionTab from '../../../components/DetailCourse/DescriptionTab';
import ReviewsTab from '../../../components/DetailCourse/ReviewsTab';
import CourseSidebar from '../../../components/DetailCourse/CourseSidebar';
import CourseHeader from '../../../components/DetailCourse/CourseHeader';

const DetailCourse: React.FC = () => {
  const { courseData, isLoading, error } = useCourseDetail();

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !courseData.id) {
    return (
      <div className="py-20 flex justify-center items-center min-h-screen bg-gray-50">
        <Empty description="Không tìm thấy khóa học" />
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
      children: <ReviewsTab reviews={courseData.reviews || []} />,
    },
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <CourseHeader course={courseData} items={items} />
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <CourseSidebar course={courseData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCourse;
