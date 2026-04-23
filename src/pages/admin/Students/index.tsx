import React, { useState } from 'react';
import { Avatar, Button, Card, Dropdown, Modal, Progress, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, LockOutlined, MoreOutlined, ReloadOutlined, UnlockOutlined, UserOutlined } from '@ant-design/icons';

import { DetailDrawer, FilterBar, PageHeader, StatusBadge } from '../../../components/admin';
import Badge from '../../../components/common/Tag';
import { useStudentManagement } from '../../../hooks';
import type { AdminStudentRecord, StudentLearningStatus } from '../../../hooks/useStudentManagement';
import { formatDate, formatDateTime } from '../../../utils/format';

const { Text } = Typography;

const learningStatusMap: Record<StudentLearningStatus, { label: string; color: string }> = {
  learning: { label: 'Đang học', color: 'green' },
  pending: { label: 'Chờ duyệt', color: 'orange' },
  completed: { label: 'Hoàn thành', color: 'blue' },
  not_enrolled: { label: 'Chưa ghi danh', color: 'default' },
  inactive: { label: 'Không hoạt động', color: 'red' },
};

const enrollmentStatusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'Đang học', color: 'green' },
  pending: { label: 'Chờ duyệt', color: 'orange' },
  completed: { label: 'Hoàn thành', color: 'blue' },
  dropped: { label: 'Đã nghỉ', color: 'warning' },
  rejected: { label: 'Từ chối', color: 'red' },
  expired: { label: 'Hết hạn', color: 'default' },
};

const StudentManagement: React.FC = () => {
  const {
    students,
    loading,
    selectedStudent,
    setSelectedStudent,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    total,
    statistics,
    allGrades,
    fetchStudents,
    toggleStudentAccountStatus,
  } = useStudentManagement();

  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = (student: AdminStudentRecord) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters({ ...filters, [key]: value });
    setTableParams({ ...tableParams, page: 1 });
  };

  const confirmToggleAccount = (student: AdminStudentRecord) => {
    const isActive = student.accountStatus === 'active';
    Modal.confirm({
      title: isActive ? 'Khóa tài khoản học viên' : 'Mở khóa tài khoản học viên',
      content: `${isActive ? 'Khóa' : 'Mở khóa'} tài khoản của ${student.fullName}?`,
      okText: isActive ? 'Khóa tài khoản' : 'Mở khóa',
      okType: isActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: () => toggleStudentAccountStatus(student.id, isActive ? 'inactive' : 'active'),
    });
  };

  const getActionMenu = (record: AdminStudentRecord) => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => handleViewDetail(record),
      },
      {
        key: 'toggle-account',
        icon: record.accountStatus === 'active' ? <LockOutlined /> : <UnlockOutlined />,
        label: record.accountStatus === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
        danger: record.accountStatus === 'active',
        onClick: () => confirmToggleAccount(record),
      },
    ],
  });

  const columns: ColumnsType<AdminStudentRecord> = [
    {
      title: 'Học viên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 250,
      render: (_value: string, record: AdminStudentRecord) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} icon={<UserOutlined />} size={40} />
          <div>
            <Text
              strong
              className="block cursor-pointer hover:text-blue-500"
              onClick={() => handleViewDetail(record)}
            >
              {record.fullName}
            </Text>
            <Text type="secondary" className="text-xs">
              {record.email || 'Chưa có email'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Mã học viên',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 130,
    },
    {
      title: 'Trường / Lớp',
      dataIndex: 'school',
      key: 'school',
      width: 190,
      render: (_value: string, record: AdminStudentRecord) => (
        <div>
          <Text className="block">{record.school || '-'}</Text>
          <Text type="secondary" className="text-xs">
            {record.grade || 'Chưa cập nhật lớp'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      width: 120,
      render: (status: AdminStudentRecord['accountStatus']) => <StatusBadge status={status} />,
    },
    {
      title: 'Tình trạng học',
      dataIndex: 'learningStatus',
      key: 'learningStatus',
      width: 140,
      render: (status: StudentLearningStatus) => <StatusBadge status={status} statusMap={learningStatusMap} />,
    },
    {
      title: 'Khóa đang học',
      dataIndex: 'currentCourses',
      key: 'currentCourses',
      width: 260,
      render: (courses: AdminStudentRecord['currentCourses']) => {
        if (courses.length === 0) {
          return <Text type="secondary">Chưa có khóa học</Text>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {courses.slice(0, 2).map((course) => (
              <Badge key={course.enrollmentId} color="processing">
                {course.title}
              </Badge>
            ))}
            {courses.length > 2 && <Text type="secondary">+{courses.length - 2}</Text>}
          </div>
        );
      },
    },
    {
      title: 'Tiến độ TB',
      dataIndex: 'averageProgress',
      key: 'averageProgress',
      width: 150,
      render: (progress: number) => (
        <div>
          <Progress percent={progress} size="small" showInfo={false} />
          <Text className="text-xs">{progress}%</Text>
        </div>
      ),
    },
    {
      title: 'Lần truy cập gần nhất',
      dataIndex: 'lastAccessedAt',
      key: 'lastAccessedAt',
      width: 180,
      render: (lastAccessedAt?: string) => (
        <Text>{lastAccessedAt ? formatDateTime(lastAccessedAt) : '-'}</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 52,
      fixed: 'right',
      render: (_: unknown, record: AdminStudentRecord) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filterFields = [
    { type: 'search' as const, key: 'search', placeholder: 'Tìm theo tên, email, mã học viên...', width: 250 },
    {
      type: 'select' as const,
      key: 'accountStatus',
      placeholder: 'Tài khoản',
      options: [
        { label: 'Hoạt động', value: 'active' },
        { label: 'Bị khóa', value: 'inactive' },
      ],
      width: 140,
    },
    {
      type: 'select' as const,
      key: 'learningStatus',
      placeholder: 'Tình trạng học',
      options: [
        { label: 'Đang học', value: 'learning' },
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Hoàn thành', value: 'completed' },
        { label: 'Chưa ghi danh', value: 'not_enrolled' },
        { label: 'Không hoạt động', value: 'inactive' },
      ],
      width: 160,
    },
    {
      type: 'select' as const,
      key: 'grade',
      placeholder: 'Lớp',
      options: allGrades.map((grade) => ({ label: grade, value: grade })),
      width: 120,
    },
  ];

  const detailItems = selectedStudent
    ? [
        { label: 'Mã học viên', value: selectedStudent.studentId },
        { label: 'Họ tên', value: selectedStudent.fullName },
        { label: 'Email', value: selectedStudent.email || '-' },
        { label: 'Trường', value: selectedStudent.school || '-' },
        { label: 'Lớp', value: selectedStudent.grade || '-' },
        { label: 'Tài khoản', value: <StatusBadge status={selectedStudent.accountStatus} /> },
        {
          label: 'Tình trạng học',
          value: <StatusBadge status={selectedStudent.learningStatus} statusMap={learningStatusMap} />,
        },
        { label: 'Tổng khóa học', value: selectedStudent.totalCourses },
        { label: 'Khóa đang học', value: selectedStudent.activeCourses },
        { label: 'Khóa đã hoàn thành', value: selectedStudent.completedCourses },
        { label: 'Tiến độ trung bình', value: `${selectedStudent.averageProgress}%` },
        { label: 'Ngày tham gia', value: selectedStudent.joinedDate ? formatDate(selectedStudent.joinedDate) : '-' },
        {
          label: 'Lần truy cập gần nhất',
          value: selectedStudent.lastAccessedAt ? formatDateTime(selectedStudent.lastAccessedAt) : '-',
          span: 2,
        },
        {
          label: 'Khóa học đang theo dõi',
          value:
            selectedStudent.currentCourses.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedStudent.currentCourses.map((course) => (
                  <div key={course.enrollmentId} className="rounded-lg border border-gray-200 px-3 py-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Text strong>{course.title}</Text>
                      <Badge color={enrollmentStatusMap[course.status]?.color || 'default'}>
                        {enrollmentStatusMap[course.status]?.label || course.status}
                      </Badge>
                    </div>
                    <Progress percent={course.progress} size="small" showInfo={false} />
                    <Text type="secondary" className="text-xs">
                      Tiến độ: {course.progress}%
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">Học viên chưa có khóa học đang theo dõi.</Text>
            ),
          span: 2,
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Quản lý học viên"
        subtitle={`${total} học viên`}
        breadcrumb={[{ title: 'Học viên' }]}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchStudents()} loading={loading}>
              Làm mới dữ liệu
            </Button>
          </Space>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-indigo-500">{statistics.total}</div>
          <p className="text-xs text-gray-500 mt-1 m-0">Tổng học viên</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-emerald-500">{statistics.activeAccounts}</div>
          <p className="text-xs text-gray-500 mt-1 m-0">Tài khoản hoạt động</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-cyan-600">{statistics.learning}</div>
          <p className="text-xs text-gray-500 mt-1 m-0">Đang học</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-500">{statistics.pending}</div>
          <p className="text-xs text-gray-500 mt-1 m-0">Chờ duyệt</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-slate-500">{statistics.notEnrolled}</div>
          <p className="text-xs text-gray-500 mt-1 m-0">Chưa ghi danh</p>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => {
          setFilters({});
          setTableParams({ ...tableParams, page: 1 });
        }}
        onRefresh={fetchStudents}
        fields={filterFields}
        loading={loading}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            current: tableParams.page,
            pageSize: tableParams.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `${count} học viên`,
          }}
          onChange={(pagination) =>
            setTableParams({
              ...tableParams,
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            })
          }
        />
      </Card>

      <DetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedStudent?.fullName || ''}
        subtitle={selectedStudent?.email || selectedStudent?.studentId}
        avatar={selectedStudent?.avatar}
        status={selectedStudent?.accountStatus}
        items={detailItems}
      />
    </div>
  );
};

export default StudentManagement;
