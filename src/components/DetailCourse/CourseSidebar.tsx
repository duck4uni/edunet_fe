import React, { useMemo, useState } from 'react';
import { Button, Image, Tag, Modal, Form, Input, Select, message, Tooltip, Typography, Avatar, Spin } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, FacebookOutlined, TwitterOutlined, YoutubeOutlined, InstagramOutlined, FlagOutlined, HeartOutlined, HeartFilled, ShareAltOutlined, SafetyCertificateOutlined, CheckCircleOutlined, ExclamationCircleOutlined, BookOutlined, HourglassOutlined, StarFilled, TeamOutlined, BarChartOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import { useCheckEnrollmentQuery, useEnrollMeMutation } from '../../services/courseApi';
import { getAccessToken } from '../../services/axiosBaseQuery';
import type { Course } from '../../models/course';

const { TextArea } = Input;
const { Text } = Typography;

interface CourseSidebarProps {
  course: Course;
}

interface CourseReportFormValues {
  reason: string;
  details: string;
  email?: string;
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
  const [reportForm] = Form.useForm<CourseReportFormValues>();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isLoggedIn = !!getAccessToken();
  const courseId = String(course.id);

  const { data: enrollmentCheck, isLoading: isCheckingEnrollment } = useCheckEnrollmentQuery(courseId, {
    skip: !isLoggedIn || !courseId,
  });
  const [enrollMe, { isLoading: isEnrolling }] = useEnrollMeMutation();

  const isEnrolled = enrollmentCheck?.data?.enrolled ?? false;
  const isPending = enrollmentCheck?.data?.isPending ?? false;
  const hasDiscount = useMemo(
    () =>
      typeof course.discountPrice === 'number' &&
      course.discountPrice > 0 &&
      course.discountPrice < course.price,
    [course.discountPrice, course.price],
  );
  const discountPercent = useMemo(() => {
    if (!hasDiscount || typeof course.discountPrice !== 'number' || course.price <= 0) {
      return null;
    }

    return Math.round(((course.price - course.discountPrice) / course.price) * 100);
  }, [hasDiscount, course.discountPrice, course.price]);
  const displayPrice = hasDiscount ? course.discountPrice ?? course.price : course.price;
  const normalizedLevel = (course.level || '').toLowerCase();
  const levelLabel = normalizedLevel === 'beginner'
    ? 'Cơ bản'
    : normalizedLevel === 'intermediate'
      ? 'Trung cấp'
      : normalizedLevel === 'advanced'
        ? 'Nâng cao'
        : 'Mọi cấp độ';
  const detailFacts = [
    {
      key: 'level',
      label: 'Cấp độ',
      value: levelLabel,
      icon: <BarChartOutlined className="text-state-500-primary" />,
    },
    {
      key: 'language',
      label: 'Ngôn ngữ',
      value: course.language || 'Vietnamese',
      icon: <GlobalOutlined className="text-state-500-primary" />,
    },
    {
      key: 'students',
      label: 'Học viên',
      value: formatNumber(course.totalStudents || 0, 'vi-VN'),
      icon: <TeamOutlined className="text-state-500-primary" />,
    },
    {
      key: 'published',
      label: 'Ngày phát hành',
      value: course.publishedAt ? formatDate(course.publishedAt, 'DD/MM/YYYY') : 'Đang cập nhật',
      icon: <CalendarOutlined className="text-state-500-primary" />,
    },
  ];

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

  const handleReportCourse = (values: CourseReportFormValues) => {
    console.log('Course report submitted:', values);
    message.success('Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
    setReportModalOpen(false);
    reportForm.resetFields();
  };

  const handleShare = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        message.warning('Trình duyệt không hỗ trợ sao chép tự động.');
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết!');
    } catch {
      message.error('Không thể sao chép liên kết. Vui lòng thử lại.');
    }
  };

  return (
    <div className="detail-course-sidebar-card">
      <div className="group relative mb-4 overflow-hidden rounded-xl border border-[rgba(48,194,236,0.2)]">
        <Image
          src={course.image}
          alt="Course"
          preview={false}
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Button
            type="default"
            shape="round"
            className="detail-course-secondary-btn opacity-0 transition-all duration-300 group-hover:opacity-100"
          >
            Xem trước
          </Button>
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Tooltip title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}>
            <Button
              shape="circle"
              icon={isWishlisted ? <HeartFilled className="text-state-light-orange" /> : <HeartOutlined />}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="detail-course-icon-fab"
            />
          </Tooltip>
          <Tooltip title="Chia sẻ">
            <Button
              shape="circle"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              className="detail-course-icon-fab"
            />
          </Tooltip>
        </div>
      </div>

      <div className="mb-5 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <span className="text-3xl font-bold text-state-500-secondary">
            {formatCurrency(displayPrice)}
          </span>
          {hasDiscount && discountPercent !== null && (
            <Tag className="detail-course-discount-tag">-{discountPercent}%</Tag>
          )}
        </div>
        {hasDiscount && (
          <span className="text-gray-400 line-through text-lg">
            {formatCurrency(course.price)}
          </span>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500 md:text-sm">
          <span className="inline-flex items-center gap-1">
            <StarFilled className="text-state-light-orange" />
            {(course.rating || 0).toFixed(1)} ({course.totalReviews || 0})
          </span>
          <span className="inline-flex items-center gap-1">
            <TeamOutlined className="text-state-500-primary" />
            {formatNumber(course.totalStudents || 0, 'vi-VN')} học viên
          </span>
        </div>
      </div>

      <div className="mb-5 space-y-2.5">
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
              className="detail-course-primary-btn !h-12 !rounded-xl !text-sm !font-semibold md:!text-base"
            >
              Vào học ngay
            </Button>
            <Text className="block text-center text-state-500-secondary text-sm">
              <CheckCircleOutlined className="mr-1" />
              Bạn đã đăng ký khóa học này
            </Text>
          </>
        ) : isPending ? (
          <>
            <Button
              size="large"
              block
              disabled
              icon={<HourglassOutlined />}
              className="detail-course-pending-btn !h-12 !rounded-xl !text-sm !font-semibold md:!text-base"
            >
              Đang chờ phê duyệt
            </Button>
            <Text className="block text-center text-state-light-orange text-sm">
              <HourglassOutlined className="mr-1" />
              Yêu cầu đăng ký đang chờ giảng viên phê duyệt
            </Text>
          </>
        ) : (
          <Button
            type="primary"
            size="large"
            block
            loading={isEnrolling}
            onClick={handleEnroll}
            className="detail-course-primary-btn !h-12 !rounded-xl !text-sm !font-semibold md:!text-base"
          >
            Đăng ký ngay
          </Button>
        )}
      </div>

      <div className="detail-course-soft-banner mb-5">
        <SafetyCertificateOutlined className="text-state-500-secondary text-xl" />
        <Text className="text-sm text-[var(--primaryColor)]">Đảm bảo hoàn tiền trong 30 ngày</Text>
      </div>

      <div className="mb-5 space-y-3">
        <h4 className="text-base font-bold text-[var(--primaryColor)]">Khóa học bao gồm:</h4>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-state-500-primary" />
            <span>{course.duration || '12h 30m'} video theo yêu cầu</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-state-500-primary" />
            <span>{course.lessons} bài học</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-state-500-primary" />
            <span>Tài liệu tải xuống</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-state-500-primary" />
            <span>Chứng chỉ hoàn thành</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircleOutlined className="text-state-500-primary" />
            <span>Truy cập trọn đời</span>
          </div>
        </div>
      </div>

      <div className="detail-course-surface mb-5 space-y-2.5 p-3.5">
        <h5 className="text-sm font-semibold uppercase tracking-wide text-[var(--primaryColor)]">Thông tin khóa học</h5>
        {detailFacts.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-500">
              {item.icon} {item.label}
            </span>
            <span className="text-right font-semibold text-[var(--primaryColor)]">{item.value}</span>
          </div>
        ))}

        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-gray-500">
            <ClockCircleOutlined className="text-state-500-primary" /> Lịch học
          </span>
          {course.schedule?.length ? (
            <div className="flex flex-wrap justify-end gap-1">
              {course.schedule.map(day => (
                <Tag key={day} className="detail-course-day-tag !m-0">{day}</Tag>
              ))}
            </div>
          ) : (
            <span className="text-right text-sm font-semibold text-[var(--primaryColor)]">Linh hoạt</span>
          )}
        </div>
      </div>

      {course.tags?.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <Tag key={tag} className="detail-course-tag-pill">
              #{tag}
            </Tag>
          ))}
        </div>
      ) : null}

      <div className="detail-course-surface mb-5 p-3.5">
        <div className="flex items-center gap-3">
          <Avatar src={course.teacher?.avatar} size={48} />
          <div>
            <Text className="block font-semibold text-[var(--primaryColor)]">{course.teacher?.name}</Text>
            <Text className="text-gray-500 text-sm">Giảng viên</Text>
          </div>
        </div>
      </div>

      <Button
        type="text"
        icon={<FlagOutlined />}
        onClick={() => setReportModalOpen(true)}
        className="!text-gray-400 hover:!text-red-500 w-full"
      >
        Báo cáo khóa học
      </Button>

      <div className="flex justify-center gap-3 pt-6 border-t border-gray-100 mt-4">
        <Tooltip title="Chia sẻ trên Facebook">
          <Button shape="circle" icon={<FacebookOutlined />} className="detail-course-social-btn" />
        </Tooltip>
        <Tooltip title="Chia sẻ trên Twitter">
          <Button shape="circle" icon={<TwitterOutlined />} className="detail-course-social-btn" />
        </Tooltip>
        <Tooltip title="Chia sẻ trên YouTube">
          <Button shape="circle" icon={<YoutubeOutlined />} className="detail-course-social-btn" />
        </Tooltip>
        <Tooltip title="Chia sẻ trên Instagram">
          <Button shape="circle" icon={<InstagramOutlined />} className="detail-course-social-btn" />
        </Tooltip>
      </div>

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
            <Select
              placeholder="Chọn lý do"
              options={COURSE_REPORT_REASONS.map(reason => ({ label: reason, value: reason }))}
            />
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
            <Button
              onClick={() => {
                setReportModalOpen(false);
                reportForm.resetFields();
              }}
            >
              Hủy
            </Button>
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
