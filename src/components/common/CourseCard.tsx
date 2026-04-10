import React from 'react';
import { Button, Tag } from 'antd';
import { ClockCircleOutlined, BookOutlined, DollarCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Course } from '../../models/course';

interface CourseCardProps {
  course: Course;
  layout?: 'vertical' | 'horizontal';
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#30C2EC]/30 h-full flex flex-col group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Link to={`/courses/${course.id}`}>
            <Button 
              type="primary" 
              shape="round"
              className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 !bg-[#00B1F5] !border-[#00B1F5]"
            >
              Xem chi tiết
            </Button>
          </Link>
        </div>
        <div className="absolute top-3 left-3">
          <Tag className="!rounded-full !border-none !px-2 !bg-[#30C2EC]/15 !text-[#00B1F5]">{course.category}</Tag>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-[#012643] mb-2 line-clamp-2 group-hover:text-[#00B1F5] transition-colors">
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <BookOutlined className="text-[#00B1F5]" />
          <span className="text-gray-500 text-sm">{course.author}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <ClockCircleOutlined className="text-[#30C2EC]" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <CalendarOutlined className="text-[#30C2EC]" />
              <span>{course.lessons} bài học</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-bold text-lg text-[#00B1F5]">
            <DollarCircleOutlined />
            <span>${course.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
