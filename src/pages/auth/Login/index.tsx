import React, { useState } from 'react';
import { Form, Input, Button, message, Modal, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, QuestionCircleOutlined, SendOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../assets/images/Logo.png';
import BookPanda from '../../../assets/images/Panda/BookPanda.png';
import CloudOne from '../../../assets/images/cloud-1.png';
import CloudTwo from '../../../assets/images/cloud-2.png';
import { useAuth } from '../../../hooks/useAuth';
import { useCreateTicketMutation } from '../../../services/supportApi';
import { useForgotPasswordMutation } from '../../../services/authApi';

import { notify } from '../../../utils/notify';
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SUPPORT_CATEGORIES = [
  { value: 'login', label: 'Vấn đề đăng nhập' },
  { value: 'registration', label: 'Vấn đề đăng ký' },
  { value: 'password', label: 'Khôi phục mật khẩu' },
  { value: 'account', label: 'Truy cập tài khoản' },
  { value: 'other', label: 'Khác' },
];

const BRAND_TITLE = 'Khai phá tiềm năng với nền tảng học tập đẳng cấp';

const Login: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      .animate-fade-in {
        animation: fade-in 0.8s ease-out;
      }
      @keyframes blink-caret {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
      .typing-caret::after {
        content: '|';
        margin-left: 2px;
        color: #00B1F5;
        -webkit-text-fill-color: #00B1F5;
        animation: blink-caret 0.9s step-end infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [supportForm] = Form.useForm();
  const [resetEmailForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');

  React.useEffect(() => {
    let currentIndex = 0;
    setTypedTitle('');

    const intervalId = window.setInterval(() => {
      currentIndex += 1;
      setTypedTitle(BRAND_TITLE.slice(0, currentIndex));

      if (currentIndex >= BRAND_TITLE.length) {
        window.clearInterval(intervalId);
      }
    }, 45);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
  
  const { login, isLoading, error } = useAuth();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateTicketMutation();
  const [forgotPassword, { isLoading: isSendingReset }] = useForgotPasswordMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    const success = await login({ email: values.email, password: values.password });
    if (success) {
      notify.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      notify.error(error || 'Email hoặc mật khẩu không đúng');
    }
  };

  const handleForgotPassword = () => {
    setIsModalOpen(true);
  };

  const handleSendResetLink = async () => {
    try {
      const values = await resetEmailForm.validateFields();
      await forgotPassword({ email: values.resetEmail }).unwrap();
      notify.success('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
      setIsModalOpen(false);
      resetEmailForm.resetFields();
    } catch {
      notify.error('Không thể gửi email. Vui lòng thử lại!');
    }
  };

  const handleSupportSubmit = async (values: { email: string; name: string; category: string; subject: string; description: string }) => {
    try {
      await createTicket({
        subject: values.subject,
        description: values.description,
        category: values.category as 'technical' | 'billing' | 'course' | 'account' | 'other',
      }).unwrap();
      notify.success('Ticket hỗ trợ đã được gửi! Chúng tôi sẽ liên hệ sớm.');
      setIsSupportModalOpen(false);
      supportForm.resetFields();
    } catch {
      notify.error('Không thể gửi ticket. Vui lòng thử lại!');
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#effcff] via-white to-[#eefaff] overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-3/5 items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-[#f3fcff] to-[#d7f2ff]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(48,194,236,0.22),transparent_42%),radial-gradient(circle_at_84%_75%,rgba(0,177,245,0.2),transparent_45%)]"></div>
        <img src={CloudOne} alt="cloud" className="absolute top-14 left-16 w-24 opacity-85" />
        <img src={CloudTwo} alt="cloud" className="absolute top-28 right-20 w-28 opacity-90" />

        <div className="relative z-10 flex flex-col items-center text-center px-8 xl:px-14">
          <img src={BookPanda} alt="Book Panda" className="w-[360px] xl:w-[420px] object-contain animate-float" />
          <Title 
            level={1} 
            className="!-mt-12 xl:!-mt-16 !mb-auto max-w-3xl animate-fade-in"
            style={{
              fontSize: '3rem',
              lineHeight: 1.2,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #30C2EC 0%, #00B1F5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(48, 194, 236, 0.3)',
              filter: 'drop-shadow(0 0 20px rgba(0, 177, 245, 0.2))',
            }}
          >
            <span className="typing-caret">{typedTitle}</span>
          </Title>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-2/5 flex items-stretch justify-center p-2 md:p-3 lg:p-4 xl:p-5 overflow-hidden">
        <div className="w-full h-full">
          {/* Mobile Logo */}
          <div className="text-center py-1 lg:hidden">
            <img src={Logo} alt="EduNet" className="w-14 h-14 rounded-xl mb-2 mx-auto shadow-lg" />
            <Title level={4} className="!text-[#0c4055] !mb-0">EduNet</Title>
          </div>

          {/* Form Card */}
          <div className="h-full px-4 py-4 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-7 lg:py-5 xl:px-8 xl:py-6 rounded-2xl lg:rounded-[2rem] flex flex-col justify-center overflow-hidden">
            <div className="mb-4 lg:mb-5">
              <Title level={2} className="!text-[#30C2EC] !mb-1 !text-3xl !font-bold">Đăng nhập</Title>
              <Text className="text-gray-600 text-sm">Chào mừng trở lại! Vui lòng nhập thông tin của bạn để tiếp tục.</Text>
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
                label={<span className="text-gray-700 font-semibold text-sm">Email</span>}
                rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
                className="!mb-1.5"
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Nhập email của bạn"
                  className="!rounded-xl !h-11 !text-base"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label={<span className="text-gray-700 font-semibold text-sm">Mật khẩu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                className="!mb-1.5"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu"
                  className="!rounded-xl !h-11 !text-base"
                />
              </Form.Item>
              <Form.Item className="!mb-3">
                <div className="flex justify-between items-center gap-4">
                  <a className="text-[#00B1F5] hover:text-[#0898cc] font-semibold text-sm" onClick={handleForgotPassword}>
                    Quên mật khẩu?
                  </a>
                </div>
              </Form.Item>

              <Form.Item className="!mb-3">
                <Button
                  type="default"
                  htmlType="submit"
                  loading={isLoading}
                  className="w-full !bg-white !border-[#30C2EC] !border-2 !h-11 !text-base !font-semibold !rounded-xl !text-[#30C2EC] hover:!bg-[#f0f7ff] hover:!text-[#00B1F5]"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-4">
              <Text className="text-gray-600 text-sm">Chưa có tài khoản? </Text>
              <div className="mt-1 flex justify-center gap-4">
                <Link to="/auth/register/student" className="text-[#00B1F5] font-semibold hover:text-[#0898cc] transition-colors">
                  Đăng ký học viên
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/auth/register/teacher" className="text-[#30C2EC] font-semibold hover:text-[#1aa9d1] transition-colors">
                  Đăng ký giảng viên
                </Link>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-3 text-center">
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                onClick={() => setIsSupportModalOpen(true)}
                className="!text-[#0c4055] hover:!text-[#00B1F5] !font-medium"
              >
                Bạn cần giúp đỡ? Gửi yêu cầu hỗ trợ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        title={
          <div className="flex items-center gap-2">
            <LockOutlined className="text-[#00B1F5]" />
            <span>Đặt lại mật khẩu</span>
          </div>
        }
        open={isModalOpen} 
        onOk={handleSendResetLink} 
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi liên kết"
        confirmLoading={isSendingReset}
        okButtonProps={{ className: '!bg-[#00B1F5] hover:!bg-[#0898cc] !border-none' }}
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
            <QuestionCircleOutlined className="text-[#30C2EC]" />
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
                className="!bg-[#00B1F5] hover:!bg-[#0898cc] !border-none !rounded-lg"
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
