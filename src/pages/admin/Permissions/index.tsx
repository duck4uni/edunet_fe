// Permissions Management Page - Simplified
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Tag, Modal, Form, Input, Tabs, Tree, Typography, Dropdown, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, TeamOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { usePermissionManagement } from '../../../hooks';
import { PageHeader, ConfirmModal } from '../../../components/admin';
import type { Permission, RoleGroup } from '../../../types/admin';
import type { DataNode } from 'antd/es/tree';

const { Text } = Typography;

const PermissionsManagement: React.FC = () => {
  const {
    permissions, roleGroups, loading, selectedRole, setSelectedRole,
    createRoleGroup, updateRoleGroup, deleteRoleGroup, updateRolePermissions, permissionsByModule,
  } = usePermissionManagement();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('roles');

  const openAdd = () => { setEditMode(false); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: RoleGroup) => { setEditMode(true); setSelectedRole(r); form.setFieldsValue(r); setModalOpen(true); };
  const openDelete = (r: RoleGroup) => { setSelectedRole(r); setDeleteOpen(true); };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editMode && selectedRole) { 
        await updateRoleGroup(selectedRole.id, values); 
        message.success('Cập nhật thành công'); 
      } else { 
        await createRoleGroup({ ...values, permissions: [], isSystem: false }); 
        message.success('Tạo mới thành công'); 
      }
      setModalOpen(false);
    } catch { /* validation failed */ }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    await deleteRoleGroup(selectedRole.id);
    message.success('Xóa thành công');
    setDeleteOpen(false);
  };

  const handlePermissionSave = async () => {
    if (!selectedRole) return;
    await updateRolePermissions(selectedRole.id, checkedKeys);
    message.success('Cập nhật quyền thành công');
  };

  const treeData: DataNode[] = Object.entries(permissionsByModule).map(([mod, perms]) => ({
    title: <Text strong className="capitalize">{mod}</Text>,
    key: mod,
    children: perms.map((p: Permission) => ({ title: `${p.name} - ${p.description || ''}`, key: p.code })),
  }));

  const handleRoleSelect = (role: RoleGroup) => {
    setSelectedRole(role);
    setCheckedKeys(role.permissions || []);
  };

  const actions = (r: RoleGroup) => ({
    items: [
      { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: () => openEdit(r) },
      { key: 'perms', icon: <SafetyOutlined />, label: 'Phân quyền', onClick: () => { handleRoleSelect(r); setActiveTab('assign'); } },
      { type: 'divider' as const },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => openDelete(r), disabled: r.isSystem },
    ],
  });

  const roleColumns = [
    { title: 'Tên vai trò', dataIndex: 'name', key: 'name', render: (n: string, r: RoleGroup) => <Text strong className={r.isSystem ? 'text-blue-500' : ''}>{n}{r.isSystem && <Tag color="blue" className="ml-2">Hệ thống</Tag>}</Text> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Số quyền', key: 'permCount', width: 100, render: (_: unknown, r: RoleGroup) => <Tag>{r.permissions?.length || 0}</Tag> },
    { title: 'Số user', dataIndex: 'usersCount', key: 'usersCount', width: 100, render: (c: number) => <Tag color="green">{c || 0}</Tag> },
    { title: '', key: 'actions', width: 50, render: (_: unknown, r: RoleGroup) => <Dropdown menu={actions(r)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> },
  ];

  const permColumns = [
    { title: 'Quyền', dataIndex: 'name', key: 'name' },
    { title: 'Mã', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c}</Tag> },
    { title: 'Phân hệ', dataIndex: 'module', key: 'module', render: (m: string) => <Tag color="blue" className="capitalize">{m}</Tag> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
  ];

  const tabs = [
    {
      key: 'roles', label: <span><TeamOutlined className="mr-1" />Vai trò</span>,
      children: (
        <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm vai trò</Button>}>
          <Table columns={roleColumns} dataSource={roleGroups} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'permissions', label: <span><LockOutlined className="mr-1" />Danh sách quyền</span>,
      children: <Card><Table columns={permColumns} dataSource={permissions} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} /></Card>,
    },
    {
      key: 'assign', label: <span><SafetyOutlined className="mr-1" />Phân quyền</span>,
      children: (
        <Row gutter={16}>
          <Col xs={24} md={10}>
            <Card title="Chọn vai trò" size="small">
              <div className="max-h-96 overflow-auto">
                {roleGroups.map((r) => (
                  <div
                    key={r.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedRole?.id === r.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                    onClick={() => handleRoleSelect(r)}
                  >
                    <Text strong>{r.name}</Text>
                    <Text type="secondary" className="text-xs block">{r.description}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={14}>
            <Card title={selectedRole ? `Quyền của "${selectedRole.name}"` : 'Chọn vai trò'} size="small"
              extra={selectedRole && <Button type="primary" size="small" onClick={handlePermissionSave}>Lưu</Button>}>
              {selectedRole ? (
                <Tree checkable treeData={treeData} checkedKeys={checkedKeys}
                  onCheck={(checked) => setCheckedKeys(checked as string[])} className="max-h-96 overflow-auto" />
              ) : <Text type="secondary">Vui lòng chọn vai trò bên trái</Text>}
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Quản lý phân quyền" subtitle={`${roleGroups.length} vai trò, ${permissions.length} quyền`} breadcrumb={[{ title: 'Phân quyền' }]} />

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

      <Modal title={editMode ? 'Chỉnh sửa vai trò' : 'Thêm vai trò'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} okText={editMode ? 'Cập nhật' : 'Tạo mới'}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <ConfirmModal open={deleteOpen} onCancel={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" content={`Bạn có chắc muốn xóa vai trò "${selectedRole?.name}"?`} type="warning" />
    </div>
  );
};

export default PermissionsManagement;