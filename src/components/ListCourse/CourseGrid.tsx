import React from 'react';
import { Row, Col, Empty, Spin, Typography, Tag } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import CourseCard from '../common/CourseCard';
import type { Course } from '../../models/course';

const { Text } = Typography;

interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  view?: 'grid' | 'list';
  className?: string;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, loading = false, view = 'grid', className }) => {
  const containerClassName = `flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm ${className || ''}`;

  if (loading) {
    return (
      <div className={containerClassName}>
        <div className="flex flex-1 items-center justify-center py-12">
          <Spin indicator={<LoadingOutlined className="text-4xl" style={{ color: 'var(--textState500Secondary)' }} spin />} />
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className={containerClassName}>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <Empty
            description={
              <div className="mt-4">
                <Text className="text-[14px] text-gray-600">Không tìm thấy khóa học</Text>
                <p className="mt-2 text-[12px] text-gray-400">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-2">
        <Text className="text-[13px] text-gray-600">
          Kết quả phù hợp: <span className="font-semibold" style={{ color: 'var(--primaryColor)' }}>{courses.length}</span> khóa học
        </Text>
        <Tag
          className="!rounded-full !border-none !px-2 !py-0.5 !text-[12px]"
          style={{ backgroundColor: 'var(--primaryColor50)', color: 'var(--textState500Secondary)' }}
        >
          {view === 'grid' ? 'Hiển thị dạng lưới' : 'Hiển thị dạng danh sách'}
        </Tag>
      </div>

      <div className="course-grid-scroll flex-1 overflow-y-auto p-3">
        {view === 'grid' ? (
          <Row gutter={[12, 12]}>
            {courses.map((course) => (
              <Col xs={24} md={12} xl={8} key={course.id}>
                <CourseCard course={course} layout="vertical" compact />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} layout="horizontal" compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseGrid;
