import React from 'react';
import { 
  Card, 
  Tabs, 
  Avatar, 
  Button, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Row, 
  Col,
  Tag,
  Modal,
  Table,
  Upload,
  Timeline,
  Empty,
  Spin,
  DatePicker
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined,
  EditOutlined,
  LockOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
  CameraOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProfile } from '../../../hooks/useProfile';
import { 
  SUPPORT_CATEGORIES,
  TICKET_PRIORITIES
} from '../../../constants/profileData';
import type { SupportTicket } from '../../../types/profile';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Profile: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    profile,
    isLoading,
    isUpdating,
    isCreatingTicket,
    isEditModalOpen,
    isPasswordModalOpen,
    isTicketModalOpen,
    selectedTicket,
    setSelectedTicket,
    achievements,
    certificates,
    supportTickets,
    handleEditProfile,
    handleSaveProfile,
    handleChangePassword,
    handleCreateTicket,
    getTicketStatusConfig,
    closeEditModal,
    closePasswordModal,
    closeTicketModal,
    openPasswordModal,
    openTicketModal,
    clearSelectedTicket,
  } = useProfile();

  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [ticketForm] = Form.useForm();

  const onEditProfile = () => {
    if (profile) {
      editForm.setFieldsValue({
        ...profile,
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
      });
    }
    handleEditProfile();
  };

  const onSaveProfile = (values: Record<string, unknown>) => {
    const dateOfBirth = values.dateOfBirth 
      ? (values.dateOfBirth as dayjs.Dayjs).format('YYYY-MM-DD') 
      : undefined;
    handleSaveProfile({ ...values, dateOfBirth });
  };

  const onChangePassword = (values: Record<string, unknown>) => {
    handleChangePassword(values);
    passwordForm.resetFields();
  };

  const onCreateTicket = (values: { subject: string; description: string; category: string; priority?: string }) => {
    handleCreateTicket(values);
    ticketForm.resetFields();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Empty description="Vui lòng đăng nhập để xem hồ sơ" />
      </div>
    );
  }

  const ticketColumns = [
    {
      title: 'Mã ticket',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text className="font-mono text-[#012643]">{id}</Text>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string) => <Text className="font-medium">{subject}</Text>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const cat = SUPPORT_CATEGORIES.find(c => c.value === category);
        return <Tag>{cat?.label || category}</Tag>;
      },
    },
    {
      title: 'Mức ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const p = TICKET_PRIORITIES.find(pr => pr.value === priority);
        return <Tag color={p?.color}>{p?.label || priority}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getTicketStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: SupportTicket) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => setSelectedTicket(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'info',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#012643] to-blue-700 -mx-6 -mt-6 px-6 py-8 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar 
                    src={profile.avatar} 
                    size={120} 
                    icon={<UserOutlined />}
                    className="!border-4 !border-white shadow-lg"
                  />
                  <Upload showUploadList={false}>
                    <Button 
                      type="primary" 
                      shape="circle" 
                      icon={<CameraOutlined />}
                      className="!absolute !bottom-0 !right-0 !bg-white !text-[#012643] !border-0 shadow-md"
                      size="small"
                    />
                  </Upload>
                </div>
                <div className="text-center md:text-left">
                  <Title level={2} className="!text-white !mb-1">
                    {profile.firstName} {profile.lastName}
                  </Title>
                  <Tag color="gold" className="!rounded-full !mb-2">
                    {profile.role === 'student' ? '👨‍🎓 Học viên' : '👨‍🏫 Giảng viên'}
                  </Tag>
                  <Text className="text-white/80 block">{profile.bio}</Text>
                  <div className="flex justify-center md:justify-start gap-3 mt-4">
                    {profile.socialLinks.facebook && (
                      <Button type="text" icon={<FacebookOutlined />} className="!text-white hover:!text-blue-300" />
                    )}
                    {profile.socialLinks.twitter && (
                      <Button type="text" icon={<TwitterOutlined />} className="!text-white hover:!text-blue-300" />
                    )}
                    {profile.socialLinks.linkedin && (
                      <Button type="text" icon={<LinkedinOutlined />} className="!text-white hover:!text-blue-300" />
                    )}
                    {profile.socialLinks.github && (
                      <Button type="text" icon={<GithubOutlined />} className="!text-white hover:!text-blue-300" />
                    )}
                  </div>
                </div>
                <div className="md:ml-auto">
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={onEditProfile}
                    className="!bg-white !text-[#012643] !border-0 hover:!bg-gray-100"
                  >
                    Sửa hồ sơ
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MailOutlined className="text-[#e5698e] text-lg" />
                    <div>
                      <Text className="text-gray-500 text-xs block">Email</Text>
                      <Text className="font-medium">{profile.email}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneOutlined className="text-[#e5698e] text-lg" />
                    <div>
                      <Text className="text-gray-500 text-xs block">Số điện thoại</Text>
                      <Text className="font-medium">{profile.phone}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarOutlined className="text-[#e5698e] text-lg" />
                    <div>
                      <Text className="text-gray-500 text-xs block">Ngày sinh</Text>
                      <Text className="font-medium">{new Date(profile.dateOfBirth).toLocaleDateString()}</Text>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <EnvironmentOutlined className="text-[#e5698e] text-lg" />
                    <div>
                      <Text className="text-gray-500 text-xs block">Địa chỉ</Text>
                      <Text className="font-medium">{profile.address}, {profile.city}, {profile.country}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarOutlined className="text-[#e5698e] text-lg" />
                    <div>
                      <Text className="text-gray-500 text-xs block">Thành viên từ</Text>
                      <Text className="font-medium">{profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : ''}</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Change Password */}
          <Card className="rounded-2xl border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <LockOutlined className="text-red-500 text-xl" />
                </div>
                <div>
                  <Text className="font-semibold text-[#012643] block">Mật khẩu & Bảo mật</Text>
                  <Text className="text-gray-500 text-sm">Quản lý mật khẩu và cài đặt bảo mật</Text>
                </div>
              </div>
              <Button 
                icon={<LockOutlined />}
                onClick={openPasswordModal}
              >
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'achievements',
      label: (
        <span className="flex items-center gap-2">
          <TrophyOutlined />
          Thành tựu
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-2xl font-bold text-[#012643]">{achievements.length}</div>
                  <div className="text-gray-500 text-sm">Thành tựu</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                  <div className="text-3xl mb-2">📜</div>
                  <div className="text-2xl font-bold text-[#012643]">{certificates.length}</div>
                  <div className="text-gray-500 text-sm">Chứng chỉ</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-[#012643]">30</div>
                  <div className="text-gray-500 text-sm">Chuỗi ngày</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-[#012643]">1,250</div>
                  <div className="text-gray-500 text-sm">Điểm XP</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Achievements Grid */}
          <Card className="rounded-2xl border-0 shadow-md">
            <Title level={4} className="!text-[#012643] !mb-4">🏆 Thành tựu của tôi</Title>
            {achievements.length === 0 ? (
              <Empty description="Chưa có thành tựu nào. Hãy hoàn thành khóa học để nhận!" />
            ) : (
              <Row gutter={[16, 16]}>
                {achievements.map(achievement => (
                  <Col xs={24} sm={12} md={8} key={achievement.id}>
                    <Card className="rounded-xl border border-gray-100 hover:shadow-md transition-all h-full">
                      <div className="text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <Text className="font-semibold text-[#012643] block">{achievement.title}</Text>
                        <Text className="text-gray-500 text-sm">{achievement.description}</Text>
                        <div className="mt-2">
                          <Tag color="blue" className="!rounded-full !text-xs">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'certificates',
      label: (
        <span className="flex items-center gap-2">
          <SafetyCertificateOutlined />
          Chứng chỉ
        </span>
      ),
      children: (
        <Card className="rounded-2xl border-0 shadow-md">
          <Title level={4} className="!text-[#012643] !mb-4">📜 Chứng chỉ của tôi</Title>
          {certificates.length === 0 ? (
            <Empty description="Chưa có chứng chỉ nào. Hãy hoàn thành khóa học để nhận chứng chỉ đầu tiên!" />
          ) : (
            <Row gutter={[16, 16]}>
              {certificates.map(cert => (
                <Col xs={24} md={12} key={cert.id}>
                  <Card className="rounded-xl border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                        <SafetyCertificateOutlined />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-semibold text-[#012643] block text-lg">{cert.courseName}</Text>
                        <Text className="text-gray-500 text-sm block">Mã chứng chỉ: {cert.credentialId}</Text>
                        <div className="flex items-center gap-4 mt-2">
                          <Text className="text-xs text-gray-400">
                            Ngày cấp: {new Date(cert.issueDate).toLocaleDateString()}
                          </Text>
                          {cert.expiryDate && (
                            <Text className="text-xs text-orange-500">
                              Hết hạn: {new Date(cert.expiryDate).toLocaleDateString()}
                            </Text>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="small" icon={<EyeOutlined />} className="!rounded-lg">Xem</Button>
                          <Button size="small" icon={<DownloadOutlined />} type="primary" className="!bg-[#012643] !rounded-lg">
                            Tải xuống
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      ),
    },
    {
      key: 'support',
      label: (
        <span className="flex items-center gap-2">
          <QuestionCircleOutlined />
          Yêu cầu hỗ trợ
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card className="rounded-2xl border-0 shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <Title level={4} className="!text-[#012643] !mb-1">Yêu cầu hỗ trợ</Title>
                <Text className="text-gray-500">Xem và quản lý các yêu cầu hỗ trợ của bạn</Text>
              </div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={openTicketModal}
                className="!bg-[#012643] !rounded-lg"
              >
                Tạo ticket mới
              </Button>
            </div>

            <Table
              columns={ticketColumns}
              dataSource={supportTickets}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="profile-tabs"
        />

        {/* Edit Profile Modal */}
        <Modal
          title="Chỉnh sửa hồ sơ"
          open={isEditModalOpen}
          onCancel={closeEditModal}
          footer={null}
          width={600}
        >
          <Form form={editForm} layout="vertical" onFinish={onSaveProfile}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="phone" label="Số điện thoại">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                    { value: 'other', label: 'Khác' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="bio" label="Giới thiệu">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ">
              <Input prefix={<EnvironmentOutlined />} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="city" label="Thành phố">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="country" label="Quốc gia">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <div className="flex justify-end gap-3">
              <Button onClick={closeEditModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating} className="!bg-[#012643]">Lưu thay đổi</Button>
            </div>
          </Form>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          title="Đổi mật khẩu"
          open={isPasswordModalOpen}
          onCancel={closePasswordModal}
          footer={null}
          width={400}
        >
          <Form form={passwordForm} layout="vertical" onFinish={onChangePassword}>
            <Form.Item 
              name="currentPassword" 
              label="Mật khẩu hiện tại" 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item 
              name="newPassword" 
              label="Mật khẩu mới" 
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item 
              name="confirmPassword" 
              label="Xác nhận mật khẩu" 
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={closePasswordModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="!bg-[#012643]">Đổi mật khẩu</Button>
            </div>
          </Form>
        </Modal>

        {/* Create Ticket Modal */}
        <Modal
          title="Tạo ticket hỗ trợ"
          open={isTicketModalOpen}
          onCancel={closeTicketModal}
          footer={null}
          width={500}
        >
          <Form form={ticketForm} layout="vertical" onFinish={onCreateTicket}>
            <Form.Item name="subject" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
              <Input placeholder="Mô tả ngắn vấn đề của bạn" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                  <Select options={SUPPORT_CATEGORIES} placeholder="Chọn danh mục" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label="Mức ưu tiên" rules={[{ required: true, message: 'Vui lòng chọn mức ưu tiên' }]}>
                  <Select options={TICKET_PRIORITIES.map(p => ({ value: p.value, label: p.label }))} placeholder="Chọn mức ưu tiên" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
              <TextArea rows={4} placeholder="Vui lòng cung cấp chi tiết vấn đề của bạn..." />
            </Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={closeTicketModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isCreatingTicket} className="!bg-[#012643]">Gửi ticket</Button>
            </div>
          </Form>
        </Modal>

        {/* View Ticket Modal */}
        <Modal
          title={`Ticket: ${selectedTicket?.id}`}
          open={!!selectedTicket}
          onCancel={clearSelectedTicket}
          footer={[
            <Button key="close" onClick={clearSelectedTicket}>Đóng</Button>
          ]}
          width={600}
        >
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <Text className="text-gray-500 text-sm">Tiêu đề</Text>
                <Title level={5} className="!mt-0">{selectedTicket.subject}</Title>
              </div>
              <Row gutter={16}>
                <Col span={8}>
                  <Text className="text-gray-500 text-sm">Trạng thái</Text>
                  <div>
                    <Tag color={getTicketStatusConfig(selectedTicket.status).color}>
                      {getTicketStatusConfig(selectedTicket.status).text}
                    </Tag>
                  </div>
                </Col>
                <Col span={8}>
                  <Text className="text-gray-500 text-sm">Danh mục</Text>
                  <div>{SUPPORT_CATEGORIES.find(c => c.value === selectedTicket.category)?.label}</div>
                </Col>
                <Col span={8}>
                  <Text className="text-gray-500 text-sm">Mức ưu tiên</Text>
                  <div>
                    <Tag color={TICKET_PRIORITIES.find(p => p.value === selectedTicket.priority)?.color}>
                      {TICKET_PRIORITIES.find(p => p.value === selectedTicket.priority)?.label}
                    </Tag>
                  </div>
                </Col>
              </Row>
              <div>
                <Text className="text-gray-500 text-sm">Mô tả</Text>
                <Paragraph className="bg-gray-50 p-3 rounded-lg mt-1">{selectedTicket.description}</Paragraph>
              </div>
              {selectedTicket.responses?.length > 0 && (
                <div>
                  <Text className="text-gray-500 text-sm">Phản hồi</Text>
                  <Timeline className="mt-2">
                    {selectedTicket.responses?.map(response => (
                      <Timeline.Item 
                        key={response.id}
                        color={response.isStaff ? 'blue' : 'green'}
                      >
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Text className="font-medium">{response.authorName}</Text>
                            <Text className="text-xs text-gray-400">
                              {new Date(response.createdAt).toLocaleString()}
                            </Text>
                          </div>
                          <Paragraph className="!mb-0">{response.message}</Paragraph>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Profile;