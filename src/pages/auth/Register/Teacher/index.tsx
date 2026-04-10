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
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Nhập email của bạn" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            className="!mb-4"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
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
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
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
          <div className="flex gap-4">
            <Form.Item
              name="firstName"
              label="Tên"
              className="!mb-4 flex-1"
              rules={[{ required: true, message: 'Nhập tên!' }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Tên" className="!rounded-lg !h-11 !text-base" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Họ"
              className="!mb-4 flex-1"
              rules={[{ required: true, message: 'Nhập họ!' }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Họ" className="!rounded-lg !h-11 !text-base" />
            </Form.Item>
          </div>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            className="!mb-4"
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Số điện thoại (tùy chọn)" className="!rounded-lg !h-11 !text-base" />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Giới thiệu bản thân"
            className="!mb-0"
          >
            <Input.TextArea rows={4} placeholder="Mô tả ngắn về bản thân bạn..." className="!rounded-lg !text-base" />
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
            className="!mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập bằng cấp!' }]}
          >
            <Input
              prefix={<BookOutlined className="text-gray-400" />}
              placeholder="VD: Thạc sĩ CNTT, Cử nhân Toán học..."
              className="!rounded-lg !h-11 !text-base"
            />
          </Form.Item>
          <Form.Item
            name="experience"
            label="Số năm kinh nghiệm"
            className="!mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' }]}
          >
            <InputNumber
              min={0}
              max={50}
              placeholder="0"
              className="!w-full !rounded-lg !h-11"
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
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HourglassOutlined className="text-5xl text-[#00B1F5]" />
          </div>
          <Title level={3} className="!text-[#0c4055] !mb-2">Đơn đăng ký đã được gửi!</Title>
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
              className="!bg-gradient-to-r !from-[#30C2EC] !to-[#00B1F5] !border-none !rounded-lg !px-8"
            >
              Về trang đăng nhập
            </Button>
          </Link>
        </div>
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
            Trở thành{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-white">
              Giảng viên
            </span>
          </Title>
          <p className="text-blue-50 text-lg xl:text-xl mb-9">
            Chia sẻ kiến thức với hàng nghìn học viên. Tài khoản sẽ được kích hoạt sau khi admin xét duyệt CV của bạn.
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
            <Title level={2} className="!text-[#0c4055] !mb-1 !text-3xl !font-bold">Đăng ký giảng viên</Title>
            <Text className="text-gray-600 text-base">
              Hoàn thành 3 bước để gửi đơn đăng ký. Tài khoản cần được admin phê duyệt trước khi sử dụng.
            </Text>
          </div>

          <Steps
            current={current}
            className="mb-6"
            size="small"
            items={steps.map(s => ({ title: s.title }))}
          />

          <Form
            form={form}
            name="register-teacher"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={formData}
          >
            <div className="min-h-[240px]">
              {steps[current].content}
            </div>

            {current < 3 && (
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
                  loading={current === 2 && isLoading}
                  className="!bg-gradient-to-r !from-[#30C2EC] !to-[#00B1F5] !border-none !rounded-lg !px-8 !h-11 !font-semibold"
                >
                  {current === 2 ? 'Gửi đơn đăng ký' : 'Tiếp tục'}
                </Button>
              </div>
            )}
          </Form>

          <div className="text-center mt-5 pt-4 border-t border-gray-100">
            <Text className="text-gray-500 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/auth/login" className="text-[#00B1F5] font-semibold hover:text-[#0898cc]">
                Đăng nhập
              </Link>
            </Text>
          </div>

          <div className="text-center mt-2">
            <a
              href="mailto:support@edunet.com"
              className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-[#00B1F5] transition-colors"
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