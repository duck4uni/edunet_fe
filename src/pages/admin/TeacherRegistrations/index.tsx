// Teacher Registration Approvals Page
import React, { useState, useMemo } from 'react';
import {
  Row, Col, Card, Table, Button, Space, Avatar, Modal, message,
  Typography, Input, Tooltip, Badge, Tabs,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageHeader, StatusBadge } from '../../../components/admin';
import { formatDate } from '../../../utils/format';
import {
  useGetTeachersQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} from '../../../services/courseApi';
import type { Teacher } from '../../../services/courseApi';

const { Text, Title } = Typography;
const { TextArea } = Input;

const CV_BASE_URL = 'http://localhost:3000';

const TeacherRegistrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Teacher | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<Teacher | null>(null);
  const [approveConfirmTarget, setApproveConfirmTarget] = useState<Teacher | null>(null);

  const { data: allData, isLoading, refetch } = useGetTeachersQuery({
    include: 'user',
    size: 'unlimited',
  });

  const [approveTeacher, { isLoading: approving }] = useApproveTeacherMutation();
  const [rejectTeacher] = useRejectTeacherMutation();

  const allTeachers = useMemo(() => allData?.data?.rows || [], [allData]);

  const pending = useMemo(() => allTeachers.filter(t => t.status === 'pending'), [allTeachers]);
  const approved = useMemo(() => allTeachers.filter(t => t.status === 'approved' || t.status === 'active'), [allTeachers]);
  const rejected = useMemo(() => allTeachers.filter(t => t.status === 'rejected'), [allTeachers]);

  const displayData = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : rejected;

  const openRejectModal = (teacher: Teacher) => {
    setRejectTarget(teacher);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveConfirmTarget) return;
    try {
      await approveTeacher(approveConfirmTarget.id).unwrap();
      message.success('Đã phê duyệt tài khoản giảng viên.');
      setApproveConfirmTarget(null);
      refetch();
    } catch {
      message.error('Phê duyệt thất bại. Vui lòng thử lại.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await rejectTeacher({ id: rejectTarget.id, rejectionReason: rejectReason.trim() }).unwrap();
      setRejectModalOpen(false);
    } finally {
      setRejectLoading(false);
    }
  };

  const columns: ColumnsType<Teacher> = [
    {
      title: 'Người đăng ký',
      key: 'user',
      width: 240,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.user?.avatar} size={40} icon={<UserOutlined />} />
          <div>
            <Text strong className="block">
              {record.user?.firstName} {record.user?.lastName}
            </Text>
            <Text type="secondary" className="text-xs">{record.user?.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Bằng cấp / Học vị',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 200,
      render: (val: string) => val || <Text type="secondary">—</Text>,
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      key: 'experience',
      width: 110,
      render: (val: number) => val != null ? `${val} năm` : '—',
    },
    {
      title: 'CV',
      dataIndex: 'cvUrl',
      key: 'cvUrl',
      width: 90,
      render: (cvUrl: string) =>
        cvUrl ? (
          <Tooltip title="Xem CV (PDF)">
            <Button
              type="link"
              icon={<FilePdfOutlined className="text-red-400 text-lg" />}
              href={`${CV_BASE_URL}${cvUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="!p-0"
            />
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: string) => <StatusBadge status={s} />,
    },
    ...(activeTab === 'rejected'
      ? [{
          title: 'Lý do từ chối',
          dataIndex: 'rejectionReason',
          key: 'rejectionReason',
          width: 220,
          render: (val: string) => val
            ? <Text type="danger" className="text-sm">{val}</Text>
            : <Text type="secondary">—</Text>,
        }]
      : []),
    {
      title: '',
      key: 'actions',
      width: activeTab === 'pending' ? 160 : 80,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setDetailModal(record)}
            />
          </Tooltip>
          {activeTab === 'pending' && (
            <>
              <Tooltip title="Phê duyệt">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckOutlined />}
                  size="small"
                  loading={approving}
                  onClick={() => setApproveConfirmTarget(record)}
                  className="!bg-green-500 !border-green-500 hover:!bg-green-600"
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  shape="circle"
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => openRejectModal(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span className="flex items-center gap-2">
          <HourglassOutlined />
          Chờ duyệt
          {pending.length > 0 && <Badge count={pending.length} size="small" />}
        </span>
      ),
    },
    {
      key: 'approved',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Đã duyệt
          <Badge count={approved.length} size="small" color="green" />
        </span>
      ),
    },
    {
      key: 'rejected',
      label: (
        <span className="flex items-center gap-2">
          <CloseCircleOutlined />
          Đã từ chối
          {rejected.length > 0 && <Badge count={rejected.length} size="small" color="red" />}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Duyệt đăng ký giảng viên"
        subtitle="Xem xét hồ sơ, CV và phê duyệt tài khoản giảng viên mới"
        breadcrumb={[{ title: 'Đăng ký giảng viên' }]}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Làm mới
          </Button>
        }
      />

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={8}>
          <Card className="rounded-xl border-0 shadow-sm text-center">
            <div className="text-3xl font-bold text-orange-500">{pending.length}</div>
            <Text className="text-sm font-semibold text-white">Chờ duyệt</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="rounded-xl border-0 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-500">{approved.length}</div>
            <Text className="text-sm font-semibold text-white">Đã duyệt</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="rounded-xl border-0 shadow-sm text-center">
            <div className="text-3xl font-bold text-red-400">{rejected.length}</div>
            <Text className="text-sm font-semibold text-white">Đã từ chối</Text>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="rounded-xl shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as typeof activeTab)}
          items={tabItems}
          className="mb-4"
        />
        <Table
          columns={columns}
          dataSource={displayData}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: activeTab === 'pending' ? 'Không có hồ sơ chờ duyệt' : 'Không có dữ liệu' }}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Từ chối đăng ký giảng viên"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleRejectConfirm}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true, loading: rejectLoading, disabled: !rejectReason.trim() }}
        cancelText="Hủy"
      >
        {rejectTarget && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text strong className="dark:text-white">{rejectTarget.user?.firstName} {rejectTarget.user?.lastName}</Text>
            <Text type="secondary" className="block text-sm dark:text-gray-300">{rejectTarget.user?.email}</Text>
            {rejectTarget.cvUrl && (
              <a
                href={`${CV_BASE_URL}${rejectTarget.cvUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm mt-1"
              >
                <FilePdfOutlined /> Xem CV
              </a>
            )}
          </div>
        )}
        <div className="mb-2">
          <Text strong>Lý do từ chối <span className="text-red-500">*</span></Text>
        </div>
        <TextArea
          rows={4}
          placeholder="VD: CV không đúng yêu cầu, bằng cấp chưa được xác minh..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết hồ sơ đăng ký"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={
          detailModal?.status === 'pending' ? (
            <Space>
              <Button onClick={() => setDetailModal(null)}>Đóng</Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setDetailModal(null);
                  openRejectModal(detailModal);
                }}
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                className="!bg-green-500 !border-green-500"
                onClick={() => {
                  if (detailModal) {
                    setApproveConfirmTarget(detailModal);
                    setDetailModal(null);
                  }
                }}
              >
                Phê duyệt
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailModal(null)}>Đóng</Button>
          )
        }
        width={720}
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={detailModal.user?.avatar} size={64} icon={<UserOutlined />} />
              <div>
                <Title level={4} className="!mb-0">
                  {detailModal.user?.firstName} {detailModal.user?.lastName}
                </Title>
                <Text type="secondary">{detailModal.user?.email}</Text>
                <div className="mt-1">
                  <StatusBadge status={detailModal.status || 'pending'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div>
                <Text type="secondary" className="text-xs">Bằng cấp / Học vị</Text>
                <Text className="block font-medium">{detailModal.qualification || '—'}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-xs">Kinh nghiệm</Text>
                <Text className="block font-medium">
                  {detailModal.experience != null ? `${detailModal.experience} năm` : '—'}
                </Text>
              </div>
              <div className="col-span-2">
                <Text type="secondary" className="text-xs">Ngày đăng ký</Text>
                <Text className="block font-medium">{formatDate(detailModal.createdAt || '')}</Text>
              </div>
            </div>

            {detailModal.cvUrl && (
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between bg-gray-50 dark:bg-transparent">
                <div className="flex items-center gap-3">
                  <FilePdfOutlined className="text-3xl text-red-400" />
                  <div>
                    <Text strong>File CV</Text>
                    <Text type="secondary" className="block text-xs">Hồ sơ xin dạy học</Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  href={`${CV_BASE_URL}${detailModal.cvUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem CV
                </Button>
              </div>
            )}

            {detailModal.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text strong className="text-red-500 block mb-1">Lý do từ chối:</Text>
                <Text>{detailModal.rejectionReason}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Confirm Modal (controlled) */}
      <Modal
        title="Phê duyệt đăng ký giáo viên"
        open={!!approveConfirmTarget}
        onCancel={() => setApproveConfirmTarget(null)}
        onOk={handleApproveConfirm}
        okText="Phê duyệt"
        cancelText="Hủy"
        okButtonProps={{ type: 'primary', className: '!bg-green-500 !border-green-500', loading: approving }}
      >
        {approveConfirmTarget && (
          <div>
            <p>Bạn có chắc muốn phê duyệt tài khoản giảng viên cho:</p>
            <p className="font-semibold mt-1">{approveConfirmTarget.user?.firstName} {approveConfirmTarget.user?.lastName} ({approveConfirmTarget.user?.email})</p>
            <p className="mt-1 text-gray-500 text-sm">Tài khoản sẽ được kích hoạt và giảng viên có thể đăng nhập.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherRegistrations;
