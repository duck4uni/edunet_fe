// Employee Management Page - Simplified
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Space, Avatar, Dropdown, Modal, Typography, Form, Input, Select } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ExportOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useEmployeeManagement } from '../../../hooks';
import { PageHeader, StatusBadge, FilterBar, DetailDrawer } from '../../../components/admin';
import { formatCurrency, formatDate } from '../../../utils/format';
import type { Employee } from '../../../types/admin';
import { employeeStatuses, employeeRoles } from '../../../constants/adminData';

import { notify } from '../../../utils/notify';
import Badge from '../../../components/common/Tag';
const { Text } = Typography;
const { TextArea } = Input;

const EmployeeManagement: React.FC = () => {
  const {
    employees, loading, selectedEmployee, setSelectedEmployee, filters, setFilters,
    tableParams, setTableParams, statistics, total, allDepartments, allPositions,
    fetchEmployees, createEmployee, updateEmployee, deleteEmployee,
  } = useEmployeeManagement();

  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const handleViewDetail = (emp: Employee) => { setSelectedEmployee(emp); setDetailOpen(true); };
  const handleAdd = () => { form.resetFields(); setEditMode(false); setFormOpen(true); };
  const handleEdit = (emp: Employee) => { setSelectedEmployee(emp); form.setFieldsValue(emp); setEditMode(true); setFormOpen(true); };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editMode && selectedEmployee) {
        await updateEmployee(selectedEmployee.id, values);
        notify.success('Cập nhật thành công');
      } else {
        await createEmployee(values);
        notify.success('Thêm thành công');
      }
      setFormOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters({ ...filters, [key]: value });
  };

  const getActionMenu = (record: Employee) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'Xem', onClick: () => handleViewDetail(record) },
      { key: 'edit', icon: <EditOutlined />, label: 'Sửa', onClick: () => handleEdit(record) },
      { type: 'divider' as const },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => {
        Modal.confirm({
          title: 'Xác nhận xóa', content: `Xóa "${record.firstName} ${record.lastName}"?`,
          okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
          onOk: () => { deleteEmployee(record.id); notify.success('Đã xóa'); },
        });
      }},
    ],
  });

  const columns = [
    {
      title: 'Nhân viên', dataIndex: 'firstName', key: 'name', width: 200,
      render: (_: string, r: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar src={r.avatar} size={40} icon={<UserOutlined />} />
          <div>
            <Text strong className="block cursor-pointer hover:text-blue-500" onClick={() => handleViewDetail(r)}>{r.firstName} {r.lastName}</Text>
            <Text type="secondary" className="text-xs flex items-center gap-1"><IdcardOutlined /> {r.employeeId}</Text>
          </div>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    { title: 'Phòng ban', dataIndex: 'department', key: 'department', width: 140, render: (d: string) => <Badge color="geekblue">{d}</Badge> },
    { title: 'Chức vụ', dataIndex: 'position', key: 'position', width: 140 },
    { title: 'Quyền', dataIndex: 'role', key: 'role', width: 120, render: (r: string) => { const info = employeeRoles.find((x: { value: string; color: string; label: string }) => x.value === r); return <Badge color={info?.color}>{info?.label || r}</Badge>; } },
    { title: 'Ngày vào', dataIndex: 'hireDate', key: 'hireDate', width: 110, render: (d: string) => formatDate(d) },
    { title: 'Lương', dataIndex: 'salary', key: 'salary', width: 120, render: (v: number | undefined) => v ? formatCurrency(v) : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <StatusBadge status={s} /> },
    { title: '', key: 'actions', width: 50, fixed: 'right' as const, render: (_: unknown, r: Employee) => <Dropdown menu={getActionMenu(r)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> },
  ];

  const filterFields = [
    { type: 'search' as const, key: 'search', placeholder: 'Tìm kiếm...', width: 220 },
    { type: 'select' as const, key: 'status', placeholder: 'Trạng thái', options: employeeStatuses.map((s: { label: string; value: string }) => ({ label: s.label, value: s.value })), width: 130 },
    { type: 'select' as const, key: 'department', placeholder: 'Phòng ban', options: allDepartments.map((d: string) => ({ label: d, value: d })), width: 150 },
    { type: 'select' as const, key: 'role', placeholder: 'Quyền', options: employeeRoles.map((r: { label: string; value: string }) => ({ label: r.label, value: r.value })), width: 130 },
  ];

  const detailItems = selectedEmployee ? [
    { label: 'Mã NV', value: selectedEmployee.employeeId },
    { label: 'Họ tên', value: `${selectedEmployee.firstName} ${selectedEmployee.lastName}` },
    { label: 'Email', value: selectedEmployee.email },
    { label: 'SĐT', value: selectedEmployee.phone },
    { label: 'Phòng ban', value: <Badge color="geekblue">{selectedEmployee.department}</Badge> },
    { label: 'Chức vụ', value: selectedEmployee.position },
    { label: 'Quyền', value: <Badge>{selectedEmployee.role}</Badge> },
    { label: 'Ngày vào', value: formatDate(selectedEmployee.hireDate) },
    { label: 'Lương', value: selectedEmployee.salary ? formatCurrency(selectedEmployee.salary) : '-' },
    { label: 'Địa chỉ', value: selectedEmployee.address, span: 2 },
  ] : [];

  return (
    <div>
      <PageHeader title="Quản lý nhân viên" subtitle={`${total} nhân viên`} breadcrumb={[{ title: 'Nhân viên' }]}
        extra={<Space><Button icon={<ExportOutlined />}>Xuất Excel</Button><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm</Button></Space>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"><div className="text-2xl font-bold text-indigo-500">{statistics.total}</div><p className="text-xs text-gray-500 mt-1 m-0">Tổng</p></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"><div className="text-2xl font-bold text-emerald-500">{statistics.active}</div><p className="text-xs text-gray-500 mt-1 m-0">Hoạt động</p></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"><div className="text-2xl font-bold text-purple-500">{statistics.byDepartment.length}</div><p className="text-xs text-gray-500 mt-1 m-0">Phòng ban</p></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"><div className="text-2xl font-bold text-amber-500">{formatCurrency(statistics.totalSalary / (statistics.total || 1))}</div><p className="text-xs text-gray-500 mt-1 m-0">Lương TB</p></div>
      </div>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} onReset={() => setFilters({})} onRefresh={fetchEmployees} fields={filterFields} loading={loading} />

      <Card>
        <Table columns={columns} dataSource={employees} rowKey="id" loading={loading} scroll={{ x: 1300 }}
          pagination={{ current: tableParams.page, pageSize: tableParams.pageSize, total, showSizeChanger: true }}
          onChange={(p) => setTableParams({ ...tableParams, page: p.current || 1, pageSize: p.pageSize || 10 })} />
      </Card>

      <DetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''} subtitle={selectedEmployee?.email} avatar={selectedEmployee?.avatar} status={selectedEmployee?.status} items={detailItems} />

      <Modal title={editMode ? 'Sửa nhân viên' : 'Thêm nhân viên'} open={formOpen} onCancel={() => setFormOpen(false)} onOk={handleFormSubmit} okText={editMode ? 'Cập nhật' : 'Thêm'} cancelText="Hủy" width={600}>
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstName" label="Họ" rules={[{ required: true }]}><Input placeholder="Họ" /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label="Tên" rules={[{ required: true }]}><Input placeholder="Tên" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="SĐT" rules={[{ required: true }]}><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="department" label="Phòng ban" rules={[{ required: true }]}><Select options={allDepartments.map((d: string) => ({ label: d, value: d }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="position" label="Chức vụ" rules={[{ required: true }]}><Select options={allPositions.map((p: string) => ({ label: p, value: p }))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="role" label="Quyền" rules={[{ required: true }]}><Select options={employeeRoles.map((r: { label: string; value: string }) => ({ label: r.label, value: r.value }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="salary" label="Lương"><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;