import React, { useState } from 'react';
import { Form, Input, Button, Steps, Select, message, InputNumber, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, BookOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../../assets/images/Logo.png';
import BookPanda from '../../../../assets/images/Panda/BookPanda.png';
import CloudOne from '../../../../assets/images/cloud-1.png';
import CloudTwo from '../../../../assets/images/cloud-2.png';
import { useRegisterMutation } from '../../../../services/authApi';
import { setTokens } from '../../../../services/axiosBaseQuery';

const { Option } = Select;
const { Title, Text } = Typography;

const BRAND_TITLE = 'Khai phá tiềm năng với nền tảng học tập đẳng cấp';

const RegisterStudent: React.FC = () => {
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
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [typedTitle, setTypedTitle] = useState('');
  const [register, { isLoading }] = useRegisterMutation();

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

  const onFinish = async (values: Record<string, unknown>) => {
    const newData = { ...formData, ...values };
    setFormData(newData);
    
    if (current < 2) {
      setCurrent(current + 1);
    } else {
      // Register user with API
      try {
        const nameParts = (newData.name as string || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const result = await register({
          email: newData.email as string,
          password: newData.password as string,
          firstName,
          lastName,
        }).unwrap();

        if (result.success && result.data) {
          setTokens(result.data.accessToken, result.data.refreshToken);
          message.success('Đăng ký thành công! Đang chuyển hướng...');
          setTimeout(() => navigate('/'), 1500);
        } else {
          message.error('Đăng ký thất bại. Vui lòng thử lại.');
        }
      } catch (err: unknown) {
        const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Đăng ký thất bại';
        message.error(errorMessage);
      }
    }
  };

  const steps = [
    {
      title: 'Tài khoản',
      content: (
        <>
          <Form.Item
            name="email"
            label="Email"
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập email của bạn" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            className="!mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Tạo mật khẩu" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            className="!mb-0"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Xác nhận mật khẩu" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Cá nhân',
      content: (
        <>
          <Form.Item
            name="name"
            label="Họ tên"
            className="!mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập họ tên đầy đủ" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            className="!mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Nhập số điện thoại" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="age"
            label="Tuổi"
            className="!mb-0"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}
          >
            <InputNumber placeholder="Nhập tuổi" className="!w-full !rounded-lg !h-11" min={1} max={100} />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Học vấn',
      content: (
        <>
          <Form.Item
            name="major"
            label="Chuyên ngành"
            className="!mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành!' }]}
          >
            <Input prefix={<BookOutlined className="text-gray-400" />} placeholder="VD: Khoa học máy tính" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="degree"
            label="Trình độ học vấn"
            className="!mb-0"
            initialValue="University"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
          >
            <Select placeholder="Chọn trình độ học vấn" className="!rounded-lg !h-11">
              <Option value="Primary School">Tiểu học</Option>
              <Option value="Middle School">Trung học cơ sở</Option>
              <Option value="High School">Trung học phổ thông</Option>
              <Option value="University">Đại học</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
  ];

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
      <div className="w-full lg:w-2/5 flex items-center justify-center p-2 md:p-4 lg:p-5 xl:p-6 overflow-y-auto">
        <div className="w-full max-w-2xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-9 rounded-2xl lg:rounded-[2rem]">
          <div className="text-center mb-4 lg:hidden">
            <img src={Logo} alt="EduNet" className="w-14 h-14 rounded-xl mb-2 mx-auto shadow-lg" />
            <Title level={4} className="!text-[#0c4055] !mb-0">EduNet</Title>
          </div>

          <div className="mb-5">
            <Title level={2} className="!text-[#0c4055] !mb-1 !text-3xl !font-bold">Đăng ký học viên</Title>
            <Text className="text-gray-600 text-base">Hoàn thành các bước dưới đây để tạo tài khoản.</Text>
          </div>

          <Steps current={current} className="mb-6" size="small" items={steps.map(s => ({ title: s.title }))} />

          <Form
            form={form}
            name="register-student"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={formData}
          >
            <div className="min-h-[180px]">
              {steps[current].content}
            </div>

            <div className="flex justify-between mt-5 gap-4">
              {current > 0 ? (
                <Button onClick={() => setCurrent(current - 1)} className="!rounded-lg !h-11 !px-6 !border-[#cfefff] !text-[#0c4055]">
                  Quay lại
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="!bg-gradient-to-r !from-[#30C2EC] !to-[#00B1F5] !border-none !rounded-lg !px-8 !h-11 !font-semibold"
              >
                {current === 2 ? 'Tạo tài khoản' : 'Tiếp tục'}
              </Button>
            </div>
          </Form>

          <div className="text-center mt-5 pt-4 border-t border-gray-100">
            <Text className="text-gray-500 text-sm">
              Đã có tài khoản?
              <Link to="/auth/login" className="text-[#00B1F5] ml-1 font-semibold hover:text-[#0898cc]">
                Đăng nhập
              </Link>
            </Text>
          </div>

          <div className="text-center mt-2">
            <a href="mailto:support@edunet.com" className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-[#00B1F5] transition-colors">
              <MailOutlined /> Cần giúp đỡ? Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;