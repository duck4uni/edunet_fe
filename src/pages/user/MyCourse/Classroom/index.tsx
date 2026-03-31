import React from 'react';
import { 
  Card, 
  Table, 
  Avatar, 
  Tag, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Select, 
  Typography, 
  Space, 
  Popconfirm,
  Breadcrumb,
  Progress,
  Tooltip,
  Row,
  Col,
  Dropdown
} from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MailOutlined,
  HomeOutlined,
  TeamOutlined,
  CrownOutlined,
  MoreOutlined,
  ExportOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useClassroom } from '../../../../hooks';
import type { ClassMember } from '../../../../types/myCourse';

const { Title, Text } = Typography;

const Classroom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  
  const {
    userRole,
    filteredMembers,
    searchText,
    setSearchText,
    filterRole,
    setFilterRole,
    isModalOpen,
    editingMember,
    stats,
    isLoading,
    getRoleConfig,
    handleAddMember,
    handleEditMember,
    handleDeleteMember,
    handleSubmit,
    closeModal,
  } = useClassroom(id!);

  const onAddMember = () => {
    form.resetFields();
    handleAddMember();
  };

  const onEditMember = (member: ClassMember) => {
    form.setFieldsValue(member);
    handleEditMember(member);
  };

  const onSubmit = (values: any) => {
    handleSubmit(values);
    form.resetFields();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return <CrownOutlined />;
      case 'assistant': return <UserOutlined />;
      case 'student':
      default: return <UserOutlined />;
    }
  };

  const columns = [
    {
      title: 'Thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: ClassMember) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} size={44} icon={<UserOutlined />} />
          <div>
            <div className="flex items-center gap-2">
              <Text className="font-semibold text-[#012643]">{record.name}</Text>
              {record.role === 'teacher' && <CrownOutlined className="text-yellow-500" />}
            </div>
            <Text className="text-gray-500 text-sm">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const config = getRoleConfig(role);
        return (
          <Tag color={config.color} icon={getRoleIcon(role)} className="!rounded-full">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number | undefined, record: ClassMember) => (
        record.role === 'student' && progress !== undefined ? (
          <div className="w-32">
            <Progress percent={progress} size="small" strokeColor="#17EAD9" />
          </div>
        ) : (
          <Text className="text-gray-400">-</Text>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'} className="!rounded-full">
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => (
        <Text className="text-gray-500">{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    ...(userRole === 'teacher' ? [{
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: ClassMember) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEditMember(record)}
              className="!text-blue-500"
            />
          </Tooltip>
          <Tooltip title="Gửi Email">
            <Button 
              type="text" 
              icon={<MailOutlined />} 
              className="!text-green-500"
            />
          </Tooltip>
          {record.role !== 'teacher' && (
            <Popconfirm
              title="Xóa thành viên này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleDeleteMember(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Xóa">
                <Button type="text" icon={<DeleteOutlined />} className="!text-red-500" />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-6"
          items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/my-course">Khóa học của tôi</Link> },
            { title: <Link to={`/my-course/detail/${id}`}>Chi tiết khóa học</Link> },
            { title: 'Lớp học' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={2} className="!text-[#012643] !mb-1 flex items-center gap-3">
              <TeamOutlined className="text-blue-500" />
              Thành viên lớp học
            </Title>
            <Text className="text-gray-500">Quản lý và xem tất cả thành viên lớp học</Text>
          </div>
          {userRole === 'teacher' && (
            <div className="flex gap-3">
              <Dropdown
                menu={{
                  items: [
                    { key: 'export', label: 'Xuất danh sách', icon: <ExportOutlined /> },
                    { key: 'invite', label: 'Mời qua liên kết', icon: <UserAddOutlined /> },
                  ]
                }}
              >
                <Button icon={<MoreOutlined />} className="!rounded-lg">Khác</Button>
              </Dropdown>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={onAddMember}
                className="!bg-[#012643] !border-[#012643] !rounded-lg"
              >
                Thêm thành viên
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#012643]">{stats.total}</div>
                <div className="text-gray-500 text-sm">Tổng thành viên</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{stats.teachers}</div>
                <div className="text-gray-500 text-sm">Giảng viên</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.students}</div>
                <div className="text-gray-500 text-sm">Học viên</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.active}</div>
                <div className="text-gray-500 text-sm">Hoạt động</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters & Table */}
        <Card className="rounded-2xl border-0 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Tìm theo tên hoặc email..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="!rounded-lg sm:!w-64"
              allowClear
            />
            <Select
              value={filterRole}
              onChange={setFilterRole}
              className="sm:!w-40"
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'teacher', label: 'Giảng viên' },
                { value: 'assistant', label: 'Trợ giảng' },
                { value: 'student', label: 'Học viên' },
              ]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `${total} thành viên` }}
            loading={isLoading}
            className="custom-table"
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={editingMember ? 'Sửa thành viên' : 'Thêm thành viên mới'}
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Địa chỉ email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="john@example.com" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select
                options={[
                  { value: 'student', label: 'Học viên' },
                  { value: 'assistant', label: 'Trợ giảng' },
                ]}
                placeholder="Chọn vai trò"
              />
            </Form.Item>

            <Form.Item
              name="avatar"
              label="Avatar URL"
            >
              <Input placeholder="https://example.com/avatar.jpg" />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={closeModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="!bg-[#012643]">
                {editingMember ? 'Cập nhật' : 'Thêm thành viên'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Classroom;
