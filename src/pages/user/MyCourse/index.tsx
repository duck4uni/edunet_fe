import React from 'react';
import { Card, Button, Input, Select, Tag, Typography, Progress, Empty, Segmented, Row, Col, Spin } from 'antd';
import { 
  EyeOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined,
  TrophyOutlined,
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useMyCourse } from '../../../hooks';
import dayjs from 'dayjs';
import { useGetProfileQuery } from '../../../services/authApi';
import TeacherDashboard from './TeacherDashboard';

const { Title, Text } = Typography;

const MyCourse: React.FC = () => {
  const { data: profileResponse } = useGetProfileQuery();
  const isTeacher = profileResponse?.data?.role === 'teacher';

  if (isTeacher) {
    return <TeacherDashboard />;
  }

  const {

    viewMode,
    setViewMode,
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    filteredCourses,
    pendingCourses,
    stats,
    getStatusConfig,
    isLoading,
  } = useMyCourse();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'learning': return <PlayCircleOutlined />;
      case 'completed': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      default: return null;
    }
  };

  const renderGridView = () => (
    <Row gutter={[24, 24]}>
      {filteredCourses.map(course => {
        const statusConfig = getStatusConfig(course.status);
        return (
          <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
            <Card 
              className="h-full rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
              cover={
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Tag 
                    color={statusConfig.color as any}
                    className="!absolute top-3 left-3 !rounded-full !px-3 !py-1 !border-0"
                    icon={getStatusIcon(course.status)}
                  >
                    {statusConfig.text}
                  </Tag>
                  {course.status === 'learning' && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <Progress 
                        percent={course.progress} 
                        size="small" 
                        strokeColor="#17EAD9" 
                        trailColor="rgba(255,255,255,0.3)"
                        format={() => <span className="text-white text-xs">{course.progress}%</span>}
                      />
                    </div>
                  )}
                </div>
              }
              bodyStyle={{ padding: '16px' }}
            >
              <div className="mb-3">
                <Tag color="blue" className="!rounded-full !text-xs !mb-2">{course.category}</Tag>
                <Title level={5} className="!text-[#012643] !mb-1 !line-clamp-2 !leading-tight">
                  {course.title}
                </Title>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <UserOutlined />
                  <span>{course.teacher}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <BookOutlined />
                  {course.lessons} bài học
                </span>
                {course.status === 'completed' && course.completedDate && (
                  <span className="flex items-center gap-1 text-green-500">
                    <TrophyOutlined />
                    {dayjs(course.completedDate).format('DD/MM/YYYY')}
                  </span>
                )}
              </div>

              {course.status === 'learning' && (
                <div className="bg-blue-50 p-3 rounded-xl mb-4">
                  <Text className="text-xs text-blue-600 font-medium">Tiến độ:</Text>
                  <Progress 
                    percent={course.progress} 
                    size="small" 
                    strokeColor="#17EAD9" 
                    className="!mb-0"
                  />
                </div>
              )}

              {course.status === 'pending' && course.startDate && (
                <div className="bg-orange-50 p-3 rounded-xl mb-4">
                  <Text className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <CalendarOutlined /> Bắt đầu
                  </Text>
                  <Text className="block text-sm text-[#012643] font-semibold">{dayjs(course.startDate).format('DD/MM/YYYY')}</Text>
                </div>
              )}

              <div className="flex gap-2">
                <Link to={`/my-course/detail/${course.id}`} className="flex-1">
                  <Button 
                    type="primary" 
                    block
                    icon={<EyeOutlined />}
                    className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg"
                  >
                    Chi tiết
                  </Button>
                </Link>
                {course.status === 'learning' && (
                  <Link to={`/my-course/classroom/${course.id}`}>
                    <Button 
                      type="default"
                      icon={<PlayCircleOutlined />}
                      className="!border-[#17EAD9] !text-[#17EAD9] hover:!bg-[#17EAD9] hover:!text-white !rounded-lg"
                    >
                      Tiếp tục
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredCourses.map(course => {
        const statusConfig = getStatusConfig(course.status);
        return (
          <Card 
            key={course.id}
            className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300"
            bodyStyle={{ padding: 0 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <Tag 
                  color={statusConfig.color as any}
                  className="!absolute top-3 left-3 !rounded-full !px-3 !py-1 !border-0"
                  icon={getStatusIcon(course.status)}
                >
                  {statusConfig.text}
                </Tag>
              </div>
              
              <div className="flex-1 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <Tag color="blue" className="!rounded-full !text-xs !mb-2">{course.category}</Tag>
                    <Title level={4} className="!text-[#012643] !mb-2">{course.title}</Title>
                    <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                      <span className="flex items-center gap-2">
                        <UserOutlined />
                        {course.teacher}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOutlined />
                        {course.lessons} bài học
                      </span>
                    </div>

                    {course.status === 'learning' && (
                      <div className="max-w-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Tiến độ</span>
                          <span className="font-semibold text-[#012643]">{course.progress}%</span>
                        </div>
                        <Progress 
                          percent={course.progress} 
                          strokeColor={{ '0%': '#17EAD9', '100%': '#012643' }}
                          showInfo={false}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2">
                    <Link to={`/my-course/detail/${course.id}`}>
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg"
                      >
                        Chi tiết
                      </Button>
                    </Link>
                    {course.status === 'learning' && (
                      <Link to={`/my-course/classroom/${course.id}`}>
                        <Button 
                          type="default"
                          icon={<PlayCircleOutlined />}
                          className="!border-[#17EAD9] !text-[#17EAD9] hover:!bg-[#17EAD9] hover:!text-white !rounded-lg"
                        >
                          Tiếp tục
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="!text-[#012643] !mb-2">Khóa học của tôi</Title>
          <Text className="text-gray-500 text-lg">Theo dõi tiến độ và tiếp tục học tập</Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-blue-100 text-sm">Tổng khóa học</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.inProgress}</div>
                <div className="text-cyan-100 text-sm">Đang học</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.completed}</div>
                <div className="text-green-100 text-sm">Hoàn thành</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-orange-400 to-amber-500 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.notStarted}</div>
                <div className="text-orange-100 text-sm">Chưa bắt đầu</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Pending Enrollments */}
        {pendingCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <HourglassOutlined className="text-orange-500 text-xl" />
              <Title level={4} className="!text-[#012643] !mb-0">Chờ phê duyệt</Title>
              <Tag color="orange" className="!rounded-full">{pendingCourses.length}</Tag>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-2">
              <Text className="text-orange-700 text-sm">
                Các khóa học dưới đây đang chờ giảng viên phê duyệt yêu cầu đăng ký. Bạn sẽ được thông báo khi được chấp thuận.
              </Text>
            </div>
            <Row gutter={[16, 16]}>
              {pendingCourses.map(course => (
                <Col xs={24} sm={12} lg={8} xl={6} key={course.key}>
                  <Card
                    className="rounded-2xl overflow-hidden border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 bg-orange-50/30"
                    cover={
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <Tag
                          icon={<HourglassOutlined />}
                          color="orange"
                          className="!absolute top-3 left-3 !rounded-full !px-3 !py-1 !border-0"
                        >
                          Chờ phê duyệt
                        </Tag>
                      </div>
                    }
                    bodyStyle={{ padding: '14px' }}
                  >
                    <Tag color="blue" className="!rounded-full !text-xs !mb-2">{course.category}</Tag>
                    <Title level={5} className="!text-[#012643] !mb-1 !line-clamp-2 !leading-tight">
                      {course.title}
                    </Title>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <UserOutlined />
                      <span>{course.teacher}</span>
                    </div>
                    {course.enrolledAt && (
                      <div className="text-xs text-orange-600 flex items-center gap-1 mb-3">
                        <CalendarOutlined />
                        Đăng ký: {dayjs(course.enrolledAt).format('DD/MM/YYYY')}
                      </div>
                    )}
                    <Link to={`/courses/${course.id}`}>
                      <Button
                        block
                        icon={<EyeOutlined />}
                        className="!rounded-lg !border-orange-400 !text-orange-600 hover:!bg-orange-500 hover:!text-white"
                      >
                        Xem khóa học
                      </Button>
                    </Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Filters */}
        <Card className="rounded-2xl border-0 shadow-md mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Tìm kiếm khóa học..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="!w-64 !rounded-lg"
                allowClear
              />
              <Select 
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 170 }}
                className="!rounded-lg"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'learning', label: 'Đang học' },
                  { value: 'completed', label: 'Hoàn thành' },
                  { value: 'pending', label: 'Chưa bắt đầu' },
                ]}
              />
            </div>
            
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'grid', icon: <AppstoreOutlined /> },
                { value: 'list', icon: <BarsOutlined /> },
              ]}
            />
          </div>
        </Card>

        {/* Course List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" tip="Đang tải khóa học..." />
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-md">
            <Empty 
              description="Không tìm thấy khóa học nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link to="/courses">
                <Button type="primary" className="!bg-[#012643]">Khám phá khóa học</Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </div>
    </div>
  );
};

export default MyCourse;
