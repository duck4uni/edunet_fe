import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Modal, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, QuestionCircleOutlined, SendOutlined, SafetyCertificateOutlined, TeamOutlined, BookOutlined, MailOutlined, AppleFilled, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../assets/images/Logo.png';
import { useAuth } from '../../../hooks/useAuth';
import { useCreateTicketMutation } from '../../../services/supportApi';
import { useForgotPasswordMutation } from '../../../services/authApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SUPPORT_CATEGORIES = [
  { value: 'login', label: 'Vấn đề đăng nhập' },
  { value: 'registration', label: 'Vấn đề đăng ký' },
  { value: 'password', label: 'Khôi phục mật khẩu' },
  { value: 'account', label: 'Truy cập tài khoản' },
  { value: 'other', label: 'Khác' },
];

const features = [
  { icon: <BookOutlined className="text-[#17EAD9]" />, text: '500+ Khóa học chất lượng' },
  { icon: <TeamOutlined className="text-[#6078EA]" />, text: '10,000+ Học viên tích cực' },
  { icon: <SafetyCertificateOutlined className="text-[#e5698e]" />, text: 'Chứng chỉ chuyên ngành' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [supportForm] = Form.useForm();
  const [resetEmailForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const { login, isLoading, error } = useAuth();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateTicketMutation();
  const [forgotPassword, { isLoading: isSendingReset }] = useForgotPasswordMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    const success = await login({ email: values.email, password: values.password });
    if (success) {
      message.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      message.error(error || 'Email hoặc mật khẩu không đúng');
    }
  };

  const handleGoogleLogin = () => {
    message.info('Đang chuyển hướng đến Google...');
  };

  const handleForgotPassword = () => {
    setIsModalOpen(true);
  };

  const handleSendResetLink = async () => {
    try {
      const values = await resetEmailForm.validateFields();
      await forgotPassword({ email: values.resetEmail }).unwrap();
      message.success('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
      setIsModalOpen(false);
      resetEmailForm.resetFields();
    } catch (err) {
      message.error('Không thể gửi email. Vui lòng thử lại!');
    }
  };

  const handleSupportSubmit = async (values: { email: string; name: string; category: string; subject: string; description: string }) => {
    try {
      await createTicket({
        subject: values.subject,
        description: values.description,
        category: values.category as 'technical' | 'billing' | 'course' | 'account' | 'other',
      }).unwrap();
      message.success('Ticket hỗ trợ đã được gửi! Chúng tôi sẽ liên hệ sớm.');
      setIsSupportModalOpen(false);
      supportForm.resetFields();
    } catch (err) {
      message.error('Không thể gửi ticket. Vui lòng thử lại!');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#012643] via-[#01385f] to-[#012643] items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#17EAD9] rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#e5698e] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2 blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#6078EA] rounded-full opacity-10 blur-3xl animate-pulse delay-500"></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-[#17EAD9] rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-[#e5698e] rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 left-16 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-500"></div>

        <div className="z-10 text-center p-12 max-w-lg">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#17EAD9] to-[#6078EA] rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <img src={Logo} alt="EduNet" className="w-28 h-28 rounded-2xl shadow-2xl relative z-10 border-4 border-white/10" />
          </div>
          <Title level={1} className="!text-white !mb-4 !text-4xl !font-bold">
            Chào mừng trở lại <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17EAD9] to-[#6078EA]">EduNet</span>
          </Title>
          <Paragraph className="text-blue-200 text-lg mb-10">
            Cổng thông tin giáo dục đẳng cấp. Tiếp tục hành trình học tập với hàng nghìn khóa học và giảng viên chuyên gia.
          </Paragraph>
          
          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <Text className="text-white/90 font-medium">{feature.text}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-6 lg:hidden">
            <img src={Logo} alt="EduNet" className="w-16 h-16 rounded-xl mb-3 mx-auto shadow-lg" />
            <Title level={3} className="!text-[#012643] !mb-0">EduNet</Title>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="mb-8">
              <Title level={2} className="!text-[#012643] !mb-2 !text-2xl">Đăng nhập</Title>
              <Text className="text-gray-500">Chào mừng trở lại! Vui lòng nhập thông tin của bạn.</Text>
            </div>

            <Form
              form={form}
              name="login"
              className="login-form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="email"
                label={<span className="text-gray-600 font-medium">Email</span>}
                rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
              >
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />} 
                  placeholder="Nhập email của bạn" 
                  className="!rounded-xl !h-12"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label={<span className="text-gray-600 font-medium">Mật khẩu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu"
                  className="!rounded-xl !h-12"
                />
              </Form.Item>
              <Form.Item>
                <div className="flex justify-between items-center">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-gray-500">Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <a className="text-[#e5698e] hover:text-[#d64d72] font-medium text-sm" onClick={handleForgotPassword}>
                    Quên mật khẩu?
                  </a>
                </div>
              </Form.Item>

              <Form.Item className="mb-4">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  className="w-full !bg-gradient-to-r from-[#012643] to-[#01385f] !border-none !h-12 !text-base !font-semibold hover:!opacity-90 !rounded-xl shadow-lg shadow-blue-900/20 transition-all"
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">hoặc tiếp tục với</span>
                </div>
              </div>

              <Form.Item className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    onClick={handleGoogleLogin}
                    icon={<GoogleOutlined className="text-red-500" />}
                    className="!h-12 !rounded-xl !border-gray-200 hover:!border-red-300 hover:!bg-red-50"
                  />
                  <Button 
                    icon={<AppleFilled className="text-gray-800" />}
                    className="!h-12 !rounded-xl !border-gray-200 hover:!border-gray-400 hover:!bg-gray-50"
                  />
                  <Button 
                    icon={<GithubOutlined className="text-gray-800" />}
                    className="!h-12 !rounded-xl !border-gray-200 hover:!border-gray-400 hover:!bg-gray-50"
                  />
                </div>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text className="text-gray-500">Chưa có tài khoản? </Text>
              <div className="mt-3 flex justify-center gap-4">
                <Link to="/auth/register/student" className="text-[#6078EA] font-semibold hover:text-[#4a5db8] transition-colors">
                  Đăng ký học viên
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/auth/register/teacher" className="text-[#e5698e] font-semibold hover:text-[#d64d72] transition-colors">
                  Đăng ký giảng viên
                </Link>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-6 text-center">
            <Button 
              type="text"
              icon={<QuestionCircleOutlined />}
              onClick={() => setIsSupportModalOpen(true)}
              className="!text-gray-500 hover:!text-[#012643]"
            >
              Bạn cần giúp đỡ? Gửi yêu cầu hỗ trợ
            </Button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        title={
          <div className="flex items-center gap-2">
            <LockOutlined className="text-[#6078EA]" />
            <span>Đặt lại mật khẩu</span>
          </div>
        }
        open={isModalOpen} 
        onOk={handleSendResetLink} 
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi liên kết"
        confirmLoading={isSendingReset}
        okButtonProps={{ className: '!bg-[#012643]' }}
      >
        <div className="py-4">
          <Paragraph className="text-gray-500 mb-4">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
          </Paragraph>
          <Form form={resetEmailForm}>
            <Form.Item
              name="resetEmail"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
              ]}
            >
              <Input 
                placeholder="Nhập địa chỉ email" 
                prefix={<MailOutlined className="text-gray-400" />} 
                size="large" 
                className="!rounded-xl"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Support Ticket Modal */}
      <Modal 
        title={
          <div className="flex items-center gap-2">
            <QuestionCircleOutlined className="text-[#e5698e]" />
            <span>Gửi yêu cầu hỗ trợ</span>
          </div>
        }
        open={isSupportModalOpen} 
        onCancel={() => setIsSupportModalOpen(false)}
        footer={null}
        width={500}
      >
        <div className="py-2">
          <Text className="text-gray-500 block mb-4">
            Bạn gặp vấn đề truy cập tài khoản? Gửi yêu cầu và đội ngũ hỗ trợ sẽ giúp bạn.
          </Text>
          <Form
            form={supportForm}
            layout="vertical"
            onFinish={handleSupportSubmit}
          >
            <Form.Item 
              name="email" 
              label="Email của bạn"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email" className="!rounded-lg" />
            </Form.Item>

            <Form.Item 
              name="name" 
              label="Họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ tên đầy đủ" className="!rounded-lg" />
            </Form.Item>

            <Form.Item 
              name="category" 
              label="Loại vấn đề"
              rules={[{ required: true, message: 'Vui lòng chọn loại vấn đề' }]}
            >
              <Select 
                options={SUPPORT_CATEGORIES} 
                placeholder="Chọn loại vấn đề"
                className="!rounded-lg"
              />
            </Form.Item>

            <Form.Item 
              name="subject" 
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Mô tả ngắn gọn vấn đề" className="!rounded-lg" />
            </Form.Item>

            <Form.Item 
              name="description" 
              label="Mô tả chi tiết"
              rules={[{ required: true, message: 'Vui lòng mô tả vấn đề' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Vui lòng cung cấp thông tin chi tiết về vấn đề của bạn..."
                className="!rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-4">
              <Button onClick={() => setIsSupportModalOpen(false)} className="!rounded-lg">Hủy</Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SendOutlined />}
                loading={isCreatingTicket}
                className="!bg-[#012643] !rounded-lg"
              >
                Gửi yêu cầu
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
