// Admin Dashboard Page
import React from 'react';
import { Row, Col, Card, Typography, Avatar, Table, Tag, Progress, List, Skeleton } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../../hooks';
import { StatsCard, PageHeader, StatusBadge, ChartCard } from '../../../components/admin';
import { formatCurrency } from '../../../utils/format';

const { Text } = Typography;

const AdminDashboard: React.FC = () => {
  const { data, loading } = useDashboard();

  if (loading && !data) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Row gutter={[16, 16]} className="mt-6">
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  const stats = data?.stats;

  // Top courses table columns
  const courseColumns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <img 
            src={record.thumbnail} 
            alt={text}
            className="w-12 h-8 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <Text strong className="block truncate text-sm">{text}</Text>
            <Text type="secondary" className="text-xs">{record.teacher.name}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Học viên',
      dataIndex: 'totalStudents',
      key: 'students',
      width: 100,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 140,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (val: number) => (
        <span>
          <StarFilled className="text-yellow-400 mr-1" />
          {val}
        </span>
      ),
    },
  ];

  // Recent tickets columns
  const ticketColumns = [
    {
      title: 'Mã ticket',
      dataIndex: 'ticketId',
      key: 'ticketId',
      render: (text: string, record: any) => (
        <div>
          <Text strong className="block text-sm">{text}</Text>
          <Text type="secondary" className="text-xs">{record.userName}</Text>
        </div>
      ),
    },
    {
      title: 'Chủ đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => <StatusBadge status={priority} size="small" />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <StatusBadge status={status} size="small" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        subtitle="Tổng quan về hoạt động của hệ thống"
        extra={
          <Text type="secondary">
            Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
          </Text>
        }
      />

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Tổng người dùng"
            value={stats?.totalUsers || 0}
            icon={<UserOutlined />}
            color="#1890ff"
            trend={stats?.usersGrowth}
            trendLabel="so với tháng trước"
            formatter={(val) => Number(val).toLocaleString()}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Tổng giáo viên"
            value={stats?.totalTeachers || 0}
            icon={<TeamOutlined />}
            color="#52c41a"
            trend={stats?.teachersGrowth}
            trendLabel="so với tháng trước"
            formatter={(val) => Number(val).toLocaleString()}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Tổng khóa học"
            value={stats?.totalCourses || 0}
            icon={<BookOutlined />}
            color="#722ed1"
            trend={stats?.coursesGrowth}
            trendLabel="so với tháng trước"
            formatter={(val) => Number(val).toLocaleString()}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Tổng doanh thu"
            value={stats?.totalRevenue || 0}
            icon={<DollarOutlined />}
            color="#fa8c16"
            trend={stats?.revenueGrowth}
            trendLabel="so với tháng trước"
            formatter={(val) => formatCurrency(Number(val))}
          />
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-blue-500">{stats?.newUsersToday || 0}</div>
            <Text type="secondary">Người dùng mới hôm nay</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-green-500">{stats?.newCoursesToday || 0}</div>
            <Text type="secondary">Khóa học mới hôm nay</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center hover:shadow-md transition-shadow">
            <Link to="/admin/courses?status=pending">
              <div className="text-3xl font-bold text-orange-500">{stats?.pendingApprovals || 0}</div>
              <Text type="secondary">Chờ duyệt</Text>
            </Link>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center hover:shadow-md transition-shadow">
            <Link to="/admin/support?status=open">
              <div className="text-3xl font-bold text-red-500">{stats?.openTickets || 0}</div>
              <Text type="secondary">Ticket mở</Text>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <ChartCard
            title="Doanh thu"
            subtitle="12 tháng gần nhất"
            extra={<Link to="/admin/revenue">Xem chi tiết</Link>}
            height={320}
          >
            <div className="flex flex-col gap-2">
              {data?.revenueData.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Text className="w-20">{item.date}</Text>
                  <div className="flex-1">
                    <Progress 
                      percent={(item.revenue / 350000000) * 100} 
                      showInfo={false}
                      strokeColor={{
                        '0%': '#1890ff',
                        '100%': '#52c41a',
                      }}
                    />
                  </div>
                  <Text strong className="w-28 text-right">
                    {formatCurrency(item.revenue)}
                  </Text>
                </div>
              ))}
            </div>
          </ChartCard>
        </Col>
        <Col xs={24} lg={8}>
          <ChartCard
            title="Phân bố khóa học"
            subtitle="Theo danh mục"
            height={320}
          >
            <div className="space-y-3 pt-2">
              {data?.coursesChart.labels.map((label, index) => {
                const value = data.coursesChart.datasets[0].data[index];
                const total = data.coursesChart.datasets[0].data.reduce((a, b) => a + b, 0);
                const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <Text className="flex-1">{label}</Text>
                    <Text strong>{value}</Text>
                    <Text type="secondary" className="w-12 text-right">
                      {((value / total) * 100).toFixed(0)}%
                    </Text>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={14}>
          <Card
            title="Top khóa học bán chạy"
            extra={<Link to="/admin/courses">Xem tất cả</Link>}
          >
            <Table
              dataSource={data?.topCourses}
              columns={courseColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Top giáo viên"
            extra={<Link to="/admin/teachers">Xem tất cả</Link>}
          >
            <List
              dataSource={data?.topTeachers}
              renderItem={(teacher: any, index) => (
                <List.Item className="px-0">
                  <List.Item.Meta
                    avatar={
                      <div className="relative">
                        <Avatar src={teacher.avatar} size={44} />
                        <div 
                          className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold"
                        >
                          {index + 1}
                        </div>
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong>{teacher.firstName} {teacher.lastName}</Text>
                        <span className="text-yellow-400">
                          <StarFilled /> {teacher.rating}
                        </span>
                      </div>
                    }
                    description={
                      <div className="flex justify-between text-xs">
                        <span>{teacher.totalCourses || 0} khóa học</span>
                        <span>{(teacher.totalStudents || 0).toLocaleString()} học viên</span>
                        <span className="text-green-500">{formatCurrency(teacher.earnings || 0)}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Tickets & Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Ticket hỗ trợ gần đây"
            extra={<Link to="/admin/support">Xem tất cả</Link>}
          >
            <Table
              dataSource={data?.recentTickets}
              columns={ticketColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Hoạt động gần đây"
            extra={<Link to="/admin/activity">Xem tất cả</Link>}
          >
            <List
              dataSource={data?.activities.slice(0, 5)}
              renderItem={(activity: any) => (
                <List.Item className="px-0 py-3">
                  <List.Item.Meta
                    avatar={<Avatar src={activity.userAvatar} icon={<UserOutlined />} />}
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong>{activity.userName}</Text>
                        <Text type="secondary" className="text-xs">
                          <ClockCircleOutlined className="mr-1" />
                          {new Date(activity.createdAt).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Tag color="blue" className="mr-2">{activity.module}</Tag>
                        <Text type="secondary">{activity.details}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
