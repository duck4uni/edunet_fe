// Admin Forgot Password Page
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Steps, Result } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks';
import { useRouteSeo } from '../../../hooks/useRouteSeo';

const { Title, Text, Paragraph } = Typography;
const MIN_ADMIN_WIDTH = 1024;

interface ForgotPasswordForm {
  email: string;
}

interface VerifyCodeForm {
  code: string;
}

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const AdminForgotPassword: React.FC = () => {
  useRouteSeo();

  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [isDesktop, setIsDesktop] = useState(
    typeof window === 'undefined' ? true : window.innerWidth >= MIN_ADMIN_WIDTH,
  );
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, loading } = useAdminAuth();

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= MIN_ADMIN_WIDTH);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const steps = [
    { title: 'Nhập Email', icon: <MailOutlined /> },
    { title: 'Xác minh', icon: <SafetyOutlined /> },
    { title: 'Đặt lại mật khẩu', icon: <LockOutlined /> },
  ];

  const handleEmailSubmit = async (values: ForgotPasswordForm) => {
    const result = await forgotPassword({ email: values.email });
    if (result.success) {
      setEmail(values.email);
      setCurrentStep(1);
      form.resetFields();
    }
  };

  const handleCodeSubmit = async (values: VerifyCodeForm) => {
    // Simulate code verification
    if (values.code === '123456') {
      setCurrentStep(2);
      form.resetFields();
    } else {
      form.setFields([{
        name: 'code',
        errors: ['Mã xác nhận không đúng!'],
      }]);
    }
  };

  const handleResetPassword = async (values: ResetPasswordForm) => {
    const result = await resetPassword({
      token: 'mock-token',
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
    if (result.success) {
      setCurrentStep(3);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            name="forgot_password_email"
            onFinish={handleEmailSubmit}
            layout="vertical"
            size="large"
          >
            <Paragraph className="text-gray-500 mb-6">
              Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
            </Paragraph>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item className="mb-0">
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
                }}
              >
                Gửi mã xác nhận
              </Button>
            </Form.Item>
          </Form>
        );

      case 1:
        return (
          <Form
            form={form}
            name="forgot_password_verify"
            onFinish={handleCodeSubmit}
            layout="vertical"
            size="large"
          >
            <Paragraph className="text-gray-500 mb-2">
              Chúng tôi đã gửi mã xác nhận đến
            </Paragraph>
            <Paragraph strong className="mb-6">
              {email}
            </Paragraph>

            <Form.Item
              name="code"
              rules={[
                { required: true, message: 'Vui lòng nhập mã xác nhận!' },
                { len: 6, message: 'Mã xác nhận gồm 6 ký tự!' },
              ]}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                placeholder="Mã xác nhận (6 số)"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </Form.Item>

            <div className="text-center mb-4">
              <Text type="secondary" className="text-sm">
                Không nhận được mã?{' '}
                <Button 
                  type="link" 
                  className="p-0"
                  onClick={() => handleEmailSubmit({ email })}
                  loading={loading}
                >
                  Gửi lại
                </Button>
              </Text>
            </div>

            <Form.Item className="mb-0">
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
                }}
              >
                Xác nhận
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Paragraph type="secondary" className="text-xs mb-0">
                Demo: Nhập mã <Text code>123456</Text> để tiếp tục
              </Paragraph>
            </div>
          </Form>
        );

      case 2:
        return (
          <Form
            form={form}
            name="reset_password"
            onFinish={handleResetPassword}
            layout="vertical"
            size="large"
          >
            <Paragraph className="text-gray-500 mb-6">
              Tạo mật khẩu mới cho tài khoản của bạn.
            </Paragraph>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Mật khẩu mới"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Xác nhận mật khẩu"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item className="mb-0">
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
                }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        );

      case 3:
        return (
          <Result
            status="success"
            title="Đặt lại mật khẩu thành công!"
            subTitle="Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ."
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate('/admin/login')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Đăng nhập
              </Button>,
            ]}
          />
        );

      default:
        return null;
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
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <Title level={3} className="mb-1">
            Quên mật khẩu
          </Title>
        </div>

        {/* Steps */}
        {currentStep < 3 && (
          <Steps
            current={currentStep}
            items={steps}
            size="small"
            className="mb-8"
          />
        )}

        {/* Form Content */}
        {renderStepContent()}

        {/* Back to Login */}
        {currentStep < 3 && (
          <div className="text-center mt-6">
            <Link to="/admin/login" className="text-gray-500 hover:text-gray-700 text-sm">
              <ArrowLeftOutlined className="mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminForgotPassword;
