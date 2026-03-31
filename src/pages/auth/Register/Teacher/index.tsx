import React, { useState } from 'react';
import { Form, Input, Button, Steps, Select, message, InputNumber, Upload, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, BookOutlined, UploadOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Logo from '../../../../assets/images/Logo.png';

const { Option } = Select;
const { Title, Text } = Typography;

const RegisterTeacher: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<any>({});
  const [fileList, setFileList] = useState<any[]>([]);

  const onFinish = async (values: any) => {
    const newData = { ...formData, ...values };
    setFormData(newData);
    
    if (current < 2) {
      setCurrent(current + 1);
    } else {
      console.log('Final Data:', newData);
      console.log('CV File:', fileList);
      
      if (fileList.length === 0) {
        message.error('Vui lòng tải lên CV của bạn!');
        return;
      }

      message.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      setCurrent(current + 1);
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
            <InputNumber placeholder="Nhập tuổi" size="large" className="!w-full !rounded-lg" min={18} max={100} />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Chuyên môn',
      content: (
        <>
          <Form.Item
            name="major"
            label="Lĩnh vực chuyên môn"
            rules={[{ required: true, message: 'Vui lòng nhập lĩnh vực chuyên môn!' }]}
          >
            <Input prefix={<BookOutlined className="text-gray-400" />} placeholder="VD: Lập trình Web, Khoa học dữ liệu" className="!rounded-lg" size="large" />
          </Form.Item>
          <Form.Item
            name="degree"
            label="Bằng cấp cao nhất"
            initialValue="University"
            rules={[{ required: true, message: 'Vui lòng chọn bằng cấp!' }]}
          >
            <Select size="large" placeholder="Chọn bằng cấp cao nhất" className="!rounded-lg">
              <Option value="Bachelor">Cử nhân</Option>
              <Option value="Master">Thạc sĩ</Option>
              <Option value="PhD">Tiến sĩ</Option>
              <Option value="Other">Chứng chỉ chuyên môn khác</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Tải lên CV/Hồ sơ" required>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              className="upload-cv"
            >
              {fileList.length < 1 && (
                <div className="text-center">
                  <UploadOutlined className="text-2xl text-gray-400" />
                  <div className="mt-2 text-gray-500">Tải lên CV</div>
                </div>
              )}
            </Upload>
            <Text className="text-gray-400 text-xs">Định dạng PDF, DOC hoặc ảnh (Tối đa 5MB)</Text>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Hoàn thành',
      content: (
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleOutlined className="text-5xl text-green-500" />
          </div>
          <Title level={3} className="!text-green-600 !mb-2">Đơn đăng ký đã được gửi!</Title>
          <Text className="text-gray-500 block mb-6 max-w-sm mx-auto">
            Cảm ơn bạn đã đăng ký làm giảng viên. Đội ngũ của chúng tôi sẽ xem xét và liên hệ bạn trong vòng 5-7 ngày làm việc.
          </Text>
          <Link to="/auth/login">
            <Button type="primary" size="large" className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg !px-8">
              Đi đến đăng nhập
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#012643] items-center justify-center relative overflow-hidden">
        <div className="z-10 text-center p-12">
          <img src={Logo} alt="EduNet" className="w-28 h-28 rounded-full mb-6 mx-auto shadow-lg" />
          <Title level={2} className="!text-white !mb-4">Trở thành giảng viên</Title>
          <Text className="text-blue-200 text-base block max-w-sm mx-auto">
            Chia sẻ kiến thức với hàng nghìn học viên. Tham gia cộng đồng giảng viên chuyên gia của chúng tôi.
          </Text>
        </div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#6078EA] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#17EAD9] rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-6 lg:hidden">
             <img src={Logo} alt="EduNet" className="w-14 h-14 rounded-full mb-2 mx-auto" />
             <Title level={3} className="!text-[#012643] !mb-0">EduNet</Title>
          </div>

          <div className="mb-6">
            <Title level={3} className="!text-[#012643] !mb-1">Đăng ký giảng viên</Title>
            <Text className="text-gray-500">Hoàn thành các bước dưới đây để đăng ký làm giảng viên.</Text>
          </div>

          <Steps current={current} className="mb-8" size="small" items={steps.map(s => ({ title: s.title }))} />

          <Form
            form={form}
            name="register-teacher"
            onFinish={onFinish}
            layout="vertical"
            initialValues={formData}
            size="large"
          >
            <div className="min-h-[280px]">
              {steps[current].content}
            </div>

            {current < 3 && (
              <div className="flex justify-between mt-6 gap-4">
                {current > 0 && (
                  <Button onClick={() => setCurrent(current - 1)} size="large" className="!rounded-lg">
                    Quay lại
                  </Button>
                )}
                {current === 0 && <div></div>}
                
                <Button type="primary" htmlType="submit" size="large" className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-lg !px-8">
                  {current === 2 ? 'Gửi đơn đăng ký' : 'Tiếp tục'}
                </Button>
              </div>
            )}
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

export default RegisterTeacher;