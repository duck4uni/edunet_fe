import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Popconfirm,
  Rate,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { FilterBar, PageHeader, StatusBadge } from '../../../components/admin';
import {
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useToggleReviewVisibilityMutation,
} from '../../../services/courseApi';
import type { QueryParams, Review } from '../../../services/courseApi';
import { formatDate } from '../../../utils/format';

const { Text, Paragraph } = Typography;

type ReviewTabKey = 'all' | 'visible' | 'hidden';

interface ReviewFilters {
  search?: string;
}

interface TableState {
  page: number;
  pageSize: number;
}

const ReviewManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReviewTabKey>('all');
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [tableState, setTableState] = useState<TableState>({ page: 1, pageSize: 10 });

  const queryParams: QueryParams = useMemo(() => {
    const filterParts: string[] = [];

    if (filters.search?.trim()) {
      filterParts.push(`comment:like:${filters.search.trim()}`);
    }

    if (activeTab === 'visible') {
      filterParts.push('isVisible:eq:true');
    }

    if (activeTab === 'hidden') {
      filterParts.push('isVisible:eq:false');
    }

    return {
      page: tableState.page,
      size: tableState.pageSize,
      include: 'user|course',
      sort: 'createdAt:desc',
      ...(filterParts.length > 0 && { filter: filterParts.join('&&') }),
    };
  }, [filters.search, activeTab, tableState.page, tableState.pageSize]);

  const {
    data: reviewsData,
    isLoading,
    refetch,
  } = useGetReviewsQuery(queryParams);

  const [toggleVisibilityApi] = useToggleReviewVisibilityMutation();
  const [deleteReviewApi] = useDeleteReviewMutation();

  const reviews = reviewsData?.data?.rows || [];
  const total = reviewsData?.data?.count || 0;

  const handleToggleVisibility = async (reviewId: string, currentlyVisible: boolean) => {
    try {
      await toggleVisibilityApi(reviewId).unwrap();
      message.success(currentlyVisible ? 'Đã ẩn đánh giá' : 'Đã hiển thị lại đánh giá');
    } catch {
      message.error('Không thể cập nhật trạng thái đánh giá');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReviewApi(reviewId).unwrap();
      message.success('Đã xóa đánh giá');
    } catch {
      message.error('Không thể xóa đánh giá');
    }
  };

  const columns = [
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 220,
      render: (_: unknown, record: Review) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.user?.avatar}>{record.user?.firstName?.charAt(0) || 'U'}</Avatar>
          <div className="min-w-0">
            <Text className="block truncate">
              {record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Người dùng không xác định'}
            </Text>
            <Text type="secondary" className="text-xs">{formatDate(record.createdAt)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Khóa học',
      key: 'course',
      width: 240,
      render: (_: unknown, record: Review) => (
        <Text className="block truncate">{record.course?.title || 'Khóa học không xác định'}</Text>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating: number) => <Rate disabled value={rating} className="text-sm" />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment?: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: false }} className="!mb-0">
          {comment || 'Không có nội dung'}
        </Paragraph>
      ),
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
          <Tooltip title={record.isVisible === false ? 'Hiện đánh giá' : 'Ẩn đánh giá'}>
            <Button
              size="small"
              icon={record.isVisible === false ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => handleToggleVisibility(record.id, record.isVisible !== false)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đánh giá này?"
            description="Hành động này không thể hoàn tác"
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý đánh giá"
        subtitle={`${total} đánh giá`}
        breadcrumb={[{ title: 'Đánh giá' }]}
        extra={
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => refetch()}>
            Làm mới
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onFilterChange={(key, value) => {
          setTableState((prev) => ({ ...prev, page: 1 }));
          setFilters((prev) => ({ ...prev, [key]: value }));
        }}
        onReset={() => {
          setTableState((prev) => ({ ...prev, page: 1 }));
          setFilters({});
        }}
        onRefresh={() => refetch()}
        loading={isLoading}
        fields={[
          {
            type: 'search',
            key: 'search',
            placeholder: 'Tìm theo nội dung đánh giá...',
            width: 320,
          },
        ]}
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setTableState((prev) => ({ ...prev, page: 1 }));
            setActiveTab(key as ReviewTabKey);
          }}
          items={[
            { key: 'all', label: 'Tất cả' },
            { key: 'visible', label: 'Đang hiển thị' },
            { key: 'hidden', label: 'Đang ẩn' },
          ]}
          className="mb-4"
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={reviews}
          loading={isLoading}
          pagination={{
            current: tableState.page,
            pageSize: tableState.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t, range) => `${range[0]}-${range[1]} của ${t} đánh giá`,
          }}
          onChange={(pagination) => {
            setTableState({
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ReviewManagement;
