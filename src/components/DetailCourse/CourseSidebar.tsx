import React, { useState } from 'react';
import { Button, Image, Tag, Modal, Form, Input, Select, message, Tooltip, Typography, Avatar, Spin } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, FacebookOutlined, TwitterOutlined, YoutubeOutlined, InstagramOutlined, FlagOutlined, HeartOutlined, HeartFilled, ShareAltOutlined, SafetyCertificateOutlined, CheckCircleOutlined, ExclamationCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { useCheckEnrollmentQuery, useEnrollMeMutation } from '../../services/courseApi';
import { getAccessToken } from '../../services/axiosBaseQuery';
import type { Course } from '../../models/course';

const { TextArea } = Input;
const { Text } = Typography;

interface CourseSidebarProps {
  course: Course;
}

const COURSE_REPORT_REASONS = [
  'Nội dung khóa học gây hiểu lầm',
  'Nội dung không phù hợp',
  'Vi phạm bản quyền',
  'Chất lượng kém hoặc lỗi thời',
  'Giảng viên không phản hồi',
  'Lỗi kỹ thuật',
  'Khác',
];

const CourseSidebar: React.FC<CourseSidebarProps> = ({ course }) => {
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm] = Form.useForm();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isLoggedIn = !!getAccessToken();
  const courseId = String(course.id);

  const { data: enrollmentCheck, isLoading: isCheckingEnrollment } = useCheckEnrollmentQuery(courseId, {
    skip: !isLoggedIn || !courseId,
  });
  const [enrollMe, { isLoading: isEnrolling }] = useEnrollMeMutation();

  const isEnrolled = enrollmentCheck?.data?.enrolled ?? false;

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      message.info('Vui lòng đăng nhập để đăng ký khóa học');
      navigate('/auth/login');
      return;
    }
    try {
      await enrollMe(courseId).unwrap();
      message.success('Đăng ký khóa học thành công!');
    } catch (err: any) {
      const msg = err?.data?.message || 'Đăng ký khóa học thất bại';
      message.error(msg);
    }
  };

  const handleGoToCourse = () => {
    navigate(`/my-course/detail/${courseId}`);
  };

  const handleReportCourse = (values: any) => {
    console.log('Course report submitted:', values);
    message.success('Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
    setReportModalOpen(false);
    reportForm.resetFields();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
      {/* Course Preview Image */}
      <div className="rounded-xl overflow-hidden mb-6 relative group">
        <Image
          src={course.image}
          alt="Course"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <Button type="primary" shape="round" 
            className="opacity-0 group-hover:opacity-100 transition-opacity !bg-white !text-[#012643] !border-none"
          >
            Xem trước
          </Button>
        </div>
        
        {/* Wishlist & Share Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Tooltip title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}>
            <Button 
              shape="circle" 
              icon={isWishlisted ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="!bg-white/90 hover:!bg-white !border-none shadow-md"
            />
          </Tooltip>
          <Tooltip title="Chia sẻ">
            <Button 
              shape="circle" 
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              className="!bg-white/90 hover:!bg-white !border-none shadow-md"
            />
          </Tooltip>
        </div>
      </div>

      {/* Price Section */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl font-bold text-[#e5698e]">
            {course.discountPrice ? formatCurrency(course.discountPrice) : formatCurrency(course.price)}
          </span>
          {course.discountPrice && (
            <Tag color="red" className="!rounded-full !text-sm">-38%</Tag>
          )}
        </div>
        {course.discountPrice && (
          <span className="text-gray-400 line-through text-lg">
            {formatCurrency(course.price)}
          </span>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 mb-6">
        {isCheckingEnrollment ? (
          <div className="flex justify-center py-4"><Spin /></div>
        ) : isEnrolled ? (
          <>
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<BookOutlined />}
              onClick={handleGoToCourse}
              className="!h-14 !text-lg !font-semibold !bg-[#17EAD9] !border-[#17EAD9] hover:!bg-[#12c5b5] !rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Vào học ngay
            </Button>
            <Text className="block text-center text-green-600 text-sm">
              <CheckCircleOutlined className="mr-1" />
              Bạn đã đăng ký khóa học này
            </Text>
          </>
        ) : (
          <>
            <Button 
              type="primary" 
              size="large" 
              block 
              loading={isEnrolling}
              onClick={handleEnroll}
              className="!h-14 !text-lg !font-semibold !bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Đăng ký ngay
            </Button>
          </>
        )}
      </div>

      {/* Money Back Guarantee */}
      <div className="bg-green-50 p-3 rounded-xl mb-6 flex items-center gap-3">
        <SafetyCertificateOutlined className="text-green-500 text-xl" />
        <Text className="text-green-700 text-sm">Đảm bảo hoàn tiền trong 30 ngày</Text>
      </div>

      {/* Course Info */}
      <div className="space-y-4 mb-6">
        <h4 className="font-bold text-[#012643]">Khóa học bao gồm:</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-[#17EAD9]" />
            <span>{course.duration || '12h 30m'} video theo yêu cầu</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-[#17EAD9]" />
            <span>{course.lessons} bài học</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-[#17EAD9]" />
            <span>Tài liệu tải xuống</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-[#17EAD9]" />
            <span>Chứng chỉ hoàn thành</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-[#17EAD9]" />
            <span>Truy cập trọn đời</span>
          </div>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center gap-2">
            <ClockCircleOutlined className="text-[#e5698e]" /> Giờ bắt đầu
          </span>
          <span className="font-semibold text-[#012643]">{course.time?.startDisplay}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center gap-2">
            <CalendarOutlined className="text-[#e5698e]" /> Lịch học
          </span>
          <div className="flex gap-1">
            {course.schedule?.map(day => (
              <Tag key={day} color="blue" className="!rounded-full">{day}</Tag>
            ))}
          </div>
        </div>
      </div>

      {/* Instructor Preview */}
      <div className="p-4 bg-gray-50 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <Avatar src={course.teacher?.avatar} size={48} />
          <div>
            <Text className="font-semibold text-[#012643] block">{course.teacher?.name}</Text>
            <Text className="text-gray-500 text-sm">Giảng viên</Text>
          </div>
        </div>
      </div>

      {/* Report Course Button */}
      <Button 
        type="text" 
        icon={<FlagOutlined />}
        onClick={() => setReportModalOpen(true)}
        className="!text-gray-400 hover:!text-red-500 w-full"
      >
        Báo cáo khóa học
      </Button>

      {/* Social Share */}
      <div className="flex justify-center gap-3 pt-6 border-t border-gray-100 mt-4">
        <Tooltip title="Chia sẻ trên Facebook">
          <Button shape="circle" icon={<FacebookOutlined />} className="!text-blue-600 !border-blue-100 hover:!bg-blue-50" />
        </Tooltip>
        <Tooltip title="Chia sẻ trên Twitter">
          <Button shape="circle" icon={<TwitterOutlined />} className="!text-sky-500 !border-sky-100 hover:!bg-sky-50" />
        </Tooltip>
        <Tooltip title="Chia sẻ trên YouTube">
          <Button shape="circle" icon={<YoutubeOutlined />} className="!text-red-600 !border-red-100 hover:!bg-red-50" />
        </Tooltip>
        <Tooltip title="Chia sẻ trên Instagram">
          <Button shape="circle" icon={<InstagramOutlined />} className="!text-pink-600 !border-pink-100 hover:!bg-pink-50" />
        </Tooltip>
      </div>

      {/* Report Course Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-500">
            <ExclamationCircleOutlined />
            <span>Báo cáo khóa học</span>
          </div>
        }
        open={reportModalOpen}
        onCancel={() => {
          setReportModalOpen(false);
          reportForm.resetFields();
        }}
        footer={null}
      >
        <Form form={reportForm} onFinish={handleReportCourse} layout="vertical">
          <p className="text-gray-500 mb-4">
            Giúp chúng tôi duy trì nội dung chất lượng. Vui lòng cho biết vấn đề của khóa học này.
          </p>
          
          <Form.Item 
            name="reason" 
            label="Lý do báo cáo"
            rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
          >
            <Select placeholder="Chọn lý do">
              {COURSE_REPORT_REASONS.map(reason => (
                <Select.Option key={reason} value={reason}>{reason}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="details" 
            label="Chi tiết bổ sung"
            rules={[{ required: true, message: 'Vui lòng mô tả chi tiết' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Vui lòng mô tả vấn đề chi tiết. Nêu ví dụ cụ thể nếu có..."
            />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="Email của bạn (để theo dõi)"
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          
          <div className="flex justify-end gap-3">
            <Button onClick={() => setReportModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" danger>
              Gửi báo cáo
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseSidebar;
