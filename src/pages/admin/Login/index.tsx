// Admin Login Page
import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, Divider, Result } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks';

const { Title, Text, Paragraph } = Typography;
const MIN_ADMIN_WIDTH = 1024;

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface LocationState {
  from?: Location;
}

const AdminLogin: React.FC = () => {
  const [form] = Form.useForm();
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window === 'undefined' ? true : window.innerWidth >= MIN_ADMIN_WIDTH,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAdminAuth();
  
  const from = (location.state as LocationState)?.from?.pathname || '/admin';

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= MIN_ADMIN_WIDTH);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onFinish = async (values: LoginForm) => {
    const result = await login({
      email: values.email,
      password: values.password,
      remember: values.remember,
    });

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Result
          status="warning"
          title="Khu vực Admin chỉ hỗ trợ màn hình từ 1024px"
          subTitle="Vui lòng dùng laptop hoặc desktop để truy cập trang quản trị."
          extra={
            <Link to="/">
              <Button type="primary">Về trang chủ</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      <Card
        className="w-full max-w-md relative z-10 shadow-2xl"
        style={{ borderRadius: '16px' }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <Title level={2} className="mb-2">
            Trang quản trị
          </Title>
          <Text type="secondary">
            Đăng nhập để quản lý hệ thống Academix
          </Text>
        </div>

        <Form
          form={form}
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link 
                to="/admin/forgot-password" 
                className="text-blue-500 hover:text-blue-600"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary" className="text-xs">
            Lưu ý phân quyền
          </Text>
        </Divider>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Paragraph className="mb-0 text-sm">
            Chỉ tài khoản có vai trò <Text strong>admin</Text> mới được truy cập trang quản trị.
          </Paragraph>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Quay lại trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
