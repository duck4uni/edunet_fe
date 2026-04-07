import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Image,
  Modal,
  Popconfirm,
  Rate,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { DeleteOutlined, EyeOutlined, MoreOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCourseManagement } from '../../../../hooks';
import { FilterBar, PageHeader, StatusBadge } from '../../../../components/admin';
import type { Category, Course, Review, Teacher } from '../../../../services/courseApi';
import { formatCurrency } from '../../../../utils/format';
import { useGetCategoriesQuery, useGetTeachersQuery } from '../../../../services/courseApi';

const { Text } = Typography;

const RejectedCourseManagement: React.FC = () => {
  const navigate = useNavigate();
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
    total,
    fetchCourses,
    fetchReviews,
    hideReview,
    showReview,
    deleteReview,
    deleteCourse,
  } = useCourseManagement({ status: 'rejected' });

  const { data: categoriesData } = useGetCategoriesQuery({ size: 'unlimited' });
  const { data: teachersData } = useGetTeachersQuery({ size: 'unlimited', include: 'user' });

  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  const categories = (categoriesData?.data?.rows || categoriesData?.data || []) as Category[];
  const teachers = (teachersData?.data?.rows || []) as Teacher[];

  const handleViewDetail = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleViewReviews = (course: Course) => {
    setSelectedCourse(course);
    fetchReviews(course.id);
    setReviewsModalOpen(true);
  };

  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      width: 360,
      render: (text: string, record: Course) => (
        <div className="flex items-center gap-3">
          <Image src={record.thumbnail} alt={text} width={84} height={52} className="rounded object-cover" preview={false} />
          <div className="min-w-0 flex-1">
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
      width: 190,
      render: (_: unknown, record: Course) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.teacher?.avatar} size="small" />
          <Text className="text-sm">
            {record.teacher ? `${record.teacher.firstName} ${record.teacher.lastName}` : '—'}
          </Text>
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
      title: 'Lý do từ chối',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      render: (reason?: string) => <Text>{reason || 'Không có ghi chú'}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      fixed: 'right' as const,
      render: (_: unknown, record: Course) => (
        <Dropdown
          trigger={['click']}
          menu={{
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
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Người đánh giá',
      key: 'userName',
      render: (_: unknown, record: Review) => (
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
      render: (_: unknown, record: Review) => (
        <StatusBadge status={record.isVisible === false ? 'hidden' : 'visible'} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: Review) => (
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

  return (
    <div>
      <PageHeader
        title="Khóa học bị từ chối"
        subtitle={`${total} khóa học`}
        breadcrumb={[{ title: 'Khóa học' }, { title: 'Bị từ chối' }]}
      />

      <FilterBar
        filters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onReset={() => setFilters({ status: 'rejected' })}
        onRefresh={fetchCourses}
        loading={loading}
        fields={[
          {
            type: 'search',
            key: 'search',
            placeholder: 'Tìm kiếm khóa học...',
            width: 260,
          },
          {
            type: 'select',
            key: 'category',
            placeholder: 'Danh mục',
            options: categories.map((c) => ({ label: c.name, value: c.id })),
            width: 180,
          },
          {
            type: 'select',
            key: 'teacher',
            placeholder: 'Giảng viên',
            options: teachers.map((t) => ({
              label: t.user ? `${t.user.firstName} ${t.user.lastName}` : t.id,
              value: t.userId,
            })),
            width: 200,
          },
        ]}
      />

      <Card>
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
            showTotal: (count, range) => `${range[0]}-${range[1]} của ${count} khóa học`,
          }}
          onChange={(pagination) => {
            setTableParams({
              ...tableParams,
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={`Đánh giá khóa học: ${selectedCourse?.title}`}
        open={reviewsModalOpen}
        onCancel={() => setReviewsModalOpen(false)}
        footer={null}
        width={900}
      >
        <Table columns={reviewColumns} dataSource={reviews} rowKey="id" pagination={{ pageSize: 5 }} size="small" />
      </Modal>
    </div>
  );
};

export default RejectedCourseManagement;
