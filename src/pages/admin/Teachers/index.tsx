// Teacher Management Page - Simplified
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Space, Avatar, Dropdown, Tag, Modal, Typography, Input } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ExportOutlined, UserOutlined, StarFilled, CheckOutlined, CloseOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTeacherManagement } from '../../../hooks';
import { PageHeader, StatusBadge, FilterBar, DetailDrawer } from '../../../components/admin';
import { API_BASE_URL } from '../../../services/axiosBaseQuery';
import { formatDate } from '../../../utils/format';
import type { Teacher } from '../../../types/admin';
import { teacherStatuses } from '../../../constants/adminData';

const { Text } = Typography;
const { TextArea } = Input;

const CV_BASE_URL = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL;
  }
})();

const TeacherManagement: React.FC = () => {
  const {
    teachers, loading, selectedTeacher, setSelectedTeacher, filters, setFilters,
    tableParams, setTableParams, statistics, total, allSpecializations, fetchTeachers,
    approveTeacher, rejectTeacher, suspendTeacher, activateTeacher, deleteTeacher,
  } = useTeacherManagement();

  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Teacher | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailOpen(true);
  };

  const openRejectModal = (teacher: Teacher) => {
    setRejectTarget(teacher);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejectLoading(true);
    await rejectTeacher(rejectTarget.id, rejectReason.trim());
    setRejectLoading(false);
    setRejectModalOpen(false);
    setRejectTarget(null);
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters({ ...filters, [key]: value });
  };

  const getActionMenu = (record: Teacher) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => handleViewDetail(record) },
      { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
      { type: 'divider' as const },
      ...(record.status === 'pending' ? [
        { key: 'approve', icon: <CheckOutlined />, label: 'Phê duyệt', onClick: () => approveTeacher(record.id) },
        { key: 'reject', icon: <CloseOutlined />, label: 'Từ chối', danger: true, onClick: () => openRejectModal(record) },
      ] : []),
      ...(record.status === 'active' ? [{ key: 'suspend', label: 'Tạm ngưng', danger: true, onClick: () => suspendTeacher(record.id) }] : []),
      ...(record.status === 'suspended' ? [{ key: 'activate', label: 'Kích hoạt', onClick: () => activateTeacher(record.id) }] : []),
      { type: 'divider' as const },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => {
        Modal.confirm({
          title: 'Xác nhận xóa',
          content: `Xóa giáo viên "${record.firstName} ${record.lastName}"?`,
          okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
          onOk: () => deleteTeacher(record.id),
        });
      }},
    ],
  });

  const columns = [
    {
      title: 'Giáo viên', dataIndex: 'firstName', key: 'name', width: 220,
      render: (_: string, record: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} size={40} icon={<UserOutlined />} />
          <div>
            <Text strong className="block cursor-pointer hover:text-blue-500" onClick={() => handleViewDetail(record)}>
              {record.firstName} {record.lastName}
            </Text>
            <Text type="secondary" className="text-xs">{record.teacherId}</Text>
          </div>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    {
      title: 'Chuyên môn', dataIndex: 'specialization', key: 'specialization', width: 180,
      render: (specs: string[]) => specs.slice(0, 2).map((s: string) => <Tag key={s} color="blue">{s}</Tag>),
    },
    { title: 'Kinh nghiệm', dataIndex: 'experience', key: 'experience', width: 100, render: (val: number) => `${val} năm` },
    { title: 'Khóa học', dataIndex: 'totalCourses', key: 'courses', width: 90 },
    { title: 'Học viên', dataIndex: 'totalStudents', key: 'students', width: 100, render: (val: number) => val.toLocaleString() },
    { title: 'Đánh giá', dataIndex: 'rating', key: 'rating', width: 80, render: (r: number) => <span><StarFilled className="text-yellow-400" /> {r}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110, render: (s: string) => <StatusBadge status={s} /> },
    {
      title: '', key: 'actions', width: 50, fixed: 'right' as const,
      render: (_: unknown, record: Teacher) => <Dropdown menu={getActionMenu(record)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown>,
    },
  ];

  const filterFields = [
    { type: 'search' as const, key: 'search', placeholder: 'Tìm kiếm...', width: 220 },
    { type: 'select' as const, key: 'status', placeholder: 'Trạng thái', options: teacherStatuses.map((s: { label: string; value: string }) => ({ label: s.label, value: s.value })), width: 140 },
    { type: 'select' as const, key: 'specialization', placeholder: 'Chuyên môn', options: allSpecializations.map((s: string) => ({ label: s, value: s })), width: 160 },
  ];

  const detailItems = selectedTeacher ? [
    { label: 'Mã GV', value: selectedTeacher.teacherId },
    { label: 'Họ tên', value: `${selectedTeacher.firstName} ${selectedTeacher.lastName}` },
    { label: 'Email', value: selectedTeacher.email },
    { label: 'SĐT', value: selectedTeacher.phone },
    { label: 'Học vấn', value: selectedTeacher.qualification },
    { label: 'Kinh nghiệm', value: `${selectedTeacher.experience} năm` },
    { label: 'Ngày tham gia', value: formatDate(selectedTeacher.joinedDate) },
    { label: 'Số khóa học', value: selectedTeacher.totalCourses },
    { label: 'Học viên', value: selectedTeacher.totalStudents.toLocaleString() },
    { label: 'Đánh giá', value: <span><StarFilled className="text-yellow-400" /> {selectedTeacher.rating}</span> },
    { label: 'Chuyên môn', value: selectedTeacher.specialization.map((s: string) => <Tag key={s} color="blue">{s}</Tag>), span: 2 },
    ...(selectedTeacher.cvUrl ? [{
      label: 'CV',
      value: (
        <a
          href={`${CV_BASE_URL}${selectedTeacher.cvUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
        >
          <FilePdfOutlined /> Xem CV (PDF)
        </a>
      ),
    }] : []),
    ...(selectedTeacher.rejectionReason ? [{
      label: 'Lý do từ chối',
      value: <Text type="danger">{selectedTeacher.rejectionReason}</Text>,
      span: 2,
    }] : []),
  ] : [];

  return (
    <div>
      <PageHeader
        title="Quản lý giáo viên"
        subtitle={`${total} giáo viên`}
        breadcrumb={[{ title: 'Giáo viên' }]}
        extra={<Space><Button icon={<ExportOutlined />}>Xuất Excel</Button><Button type="primary" icon={<PlusOutlined />}>Thêm</Button></Space>}
      />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-blue-500">{statistics.total}</div><Text type="secondary" className="text-xs">Tổng</Text></Card></Col>
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-green-500">{statistics.active}</div><Text type="secondary" className="text-xs">Hoạt động</Text></Card></Col>
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-orange-500">{statistics.pending}</div><Text type="secondary" className="text-xs">Chờ duyệt</Text></Card></Col>
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-yellow-500">{statistics.averageRating.toFixed(1)}</div><Text type="secondary" className="text-xs">Đánh giá TB</Text></Card></Col>
      </Row>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} onReset={() => setFilters({})} onRefresh={fetchTeachers} fields={filterFields} loading={loading} />

      <Card>
        <Table
          columns={columns} dataSource={teachers} rowKey="id" loading={loading} scroll={{ x: 1400 }}
          pagination={{ current: tableParams.page, pageSize: tableParams.pageSize, total, showSizeChanger: true }}
          onChange={(p) => setTableParams({ ...tableParams, page: p.current || 1, pageSize: p.pageSize || 10 })}
        />
      </Card>

      <DetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : ''} subtitle={selectedTeacher?.email} avatar={selectedTeacher?.avatar} status={selectedTeacher?.status} items={detailItems} />

      {/* Reject Teacher Modal */}
      <Modal
        title="Từ chối đăng ký giáo viên"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleRejectConfirm}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true, loading: rejectLoading, disabled: !rejectReason.trim() }}
        cancelText="Hủy"
      >
        {rejectTarget && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <Text strong>{rejectTarget.firstName} {rejectTarget.lastName}</Text>
            <Text type="secondary" className="block text-sm">{rejectTarget.email}</Text>
          </div>
        )}
        <div className="mb-2">
          <Text strong>Lý do từ chối <span className="text-red-500">*</span></Text>
        </div>
        <TextArea
          rows={4}
          placeholder="VD: CV không đúng yêu cầu, bằng cấp chưa được xác minh..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>
    </div>
  );
};

export default TeacherManagement;