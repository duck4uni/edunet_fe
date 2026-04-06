import React from 'react';
import { Card, Col, Row, Typography, Progress, Avatar, Breadcrumb, Tag, Button, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import {
  TeamOutlined,
  ReadOutlined,
  BookOutlined,
  BellOutlined,
  FileTextOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import { useGetCourseByIdQuery, useCheckEnrollmentQuery } from '../../../../services/courseApi';
import { useGetProfileQuery } from '../../../../services/authApi';
import { useGetMaterialsByCourseQuery, useGetAssignmentsByCourseQuery, useGetQuizzesByCourseQuery } from '../../../../services/learningApi';
import { useGetEnrollmentsByCourseQuery } from '../../../../services/courseApi';

const { Title, Text } = Typography;

const DetailMyCourse: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { data: profileData } = useGetProfileQuery();
  const userRole = (profileData?.data?.role as 'student' | 'teacher') || 'student';

  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(
    { id: courseId!, include: 'teacher,lessons,category' },
    { skip: !courseId }
  );
  const { data: enrollmentData, isLoading: enrollmentLoading } = useCheckEnrollmentQuery(courseId!, { skip: !courseId });
  const { data: membersData } = useGetEnrollmentsByCourseQuery(courseId!, { skip: !courseId });
  const { data: materialsData } = useGetMaterialsByCourseQuery(courseId!, { skip: !courseId });
  const { data: assignmentsData } = useGetAssignmentsByCourseQuery(courseId!, { skip: !courseId });
  const { data: quizzesData } = useGetQuizzesByCourseQuery(courseId!, { skip: !courseId });

  const course = courseData?.data;
  const enrollment = enrollmentData?.data?.enrollment;
  const memberCount = membersData?.data?.length || 0;
  const materialCount = materialsData?.data?.length || 0;
  const assignmentCount = assignmentsData?.data?.length || 0;
  const quizCount = quizzesData?.data?.length || 0;
  const totalLessons = course?.totalLessons || course?.lessons?.length || 0;
  const progressValue = enrollment?.progress || 0;
  const completedLessons = totalLessons > 0 ? Math.round((progressValue / 100) * totalLessons) : 0;
  const teacherName = course?.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : '';

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Access guard: students need an active/completed enrollment
  const enrollmentStatus = enrollmentData?.data?.enrollment?.status;
  const hasAccess =
    userRole === 'teacher' ||
    enrollmentStatus === 'active' ||
    enrollmentStatus === 'completed';

  if (!hasAccess) {
    const isPending = enrollmentData?.data?.isPending;
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 text-center px-6">
        <HourglassOutlined style={{ fontSize: 64, color: '#faad14' }} />
        <h2 className="text-2xl font-bold text-[#012643]">
          {isPending ? 'Yêu cầu đăng ký đang chờ phê duyệt' : 'Bạn chưa có quyền truy cập khóa học này'}
        </h2>
        <p className="text-gray-500 max-w-md">
          {isPending
            ? 'Giảng viên chưa phê duyệt yêu cầu đăng ký của bạn. Vui lòng chờ xét duyệt.'
            : 'Vui lòng đăng ký khóa học và chờ phê duyệt từ giảng viên.'}
        </p>
        <Link to="/my-course">
          <Button type="primary">Quay lại Khóa học của tôi</Button>
        </Link>
      </div>
    );
  }

  const menuItems = [
    {
      key: 'classroom',
      title: 'Lớp học',
      description: userRole === 'teacher' ? 'Quản lý thành viên lớp học' : 'Xem thành viên lớp học',
      icon: <TeamOutlined className="text-3xl" />,
      link: `/my-course/classroom/${courseId}`,
      color: 'from-blue-500 to-blue-600',
      stats: `${memberCount} Thành viên`,
      badge: userRole === 'teacher' ? 'Quản lý' : null,
    },
    {
      key: 'assignments',
      title: 'Bài tập',
      description: userRole === 'teacher' ? 'Tạo và chấm bài tập' : 'Nộp và theo dõi bài tập',
      icon: <FileTextOutlined className="text-3xl" />,
      link: `/my-course/assignment/index/${courseId}`,
      color: 'from-orange-500 to-red-500',
      stats: `${assignmentCount} Bài tập`,
      badge: userRole === 'teacher' ? 'Tạo mới' : null,
    },
    {
      key: 'quizzes',
      title: 'Bài kiểm tra',
      description: userRole === 'teacher' ? 'Tạo và quản lý bài kiểm tra' : 'Làm bài kiểm tra',
      icon: <ReadOutlined className="text-3xl" />,
      link: `/my-course/quizz/${courseId}`,
      color: 'from-green-500 to-emerald-600',
      stats: `${quizCount} Bài kiểm tra`,
      badge: userRole === 'teacher' ? 'Tạo mới' : null,
    },
    {
      key: 'materials',
      title: 'Tài liệu',
      description: userRole === 'teacher' ? 'Tải lên và quản lý tài liệu' : 'Tải xuống tài liệu khóa học',
      icon: <BookOutlined className="text-3xl" />,
      link: `/my-course/material/${courseId}`,
      color: 'from-cyan-500 to-teal-500',
      stats: `${materialCount} Tệp`,
      badge: userRole === 'teacher' ? 'Tải lên' : null,
    },
    {
      key: 'notifications',
      title: 'Thông báo',
      description: userRole === 'teacher' ? 'Đăng thông báo cho lớp' : 'Xem thông báo lớp học',
      icon: <BellOutlined className="text-3xl" />,
      link: `/my-course/notifications/${courseId}`,
      color: 'from-pink-500 to-rose-500',
      stats: 'Thông báo',
      badge: userRole === 'teacher' ? 'Đăng' : null,
    },
  ];

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-6"
          items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/my-course">Khóa học của tôi</Link> },
            { title: course?.title || 'Chi tiết khóa học' },
          ]}
        />

        {/* Course Header Card */}
        <Card className="rounded-2xl border-0 shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Course Image */}
            <div className="lg:w-80 h-48 lg:h-auto rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={course?.thumbnail || 'https://placehold.co/400x250?text=Course'} 
                alt={course?.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <Tag color={userRole === 'teacher' ? 'gold' : 'blue'} className="!rounded-full !mb-2">
                    {userRole === 'teacher' ? '👨‍🏫 Giảng viên' : '👨‍🎓 Học viên'}
                  </Tag>
                  <Title level={2} className="!text-[#012643] !mb-2">{course?.title}</Title>
                  <div className="flex items-center gap-3">
                    <Avatar src={course?.teacher?.avatar} size={40} />
                    <div>
                      <Text className="block font-semibold text-[#012643]">{teacherName}</Text>
                      <Text className="text-gray-500 text-sm">Giảng viên</Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-semibold text-[#012643]">Tiến độ khóa học</Text>
                  <Text className="text-2xl font-bold text-[#17EAD9]">{progressValue}%</Text>
                </div>
                <Progress 
                  percent={progressValue} 
                  strokeColor={{ '0%': '#17EAD9', '100%': '#012643' }}
                  showInfo={false}
                  size={{ height: 10 }}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span><TrophyOutlined className="mr-1" />{completedLessons} đã hoàn thành</span>
                  <span>{totalLessons - completedLessons} còn lại</span>
                </div>
              </div>

              {/* Course Info Cards */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <PlayCircleOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <Text className="text-xs text-blue-600 font-medium">TỔNG BÀI HỌC</Text>
                      <Text className="block font-semibold text-[#012643]">{totalLessons} bài học</Text>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <CalendarOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <Text className="text-xs text-green-600 font-medium">CẤP ĐỘ</Text>
                      <Text className="block font-semibold text-[#012643]">{course?.level || 'Tất cả'}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Grid */}
        <Row gutter={[20, 20]}>
          {menuItems.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.key}>
              <Link to={item.link}>
                <Card 
                  className="h-full rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  bodyStyle={{ padding: 0 }}
                >
                  <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        {item.icon}
                      </div>
                      {item.badge && (
                        <Tag color="white" className="!text-gray-800 !rounded-full !font-medium">
                          {item.badge}
                        </Tag>
                      )}
                    </div>
                    <Title level={4} className="!text-white !mt-4 !mb-1">{item.title}</Title>
                    <Text className="text-white/80 text-sm">{item.stats}</Text>
                  </div>
                  <div className="p-5">
                    <Text className="text-gray-600 block mb-3">{item.description}</Text>
                    <div className="flex items-center text-[#012643] font-medium group-hover:translate-x-2 transition-transform">
                      <span>Mở</span>
                      <ArrowRightOutlined className="ml-2" />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Quick Actions for Teacher */}
        {userRole === 'teacher' && (
          <Card className="rounded-2xl border-0 shadow-md mt-8">
            <Title level={4} className="!text-[#012643] !mb-4">Thao tác nhanh</Title>
            <div className="flex flex-wrap gap-3">
              <Link to={`/my-course/classroom/${courseId}`}>
                <Button type="primary" icon={<TeamOutlined />} className="!bg-blue-500 !border-blue-500 !rounded-lg">
                  Thêm học viên
                </Button>
              </Link>
              <Link to={`/my-course/assignment/index/${courseId}`}>
                <Button type="primary" icon={<FileTextOutlined />} className="!bg-orange-500 !border-orange-500 !rounded-lg">
                  Tạo bài tập
                </Button>
              </Link>
              <Link to={`/my-course/quizz/${courseId}`}>
                <Button type="primary" icon={<ReadOutlined />} className="!bg-green-500 !border-green-500 !rounded-lg">
                  Tạo bài kiểm tra
                </Button>
              </Link>
              <Link to={`/my-course/material/${courseId}`}>
                <Button type="primary" icon={<BookOutlined />} className="!bg-cyan-500 !border-cyan-500 !rounded-lg">
                  Tải lên tài liệu
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DetailMyCourse;
