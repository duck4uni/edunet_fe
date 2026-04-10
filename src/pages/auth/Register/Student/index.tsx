import React, { useState } from 'react';
import { Form, Input, Button, Steps, Select, message, InputNumber, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, BookOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../../assets/images/Logo.png';
import { useRegisterMutation } from '../../../../services/authApi';
import { setTokens } from '../../../../services/axiosBaseQuery';

const { Option } = Select;
const { Title, Text } = Typography;

const RegisterStudent: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [register, { isLoading }] = useRegisterMutation();

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
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-[#0f2b39] via-[#10607a] to-[#00B1F5] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(48,194,236,0.35),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(0,177,245,0.35),transparent_40%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.2),transparent_45%)]"></div>
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-[#30C2EC] rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#00B1F5] rounded-full opacity-20 translate-y-1/2 -translate-x-1/2 blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white rounded-full opacity-10 blur-3xl animate-pulse delay-500"></div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] border border-white/15 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-white/25 rounded-full"></div>

        <div className="absolute top-20 left-20 w-4 h-4 bg-[#30C2EC] rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-[#00B1F5] rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 left-16 w-2 h-2 bg-white rounded-full animate-bounce delay-500"></div>

        <div className="z-10 text-center p-10 xl:p-14 max-w-2xl">
          <div className="mb-7 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#30C2EC] to-[#00B1F5] rounded-full blur-2xl opacity-45 animate-pulse"></div>
            <img src={Logo} alt="EduNet" className="w-24 h-24 rounded-2xl shadow-2xl relative z-10 border-4 border-white/30 bg-white/10" />
          </div>
          <Title level={2} className="!text-white !mb-4 !text-4xl xl:!text-5xl !font-bold !leading-tight">
            Đăng ký <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-white">Học viên</span>
          </Title>
          <p className="text-blue-50 text-lg xl:text-xl mb-9">
            Bắt đầu hành trình học tập ngay hôm nay. Truy cập hàng nghìn khóa học từ giảng viên chuyên gia.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-2 md:p-4 lg:p-5 xl:p-6 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-9 rounded-2xl lg:rounded-[2rem] shadow-[0_18px_60px_rgba(0,177,245,0.16)] border border-[#30C2EC]/25">
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