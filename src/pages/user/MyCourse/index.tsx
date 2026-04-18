import React, { useMemo, useState } from 'react';
import { Button, Empty, Input, Progress, Select, Space, Spin, Table, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMyCourse } from '../../../hooks';
import type { MyCourseItem } from '../../../hooks/useMyCourse';
import { useGetProfileQuery } from '../../../services/authApi';
import TeacherDashboard from './TeacherDashboard';
import Badge from '../../../components/common/Tag';

const { Text } = Typography;

type ViewMode = 'study' | 'pending';

const MyCourse: React.FC = () => {
  const { data: profileResponse } = useGetProfileQuery();
  const isTeacher = profileResponse?.data?.role === 'teacher';

  const {
    filterStatus,
    setFilterStatus,
    searchText,
    setSearchText,
    filteredCourses,
    pendingCourses,
    stats,
    getStatusConfig,
    isLoading,
  } = useMyCourse();

  const [viewMode, setViewMode] = useState<ViewMode>('study');

  const pendingFilteredBySearch = useMemo(
    () =>
      pendingCourses.filter((course) => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return true;

        return (
          course.title.toLowerCase().includes(keyword) ||
          course.teacher.toLowerCase().includes(keyword) ||
          course.category.toLowerCase().includes(keyword)
        );
      }),
    [pendingCourses, searchText],
  );

  if (isTeacher) {
    return <TeacherDashboard />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'learning':
        return <PlayCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const renderStatusTag = (status: MyCourseItem['status']) => {
    const config = getStatusConfig(status);

    return (
      <Badge className={`mycourse-pill ${status === 'pending' ? 'is-warning' : ''}`} icon={getStatusIcon(status)}>
        {config.text}
      </Badge>
    );
  };

  const studyColumns: ColumnsType<MyCourseItem> = [
    {
      title: 'KHÓA HỌC',
      dataIndex: 'title',
      key: 'title',
      render: (_value, record) => (
        <div className="mycourse-course-cell">
          <img src={record.image} alt={record.title} className="mycourse-thumbnail" />
          <div className="mycourse-course-info">
            <Text strong className="mycourse-course-name">
              {record.title}
            </Text>
            <Text className="mycourse-subtext">{record.category}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'GIẢNG VIÊN',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'BÀI HỌC',
      dataIndex: 'lessons',
      key: 'lessons',
      width: 110,
    },
    {
      title: 'TIẾN ĐỘ',
      dataIndex: 'progress',
      key: 'progress',
      width: 170,
      render: (_value, record) => (
        <div className="mycourse-progress-wrap">
          <Progress percent={record.progress} size="small" showInfo={false} strokeColor="#3676E0" />
          <Text className="mycourse-subtext">{record.progress}%</Text>
        </div>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: MyCourseItem['status']) => renderStatusTag(status),
    },
    {
      title: 'MỐC THỜI GIAN',
      key: 'timeline',
      width: 130,
      render: (_value, record) => {
        if (record.status === 'completed' && record.completedDate) {
          return dayjs(record.completedDate).format('DD/MM/YYYY');
        }

        if (record.status === 'learning' && record.startDate) {
          return dayjs(record.startDate).format('DD/MM/YYYY');
        }

        return '-';
      },
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 190,
      render: (_value, record) => (
        <Space size={8}>
          <Link to={`/my-course/detail/${record.id}`}>
            <Button icon={<EyeOutlined />} type="primary" size="small">
              Chi tiết
            </Button>
          </Link>
          {record.status === 'learning' && (
            <Link to={`/my-course/classroom/${record.id}`}>
              <Button icon={<PlayCircleOutlined />} size="small">
                Tiếp tục
              </Button>
            </Link>
          )}
        </Space>
      ),
    },
  ];

  const pendingColumns: ColumnsType<MyCourseItem> = [
    {
      title: 'KHÓA HỌC',
      dataIndex: 'title',
      key: 'title',
      render: (_value, record) => (
        <div className="mycourse-course-cell">
          <img src={record.image} alt={record.title} className="mycourse-thumbnail" />
          <div className="mycourse-course-info">
            <Text strong className="mycourse-course-name">
              {record.title}
            </Text>
            <Text className="mycourse-subtext">{record.category}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'GIẢNG VIÊN',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'NGÀY ĐĂNG KÝ',
      key: 'enrolledAt',
      render: (_value, record) => (record.enrolledAt ? dayjs(record.enrolledAt).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 160,
      render: () => <Badge className="mycourse-pill is-warning">Chờ phê duyệt</Badge>,
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 160,
      render: (_value, record) => (
        <Link to={`/courses/${record.id}`}>
          <Button icon={<EyeOutlined />} size="small">
            Xem khóa học
          </Button>
        </Link>
      ),
    },
  ];

  const tableData = viewMode === 'pending' ? pendingFilteredBySearch : filteredCourses;

  return (
    <div className="mycourse-shell">
      <div className="mycourse-container">
        <div className="mycourse-header-block">
          <h1 className="mycourse-main-title">QUẢN LÝ KHÓA HỌC CỦA TÔI</h1>
        </div>

        <div className="mycourse-inline-tabs">
          <button
            type="button"
            className={`mycourse-inline-tab ${viewMode === 'study' ? 'is-active' : ''}`}
            onClick={() => setViewMode('study')}
          >
            Tất cả khóa học <span>{stats.total}</span>
          </button>
          <button
            type="button"
            className={`mycourse-inline-tab ${viewMode === 'pending' ? 'is-active' : ''}`}
            onClick={() => {
              setFilterStatus('all');
              setViewMode('pending');
            }}
          >
            Đăng ký chờ duyệt <span>{pendingCourses.length}</span>
          </button>
        </div>

        <div className="mycourse-toolbar">
          <div className="mycourse-toolbar-left">
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={viewMode === 'pending' ? 'Tìm kiếm đăng ký chờ duyệt...' : 'Tìm kiếm khóa học...'}
              prefix={<SearchOutlined />}
              allowClear
              className="mycourse-search-input"
            />
            {viewMode === 'study' && (
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                className="mycourse-status-select"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'learning', label: 'Đang học' },
                  { value: 'completed', label: 'Hoàn thành' },
                ]}
              />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="mycourse-loading">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : tableData.length === 0 ? (
          <div className="mycourse-empty-wrap">
            <Empty
              description={viewMode === 'pending' ? 'Không có đăng ký chờ duyệt' : 'Không tìm thấy khóa học phù hợp'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {viewMode === 'study' && (
                <Link to="/courses">
                  <Button type="primary">Khám phá khóa học</Button>
                </Link>
              )}
            </Empty>
          </div>
        ) : (
          <div className="mycourse-table-shell">
            <Table
              rowKey="enrollmentId"
              columns={viewMode === 'pending' ? pendingColumns : studyColumns}
              dataSource={tableData}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: 980 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourse;
