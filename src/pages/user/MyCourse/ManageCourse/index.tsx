import React, { useMemo, useState } from 'react';
import { AppstoreOutlined, FileTextOutlined, FormOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import { Alert, Card, Spin, Tabs } from 'antd';
import { useParams } from 'react-router-dom';
import {
  useGetCourseByIdQuery,
  useGetEnrollmentsByCourseQuery,
  useGetLessonsByCourseQuery,
} from '../../../../services/courseApi';
import {
  useGetAssignmentsByCourseQuery,
  useGetMaterialsByCourseQuery,
  useGetQuizzesByCourseQuery,
} from '../../../../services/learningApi';
import CourseDescriptionTab from './components/CourseDescriptionTab';
import ClassroomTab from './components/ClassroomTab';
import MaterialsTab from './components/MaterialsTab';
import AssignmentsTab from './components/AssignmentsTab';
import QuizzesTab from './components/QuizzesTab';
import StudentListTab from './components/StudentListTab';
import './manage-course.css';

const ManageCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id ?? '';
  const shouldSkip = !courseId;

  const { data: courseData, isLoading } = useGetCourseByIdQuery({ id: courseId }, { skip: shouldSkip });
  const { data: lessonsData } = useGetLessonsByCourseQuery(courseId, { skip: shouldSkip });
  const { data: materialsData } = useGetMaterialsByCourseQuery(courseId, { skip: shouldSkip });
  const { data: assignmentsData } = useGetAssignmentsByCourseQuery(courseId, { skip: shouldSkip });
  const { data: quizzesData } = useGetQuizzesByCourseQuery(courseId, { skip: shouldSkip });
  const { data: enrollmentsData } = useGetEnrollmentsByCourseQuery(courseId, { skip: shouldSkip });
  const [activeTab, setActiveTab] = useState('description');

  const course = courseData?.data;

  const studentsCount = enrollmentsData?.data?.length ?? 0;
  const lessonsCount = lessonsData?.data?.length ?? 0;
  const materialsCount = materialsData?.data?.length ?? 0;
  const assignmentsCount = assignmentsData?.data?.length ?? 0;
  const quizzesCount = quizzesData?.data?.length ?? 0;

  const tabItems = useMemo(
    () => {
      const rawItems = [
        {
          key: 'description',
          label: (
            <span className="manage-course-tab-label">
              <FileTextOutlined />
              Mô tả khóa học
            </span>
          ),
          children: <CourseDescriptionTab courseId={courseId} course={course} />,
        },
        {
          key: 'students',
          label: (
            <span className="manage-course-tab-label">
              <TeamOutlined />
              Học sinh
              <span className="manage-course-tab-count">{studentsCount}</span>
            </span>
          ),
          children: <StudentListTab courseId={courseId} />,
        },
        {
          key: 'lessons',
          label: (
            <span className="manage-course-tab-label">
              <ReadOutlined />
              Bài học
              <span className="manage-course-tab-count">{lessonsCount}</span>
            </span>
          ),
          children: <ClassroomTab courseId={courseId} />,
        },
        {
          key: 'materials',
          label: (
            <span className="manage-course-tab-label">
              <FileTextOutlined />
              Tài liệu
              <span className="manage-course-tab-count">{materialsCount}</span>
            </span>
          ),
          children: (
            <MaterialsTab
              courseId={courseId}
              courseTitle={course?.title}
              courseDescription={course?.description}
            />
          ),
        },
        {
          key: 'assignments',
          label: (
            <span className="manage-course-tab-label">
              <FormOutlined />
              Bài tập
              <span className="manage-course-tab-count">{assignmentsCount}</span>
            </span>
          ),
          children: (
            <AssignmentsTab
              courseId={courseId}
              courseTitle={course?.title}
              courseDescription={course?.description}
            />
          ),
        },
        {
          key: 'quizzes',
          label: (
            <span className="manage-course-tab-label">
              <AppstoreOutlined />
              Quizzes
              <span className="manage-course-tab-count">{quizzesCount}</span>
            </span>
          ),
          children: <QuizzesTab courseId={courseId} />,
        },
      ];

      // Guard against accidental duplicated tabs when merging/reloading.
      return rawItems.filter(
        (item, index, items) => items.findIndex((candidate) => candidate.key === item.key) === index,
      );
    },
    [
      assignmentsCount,
      course,
      courseId,
      lessonsCount,
      materialsCount,
      quizzesCount,
      studentsCount,
    ],
  );

  if (!courseId) {
    return (
      <div className="mycourse-shell manage-course-shell">
        <div className="mycourse-container">
          <Alert
            type="error"
            message="Không tìm thấy mã khóa học"
            description="Vui lòng quay lại danh sách khóa học và chọn lại khóa học cần quản lý."
            showIcon
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mycourse-shell manage-course-shell">
        <div className="course-manage-loading">
          <Spin size="large" tip="Đang tải dữ liệu khóa học..." />
        </div>
      </div>
    );
  }

  return (
    <div className="mycourse-shell manage-course-shell">
      <div className="mycourse-container">
        <Card className="manage-course-card" bordered={false}>
          <Tabs
            className="manage-course-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={tabItems}
          />
        </Card>
      </div>
    </div>
  );
};

export default ManageCourse;
