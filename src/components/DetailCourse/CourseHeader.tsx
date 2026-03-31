import React from 'react';
import { Avatar, Tabs } from 'antd';
import { ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import type { Course } from '../../models/course';

interface CourseHeaderProps {
  course: Course;
  items: any[];
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course, items }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <h1 className="text-3xl font-bold text-[#012643] mb-4">{course.title}</h1>
      <div className="flex items-center gap-4 mb-6 text-gray-500">
        <div className="flex items-center gap-2">
          <Avatar src={course.teacher?.avatar} size="small" />
          <span>{course.teacher?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-[#e5698e]" />
          <span>Cập nhật lần cuối 10/2023</span>
        </div>
        <div className="flex items-center gap-2">
          <GlobalOutlined className="text-[#e5698e]" />
          <span>Tiếng Việt</span>
        </div>
      </div>
      
      <Tabs defaultActiveKey="1" items={items} className="custom-tabs" />
    </div>
  );
};

export default CourseHeader;
