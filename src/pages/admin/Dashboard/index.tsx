import React from 'react';
import { Avatar, Card, Skeleton, Table } from 'antd';
import {
  Users,
  GraduationCap,
  BookOpen,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../../hooks';
import { StatsCard, PageHeader, StatusBadge } from '../../../components/admin';

const AdminDashboard: React.FC = () => {
  const { data, loading } = useDashboard();
  const stats = data?.stats;

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
            className="w-10 h-7 object-cover rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <p className="text-sm font-medium text-gray-800 m-0 truncate max-w-xs">{text}</p>
            <p className="text-xs text-gray-400 m-0">{record.teacher?.name}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Học viên',
      dataIndex: 'totalStudents',
      key: 'students',
      width: 90,
      render: (v: number) => (
        <span className="font-semibold text-gray-700">{(v || 0).toLocaleString()}</span>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (v: number) => (
        <span className="flex items-center gap-1 text-sm">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span className="font-medium">{v || '—'}</span>
        </span>
      ),
    },
  ];

  const ticketColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticketId',
      key: 'id',
      render: (id: string, r: any) => (
        <div>
          <p className="text-sm font-semibold text-gray-800 m-0">#{id}</p>
          <p className="text-xs text-gray-400 m-0">{r.userName}</p>
        </div>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (s: string) => <span className="text-sm text-gray-600">{s}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <StatusBadge status={s} size="small" />,
    },
  ];

  if (loading && !data) {
    return (
      <div>
        <div className="flex items-start justify-between mb-6">
          <Skeleton.Input active style={{ width: 200 }} />
        </div>
        <div className="grid grid-cols-3 gap-5 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        subtitle={`Cập nhật lần cuối: ${new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <StatsCard
          title="Tổng người dùng"
          value={stats?.totalUsers ?? 0}
          icon={<Users size={20} />}
          color="#6366f1"
          trend={stats?.usersGrowth}
          trendLabel="tháng trước"
          formatter={(v) => Number(v).toLocaleString()}
        />
        <StatsCard
          title="Giáo viên"
          value={stats?.totalTeachers ?? 0}
          icon={<GraduationCap size={20} />}
          color="#10b981"
          trend={stats?.teachersGrowth}
          trendLabel="tháng trước"
          formatter={(v) => Number(v).toLocaleString()}
        />
        <StatsCard
          title="Khóa học"
          value={stats?.totalCourses ?? 0}
          icon={<BookOpen size={20} />}
          color="#f59e0b"
          trend={stats?.coursesGrowth}
          trendLabel="tháng trước"
          formatter={(v) => Number(v).toLocaleString()}
        />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Người dùng hôm nay', value: stats?.newUsersToday ?? 0, color: 'bg-indigo-50 text-indigo-600', to: null },
          { label: 'Khóa học mới', value: stats?.newCoursesToday ?? 0, color: 'bg-emerald-50 text-emerald-600', to: null },
          { label: 'Chờ duyệt', value: stats?.pendingApprovals ?? 0, color: 'bg-amber-50 text-amber-600', to: '/admin/courses/review' },
          { label: 'Ticket mở', value: stats?.openTickets ?? 0, color: 'bg-red-50 text-red-600', to: '/admin/support' },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl p-5 ${item.color.split(' ')[0]} border border-transparent`}
          >
            {item.to ? (
              <Link to={item.to} className="block">
                <p className={`text-3xl font-bold m-0 ${item.color.split(' ')[1]}`}>{item.value}</p>
                <p className="text-sm text-gray-500 mt-1 m-0 flex items-center gap-1">
                  {item.label} <ArrowRight size={12} />
                </p>
              </Link>
            ) : (
              <>
                <p className={`text-3xl font-bold m-0 ${item.color.split(' ')[1]}`}>{item.value}</p>
                <p className="text-sm text-gray-500 mt-1 m-0">{item.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Top courses */}
        <div className="lg:col-span-3">
          <Card
            title={<span className="font-semibold text-gray-800">Top khóa học bán chạy</span>}
            extra={<Link to="/admin/courses" className="text-indigo-500 text-sm font-medium hover:text-indigo-600">Xem tất cả</Link>}
            className="!rounded-2xl !border-gray-100 !shadow-sm h-full"
          >
            <Table
              dataSource={data?.topCourses}
              columns={courseColumns}
              rowKey="id"
              pagination={false}
              size="small"
              className="ant-table-clean"
            />
          </Card>
        </div>

        {/* Top teachers */}
        <div className="lg:col-span-2">
          <Card
            title={<span className="font-semibold text-gray-800">Top giáo viên</span>}
            extra={<Link to="/admin/teachers" className="text-indigo-500 text-sm font-medium hover:text-indigo-600">Xem tất cả</Link>}
            className="!rounded-2xl !border-gray-100 !shadow-sm h-full"
          >
            <div className="space-y-4">
              {(data?.topTeachers ?? []).slice(0, 5).map((teacher: any, idx: number) => (
                <div key={teacher.id ?? idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                  <Avatar src={teacher.avatar} size={36} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 m-0 truncate">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-xs text-gray-400 m-0">
                      {teacher.totalCourses ?? 0} khóa · {(teacher.totalStudents ?? 0).toLocaleString()} học viên
                    </p>
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                    <Star size={11} className="fill-amber-400" />
                    {teacher.rating ?? '–'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <Card
            title={<span className="font-semibold text-gray-800">Ticket hỗ trợ gần đây</span>}
            extra={<Link to="/admin/support" className="text-indigo-500 text-sm font-medium hover:text-indigo-600">Xem tất cả</Link>}
            className="!rounded-2xl !border-gray-100 !shadow-sm"
          >
            <Table
              dataSource={data?.recentTickets}
              columns={ticketColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </div>

        {/* Course categories */}
        <div className="lg:col-span-2">
          <Card
            title={<span className="font-semibold text-gray-800">Phân bố danh mục</span>}
            className="!rounded-2xl !border-gray-100 !shadow-sm"
          >
            <div className="space-y-3">
              {data?.coursesChart?.labels?.map((label: string, i: number) => {
                const chartData = data.coursesChart.datasets[0].data;
                const value = chartData[i];
                const total = chartData.reduce((a: number, b: number) => a + b, 0);
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                const c = colors[i % colors.length];
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
