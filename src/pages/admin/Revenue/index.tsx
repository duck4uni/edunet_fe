// Revenue Management Page - Simplified
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, DatePicker, Select, Statistic, Tag, Typography, Space, Tabs } from 'antd';
import { DollarOutlined, ExportOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { useRevenue } from '../../../hooks';
import { PageHeader, StatsCard } from '../../../components/admin';
import { formatCurrency, formatDate } from '../../../utils/format';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const RevenueManagement: React.FC = () => {
  const {
    revenueData, loading, summary, topCourses, topTeachers, filters, setFilters, exportReport,
  } = useRevenue();

  const [activeTab, setActiveTab] = useState('overview');

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  const columns = [
    { title: 'Tháng', dataIndex: 'date', key: 'date', width: 120, render: (d: string) => formatDate(d) },
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', width: 150, render: (v: number) => <Text className="text-green-500">{formatCurrency(v)}</Text> },
    { title: 'Đơn hàng', dataIndex: 'orders', key: 'orders', width: 100 },
    { title: 'Hoàn tiền', dataIndex: 'refunds', key: 'refunds', width: 100, render: (v: number) => <Text className="text-red-500">{v}</Text> },
    { title: 'Doanh thu ròng', dataIndex: 'netRevenue', key: 'netRevenue', width: 150, render: (v: number) => <Text className="text-blue-500">{formatCurrency(v)}</Text> },
  ];

  const overviewContent = (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Tổng doanh thu"
            value={formatCurrency(summary.totalRevenue)}
            icon={<DollarOutlined />}
            color="#52c41a"
            trend={summary.revenueGrowth}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Doanh thu tháng"
            value={formatCurrency(summary.currentMonthRevenue)}
            icon={<BarChartOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Tổng đơn hàng"
            value={summary.totalOrders.toString()}
            icon={<LineChartOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Giá trị TB/đơn"
            value={formatCurrency(summary.averageOrderValue)}
            icon={<PieChartOutlined />}
            color="#faad14"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biến động doanh thu" extra={<Select defaultValue="month" size="small" options={[{ value: 'week', label: '7 ngày' }, { value: 'month', label: '30 ngày' }, { value: 'year', label: '12 tháng' }]} />}>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
              <Text type="secondary">Biểu đồ - Doanh thu theo thời gian</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top khóa học">
            <div className="space-y-3">
              {topCourses.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag color="blue">{i + 1}</Tag>
                    <Text ellipsis className="max-w-40">{c.title}</Text>
                  </div>
                  <Text type="success">{formatCurrency(c.revenue)}</Text>
                </div>
              ))}
              {topCourses.length === 0 && <Text type="secondary">Chưa có dữ liệu</Text>}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card title="Top giảng viên">
            <div className="space-y-3">
              {topTeachers.slice(0, 5).map((t, i) => (
                <div key={t.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag color="purple">{i + 1}</Tag>
                    <Text>{t.name}</Text>
                  </div>
                  <Text type="success">{formatCurrency(t.earnings)}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Thống kê nhanh">
            <Row gutter={16}>
              <Col span={12}><Statistic title="Doanh thu ròng" value={summary.totalNetRevenue} formatter={(v) => formatCurrency(Number(v))} valueStyle={{ color: '#52c41a' }} /></Col>
              <Col span={12}><Statistic title="Hoàn tiền" value={summary.totalRefunds} valueStyle={{ color: '#ff4d4f' }} suffix="lần" /></Col>
              <Col span={12} className="mt-4"><Statistic title="Tỉ lệ hoàn" value={summary.refundRate.toFixed(1)} valueStyle={{ color: '#faad14' }} suffix="%" /></Col>
              <Col span={12} className="mt-4"><Statistic title="Tăng trưởng" value={summary.revenueGrowth.toFixed(1)} valueStyle={{ color: summary.revenueGrowth >= 0 ? '#52c41a' : '#ff4d4f' }} suffix="%" /></Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );

  const transactionsContent = (
    <Card
      title="Dữ liệu doanh thu theo tháng"
      extra={
        <Space>
          <RangePicker size="small" onChange={(dates) => handleFilterChange('dateRange', dates)} />
          <Button icon={<ExportOutlined />} size="small" onClick={() => exportReport('excel')}>Xuất Excel</Button>
        </Space>
      }
    >
      <Table columns={columns} dataSource={revenueData} rowKey="date" loading={loading} scroll={{ x: 800 }} pagination={{ pageSize: 12 }}
        summary={(data) => {
          const totalRev = data.reduce((sum, r) => sum + r.revenue, 0);
          const totalNet = data.reduce((sum, r) => sum + r.netRevenue, 0);
          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><Text strong>Tổng</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><Text strong className="text-green-500">{formatCurrency(totalRev)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><Text strong>{data.reduce((s, r) => s + r.orders, 0)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={3}><Text strong className="text-red-500">{data.reduce((s, r) => s + r.refunds, 0)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={4}><Text strong className="text-blue-500">{formatCurrency(totalNet)}</Text></Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </Card>
  );

  const reportsContent = (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="Xuất báo cáo">
          <Space wrap>
            <Button icon={<ExportOutlined />} onClick={() => exportReport('excel')}>Xuất Excel</Button>
            <Button icon={<ExportOutlined />} onClick={() => exportReport('pdf')}>Xuất PDF</Button>
          </Space>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="So sánh kỳ">
          <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
            <Text type="secondary">Biểu đồ - So sánh doanh thu các kỳ</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Phân tích xu hướng">
          <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
            <Text type="secondary">Biểu đồ - Xu hướng tăng trưởng</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const tabs = [
    { key: 'overview', label: <span><BarChartOutlined className="mr-1" />Tổng quan</span>, children: overviewContent },
    { key: 'transactions', label: <span><DollarOutlined className="mr-1" />Dữ liệu</span>, children: transactionsContent },
    { key: 'reports', label: <span><ExportOutlined className="mr-1" />Báo cáo</span>, children: reportsContent },
  ];

  return (
    <div>
      <PageHeader
        title="Doanh thu & Thống kê"
        subtitle="Quản lý tài chính và phân tích"
        breadcrumb={[{ title: 'Doanh thu' }]}
        extra={
          <Space>
            <RangePicker onChange={(dates) => handleFilterChange('dateRange', dates)} />
            <Button type="primary" icon={<ExportOutlined />} onClick={() => exportReport('pdf')}>Xuất báo cáo</Button>
          </Space>
        }
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
    </div>
  );
};

export default RevenueManagement;