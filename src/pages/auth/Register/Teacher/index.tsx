import React, { useState } from 'react';
import { Form, Input, Button, Steps, message, InputNumber, Upload, Typography } from 'antd';
import type { UploadFile, RcFile } from 'antd/es/upload';
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  BookOutlined,
  MailOutlined,
  FilePdfOutlined,
  HourglassOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Logo from '../../../../assets/images/Logo.png';
import { useRegisterTeacherMutation } from '../../../../services/authApi';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const RegisterTeacher: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [cvFile, setCvFile] = useState<RcFile | null>(null);
  const [registerTeacher, { isLoading }] = useRegisterTeacherMutation();

  const onFinish = async (values: Record<string, unknown>) => {
    const newData = { ...formData, ...values };
    setFormData(newData);

    if (current < 2) {
      setCurrent(current + 1);
      return;
    }

    // Step 3: submit via FormData
    if (!cvFile) {
      message.error('Vui lòng tải lên CV dạng PDF!');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('firstName', (newData.firstName as string) || '');
      fd.append('lastName', (newData.lastName as string) || '');
      fd.append('email', (newData.email as string) || '');
      fd.append('password', (newData.password as string) || '');
      if (newData.phone) fd.append('phone', newData.phone as string);
      if (newData.bio) fd.append('bio', newData.bio as string);
      if (newData.qualification) fd.append('qualification', newData.qualification as string);
      if (newData.experience != null) fd.append('experience', String(newData.experience));
      fd.append('cv', cvFile);

      await registerTeacher(fd).unwrap();
      setCurrent(3); // success step
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string; errors?: Record<string, string> } })?.data;
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (typeof errorData?.message === 'string') {
        errorMessage = errorData.message;
      } else if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).join('. ');
      }
      message.error(errorMessage);
    }
  };

  const beforeCvUpload = (file: RcFile) => {
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      message.error('Chỉ chấp nhận file PDF!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File không được vượt quá 5MB!');
      return Upload.LIST_IGNORE;
    }
    setCvFile(file);
    return false; // prevent auto-upload
  };

  const steps = [
    {
      title: 'Tài khoản',
      content: (
        <>
          <Form.Item
            name="email"
            label="Email"
            className="!mb-3"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Nhập email của bạn" className="!rounded-lg !h-9" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            className="!mb-3"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Tạo mật khẩu" className="!rounded-lg !h-9" />
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
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Xác nhận mật khẩu" className="!rounded-lg !h-9" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Cá nhân',
      content: (
        <>
          <div className="flex gap-3">
            <Form.Item
              name="firstName"
              label="Tên"
              className="!mb-3 flex-1"
              rules={[{ required: true, message: 'Nhập tên!' }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Tên" className="!rounded-lg !h-9" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Họ"
              className="!mb-3 flex-1"
              rules={[{ required: true, message: 'Nhập họ!' }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Họ" className="!rounded-lg !h-9" />
            </Form.Item>
          </div>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            className="!mb-3"
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Số điện thoại (tùy chọn)" className="!rounded-lg !h-9" />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Giới thiệu bản thân"
            className="!mb-0"
          >
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về bản thân bạn..." className="!rounded-lg" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Chuyên môn & CV',
      content: (
        <>
          <Form.Item
            name="qualification"
            label="Bằng cấp / Học vị"
            className="!mb-3"
            rules={[{ required: true, message: 'Vui lòng nhập bằng cấp!' }]}
          >
            <Input
              prefix={<BookOutlined className="text-gray-400" />}
              placeholder="VD: Thạc sĩ CNTT, Cử nhân Toán học..."
              className="!rounded-lg !h-9"
            />
          </Form.Item>
          <Form.Item
            name="experience"
            label="Số năm kinh nghiệm"
            className="!mb-3"
            rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' }]}
          >
            <InputNumber
              min={0}
              max={50}
              placeholder="0"
              className="!w-full !rounded-lg"
              addonAfter="năm"
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                CV <span className="text-red-500">*</span>{' '}
                <Text className="text-gray-400 text-xs font-normal">(Bắt buộc — PDF, tối đa 5MB)</Text>
              </span>
            }
            className="!mb-0"
            required
          >
            <Dragger
              accept=".pdf"
              beforeUpload={beforeCvUpload}
              maxCount={1}
              onRemove={() => setCvFile(null)}
              fileList={cvFile ? [{ uid: '-1', name: cvFile.name, status: 'done' } as UploadFile] : []}
              showUploadList={{ showRemoveIcon: true }}
            >
              <p className="ant-upload-drag-icon">
                <FilePdfOutlined className="text-3xl text-red-400" />
              </p>
              <p className="ant-upload-text text-sm">Kéo thả hoặc click để chọn file CV</p>
              <p className="ant-upload-hint text-xs text-gray-400">Chỉ chấp nhận PDF — tối đa 5MB</p>
            </Dragger>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Hoàn thành',
      content: (
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HourglassOutlined className="text-5xl text-orange-500" />
          </div>
          <Title level={3} className="!text-orange-600 !mb-2">Đơn đăng ký đã được gửi!</Title>
          <Text className="text-gray-500 block mb-2 max-w-sm mx-auto">
            Chúng tôi đã nhận được thông tin và CV của bạn.
          </Text>
          <Text className="text-gray-500 block mb-6 max-w-sm mx-auto">
            Admin sẽ xém xét và phê duyệt tài khoản giảng viên của bạn trong thời gian sớm nhất.
            Bạn có thể đăng nhập sau khi được phê duyệt.
          </Text>
          <Link to="/auth/login">
            <Button
              type="primary"
              size="large"
              className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg !px-8"
            >
              Về trang đăng nhập
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#012643] via-[#01385f] to-[#012643] items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#17EAD9] rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#6078EA] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2 blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#e5698e] rounded-full opacity-10 blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full"></div>
        <div className="absolute top-20 left-20 w-4 h-4 bg-[#17EAD9] rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-[#6078EA] rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 left-16 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-500"></div>
        <div className="z-10 text-center p-8 max-w-lg">
          <div className="mb-5 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#17EAD9] to-[#6078EA] rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <img src={Logo} alt="EduNet" className="w-20 h-20 rounded-2xl shadow-2xl relative z-10 border-4 border-white/10" />
          </div>
          <Title level={2} className="!text-white !mb-3 !text-3xl !font-bold">
            Trở thành{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17EAD9] to-[#6078EA]">
              Giảng viên
            </span>
          </Title>
          <p className="text-blue-200 text-base mb-6">
            Chia sẻ kiến thức với hàng nghìn học viên. Tài khoản sẽ được kích hoạt sau khi admin xét duyệt CV của bạn.
          </p>
          {/* <div className="space-y-3 text-left">
            {[
              'Điền thông tin tài khoản & cá nhân',
              'Upload CV dạng PDF (bắt buộc)',
              'Chờ admin xét duyệt',
              'Đăng nhập và bắt đầu dạy học',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-xl bg-white p-5 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-3 lg:hidden">
            <img src={Logo} alt="EduNet" className="w-12 h-12 rounded-full mb-2 mx-auto" />
            <Title level={4} className="!text-[#012643] !mb-0">EduNet</Title>
          </div>

          <div className="mb-3">
            <Title level={3} className="!text-[#012643] !mb-1">Đăng ký giảng viên</Title>
            <Text className="text-gray-500">
              Hoàn thành 3 bước để gửi đơn đăng ký. Tài khoản cần được admin phê duyệt trước khi sử dụng.
            </Text>
          </div>

          <Steps
            current={current}
            className="mb-4"
            size="small"
            items={steps.map(s => ({ title: s.title }))}
          />

          <Form
            form={form}
            name="register-teacher"
            onFinish={onFinish}
            layout="vertical"
            initialValues={formData}
          >
            <div className="min-h-[200px]">
              {steps[current].content}
            </div>

            {current < 3 && (
              <div className="flex justify-between mt-3 gap-4">
                {current > 0 ? (
                  <Button onClick={() => setCurrent(current - 1)} className="!rounded-lg">
                    Quay lại
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={current === 2 && isLoading}
                  className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg !px-8"
                >
                  {current === 2 ? 'Gửi đơn đăng ký' : 'Tiếp tục'}
                </Button>
              </div>
            )}
          </Form>

          <div className="text-center mt-3 pt-3 border-t border-gray-100">
            <Text className="text-gray-500 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/auth/login" className="text-[#e5698e] font-medium hover:underline">
                Đăng nhập
              </Link>
            </Text>
          </div>

          <div className="text-center mt-1">
            <a
              href="mailto:support@edunet.com"
              className="inline-flex items-center gap-2 text-gray-500 text-xs hover:text-[#012643] transition-colors"
            >
              <InboxOutlined /> Cần giúp đỡ? Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTeacher;