import React from 'react';
import { Avatar, Tabs, Tag } from 'antd';
import { BarChartOutlined, CalendarOutlined, ClockCircleOutlined, GlobalOutlined, ReadOutlined, StarFilled, TeamOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { Course } from '../../models/course';
import { formatDate, formatNumber } from '../../utils/format';

interface CourseHeaderProps {
  course: Course;
  items: TabsProps['items'];
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course, items }) => {
  const normalizedLevel = (course.level || '').toLowerCase();
  const levelLabel = normalizedLevel === 'beginner'
    ? 'Cơ bản'
    : normalizedLevel === 'intermediate'
      ? 'Trung cấp'
      : normalizedLevel === 'advanced'
        ? 'Nâng cao'
        : 'Mọi cấp độ';

  const stats = [
    {
      key: 'rating',
      icon: <StarFilled className="text-state-light-orange" />,
      value: course.rating ? course.rating.toFixed(1) : '0.0',
      label: `${course.totalReviews || 0} đánh giá`,
    },
    {
      key: 'students',
      icon: <TeamOutlined className="text-state-500-primary" />,
      value: formatNumber(course.totalStudents || 0, 'vi-VN'),
      label: 'Học viên',
    },
    {
      key: 'lessons',
      icon: <ReadOutlined className="text-state-500-primary" />,
      value: String(course.lessons || 0),
      label: 'Bài học',
    },
    {
      key: 'level',
      icon: <BarChartOutlined className="text-state-500-primary" />,
      value: levelLabel,
      label: course.duration || 'Đang cập nhật',
    },
  ];

  return (
    <div className="detail-course-main-card mb-2.5">
      <div className="mb-1 flex flex-wrap items-center gap-1">
        <span className="detail-course-brand-pill">{course.category || 'Khóa học'}</span>
        <span className="detail-course-brand-pill detail-course-brand-pill-secondary">Được đề xuất</span>
      </div>

      <h1 className="detail-course-title">{course.title}</h1>

      <div className="detail-course-meta-row">
        <div className="detail-course-meta-chip">
          <Avatar src={course.teacher?.avatar} size="small" />
          <span className="font-medium text-[var(--primaryColor)]">{course.teacher?.name || 'Giảng viên Academix'}</span>
        </div>
        <div className="detail-course-meta-chip">
          <ClockCircleOutlined className="text-state-500-primary" />
          <span>
            Cập nhật lần cuối {course.updatedAt ? formatDate(course.updatedAt, 'MM/YYYY') : 'gần đây'}
          </span>
        </div>
        <div className="detail-course-meta-chip">
          <GlobalOutlined className="text-state-500-primary" />
          <span>{course.language || 'Vietnamese'}</span>
        </div>
        <div className="detail-course-meta-chip">
          <CalendarOutlined className="text-state-500-primary" />
          <span>
            Xuất bản {course.publishedAt ? formatDate(course.publishedAt, 'DD/MM/YYYY') : 'sắp tới'}
          </span>
        </div>
      </div>

      <div className="detail-course-kpi-grid mb-2.5">
        {stats.map((stat) => (
          <div key={stat.key} className="detail-course-kpi-item">
            <div className="detail-course-kpi-icon">{stat.icon}</div>
            <div>
              <p className="detail-course-kpi-value">{stat.value}</p>
              <p className="detail-course-kpi-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {course.tags?.length ? (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {course.tags.map((tag) => (
            <Tag key={tag} className="detail-course-tag-pill">
              #{tag}
            </Tag>
          ))}
        </div>
      ) : null}

      <Tabs defaultActiveKey="1" items={items} className="detail-course-tabs" destroyOnHidden size="small" />
    </div>
  );
};

export default CourseHeader;
