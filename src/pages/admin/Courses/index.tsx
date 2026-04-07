// Course Management Page
import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Table, Button, Space, Input, Modal, 
  Typography, Avatar, Tooltip, Dropdown, Tabs, Image,
  Rate, Popconfirm, Badge, Form, Select, InputNumber
} from 'antd';
import {
  PlusOutlined, EyeOutlined,
  DeleteOutlined, CheckOutlined, CloseOutlined, LockOutlined,
  UnlockOutlined, MoreOutlined, StarFilled,
  ExportOutlined, TeamOutlined, UserOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCourseManagement } from '../../../hooks';
import { PageHeader, StatusBadge, FilterBar } from '../../../components/admin';
import { formatCurrency, formatDate } from '../../../utils/format';
import type { Course, Review, Enrollment } from '../../../services/courseApi';
import { useGetCategoriesQuery, useGetTeachersQuery, useCreateCourseMutation } from '../../../services/courseApi';
import { message } from 'antd';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CourseManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
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
    courseEnrollments,
    isEnrollmentsLoading,
    openEnrollmentManagement,
    approveEnrollment,
    rejectEnrollment,
  } = useCourseManagement();

  // Fetch real categories from API
  const { data: categoriesData } = useGetCategoriesQuery({ size: 'unlimited' });
  const { data: teachersData } = useGetTeachersQuery({ size: 'unlimited', include: 'user' });
  const [createCourseApi, { isLoading: isCreating }] = useCreateCourseMutation();

  const [activeTab, setActiveTab] = useState(() => {
    if (tabFromUrl === 'pending') return 'pending';
    if (tabFromUrl === 'reviews') return 'reviews';
    return 'all';
  });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; courseId: string | null }>({
    open: false,
    courseId: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [enrollmentsModalOpen, setEnrollmentsModalOpen] = useState(false);
  const [enrollmentTab, setEnrollmentTab] = useState('pending');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Sync tab from URL query param when navigation changes
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('tab');
    if (p === 'pending' || p === 'reviews') {
      setActiveTab(p);
      if (p !== 'reviews') setFilters({ ...filters, status: p });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'reviews') {
      setSelectedCourse(null);
      fetchReviews(undefined);
      setReviewsModalOpen(true);
      return;
    }
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
    navigate(`/admin/courses/${course.id}`);
  };

  const handleReject = async () => {
    if (rejectModal.courseId && rejectReason.trim()) {
      await rejectCourse(rejectModal.courseId, rejectReason);
      setRejectModal({ open: false, courseId: null });
      setRejectReason('');
    }
  };

  const handleCreateCourse = async (values: any) => {
    try {
      await createCourseApi({
        ...values,
        price: Number(values.price ?? 0),
        discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
        totalLessons: values.totalLessons ? Number(values.totalLessons) : 0,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        // Admin create → backend sets status = published automatically
      }).unwrap();
      message.success('Tạo khóa học thành công — đã xuất bản ngay lập tức');
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchCourses();
    } catch {
      message.error('Không thể tạo khóa học, vui lòng thử lại');
    }
  };

  const handleViewReviews = (course: Course) => {
    setSelectedCourse(course);
    fetchReviews(course.id);
    setReviewsModalOpen(true);
  };

  const handleViewEnrollments = (course: Course) => {
    setSelectedCourse(course);
    openEnrollmentManagement(course.id);
    setEnrollmentTab('pending');
    setEnrollmentsModalOpen(true);
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
      {
        key: 'enrollments',
        icon: <TeamOutlined />,
        label: 'Quản lý học viên',
        onClick: () => handleViewEnrollments(record),
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

  const filteredEnrollments = (courseEnrollments as Enrollment[]).filter(e => {
    if (enrollmentTab === 'all') return true;
    return e.status === enrollmentTab;
  });

  const enrollmentColumns = [
    {
      title: 'Học viên',
      key: 'user',
      render: (_: any, record: Enrollment) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.user?.avatar} icon={<UserOutlined />} size="small" />
          <span>{record.user ? `${record.user.firstName} ${record.user.lastName}` : '—'}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 90,
      render: (p: number) => `${p ?? 0}%`,
    },
    {
      title: 'Đăng ký lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 190,
      render: (_: any, record: Enrollment) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Phê duyệt học viên này?"
                onConfirm={() => approveEnrollment(record.id)}
                okText="Duyệt"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  className="approval-action-btn approval-action-btn-approve"
                >
                  Duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Từ chối học viên này?"
                onConfirm={() => rejectEnrollment(record.id)}
                okText="Từ chối"
                okType="danger"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  className="approval-action-btn approval-action-btn-reject"
                >
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

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
    { key: 'approved', label: `Đã duyệt (${statistics.approved ?? 0})` },
    { key: 'published', label: `Đã xuất bản (${statistics.published})` },
    { key: 'rejected', label: `Từ chối (${statistics.rejected})` },
    { key: 'archived', label: `Lưu trữ (${statistics.archived})` },
    { key: 'reviews', label: 'Đánh giá' },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý khóa học"
        subtitle={`${total} khóa học`}
        breadcrumb={[{ title: 'Khóa học' }]}
        extra={
          <Space>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Thêm khóa học
            </Button>
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

      {/* Enrollment Management Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined />
            <span>Quản lý học viên: {selectedCourse?.title}</span>
          </div>
        }
        open={enrollmentsModalOpen}
        onCancel={() => setEnrollmentsModalOpen(false)}
        footer={null}
        width={900}
      >
        <Tabs
          activeKey={enrollmentTab}
          onChange={setEnrollmentTab}
          className="mb-4"
          items={[
            {
              key: 'pending',
              label: (
                <Badge
                  count={(courseEnrollments as Enrollment[]).filter(e => e.status === 'pending').length}
                  size="small"
                  offset={[6, 0]}
                >
                  Chờ phê duyệt
                </Badge>
              ),
            },
            { key: 'active', label: 'Đang học' },
            { key: 'completed', label: 'Hoàn thành' },
            { key: 'rejected', label: 'Đã từ chối' },
            { key: 'all', label: 'Tất cả' },
          ]}
        />
        <Table
          columns={enrollmentColumns}
          dataSource={filteredEnrollments}
          rowKey="id"
          loading={isEnrollmentsLoading}
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: 'Không có học viên nào' }}
        />
      </Modal>
      {/* Create Course Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-blue-500" />
            <span>Tạo khóa học mới</span>
          </div>
        }
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        width={760}
        destroyOnClose
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
          Khóa học do admin tạo sẽ được <strong>xuất bản ngay lập tức</strong> mà không cần qua quy trình phê duyệt.
        </div>
        <Form form={createForm} layout="vertical" onFinish={handleCreateCourse}>
          <Form.Item name="title" label="Tên khóa học" rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}>
            <Input placeholder="Nhập tên khóa học" size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả nội dung khóa học..." />
          </Form.Item>
          <Form.Item name="thumbnail" label="URL Ảnh đại diện">
            <Input placeholder="https://example.com/image.png" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="teacherId" label="Giảng viên (tuỳ chọn)">
                <Select placeholder="Chọn giảng viên" allowClear showSearch optionFilterProp="label">
                  {teachersData?.data?.rows?.map(t => (
                    <Option key={t.id} value={t.userId} label={t.user ? `${t.user.firstName} ${t.user.lastName}` : t.id}>
                      <div className="flex items-center gap-2">
                        <Avatar src={t.user?.avatar} size="small" icon={<UserOutlined />} />
                        {t.user ? `${t.user.firstName} ${t.user.lastName}` : t.id}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryId" label="Danh mục">
                <Select placeholder="Chọn danh mục" allowClear>
                  {(categories as any[]).map((c: any) => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label="Giá (VNĐ)" initialValue={0} rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discountPrice" label="Giá khuyến mãi">
                <InputNumber className="w-full" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="level" label="Cấp độ" initialValue="beginner">
                <Select>
                  <Option value="beginner">Mới bắt đầu</Option>
                  <Option value="intermediate">Trung bình</Option>
                  <Option value="advanced">Nâng cao</Option>
                  <Option value="all">Tất cả</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="duration" label="Thời lượng">
                <Input placeholder="Ví dụ: 20 giờ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="language" label="Ngôn ngữ" initialValue="Vietnamese">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Nhập tags và nhấn Enter..." />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => { setCreateModalOpen(false); createForm.resetFields(); }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isCreating} icon={<PlusOutlined />}>
                Tạo và Xuất bản
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;