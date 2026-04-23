import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader, StatsCard } from '../../../components/admin';
import { useRevenue } from '../../../hooks';

const { MonthPicker } = DatePicker;
const { Text } = Typography;

const STATUS_LABELS: Record<string, string> = {
  draft: 'Bản nháp',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  published: 'Đã xuất bản',
  archived: 'Đã lưu trữ',
  open: 'Mở',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
  active: 'Đang học',
  completed: 'Hoàn thành',
  dropped: 'Đã hủy',
  expired: 'Hết hạn',
  admin: 'Quản trị viên',
  teacher: 'Giảng viên',
  student: 'Học viên',
};

const toVietnameseLabel = (value: string) => STATUS_LABELS[value] ?? value;

const RevenueManagement: React.FC = () => {
  const {
    report,
    loading,
    exporting,
    filters,
    setFilters,
    selectedMonth,
    setSelectedMonth,
    topCourses,
    topTeachers,
    monthlyComparison,
    fetchRevenueData,
    exportReport,
    savedPresets,
    activePresetId,
    saveCurrentPreset,
    applyPreset,
    deletePreset,
  } = useRevenue();

  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const trendRows = useMemo(() =>
    (report?.trends.labels ?? []).map((label, index) => ({
      key: `${label}-${index}`,
      period: label,
      users: report?.trends.users[index] ?? 0,
      courses: report?.trends.courses[index] ?? 0,
      enrollments: report?.trends.enrollments[index] ?? 0,
      tickets: report?.trends.tickets[index] ?? 0,
    })),
  [report]);

  const isEmptyReport = useMemo(() => {
    if (!report) return false;
    return (
      report.overview.totalUsers === 0 &&
      report.overview.totalCourses === 0 &&
      report.overview.enrollments === 0 &&
      report.overview.tickets === 0
    );
  }, [report]);

  const handleMonthChange = (month: dayjs.Dayjs | null) => {
    if (!month) return;
    setSelectedMonth(month.format('YYYY-MM'));
  };

  const savePreset = () => {
    saveCurrentPreset(presetName);
    setPresetModalOpen(false);
    setPresetName('');
  };

  const trendColumns = [
    {
      title: 'Kỳ',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Người dùng',
      dataIndex: 'users',
      key: 'users',
      width: 90,
    },
    {
      title: 'Khóa học',
      dataIndex: 'courses',
      key: 'courses',
      width: 90,
    },
    {
      title: 'Ghi danh',
      dataIndex: 'enrollments',
      key: 'enrollments',
      width: 110,
    },
    {
      title: 'Yêu cầu hỗ trợ',
      dataIndex: 'tickets',
      key: 'tickets',
      width: 90,
    },
  ];

  const topCourseColumns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students',
      width: 100,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 90,
    },
  ];

  const topTeacherColumns = [
    {
      title: 'Giảng viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Khóa học',
      dataIndex: 'courses',
      key: 'courses',
      width: 100,
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students',
      width: 100,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 90,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Báo cáo và thống kê vận hành"
        subtitle="Bảng điều khiển tổng hợp từ Người dùng, Khóa học, Ghi danh và Yêu cầu hỗ trợ"
        breadcrumb={[{ title: 'Báo cáo' }]}
        extra={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={() => fetchRevenueData()}>
            Làm mới
          </Button>,
          <Button
            key="export-csv"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={() => exportReport('csv')}
          >
            Xuất CSV
          </Button>,
          <Button
            key="export-json"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={() => exportReport('json')}
          >
            Xuất JSON
          </Button>,
        ]}
      />

      {(report?.warnings ?? []).map((warning) => (
        <Alert
          key={warning.code}
          className="mb-4"
          type="warning"
          showIcon
          message={warning.message}
          description={warning.suggestion}
        />
      ))}

      {!loading && isEmptyReport && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="API đã kết nối nhưng chưa có dữ liệu trong phạm vi lọc hiện tại"
          description="Hãy thử chọn tháng khác để xem dữ liệu lịch sử theo từng tháng."
        />
      )}

      <Card className="mb-4">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          <div className="xl:col-span-2">
            <Text className="text-xs text-gray-500 block mb-1">Tháng báo cáo</Text>
            <MonthPicker
              value={dayjs(`${selectedMonth}-01`)}
              onChange={(month) => handleMonthChange(month)}
              format="MM/YYYY"
              allowClear={false}
              className="w-full"
            />
          </div>

          <div>
            <Text className="text-xs text-gray-500 block mb-1">Nhóm dữ liệu</Text>
            <Select
              value="month"
              disabled
              className="w-full"
              options={[
                { value: 'month', label: 'Theo tháng' },
              ]}
            />
          </div>

          <div>
            <Text className="text-xs text-gray-500 block mb-1">Vai trò người dùng</Text>
            <Select
              allowClear
              value={filters.userRole}
              onChange={(value) => setFilters((prev) => ({ ...prev, userRole: value }))}
              className="w-full"
              options={[
                { value: 'admin', label: 'Quản trị viên' },
                { value: 'teacher', label: 'Giảng viên' },
                { value: 'student', label: 'Học viên' },
              ]}
            />
          </div>

          <div>
            <Text className="text-xs text-gray-500 block mb-1">Trạng thái khóa học</Text>
            <Select
              allowClear
              value={filters.courseStatus}
              onChange={(value) => setFilters((prev) => ({ ...prev, courseStatus: value }))}
              className="w-full"
              options={[
                { value: 'draft', label: 'Bản nháp' },
                { value: 'pending', label: 'Chờ duyệt' },
                { value: 'approved', label: 'Đã duyệt' },
                { value: 'rejected', label: 'Từ chối' },
                { value: 'published', label: 'Đã xuất bản' },
                { value: 'archived', label: 'Đã lưu trữ' },
              ]}
            />
          </div>

          <div>
            <Text className="text-xs text-gray-500 block mb-1">So sánh</Text>
            <div className="h-8 flex items-center">
              <Tag color="blue">Tự động so sánh với tháng trước</Tag>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Select
            placeholder="Preset đã lưu"
            value={activePresetId ?? undefined}
            onChange={(value) => applyPreset(value)}
            className="min-w-[240px]"
            allowClear
            options={savedPresets.map((preset) => ({
              value: preset.id,
              label: preset.name,
            }))}
          />

          <Button icon={<SaveOutlined />} onClick={() => setPresetModalOpen(true)}>
            Lưu bộ lọc
          </Button>

          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={!activePresetId}
            onClick={() => activePresetId && deletePreset(activePresetId)}
          >
            Xóa preset
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Tổng người dùng"
          value={report?.overview.totalUsers ?? 0}
          formatter={(value) => Number(value).toLocaleString('vi-VN')}
          color="#1677ff"
        />
        <StatsCard
          title="Khóa học mới trong kỳ"
          value={report?.overview.newCourses ?? 0}
          formatter={(value) => Number(value).toLocaleString('vi-VN')}
          color="#52c41a"
          trend={report?.comparison?.delta.newCoursesPct ?? 0}
          trendLabel="vs kỳ trước"
        />
        <StatsCard
          title="Ghi danh trong kỳ"
          value={report?.overview.enrollments ?? 0}
          formatter={(value) => Number(value).toLocaleString('vi-VN')}
          color="#fa8c16"
          trend={report?.comparison?.delta.enrollmentsPct ?? 0}
          trendLabel="vs kỳ trước"
        />
        <StatsCard
          title="Yêu cầu hỗ trợ trong kỳ"
          value={report?.overview.tickets ?? 0}
          formatter={(value) => Number(value).toLocaleString('vi-VN')}
          color="#722ed1"
          trend={report?.comparison?.delta.ticketsPct ?? 0}
          trendLabel="vs kỳ trước"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card title="Tình trạng dữ liệu" className="xl:col-span-1">
          <Space direction="vertical" size="small" className="w-full">
            <div className="flex items-center justify-between">
              <span>Người dùng</span>
              {report?.availability.users.hasData ? <Tag color="green">Dữ liệu đầy đủ</Tag> : <Tag color="orange">Thiếu dữ liệu</Tag>}
            </div>
            <div className="flex items-center justify-between">
              <span>Khóa học</span>
              {report?.availability.courses.hasData ? <Tag color="green">Dữ liệu đầy đủ</Tag> : <Tag color="orange">Thiếu dữ liệu</Tag>}
            </div>
            <div className="flex items-center justify-between">
              <span>Ghi danh</span>
              {report?.availability.enrollments.hasData ? <Tag color="green">Dữ liệu đầy đủ</Tag> : <Tag color="orange">Thiếu dữ liệu</Tag>}
            </div>
            <div className="flex items-center justify-between">
              <span>Yêu cầu hỗ trợ</span>
              {report?.availability.tickets.hasData ? <Tag color="green">Dữ liệu đầy đủ</Tag> : <Tag color="orange">Thiếu dữ liệu</Tag>}
            </div>
          </Space>
        </Card>

        <Card title="So sánh theo tháng (tháng hiện tại so với tháng trước)" className="xl:col-span-2">
          {monthlyComparison ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Statistic
                title="Người dùng mới"
                value={report?.comparison?.delta.newUsersPct ?? 0}
                suffix="%"
                valueStyle={{ color: (report?.comparison?.delta.newUsersPct ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}
              />
              <Statistic
                title="Khóa học mới"
                value={report?.comparison?.delta.newCoursesPct ?? 0}
                suffix="%"
                valueStyle={{ color: (report?.comparison?.delta.newCoursesPct ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}
              />
              <Statistic
                title="Ghi danh"
                value={monthlyComparison.change.orders}
                suffix="%"
                valueStyle={{ color: monthlyComparison.change.orders >= 0 ? '#16a34a' : '#dc2626' }}
              />
              <Statistic
                title="Yêu cầu hỗ trợ"
                value={report?.comparison?.delta.ticketsPct ?? 0}
                suffix="%"
                valueStyle={{ color: (report?.comparison?.delta.ticketsPct ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}
              />
            </div>
          ) : (
            <Text type="secondary">Chưa có đủ dữ liệu để so sánh với tháng trước.</Text>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card title="Xu hướng theo kỳ" className="xl:col-span-2" bodyStyle={{ paddingTop: 8 }}>
          {loading ? (
            <div className="py-8 text-center"><Spin /></div>
          ) : (
            <Table
              rowKey="key"
              dataSource={trendRows}
              columns={trendColumns}
              size="small"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 960 }}
            />
          )}
        </Card>

        <Card title="Phân bổ theo trạng thái">
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Text strong className="block mb-2">Khóa học</Text>
              <Space wrap>
                {(report?.breakdowns.coursesByStatus ?? []).map((item) => (
                  <Tag key={`course-${item.status}`} color="blue">
                    {toVietnameseLabel(item.status)}: {item.count}
                  </Tag>
                ))}
              </Space>
            </div>

            <div>
              <Text strong className="block mb-2">Ticket hỗ trợ</Text>
              <Space wrap>
                {(report?.breakdowns.ticketsByStatus ?? []).map((item) => (
                  <Tag key={`ticket-${item.status}`} color="purple">
                    {toVietnameseLabel(item.status)}: {item.count}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Top khóa học">
          <Table
            rowKey="id"
            dataSource={topCourses}
            columns={topCourseColumns}
            size="small"
            pagination={false}
          />
        </Card>

        <Card title="Top giảng viên">
          <Table
            rowKey="id"
            dataSource={topTeachers}
            columns={topTeacherColumns}
            size="small"
            pagination={false}
          />
        </Card>
      </div>

      <Modal
        title="Lưu bộ lọc báo cáo"
        open={presetModalOpen}
        onOk={savePreset}
        onCancel={() => setPresetModalOpen(false)}
        okText="Lưu"
      >
        <Input
          placeholder="VD: Báo cáo tháng cho Ban giám đốc"
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
        />
      </Modal>
    </div>
  );
};

export default RevenueManagement;