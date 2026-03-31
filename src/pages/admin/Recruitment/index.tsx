// Recruitment Management Page - Simplified
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Space, Avatar, Tabs, Dropdown, Tag, Modal, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, MoreOutlined, ExportOutlined, UserOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, InboxOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRecruitment } from '../../../hooks';
import { PageHeader, StatusBadge, FilterBar, DetailDrawer } from '../../../components/admin';
import { formatCurrency, formatDate } from '../../../utils/format';
import type { CVApplication, JobPosting } from '../../../types/admin';

const { Text } = Typography;

const RecruitmentManagement: React.FC = () => {
  const {
    applications, jobs, loading, selectedApplication, setSelectedApplication,
    selectedJob, setSelectedJob, cvFilters, setCVFilters, statistics,
    updateApplicationStatus, deleteApplication, closeJob, deleteJob,
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState('applications');
  const [detailOpen, setDetailOpen] = useState(false);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);

  const handleViewApp = (app: CVApplication) => { setSelectedApplication(app); setDetailOpen(true); };
  const handleViewJob = (job: JobPosting) => { setSelectedJob(job); setJobDetailOpen(true); };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setCVFilters({ ...cvFilters, [key]: value });
  };

  const appActions = (r: CVApplication) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem', onClick: () => handleViewApp(r) },
      ...(r.status === 'new' || r.status === 'reviewing' ? [
        { key: 'accept', icon: <CheckCircleOutlined />, label: 'Chấp nhận', onClick: () => updateApplicationStatus(r.id, 'shortlisted') },
        { key: 'reject', icon: <CloseCircleOutlined />, label: 'Từ chối', danger: true, onClick: () => updateApplicationStatus(r.id, 'rejected') },
      ] : []),
      { type: 'divider' as const },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => Modal.confirm({ title: 'Xóa?', onOk: () => deleteApplication(r.id) }) },
    ],
  });

  const jobActions = (r: JobPosting) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem', onClick: () => handleViewJob(r) },
      ...(r.status === 'active' ? [{ key: 'close', icon: <CloseCircleOutlined />, label: 'Đóng', danger: true, onClick: () => closeJob(r.id) }] : []),
      { type: 'divider' as const },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => Modal.confirm({ title: 'Xóa?', onOk: () => deleteJob(r.id) }) },
    ],
  });

  const appColumns = [
    {
      title: 'Ứng viên', dataIndex: 'applicantName', key: 'name', width: 200,
      render: (_: string, r: CVApplication) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <Text strong className="cursor-pointer hover:text-blue-500" onClick={() => handleViewApp(r)}>{r.applicantName}</Text>
            <Text type="secondary" className="text-xs block">{r.email}</Text>
          </div>
        </div>
      ),
    },
    { title: 'Vị trí', dataIndex: 'position', key: 'position', width: 180, render: (p: string) => <Tag color="blue">{p}</Tag> },
    { title: 'Kinh nghiệm', dataIndex: 'experience', key: 'exp', width: 100, render: (v: number) => `${v} năm` },
    { title: 'Mức lương', dataIndex: 'expectedSalary', key: 'salary', width: 130, render: (v: number | undefined) => v ? formatCurrency(v) : '-' },
    { title: 'Ngày nộp', dataIndex: 'appliedAt', key: 'date', width: 110, render: (d: string) => formatDate(d) },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (s: string) => <StatusBadge status={s} /> },
    { title: '', key: 'actions', width: 50, fixed: 'right' as const, render: (_: unknown, r: CVApplication) => <Dropdown menu={appActions(r)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> },
  ];

  const jobColumns = [
    {
      title: 'Vị trí', dataIndex: 'title', key: 'title', width: 230,
      render: (t: string, r: JobPosting) => (
        <div>
          <Text strong className="cursor-pointer hover:text-blue-500" onClick={() => handleViewJob(r)}>{t}</Text>
          <Text type="secondary" className="text-xs block"><EnvironmentOutlined className="mr-1" />{r.location}</Text>
        </div>
      ),
    },
    { title: 'Phòng ban', dataIndex: 'department', key: 'dept', width: 140, render: (d: string) => <Tag color="geekblue">{d}</Tag> },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 120, render: (t: string) => <Tag color={t === 'full-time' ? 'green' : t === 'internship' ? 'orange' : 'blue'}>{t === 'full-time' ? 'Toàn thời gian' : t === 'internship' ? 'Thực tập' : t}</Tag> },
    { title: 'Mức lương', key: 'salary', width: 160, render: (_: unknown, r: JobPosting) => r.salaryRange ? `${formatCurrency(r.salaryRange.min)} - ${formatCurrency(r.salaryRange.max)}` : '-' },
    { title: 'Ứng viên', dataIndex: 'applicationsCount', key: 'apps', width: 90 },
    { title: 'Hạn', dataIndex: 'deadline', key: 'deadline', width: 110, render: (d: string | undefined) => d ? formatDate(d) : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <StatusBadge status={s} /> },
    { title: '', key: 'actions', width: 50, fixed: 'right' as const, render: (_: unknown, r: JobPosting) => <Dropdown menu={jobActions(r)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> },
  ];

  const filterFields = [
    { type: 'search' as const, key: 'search', placeholder: 'Tìm kiếm...', width: 220 },
    { type: 'select' as const, key: 'status', placeholder: 'Trạng thái', options: [{ label: 'Mới', value: 'new' }, { label: 'Đang xét', value: 'reviewing' }, { label: 'Đã tuyển', value: 'hired' }, { label: 'Từ chối', value: 'rejected' }], width: 140 },
  ];

  const appDetailItems = selectedApplication ? [
    { label: 'Họ tên', value: selectedApplication.applicantName },
    { label: 'Email', value: selectedApplication.email },
    { label: 'SĐT', value: selectedApplication.phone },
    { label: 'Vị trí', value: <Tag color="blue">{selectedApplication.position}</Tag> },
    { label: 'Kinh nghiệm', value: `${selectedApplication.experience} năm` },
    { label: 'Học vấn', value: selectedApplication.education },
    { label: 'Lương mong muốn', value: selectedApplication.expectedSalary ? formatCurrency(selectedApplication.expectedSalary) : '-' },
    { label: 'Ngày nộp', value: formatDate(selectedApplication.appliedAt) },
    { label: 'Kỹ năng', value: selectedApplication.skills?.map((s: string) => <Tag key={s}>{s}</Tag>) || '-', span: 2 },
  ] : [];

  const tabItems = [
    {
      key: 'applications',
      label: <span><FileTextOutlined /> Đơn ứng tuyển ({applications.length})</span>,
      children: (
        <>
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-blue-500">{statistics.totalApplications}</div><Text type="secondary" className="text-xs">Tổng</Text></Card></Col>
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-orange-500">{statistics.newApplications}</div><Text type="secondary" className="text-xs">Mới</Text></Card></Col>
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-purple-500">{statistics.inProgress}</div><Text type="secondary" className="text-xs">Đang xử lý</Text></Card></Col>
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-green-500">{statistics.hired}</div><Text type="secondary" className="text-xs">Đã tuyển</Text></Card></Col>
          </Row>
          <FilterBar filters={cvFilters} onFilterChange={handleFilterChange} onReset={() => setCVFilters({})} fields={filterFields} loading={loading} />
          <Card><Table columns={appColumns} dataSource={applications} rowKey="id" loading={loading} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} /></Card>
        </>
      ),
    },
    {
      key: 'jobs',
      label: <span><InboxOutlined /> Tin tuyển dụng ({jobs.length})</span>,
      children: (
        <>
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-blue-500">{statistics.totalJobs}</div><Text type="secondary" className="text-xs">Tổng</Text></Card></Col>
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-green-500">{statistics.activeJobs}</div><Text type="secondary" className="text-xs">Đang tuyển</Text></Card></Col>
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-gray-500">{statistics.closedJobs}</div><Text type="secondary" className="text-xs">Đã đóng</Text></Card></Col>
            <Col xs={12} sm={6}><Card size="small" className="text-center"><div className="text-2xl font-bold text-purple-500">{statistics.totalApplications}</div><Text type="secondary" className="text-xs">Tổng UV</Text></Card></Col>
          </Row>
          <Card><Table columns={jobColumns} dataSource={jobs} rowKey="id" loading={loading} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} /></Card>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Tuyển dụng" subtitle={`${statistics.totalApplications} ứng viên • ${statistics.totalJobs} vị trí`} breadcrumb={[{ title: 'Tuyển dụng' }]}
        extra={<Space><Button icon={<ExportOutlined />}>Xuất báo cáo</Button><Button type="primary" icon={<PlusOutlined />}>Đăng tin</Button></Space>} />
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <DetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedApplication?.applicantName || ''} subtitle={selectedApplication?.position} status={selectedApplication?.status} items={appDetailItems} />
      <DetailDrawer open={jobDetailOpen} onClose={() => setJobDetailOpen(false)} title={selectedJob?.title || ''} subtitle={`${selectedJob?.department} • ${selectedJob?.location}`} status={selectedJob?.status}
        items={selectedJob ? [
          { label: 'Phòng ban', value: <Tag color="geekblue">{selectedJob.department}</Tag> },
          { label: 'Địa điểm', value: selectedJob.location },
          { label: 'Loại', value: selectedJob.type },
          { label: 'Mức lương', value: selectedJob.salaryRange ? `${formatCurrency(selectedJob.salaryRange.min)} - ${formatCurrency(selectedJob.salaryRange.max)}` : '-' },
          { label: 'Số ứng viên', value: selectedJob.applicationsCount },
          { label: 'Hạn nộp', value: selectedJob.deadline ? formatDate(selectedJob.deadline) : '-' },
          { label: 'Mô tả', value: selectedJob.description, span: 2 },
          { label: 'Yêu cầu', value: selectedJob.requirements?.map((r: string, i: number) => <div key={i}>• {r}</div>) || '-', span: 2 },
        ] : []} />
    </div>
  );
};

export default RecruitmentManagement;