import React from 'react';
import { Button, Tag } from 'antd';
import {
  ClockCircleOutlined,
  BookOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Course } from '../../models/course';

interface CourseCardProps {
  course: Course;
  layout?: 'vertical' | 'horizontal';
}

const formatPrice = (value: number): string => {
  if (value <= 0) return 'Miễn phí';
  if (value < 1000) return `$${value.toFixed(2).replace(/\.00$/, '')}`;
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
};

const formatDate = (date?: string | null): string => {
  if (!date) return 'Chưa cập nhật';
  return new Date(date).toLocaleDateString('vi-VN');
};

const levelLabel: Record<string, string> = {
  beginner: 'Người mới',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  all: 'Mọi trình độ',
};

const CourseCard: React.FC<CourseCardProps> = ({ course, layout = 'vertical' }) => {
  const isHorizontal = layout === 'horizontal';
  const coursePrice = Number(course.price) || 0;
  const discountPrice = course.discountPrice ? Number(course.discountPrice) : null;
  const rating = Number(course.rating) || 0;
  const totalStudents = Number(course.totalStudents) || 0;
  const totalReviews = Number(course.totalReviews) || 0;
  const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < coursePrice;

  return (
    <article
      className={`group h-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        isHorizontal ? 'md:flex md:items-stretch' : 'flex flex-col'
      }`}
    >
      <div className={`relative overflow-hidden ${isHorizontal ? 'h-44 md:h-auto md:w-64 md:min-w-64' : 'h-44'}`}>
        <img 
          src={course.image} 
          alt={course.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <Link to={`/courses/${course.id}`}>
            <Button 
              type="primary" 
              shape="round"
              size="small"
              className="transition-all duration-300"
              style={{
                backgroundColor: 'var(--textState500Secondary)',
                borderColor: 'var(--textState500Secondary)',
              }}
            >
              Xem chi tiết
            </Button>
          </Link>
        </div>
        <div className="absolute top-3 left-3">
          <Tag
            className="!rounded-full !border-none !px-2"
            style={{ backgroundColor: 'var(--primaryColor50)', color: 'var(--textState500Secondary)' }}
          >
            {course.category}
          </Tag>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <StarFilled style={{ color: 'var(--textStateLightOrange)' }} />
            <span>{rating.toFixed(1)} ({totalReviews})</span>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: 'var(--primaryColor50)',
              color: 'var(--textState500Primary)',
            }}
          >
            {levelLabel[course.level || 'all'] || 'Mọi trình độ'}
          </span>
        </div>

        <h3 className="mb-1.5 line-clamp-2 text-base font-bold transition-colors group-hover:text-[var(--textState500Secondary)]" style={{ color: 'var(--primaryColor)' }}>
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h3>

        <p className="mb-2 line-clamp-2 text-xs text-gray-500">{course.description || 'Khóa học được thiết kế thực hành và bám sát nhu cầu thực tế.'}</p>
        
        <div className="mb-2 flex items-center gap-1.5">
          <BookOutlined style={{ color: 'var(--textState500Secondary)' }} />
          <span className="text-xs text-gray-500">{course.author}</span>
        </div>

        <div className={`grid gap-1.5 text-xs text-gray-500 ${isHorizontal ? 'sm:grid-cols-3' : 'grid-cols-2'}`}>
          <div className="flex items-center gap-1.5">
            <ClockCircleOutlined style={{ color: 'var(--textState500Primary)' }} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarOutlined style={{ color: 'var(--textState500Primary)' }} />
            <span>{course.lessons} bài học</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TeamOutlined style={{ color: 'var(--textState500Primary)' }} />
            <span>{totalStudents} học viên</span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-gray-100 pt-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <CalendarOutlined style={{ color: 'var(--textState500Primary)' }} />
              <span>Bắt đầu: {formatDate(course.startDate)}</span>
            </div>
            {course.language && <span className="text-xs text-gray-500">Ngôn ngữ: {course.language}</span>}
          </div>
          <div className="text-right">
            {hasDiscount && <div className="text-xs text-gray-400 line-through">{formatPrice(coursePrice)}</div>}
            <div className="flex items-center justify-end gap-1 text-base font-bold" style={{ color: 'var(--textState500Secondary)' }}>
              <DollarCircleOutlined />
              <span>{formatPrice(hasDiscount ? discountPrice || coursePrice : coursePrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
