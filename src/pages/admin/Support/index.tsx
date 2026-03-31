// Support Management Page - Simplified
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Avatar, Dropdown, Tag, Typography, Input, Badge } from 'antd';
import { EyeOutlined, MoreOutlined, ExportOutlined, UserOutlined, MessageOutlined, CheckCircleOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useSupportManagement } from '../../../hooks';
import { PageHeader, StatusBadge, FilterBar, DetailDrawer } from '../../../components/admin';
import { formatRelativeTime } from '../../../utils/format';
import type { AdminSupportTicket } from '../../../types/admin';
import { supportCategories, ticketStatuses, ticketPriorities } from '../../../constants/adminData';

const { Text } = Typography;
const { TextArea } = Input;

const SupportManagement: React.FC = () => {
  const {
    tickets, loading, selectedTicket, setSelectedTicket, filters, setFilters, statistics,
    updateTicketStatus, assignTicket, addResponse, closeTicket,
  } = useSupportManagement();

  const [detailOpen, setDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleView = (ticket: AdminSupportTicket) => { setSelectedTicket(ticket); setDetailOpen(true); };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    await addResponse(selectedTicket.id, replyText);
    setReplyText('');
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters({ ...filters, [key]: value });
  };

  const getPriorityTag = (p: string) => {
    const colors: Record<string, string> = { low: 'default', medium: 'warning', high: 'orange', urgent: 'red' };
    const labels: Record<string, string> = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' };
    return <Tag color={colors[p]}>{labels[p] || p}</Tag>;
  };

  const actions = (r: AdminSupportTicket) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => handleView(r) },
      ...(r.status === 'open' ? [
        { key: 'inprogress', icon: <ClockCircleOutlined />, label: 'Bắt đầu xử lý', onClick: () => updateTicketStatus(r.id, 'in_progress') },
      ] : []),
      ...(r.status !== 'closed' && r.status !== 'resolved' ? [
        { key: 'resolve', icon: <CheckCircleOutlined />, label: 'Đánh dấu đã xử lý', onClick: () => updateTicketStatus(r.id, 'resolved') },
        { key: 'close', label: 'Đóng ticket', onClick: () => closeTicket(r.id) },
      ] : []),
      { type: 'divider' as const },
      { key: 'assign', label: 'Phân công', onClick: () => assignTicket(r.id, 'admin-1', 'Admin') },
    ],
  });

  const columns = [
    {
      title: 'Mã ticket', dataIndex: 'ticketId', key: 'ticketId', width: 130,
      render: (id: string, r: AdminSupportTicket) => (
        <div>
          <Text strong className="cursor-pointer hover:text-blue-500" onClick={() => handleView(r)}>#{id}</Text>
          <Text type="secondary" className="text-xs block">{formatRelativeTime(r.createdAt)}</Text>
        </div>
      ),
    },
    {
      title: 'Người gửi', dataIndex: 'userName', key: 'user', width: 180,
      render: (_: string, r: AdminSupportTicket) => (
        <div className="flex items-center gap-2">
          <Avatar src={r.userAvatar} size={32} icon={<UserOutlined />} />
          <div>
            <Text className="block text-sm">{r.userName}</Text>
            <Text type="secondary" className="text-xs">{r.userEmail}</Text>
          </div>
        </div>
      ),
    },
    { title: 'Tiêu đề', dataIndex: 'subject', key: 'subject', width: 250, ellipsis: true },
    { title: 'Phân loại', dataIndex: 'category', key: 'category', width: 120, render: (c: string) => <Tag>{supportCategories.find((x: { value: string; label: string }) => x.value === c)?.label || c}</Tag> },
    { title: 'Độ ưu tiên', dataIndex: 'priority', key: 'priority', width: 110, render: (p: string) => getPriorityTag(p) },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (s: string) => <StatusBadge status={s} /> },
    {
      title: 'Phân công', dataIndex: 'assignedTo', key: 'assigned', width: 140,
      render: (a: string | undefined) => a ? <Tag color="blue">{a}</Tag> : <Text type="secondary">Chưa phân công</Text>,
    },
    { title: '', key: 'actions', width: 50, fixed: 'right' as const, render: (_: unknown, r: AdminSupportTicket) => <Dropdown menu={actions(r)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> },
  ];

  const filterFields = [
    { type: 'search' as const, key: 'search', placeholder: 'Tìm kiếm...', width: 220 },
    { type: 'select' as const, key: 'status', placeholder: 'Trạng thái', options: ticketStatuses.map((s: { label: string; value: string }) => ({ label: s.label, value: s.value })), width: 140 },
    { type: 'select' as const, key: 'category', placeholder: 'Phân loại', options: supportCategories.map((c: { label: string; value: string }) => ({ label: c.label, value: c.value })), width: 150 },
    { type: 'select' as const, key: 'priority', placeholder: 'Ưu tiên', options: ticketPriorities.map((p: { label: string; value: string }) => ({ label: p.label, value: p.value })), width: 130 },
  ];

  const detailItems = selectedTicket ? [
    { label: 'Mã ticket', value: `#${selectedTicket.ticketId}` },
    { label: 'Người gửi', value: selectedTicket.userName },
    { label: 'Email', value: selectedTicket.userEmail },
    { label: 'Phân loại', value: <Tag>{selectedTicket.category}</Tag> },
    { label: 'Độ ưu tiên', value: getPriorityTag(selectedTicket.priority) },
    { label: 'Thời gian', value: formatRelativeTime(selectedTicket.createdAt) },
    { label: 'Nội dung', value: selectedTicket.description, span: 2 },
  ] : [];

  return (
    <div>
      <PageHeader title="Hỗ trợ khách hàng" subtitle={`${statistics.total} ticket`} breadcrumb={[{ title: 'Hỗ trợ' }]}
        extra={<Button icon={<ExportOutlined />}>Xuất báo cáo</Button>} />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6}><Card size="small" className="text-center"><Badge count={statistics.open} offset={[10, 0]}><div className="text-2xl font-bold text-blue-500">{statistics.total}</div></Badge><Text type="secondary" className="text-xs">Tổng ticket</Text></Card></Col>
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-orange-500">{statistics.open}</div><Text type="secondary" className="text-xs">Đang mở</Text></Card></Col>
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-purple-500">{statistics.inProgress}</div><Text type="secondary" className="text-xs">Đang xử lý</Text></Card></Col>
        <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-green-500">{statistics.resolved}</div><Text type="secondary" className="text-xs">Đã xử lý</Text></Card></Col>
      </Row>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} onReset={() => setFilters({})} fields={filterFields} loading={loading} />

      <Card><Table columns={columns} dataSource={tickets} rowKey="id" loading={loading} scroll={{ x: 1200 }} pagination={{ pageSize: 10 }} /></Card>

      <DetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedTicket?.subject || ''}
        subtitle={`#${selectedTicket?.ticketId}`}
        avatar={selectedTicket?.userAvatar}
        status={selectedTicket?.status}
        items={detailItems}
        extra={
          selectedTicket?.status !== 'closed' && selectedTicket?.status !== 'resolved' ? (
            <div className="mt-4 pt-4 border-t">
              <Text strong className="block mb-2"><MessageOutlined className="mr-2" />Trả lời</Text>
              <TextArea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Nhập nội dung trả lời..." />
              <Button type="primary" icon={<SendOutlined />} className="mt-2" onClick={handleReply} disabled={!replyText.trim()}>Gửi</Button>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default SupportManagement;