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
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập email của bạn" className="!rounded-lg" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Tạo mật khẩu" className="!rounded-lg" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
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
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Xác nhận mật khẩu" className="!rounded-lg" size="large" />
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
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập họ tên đầy đủ" className="!rounded-lg" size="large" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Nhập số điện thoại" className="!rounded-lg" size="large" />
          </Form.Item>
          <Form.Item
            name="age"
            label="Tuổi"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}
          >
            <InputNumber placeholder="Nhập tuổi" size="large" className="!w-full !rounded-lg" min={1} max={100} />
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
            rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành!' }]}
          >
            <Input prefix={<BookOutlined className="text-gray-400" />} placeholder="VD: Khoa học máy tính" className="!rounded-lg" size="large" />
          </Form.Item>
          <Form.Item
            name="degree"
            label="Trình độ học vấn"
            initialValue="University"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
          >
            <Select size="large" placeholder="Chọn trình độ học vấn" className="!rounded-lg">
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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#012643] items-center justify-center relative overflow-hidden">
        <div className="z-10 text-center p-12">
          <img src={Logo} alt="EduNet" className="w-28 h-28 rounded-full mb-6 mx-auto shadow-lg" />
          <Title level={2} className="!text-white !mb-4">Đăng ký học viên</Title>
          <Text className="text-blue-200 text-base block max-w-sm mx-auto">
            Bắt đầu hành trình học tập ngay hôm nay. Truy cập hàng nghìn khóa học từ giảng viên chuyên gia.
          </Text>
        </div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#17EAD9] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#e5698e] rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-6 lg:hidden">
             <img src={Logo} alt="EduNet" className="w-14 h-14 rounded-full mb-2 mx-auto" />
             <Title level={3} className="!text-[#012643] !mb-0">EduNet</Title>
          </div>

          <div className="mb-6">
            <Title level={3} className="!text-[#012643] !mb-1">Đăng ký học viên</Title>
            <Text className="text-gray-500">Hoàn thành các bước dưới đây để tạo tài khoản.</Text>
          </div>

          <Steps current={current} className="mb-8" size="small" items={steps.map(s => ({ title: s.title }))} />

          <Form
            form={form}
            name="register-student"
            onFinish={onFinish}
            layout="vertical"
            initialValues={formData}
            size="large"
          >
            <div className="min-h-[240px]">
              {steps[current].content}
            </div>

            <div className="flex justify-between mt-6 gap-4">
              {current > 0 && (
                <Button onClick={() => setCurrent(current - 1)} size="large" className="!rounded-lg">
                  Quay lại
                </Button>
              )}
              {current === 0 && <div></div>}
              
              <Button type="primary" htmlType="submit" size="large" loading={isLoading} className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg !px-8">
                {current === 2 ? 'Tạo tài khoản' : 'Tiếp tục'}
              </Button>
            </div>
          </Form>

          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <Text className="text-gray-500">
              Đã có tài khoản? 
              <Link to="/auth/login" className="text-[#e5698e] ml-1 font-medium hover:underline">Đăng nhập</Link>
            </Text>
          </div>

          <div className="text-center mt-4">
             <a href="mailto:support@edunet.com" className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-[#012643] transition-colors">
                <MailOutlined /> Cần giúp đỡ? Liên hệ hỗ trợ
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;