// Course Management Page
import React, { useState } from 'react';
import { 
  Row, Col, Card, Table, Button, Space, Input, Modal, 
  Typography, Avatar, Tooltip, Dropdown, Tag, Tabs, Image,
  Rate, Popconfirm
} from 'antd';
import {
  PlusOutlined, EyeOutlined,
  DeleteOutlined, CheckOutlined, CloseOutlined, LockOutlined,
  UnlockOutlined, MoreOutlined, StarFilled,
  ExportOutlined
} from '@ant-design/icons';
import { useCourseManagement } from '../../../hooks';
import { PageHeader, StatusBadge, FilterBar, DetailDrawer } from '../../../components/admin';
import { formatCurrency, formatDate } from '../../../utils/format';
import type { Course, Review } from '../../../services/courseApi';
import { useGetCategoriesQuery } from '../../../services/courseApi';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const CourseManagement: React.FC = () => {
  const {
    courses,
    reviews,
    loading,
    selectedCourse,
    setSelectedCourse,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    statistics,
    total,
    fetchCourses,
    fetchReviews,
    approveCourse,
    rejectCourse,
    publishCourse,
    toggleCourseLock,
    deleteCourse,
    hideReview,
    showReview,
    deleteReview,
  } = useCourseManagement();

  // Fetch real categories from API
  const { data: categoriesData } = useGetCategoriesQuery({ size: 'unlimited' });

  const [activeTab, setActiveTab] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; courseId: string | null }>({
    open: false,
    courseId: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'all') {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status: key });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleViewDetail = (course: Course) => {
    setSelectedCourse(course);
    setDetailOpen(true);
  };

  const handleReject = async () => {
    if (rejectModal.courseId && rejectReason.trim()) {
      await rejectCourse(rejectModal.courseId, rejectReason);
      setRejectModal({ open: false, courseId: null });
      setRejectReason('');
    }
  };

  const handleViewReviews = (course: Course) => {
    setSelectedCourse(course);
    fetchReviews(course.id);
    setReviewsModalOpen(true);
  };

  // Helper to get teacher display name
  const getTeacherName = (course: Course) => {
    if (course.teacher) {
      return `${course.teacher.firstName} ${course.teacher.lastName}`;
    }
    return '—';
  };

  const getActionMenu = (record: Course) => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => handleViewDetail(record),
      },
      {
        key: 'reviews',
        icon: <StarFilled />,
        label: 'Xem đánh giá',
        onClick: () => handleViewReviews(record),
      },
      { type: 'divider' as const },
      ...(record.status === 'pending' ? [
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Duyệt khóa học',
          onClick: () => approveCourse(record.id),
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: 'Từ chối',
          danger: true,
          onClick: () => setRejectModal({ open: true, courseId: record.id }),
        },
      ] : []),
      ...(record.status === 'approved' ? [
        {
          key: 'publish',
          icon: <CheckOutlined />,
          label: 'Xuất bản',
          onClick: () => publishCourse(record.id),
        },
      ] : []),
      ...(record.status === 'published' || record.status === 'archived' ? [
        {
          key: 'toggle',
          icon: record.status === 'archived' ? <UnlockOutlined /> : <LockOutlined />,
          label: record.status === 'archived' ? 'Mở khóa' : 'Khóa khóa học',
          onClick: () => toggleCourseLock(record.id),
        },
      ] : []),
      { type: 'divider' as const },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Xóa khóa học',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa khóa học "${record.title}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => deleteCourse(record.id),
          });
        },
      },
    ],
  });

  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      width: 350,
      render: (text: string, record: Course) => (
        <div className="flex items-center gap-3">
          <Image
            src={record.thumbnail}
            alt={text}
            width={80}
            height={50}
            className="rounded object-cover"
            preview={false}
          />
          <div className="flex-1 min-w-0">
            <Tooltip title={text}>
              <Text strong className="block truncate cursor-pointer hover:text-blue-500" onClick={() => handleViewDetail(record)}>
                {text}
              </Text>
            </Tooltip>
            <Text type="secondary" className="text-xs">{record.category?.name || '—'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'teacher',
      key: 'teacher',
      width: 150,
      render: (_: any, record: Course) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.teacher?.avatar} size="small" />
          <Text className="text-sm">{getTeacherName(record)}</Text>
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (price: number, record: Course) => (
        <div>
          {record.discountPrice ? (
            <>
              <Text delete type="secondary" className="text-xs block">{formatCurrency(price)}</Text>
              <Text strong className="text-green-500">{formatCurrency(record.discountPrice)}</Text>
            </>
          ) : (
            <Text strong>{formatCurrency(price)}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Học viên',
      dataIndex: 'totalStudents',
      key: 'students',
      width: 90,
      sorter: true,
      render: (val: number) => (val ?? 0).toLocaleString(),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      sorter: true,
      render: (rating: number, record: Course) => (
        <Tooltip title={`${record.totalReviews ?? 0} đánh giá`}>
          <span>
            <StarFilled className="text-yellow-400 mr-1" />
            {rating > 0 ? rating : '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Doanh thu',
      key: 'revenue',
      width: 130,
      sorter: true,
      render: (_: any, record: Course) => formatCurrency((record.price ?? 0) * (record.totalStudents ?? 0)),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date: string) => formatDate(date),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      fixed: 'right' as const,
      render: (_: any, record: Course) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Người đánh giá',
      key: 'userName',
      render: (_: any, record: Review) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.user?.avatar} size="small" />
          <Text>{record.user ? `${record.user.firstName} ${record.user.lastName}` : '—'}</Text>
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: number) => <Rate disabled defaultValue={rating} className="text-sm" />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_: any, record: Review) => (
        <StatusBadge status={record.isVisible === false ? 'hidden' : 'visible'} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: any, record: Review) => (
        <Space size="small">
          {record.isVisible !== false ? (
            <Tooltip title="Ẩn">
              <Button size="small" icon={<EyeOutlined />} onClick={() => hideReview(record.id)} />
            </Tooltip>
          ) : (
            <Tooltip title="Hiện">
              <Button size="small" type="primary" ghost icon={<EyeOutlined />} onClick={() => showReview(record.id)} />
            </Tooltip>
          )}
          <Popconfirm title="Xóa đánh giá này?" onConfirm={() => deleteReview(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categories = categoriesData?.data?.rows || categoriesData?.data || [];
  const filterFields = [
    {
      type: 'search' as const,
      key: 'search',
      placeholder: 'Tìm kiếm khóa học...',
      width: 250,
    },
    {
      type: 'select' as const,
      key: 'category',
      placeholder: 'Danh mục',
      options: (categories as any[]).map((c: any) => ({ label: c.name, value: c.id })),
      width: 180,
    },
  ];

  const tabItems = [
    { key: 'all', label: `Tất cả (${statistics.total})` },
    { key: 'pending', label: `Chờ duyệt (${statistics.pending})` },
    { key: 'published', label: `Đã xuất bản (${statistics.published})` },
    { key: 'rejected', label: `Từ chối (${statistics.rejected})` },
    { key: 'archived', label: `Lưu trữ (${statistics.archived})` },
  ];

  const detailItems = selectedCourse ? [
    { label: 'Mã khóa học', value: selectedCourse.id },
    { label: 'Danh mục', value: selectedCourse.category?.name || '—' },
    { label: 'Cấp độ', value: selectedCourse.level },
    { label: 'Ngôn ngữ', value: selectedCourse.language || '—' },
    { label: 'Thời lượng', value: selectedCourse.duration || '—' },
    { label: 'Số bài học', value: selectedCourse.totalLessons },
    { label: 'Giá gốc', value: formatCurrency(selectedCourse.price) },
    { label: 'Giá khuyến mãi', value: selectedCourse.discountPrice ? formatCurrency(selectedCourse.discountPrice) : '—' },
    { label: 'Học viên', value: (selectedCourse.totalStudents ?? 0).toLocaleString() },
    { label: 'Đánh giá', value: `${selectedCourse.rating ?? 0} (${selectedCourse.totalReviews ?? 0} đánh giá)` },
    { label: 'Ngày tạo', value: formatDate(selectedCourse.createdAt) },
    { label: 'Cập nhật', value: formatDate(selectedCourse.updatedAt) },
    { label: 'Xuất bản', value: selectedCourse.publishedAt ? formatDate(selectedCourse.publishedAt) : '—' },
    { label: 'Mô tả', value: selectedCourse.description, span: 2 },
    { label: 'Thẻ', value: (selectedCourse.tags || []).map(t => <Tag key={t}>{t}</Tag>), span: 2 },
  ] : [];

  return (
    <div>
      <PageHeader
        title="Quản lý khóa học"
        subtitle={`${total} khóa học`}
        breadcrumb={[{ title: 'Khóa học' }]}
        extra={
          <Space>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
            <Button type="primary" icon={<PlusOutlined />}>Thêm khóa học</Button>
          </Space>
        }
      />

      {/* Stats Summary */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{statistics.total}</div>
            <Text type="secondary" className="text-xs">Tổng khóa học</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-500">{statistics.pending}</div>
            <Text type="secondary" className="text-xs">Chờ duyệt</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-500">{(statistics.totalStudents ?? 0).toLocaleString()}</div>
            <Text type="secondary" className="text-xs">Tổng học viên</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-red-500">{statistics.flaggedReviews}</div>
            <Text type="secondary" className="text-xs">Đánh giá bị báo cáo</Text>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters({})}
        onRefresh={fetchCourses}
        fields={filterFields}
        loading={loading}
      />

      {/* Tabs & Table */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={tabItems}
          className="mb-4"
        />
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            current: tableParams.page,
            pageSize: tableParams.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khóa học`,
          }}
          onChange={(pagination, _filters, _sorter) => {
            setTableParams({
              ...tableParams,
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Detail Drawer */}
      <DetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedCourse?.title || ''}
        subtitle={selectedCourse ? getTeacherName(selectedCourse) : undefined}
        avatar={selectedCourse?.thumbnail}
        status={selectedCourse?.status}
        items={detailItems}
      />

      {/* Reject Modal */}
      <Modal
        title="Từ chối khóa học"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => {
          setRejectModal({ open: false, courseId: null });
          setRejectReason('');
        }}
        okText="Từ chối"
        okType="danger"
        cancelText="Hủy"
      >
        <Paragraph className="mb-4">Vui lòng nhập lý do từ chối:</Paragraph>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>

      {/* Reviews Modal */}
      <Modal
        title={`Đánh giá khóa học: ${selectedCourse?.title}`}
        open={reviewsModalOpen}
        onCancel={() => setReviewsModalOpen(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={reviewColumns}
          dataSource={reviews}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default CourseManagement;