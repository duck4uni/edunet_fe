import React, { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Image,
  Input,
  Modal,
  Popconfirm,
  Rate,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  UnlockOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../../../components/admin';
import {
  useDeleteCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseByIdMutation,
  useReviewCourseMutation,
  useUpdateCourseMutation,
} from '../../../../services/courseApi';
import type { Course, Lesson, Review } from '../../../../services/courseApi';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/format';
import { notify } from '../../../../utils/notify';
import { useSeo } from '../../../../hooks/useSeo';
import Badge from '../../../../components/common/Tag';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

type NumericLike = number | string | null | undefined;

interface AdminTeacherDetail {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  isActive?: boolean;
}

type AdminCourseDetail = Omit<Course, 'price' | 'discountPrice' | 'rating' | 'schedule' | 'teacher'> & {
  price: NumericLike;
  discountPrice?: NumericLike;
  rating?: NumericLike;
  schedule?: string[] | null;
  teacher?: AdminTeacherDetail;
  lessons?: Lesson[];
  reviews?: Review[];
};

const toNumber = (value: NumericLike): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getTeacherName = (teacher?: AdminTeacherDetail): string => {
  if (!teacher) return 'Chưa gán giảng viên';
  const name = `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim();
  return name || teacher.email || teacher.id;
};

const AdminCourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: courseDetailResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCourseByIdQuery(
    { id: id || '', include: 'category|teacher|lessons|reviews' },
    { skip: !id }
  );

  const [reviewCourse, { isLoading: isReviewing }] = useReviewCourseMutation();
  const [publishCourse, { isLoading: isPublishing }] = usePublishCourseByIdMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const course = courseDetailResponse?.data as AdminCourseDetail | undefined;
  const lessons = useMemo(
    () => [...(course?.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [course?.lessons]
  );
  const reviews = course?.reviews || [];

  useSeo({
    title: course?.title
      ? `${course.title} | Quản trị khóa học | Academix`
      : 'Chi tiết khóa học quản trị | Academix',
    description: course?.description
      ? course.description.slice(0, 180)
      : 'Khu vực quản trị chi tiết khóa học trong hệ thống Academix.',
    keywords: [
      'Academix',
      'admin',
      'quản trị khóa học',
      course?.category?.name || '',
      course?.status || '',
    ].filter(Boolean),
    robots: 'noindex, nofollow',
    canonicalPath: id ? `/admin/courses/${id}` : '/admin/courses',
  });

  const price = toNumber(course?.price);
  const discountPrice = toNumber(course?.discountPrice);
  const rating = toNumber(course?.rating);

  const handleApprove = async (): Promise<void> => {
    if (!id) return;
    try {
      await reviewCourse({ id, status: 'approved' }).unwrap();
      notify.success('Đã duyệt khóa học');
      refetch();
    } catch {
      notify.error('Không thể duyệt khóa học');
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!id || !rejectReason.trim()) {
      notify.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await reviewCourse({
        id,
        status: 'rejected',
        rejectionReason: rejectReason.trim(),
      }).unwrap();
      notify.success('Đã từ chối khóa học');
      setRejectOpen(false);
      setRejectReason('');
      refetch();
    } catch {
      notify.error('Không thể từ chối khóa học');
    }
  };

  const handlePublish = async (): Promise<void> => {
    if (!id) return;
    try {
      await publishCourse(id).unwrap();
      notify.success('Đã xuất bản khóa học');
      refetch();
    } catch {
      notify.error('Không thể xuất bản khóa học');
    }
  };

  const handleToggleLock = async (): Promise<void> => {
    if (!id || !course) return;
    const nextStatus = course.status === 'archived' ? 'published' : 'archived';
    try {
      await updateCourse({ id, data: { status: nextStatus } }).unwrap();
      notify.success(nextStatus === 'archived' ? 'Đã khóa khóa học' : 'Đã mở khóa khóa học');
      refetch();
    } catch {
      notify.error('Không thể cập nhật trạng thái khóa học');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id) return;
    try {
      await deleteCourse(id).unwrap();
      notify.success('Đã xóa khóa học');
      navigate('/admin/courses');
    } catch {
      notify.error('Không thể xóa khóa học');
    }
  };

  const lessonColumns = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (order: number) => order ?? '-',
    },
    {
      title: 'Tên bài học',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Lesson) => (
        <div>
          <Text strong>{title}</Text>
          {record.description && (
            <Paragraph className="!mb-0 !mt-1" type="secondary" ellipsis={{ rows: 2 }}>
              {record.description}
            </Paragraph>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Badge color="blue">{type || 'video'}</Badge>,
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: string) => duration || '—',
    },
    {
      title: 'Truy cập',
      dataIndex: 'isFree',
      key: 'isFree',
      width: 120,
      render: (isFree: boolean) => (
        <Badge color={isFree ? 'green' : 'gold'}>{isFree ? 'Miễn phí' : 'Trả phí'}</Badge>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Học viên',
      key: 'user',
      render: (_: unknown, record: Review) => {
        const fullName = record.user
          ? `${record.user.firstName} ${record.user.lastName}`.trim()
          : 'Ẩn danh';
        return (
          <div className="flex items-center gap-2">
            <Avatar src={record.user?.avatar} icon={<UserOutlined />} size="small" />
            <span>{fullName || 'Ẩn danh'}</span>
          </div>
        );
      },
    },
    {
      title: 'Điểm',
      dataIndex: 'rating',
      key: 'rating',
      width: 180,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Rate disabled allowHalf value={value || 0} />
          <Text>{value || 0}</Text>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string) => comment || <Text type="secondary">Không có nội dung</Text>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (createdAt: string) => (createdAt ? formatDateTime(createdAt) : '—'),
    },
  ];

  const renderActions = (): React.ReactNode => {
    if (!course) return null;

    return (
      <Space wrap>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
          Làm mới
        </Button>

        <Button icon={<EyeOutlined />} onClick={() => navigate(`/courses/${course.id}`)}>
          Xem trang người học
        </Button>

        {course.status === 'pending' && (
          <>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={isReviewing}
              onClick={handleApprove}
              className="approval-action-btn approval-action-btn-approve"
            >
              Duyệt khóa học
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => setRejectOpen(true)}
              className="approval-action-btn approval-action-btn-reject"
            >
              Từ chối
            </Button>
          </>
        )}

        {course.status === 'approved' && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={isPublishing}
            onClick={handlePublish}
          >
            Xuất bản
          </Button>
        )}

        {(course.status === 'published' || course.status === 'archived') && (
          <Button
            icon={course.status === 'archived' ? <UnlockOutlined /> : <LockOutlined />}
            loading={isUpdating}
            onClick={handleToggleLock}
          >
            {course.status === 'archived' ? 'Mở khóa' : 'Khóa khóa học'}
          </Button>
        )}

        <Popconfirm
          title="Xóa khóa học này?"
          description="Hành động này không thể hoàn tác."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={handleDelete}
        >
          <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
            Xóa khóa học
          </Button>
        </Popconfirm>
      </Space>
    );
  };

  if (!id) {
    return <Alert type="error" message="Thiếu mã khóa học" />;
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" tip="Đang tải chi tiết khóa học..." />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <Card>
        <Alert
          type="error"
          showIcon
          message="Không thể tải chi tiết khóa học"
          description="Dữ liệu có thể đã bị xóa hoặc bạn không có quyền truy cập."
        />
        <div className="mt-4">
          <Button onClick={() => refetch()} icon={<ReloadOutlined />}>
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        showBack
        title={course.title}
        subtitle={`Mã khóa học: ${course.id}`}
        breadcrumb={[
          { title: 'Khóa học', path: '/admin/courses' },
          { title: 'Chi tiết khóa học' },
        ]}
        extra={renderActions()}
      />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Giá" value={formatCurrency(price)} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Giá KM" value={discountPrice > 0 ? formatCurrency(discountPrice) : '—'} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Học viên" value={course.totalStudents ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Đánh giá" value={rating.toFixed(1)} suffix={`/ 5 (${course.totalReviews ?? 0})`} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="mb-4" bodyStyle={{ paddingBottom: 12 }}>
            <div className="flex flex-col gap-4">
              <Image
                src={course.thumbnail}
                alt={course.title}
                className="rounded-lg object-cover"
                style={{ width: '100%', maxHeight: 340, objectFit: 'cover' }}
              />
              <div>
                <Space className="mb-2" wrap>
                  <StatusBadge status={course.status} />
                  <Badge color="blue">{course.level}</Badge>
                  <Badge color="purple">{course.language || 'Vietnamese'}</Badge>
                  {course.category?.name && <Badge color="geekblue">{course.category.name}</Badge>}
                </Space>
                <Paragraph>{course.description || 'Không có mô tả'}</Paragraph>
              </div>
            </div>
          </Card>

          <Card>
            <Tabs
              items={[
                {
                  key: 'overview',
                  label: 'Tổng quan',
                  children: (
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Mã khóa học" span={2}>{course.id}</Descriptions.Item>
                      <Descriptions.Item label="Trạng thái"><StatusBadge status={course.status} /></Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">{formatDateTime(course.createdAt)}</Descriptions.Item>
                      <Descriptions.Item label="Cập nhật">{formatDateTime(course.updatedAt)}</Descriptions.Item>
                      <Descriptions.Item label="Xuất bản">
                        {course.publishedAt ? formatDateTime(course.publishedAt) : 'Chưa xuất bản'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời lượng">{course.duration || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Tổng số bài">{course.totalLessons ?? lessons.length}</Descriptions.Item>
                      <Descriptions.Item label="Lịch học">
                        {Array.isArray(course.schedule) && course.schedule.length > 0
                          ? course.schedule.join(', ')
                          : 'Chưa thiết lập'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mục tiêu" span={2}>{course.goal || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Tags" span={2}>
                        {(course.tags || []).length > 0
                          ? (course.tags || []).map(tag => <Badge key={tag}>{tag}</Badge>)
                          : 'Không có tags'}
                      </Descriptions.Item>
                      {course.rejectionReason && (
                        <Descriptions.Item label="Lý do từ chối" span={2}>
                          <Text type="danger">{course.rejectionReason}</Text>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  ),
                },
                {
                  key: 'lessons',
                  label: `Bài học (${lessons.length})`,
                  children: lessons.length ? (
                    <Table
                      rowKey="id"
                      columns={lessonColumns}
                      dataSource={lessons}
                      pagination={{ pageSize: 6 }}
                      scroll={{ x: 720 }}
                    />
                  ) : (
                    <Empty description="Khóa học chưa có bài học" />
                  ),
                },
                {
                  key: 'reviews',
                  label: `Đánh giá (${reviews.length})`,
                  children: reviews.length ? (
                    <Table
                      rowKey="id"
                      columns={reviewColumns}
                      dataSource={reviews}
                      pagination={{ pageSize: 6 }}
                      scroll={{ x: 720 }}
                    />
                  ) : (
                    <Empty description="Chưa có đánh giá" />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Giảng viên" className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={course.teacher?.avatar} icon={<UserOutlined />} size={56} />
              <div>
                <Title level={5} className="!mb-0">{getTeacherName(course.teacher)}</Title>
                <Text type="secondary">{course.teacher?.role || 'teacher'}</Text>
              </div>
            </div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">{course.teacher?.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Điện thoại">{course.teacher?.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge color={course.teacher?.isActive === false ? 'red' : 'green'}>
                  {course.teacher?.isActive === false ? 'Đang khóa' : 'Đang hoạt động'}
                </Badge>
              </Descriptions.Item>
            </Descriptions>
            <Paragraph className="!mb-0 !mt-3" type="secondary">
              {course.teacher?.bio || 'Chưa có mô tả giảng viên'}
            </Paragraph>
          </Card>

          <Card title="Danh mục">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên">{course.category?.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Slug">{course.category?.slug || '—'}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {course.category?.description || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {course.category?.createdAt ? formatDate(course.category.createdAt) : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Từ chối khóa học"
        open={rejectOpen}
        onCancel={() => {
          setRejectOpen(false);
          setRejectReason('');
        }}
        onOk={handleReject}
        confirmLoading={isReviewing}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message="Lý do từ chối sẽ được gửi cho giảng viên để chỉnh sửa khóa học."
        />
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </div>
  );
};

export default AdminCourseDetail;