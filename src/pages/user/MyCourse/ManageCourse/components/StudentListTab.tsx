import React, { useMemo, useState } from 'react';
import { Avatar, Input, Select, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { type Enrollment, useGetEnrollmentsByCourseQuery } from '../../../../../services/courseApi';

const { Title, Text } = Typography;

type EnrollmentFilter = 'all' | Enrollment['status'];

interface StudentListTabProps {
  courseId: string;
}

const ENROLLMENT_STATUS_META: Record<Enrollment['status'], { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'processing' },
  active: { label: 'Đang học', color: 'success' },
  completed: { label: 'Hoàn thành', color: 'blue' },
  dropped: { label: 'Đã nghỉ', color: 'warning' },
  rejected: { label: 'Từ chối', color: 'error' },
  expired: { label: 'Hết hạn', color: 'default' },
};

const StudentListTab: React.FC<StudentListTabProps> = ({ courseId }) => {
  const { data: enrollmentsData, isLoading } = useGetEnrollmentsByCourseQuery(courseId);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentFilter>('all');

  const enrollments = enrollmentsData?.data ?? [];

  const filteredEnrollments = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();

    return enrollments.filter((enrollment) => {
      const fullName = `${enrollment.user?.firstName || ''} ${enrollment.user?.lastName || ''}`
        .trim()
        .toLowerCase();
      const email = (enrollment.user?.email || '').toLowerCase();

      const matchesKeyword = !normalizedKeyword || fullName.includes(normalizedKeyword) || email.includes(normalizedKeyword);
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [enrollments, searchText, statusFilter]);

  const columns: ColumnsType<Enrollment> = [
    {
      title: 'Học sinh',
      dataIndex: 'user',
      key: 'user',
      render: (_value, record) => {
        const firstName = record.user?.firstName || '';
        const lastName = record.user?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Chưa có tên';

        return (
          <div className="flex items-center gap-2">
            <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
            <div>
              <Text strong>{fullName}</Text>
              <div className="manage-tab-subtext">{record.user?.email || 'Chưa có email'}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: Enrollment['status']) => {
        const meta = ENROLLMENT_STATUS_META[status] || { label: status, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 110,
      render: (progress: number) => `${Math.max(0, Math.min(100, Number(progress) || 0))}%`,
    },
    {
      title: 'Ngày ghi danh',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY'),
    },
    {
      title: 'Truy cập gần nhất',
      dataIndex: 'lastAccessedAt',
      key: 'lastAccessedAt',
      width: 170,
      render: (lastAccessedAt?: string) => (lastAccessedAt ? dayjs(lastAccessedAt).format('DD/MM/YYYY HH:mm') : '-'),
    },
  ];

  return (
    <div>
      <div className="manage-tab-toolbar">
        <Title level={4} className="manage-tab-title">
          Danh sách học sinh
        </Title>

        <div className="manage-tab-toolbar-left">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm học sinh..."
            allowClear
            className="manage-tab-search"
          />

          <Select<EnrollmentFilter>
            value={statusFilter}
            onChange={setStatusFilter}
            className="manage-tab-filter"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'active', label: 'Đang học' },
              { value: 'completed', label: 'Hoàn thành' },
              { value: 'dropped', label: 'Đã nghỉ' },
              { value: 'rejected', label: 'Từ chối' },
              { value: 'expired', label: 'Hết hạn' },
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredEnrollments}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: 'Chưa có học sinh nào trong khóa học này.' }}
        scroll={{ x: 980 }}
      />
    </div>
  );
};

export default StudentListTab;
