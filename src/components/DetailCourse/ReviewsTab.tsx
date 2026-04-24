import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Rate,
  Select,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  ClockCircleOutlined,
  DislikeFilled,
  DislikeOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  FlagOutlined,
  LikeFilled,
  LikeOutlined,
  MoreOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useReviewForm } from '../../hooks/useReviewForm';
import type { Review } from '../../models/course';

import { notify } from '../../utils/notify';
const { TextArea } = Input;
const { Text } = Typography;

interface ReviewsTabProps {
  reviews: Review[];
  stats?: {
    averageRating: number;
    totalReviews: number;
  };
}

interface ReviewReportFormValues {
  reason: string;
  details?: string;
}

type ReviewId = Review['id'];

const REPORT_REASONS = [
  'Spam hoặc gây hiểu lầm',
  'Nội dung không phù hợp',
  'Quấy rối hoặc bắt nạt',
  'Thông tin sai lệch',
  'Vi phạm bản quyền',
  'Khác',
];

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews, stats }) => {
  const { form, handleFinishReview } = useReviewForm();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const [reportForm] = Form.useForm<ReviewReportFormValues>();
  const [likedReviews, setLikedReviews] = useState<ReviewId[]>([]);
  const [dislikedReviews, setDislikedReviews] = useState<ReviewId[]>([]);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const ratingSummary = useMemo(() => {
    const visibleCount = reviews.length;
    const total = stats?.totalReviews && stats.totalReviews > 0 ? stats.totalReviews : visibleCount;
    const averageFromList = visibleCount > 0 ? reviews.reduce((sum, review) => sum + review.rate, 0) / visibleCount : 0;
    const average = typeof stats?.averageRating === 'number' && stats.averageRating > 0
      ? stats.averageRating
      : averageFromList;

    const breakdown = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(review => Math.floor(review.rate) === star).length;
      const denominator = total > 0 ? total : visibleCount;
      const percent = denominator > 0 ? Math.round((count / denominator) * 100) : 0;

      return { star, percent };
    });

    return {
      total,
      visibleCount,
      average,
      breakdown,
    };
  }, [reviews, stats]);

  const handleReport = (review: Review) => {
    setReportingReview(review);
    setReportModalOpen(true);
  };

  const handleSubmitReport = (values: ReviewReportFormValues) => {
    console.log('Report submitted:', { review: reportingReview, ...values });
    notify.success('Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
    setReportModalOpen(false);
    setReportingReview(null);
    reportForm.resetFields();
  };

  const handleLike = (reviewId: ReviewId) => {
    if (likedReviews.includes(reviewId)) {
      setLikedReviews(prev => prev.filter(id => id !== reviewId));
    } else {
      setLikedReviews(prev => [...prev, reviewId]);
      setDislikedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  const handleDislike = (reviewId: ReviewId) => {
    if (dislikedReviews.includes(reviewId)) {
      setDislikedReviews(prev => prev.filter(id => id !== reviewId));
    } else {
      setDislikedReviews(prev => [...prev, reviewId]);
      setLikedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  const filteredReviews = useMemo(
    () => (filterRating ? reviews.filter(review => Math.floor(review.rate) === filterRating) : reviews),
    [filterRating, reviews],
  );

  const getMenuItems = (review: Review) => [
    {
      key: 'report',
      label: (
        <span className="flex items-center gap-2 text-red-500">
          <FlagOutlined /> Báo cáo đánh giá
        </span>
      ),
      onClick: () => handleReport(review),
    },
  ];

  return (
    <div className="py-1">
      <div className="detail-course-rating-summary mb-4 p-4">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="text-center">
            <h1>{ratingSummary.average.toFixed(1)}</h1>
            <Rate disabled value={ratingSummary.average || 0} allowHalf className="text-state-light-orange" />
            <p className="mt-1 text-xs text-blue-100">Dựa trên {ratingSummary.total} đánh giá</p>
          </div>
          <div className="w-full flex-1">
            {ratingSummary.breakdown.map(({ star, percent }) => {
              return (
                <div
                  key={star}
                  className="mb-1.5 flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                >
                  <div className="flex w-14 items-center gap-1">
                    <span className="text-sm font-medium text-white">{star}</span>
                    <Rate disabled defaultValue={1} count={1} className="text-state-light-orange text-xs" />
                  </div>
                  <Progress
                    percent={percent}
                    strokeColor="var(--textStateLightOrange)"
                    trailColor="rgba(255,255,255,0.2)"
                    showInfo={false}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-xs text-blue-100">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="detail-course-surface mb-4 flex flex-wrap items-center justify-between gap-2 p-2.5">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-state-500-primary" />
          <Text className="text-xs text-gray-500">Lọc theo:</Text>
          <Select
            value={filterRating ?? undefined}
            onChange={value => setFilterRating(value ?? null)}
            placeholder="Tất cả đánh giá"
            allowClear
            className="w-28"
            options={[
              { value: 5, label: '5 Sao' },
              { value: 4, label: '4 Sao' },
              { value: 3, label: '3 Sao' },
              { value: 2, label: '2 Sao' },
              { value: 1, label: '1 Sao' },
            ]}
          />
        </div>
        <Text className="text-xs text-gray-500">
          Hiển thị {filteredReviews.length} trên {ratingSummary.total} đánh giá
        </Text>
      </div>

      <List
        itemLayout="vertical"
        dataSource={filteredReviews}
        locale={{ emptyText: 'Chưa có đánh giá phù hợp.' }}
        renderItem={(item) => (
          <List.Item className="detail-course-review-card mb-2.5 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <List.Item.Meta
              avatar={
                <Avatar
                  src={item.avatar}
                  size={40}
                  className="border-2 border-gray-100"
                />
              }
              title={
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="mb-1 text-[13px] font-bold text-[var(--primaryColor)]">{item.user}</h4>
                    <div className="flex items-center gap-2">
                      <Rate disabled value={item.rate} className="text-sm text-state-light-orange" />
                      <Tag className="!rounded-full !border-none !bg-[rgba(48,194,236,0.16)] !text-[var(--textState500Secondary)]">
                        {item.role}
                      </Tag>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <ClockCircleOutlined /> {item.date}
                    </span>
                    <Dropdown menu={{ items: getMenuItems(item) }} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} className="!text-gray-400" />
                    </Dropdown>
                  </div>
                </div>
              }
              description={
                <div className="mt-2.5">
                  <p className="text-[13px] leading-relaxed text-gray-600">{item.content}</p>

                  {item.images && item.images.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {item.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Review attachment"
                          className="h-16 w-16 cursor-pointer rounded-md object-cover hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2.5 border-t border-gray-100 pt-2">
                    <Tooltip title="Hữu ích">
                      <Button
                        type="text"
                        icon={likedReviews.includes(item.id) ? <LikeFilled className="text-state-500-secondary" /> : <LikeOutlined />}
                        onClick={() => handleLike(item.id)}
                        className={`detail-course-review-action ${likedReviews.includes(item.id) ? 'is-active' : ''}`}
                      >
                        {12 + (likedReviews.includes(item.id) ? 1 : 0)}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Không hữu ích">
                      <Button
                        type="text"
                        icon={dislikedReviews.includes(item.id) ? <DislikeFilled className="text-state-light-orange" /> : <DislikeOutlined />}
                        onClick={() => handleDislike(item.id)}
                        className={`detail-course-review-action ${dislikedReviews.includes(item.id) ? 'is-active' : ''}`}
                      >
                        {2 + (dislikedReviews.includes(item.id) ? 1 : 0)}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <div className="detail-course-surface mt-4 p-4">
        <h3 className="mb-1 text-[15px] font-bold text-[var(--primaryColor)]">Viết đánh giá</h3>
        <p className="mb-3 text-xs text-gray-500">Chia sẻ trải nghiệm của bạn về khóa học này</p>

        <Form form={form} onFinish={handleFinishReview} layout="vertical">
          <Form.Item
            name="rate"
            label={<span className="font-medium">Đánh giá của bạn</span>}
            rules={[{ required: true, message: 'Vui lòng chọn mức đánh giá' }]}
          >
            <Rate className="text-xl text-state-light-orange" />
          </Form.Item>

          <Form.Item
            name="title"
            label={<span className="font-medium">Tiêu đề đánh giá</span>}
            rules={[{ required: true, message: 'Vui lòng thêm tiêu đề' }]}
          >
            <Input placeholder="Tóm tắt trải nghiệm của bạn" className="!rounded-lg" />
          </Form.Item>

          <Form.Item
            name="content"
            label={<span className="font-medium">Nội dung đánh giá</span>}
            rules={[{ required: true, message: 'Vui lòng viết đánh giá' }]}
          >
            <TextArea
              rows={4}
              placeholder="Bạn thích hoặc không thích điều gì về khóa học? Giảng viên thế nào? Bạn có giới thiệu không?"
              className="!rounded-lg"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item name="images" label={<span className="font-medium">Thêm ảnh (Tùy chọn)</span>}>
            <Upload listType="picture-card" maxCount={5} beforeUpload={() => false}>
              <div className="text-gray-400">
                <UploadOutlined className="text-xl" />
                <div className="mt-2 text-[13px]">Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="middle"
              className="detail-course-primary-btn !h-10 !rounded-lg !px-6 !text-[13px]"
            >
              Gửi đánh giá
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-red-500">
            <ExclamationCircleOutlined />
            <span>Báo cáo đánh giá</span>
          </div>
        }
        open={reportModalOpen}
        onCancel={() => {
          setReportModalOpen(false);
          setReportingReview(null);
          reportForm.resetFields();
        }}
        footer={null}
      >
        <Form form={reportForm} onFinish={handleSubmitReport} layout="vertical">
          <p className="text-gray-500 mb-4">
            Giúp chúng tôi hiểu vấn đề của đánh giá này. Báo cáo của bạn sẽ được đội ngũ của chúng tôi xem xét.
          </p>

          <Form.Item
            name="reason"
            label="Lý do báo cáo"
            rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
          >
            <Select
              placeholder="Chọn lý do"
              options={REPORT_REASONS.map(reason => ({ label: reason, value: reason }))}
            />
          </Form.Item>

          <Form.Item
            name="details"
            label="Chi tiết bổ sung"
          >
            <TextArea
              rows={4}
              placeholder="Cung cấp thông tin bổ sung giúp chúng tôi hiểu vấn đề..."
            />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setReportModalOpen(false);
                setReportingReview(null);
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

export default ReviewsTab;
