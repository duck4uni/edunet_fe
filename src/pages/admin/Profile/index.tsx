// Admin Profile & Settings Page - Simplified
import React, { useState } from 'react';
import { 
  Row, Col, Card, Button, Space, Avatar, Typography, Form, Input, 
  Switch, Tabs, Divider, List, Tag, Badge, Select, message, Modal
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, 
  CameraOutlined, SaveOutlined, BellOutlined, SecurityScanOutlined,
  GlobalOutlined, MoonOutlined, SunOutlined, SettingOutlined,
  KeyOutlined, HistoryOutlined, LogoutOutlined, EditOutlined,
  CheckCircleOutlined, SafetyOutlined
} from '@ant-design/icons';
import { useAdminAuth, useTheme } from '../../../hooks';
import { PageHeader } from '../../../components/admin';
import { formatDate, formatDateTime } from '../../../utils/format';

const { Text, Title } = Typography;
const { TextArea } = Input;

const AdminProfile: React.FC = () => {
  const { admin, updateProfile, changePassword, logout, loginHistory } = useAdminAuth();
  const { isDarkMode, toggleTheme, themeColor, setThemeColor } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const values = await profileForm.validateFields();
      await updateProfile(values);
      message.success('Cập nhật thông tin thành công');
      setEditMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp');
        return;
      }
      await changePassword(values.currentPassword, values.newPassword);
      message.success('Đổi mật khẩu thành công');
      setPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (e) {
      message.error('Đổi mật khẩu thất bại');
    }
  };

  const themeColors = [
    { name: 'Xanh dương', value: '#1890ff' },
    { name: 'Xanh lá', value: '#52c41a' },
    { name: 'Tím', value: '#722ed1' },
    { name: 'Cam', value: '#fa8c16' },
    { name: 'Đỏ', value: '#f5222d' },
    { name: 'Hồng', value: '#eb2f96' },
  ];

  const notificationSettings = [
    { key: 'email', label: 'Thông báo qua email', description: 'Nhận thông báo quan trọng qua email', enabled: true },
    { key: 'browser', label: 'Thông báo trình duyệt', description: 'Thông báo đẩy trên trình duyệt', enabled: true },
    { key: 'newUser', label: 'Người dùng mới', description: 'Khi có người dùng mới đăng ký', enabled: true },
    { key: 'newOrder', label: 'Đơn hàng mới', description: 'Khi có đơn hàng mới', enabled: true },
    { key: 'support', label: 'Yêu cầu hỗ trợ', description: 'Khi có ticket hỗ trợ mới', enabled: false },
    { key: 'system', label: 'Cảnh báo hệ thống', description: 'Thông báo về hệ thống', enabled: true },
  ];

  const securitySettings = [
    { key: '2fa', label: 'Xác thực 2 bước (2FA)', description: 'Bảo mật tài khoản với mã OTP', enabled: true },
    { key: 'loginAlert', label: 'Cảnh báo đăng nhập', description: 'Thông báo khi có đăng nhập từ thiết bị mới', enabled: true },
    { key: 'sessionTimeout', label: 'Hết phiên tự động', description: 'Tự động đăng xuất sau 30 phút không hoạt động', enabled: false },
  ];

  const tabItems = [
    {
      key: 'profile',
      label: <span><UserOutlined /> Thông tin cá nhân</span>,
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text type="secondary">Cập nhật thông tin cá nhân của bạn</Text>
            {!editMode ? (
              <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                Chỉnh sửa
              </Button>
            ) : (
              <Space>
                <Button onClick={() => setEditMode(false)}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSaveProfile}>
                  Lưu thay đổi
                </Button>
              </Space>
            )}
          </div>

          <Form form={profileForm} layout="vertical" initialValues={admin || {}} disabled={!editMode}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="firstName" label="Họ" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined />} placeholder="Nhập họ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lastName" label="Tên" rules={[{ required: true }]}>
                  <Input placeholder="Nhập tên" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                  <Input prefix={<PhoneOutlined />} placeholder="0xxx xxx xxx" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label="Địa chỉ">
              <TextArea rows={2} placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'appearance',
      label: <span><SettingOutlined /> Giao diện</span>,
      children: (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              {isDarkMode ? (
                <MoonOutlined className="text-2xl text-blue-500" />
              ) : (
                <SunOutlined className="text-2xl text-yellow-500" />
              )}
              <div>
                <Text strong className="block">Chế độ tối</Text>
                <Text type="secondary">Giảm mỏi mắt khi làm việc trong môi trường ánh sáng yếu</Text>
              </div>
            </div>
            <Switch 
              checked={isDarkMode} 
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
          </div>

          <div className="p-4 border rounded-lg">
            <Text strong className="block mb-4">Màu chủ đề</Text>
            <div className="flex gap-3 flex-wrap">
              {themeColors.map((color) => (
                <div
                  key={color.value}
                  className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all
                    ${themeColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setThemeColor(color.value)}
                  title={color.name}
                >
                  {themeColor === color.value && <CheckCircleOutlined className="text-white" />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <GlobalOutlined className="text-2xl text-blue-500" />
              <div>
                <Text strong className="block">Ngôn ngữ</Text>
                <Text type="secondary">Chọn ngôn ngữ hiển thị</Text>
              </div>
            </div>
            <Select
              defaultValue="vi"
              style={{ width: 150 }}
              options={[
                { label: '🇻🇳 Tiếng Việt', value: 'vi' },
                { label: '🇺🇸 English', value: 'en' },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: <span><BellOutlined /> Thông báo</span>,
      children: (
        <div>
          <Text type="secondary" className="block mb-4">
            Tùy chỉnh các loại thông báo bạn muốn nhận
          </Text>
          <List
            dataSource={notificationSettings}
            renderItem={(item) => (
              <List.Item actions={[<Switch key="switch" defaultChecked={item.enabled} />]}>
                <List.Item.Meta title={item.label} description={item.description} />
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'security',
      label: <span><SecurityScanOutlined /> Bảo mật</span>,
      children: (
        <div className="space-y-6">
          <List
            dataSource={securitySettings}
            renderItem={(item) => (
              <List.Item actions={[<Switch key="switch" defaultChecked={item.enabled} />]}>
                <List.Item.Meta
                  avatar={<SafetyOutlined className="text-blue-500 text-xl" />}
                  title={item.label}
                  description={item.description}
                />
              </List.Item>
            )}
          />

          <Divider />

          <div>
            <Text strong className="block mb-4">
              <HistoryOutlined className="mr-2" />
              Lịch sử đăng nhập
            </Text>
            <List
              dataSource={loginHistory}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge status={item.status === 'success' ? 'success' : 'error'} offset={[-5, 30]}>
                        <Avatar icon={<GlobalOutlined />} />
                      </Badge>
                    }
                    title={
                      <span>
                        {item.device} - {item.browser}
                        {item.isCurrent && <Tag color="green" className="ml-2">Phiên hiện tại</Tag>}
                      </span>
                    }
                    description={
                      <span>
                        {item.ip} • {item.location} • {formatDateTime(item.time)}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hồ sơ & Cài đặt"
        subtitle="Quản lý thông tin cá nhân và tùy chỉnh hệ thống"
        breadcrumb={[{ title: 'Cài đặt' }]}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar 
                  size={120} 
                  src={admin?.avatar}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
                />
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<CameraOutlined />}
                  className="absolute bottom-0 right-0"
                  size="small"
                />
              </div>
              <Title level={4} className="mb-1">{admin?.firstName} {admin?.lastName}</Title>
              <Text type="secondary">{admin?.email}</Text>
              <div className="mt-2">
                <Tag color="purple">{admin?.role === 'super_admin' ? 'Quản trị viên cao cấp' : 'Quản trị viên'}</Tag>
              </div>
            </div>

            <Divider />

            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Mã người dùng</Text>
                <Text strong>{admin?.id}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Vai trò</Text>
                <Text strong>{admin?.role}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Trạng thái</Text>
                <Tag color={admin?.status === 'active' ? 'green' : 'red'}>{admin?.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</Tag>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Ngày tạo</Text>
                <Text strong>{formatDate(admin?.createdAt || '')}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Đăng nhập cuối</Text>
                <Text strong>{formatDateTime(admin?.lastLogin || '')}</Text>
              </div>
            </div>

            <Divider />

            <Space direction="vertical" className="w-full">
              <Button block icon={<KeyOutlined />} onClick={() => setPasswordModalOpen(true)}>
                Đổi mật khẩu
              </Button>
              <Button 
                block 
                danger 
                icon={<LogoutOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Đăng xuất',
                    content: 'Bạn có chắc muốn đăng xuất?',
                    okText: 'Đăng xuất',
                    cancelText: 'Hủy',
                    onOk: logout,
                  });
                }}
              >
                Đăng xuất
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          </Card>
        </Col>
      </Row>

      <Modal
        title={<span><KeyOutlined className="mr-2" />Đổi mật khẩu</span>}
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        onOk={handleChangePassword}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
      >
        <Form form={passwordForm} layout="vertical" className="mt-4">
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProfile;