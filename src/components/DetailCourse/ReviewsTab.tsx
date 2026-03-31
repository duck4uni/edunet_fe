import React, { useState } from 'react';
import { Rate, Progress, List, Avatar, Tag, Form, Input, Upload, Button, Modal, Select, Dropdown, message, Tooltip, Typography } from 'antd';
import { ClockCircleOutlined, UploadOutlined, MoreOutlined, FlagOutlined, LikeOutlined, LikeFilled, DislikeOutlined, DislikeFilled, FilterOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useReviewForm } from '../../hooks/useReviewForm';

const { TextArea } = Input;
const { Text } = Typography;

interface ReviewsTabProps {
  reviews: any[];
}

const REPORT_REASONS = [
  'Spam hoặc gây hiểu lầm',
  'Nội dung không phù hợp',
  'Quấy rối hoặc bắt nạt',
  'Thông tin sai lệch',
  'Vi phạm bản quyền',
  'Khác',
];

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews }) => {
  const { form, handleFinishReview } = useReviewForm();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<any>(null);
  const [reportForm] = Form.useForm();
  const [likedReviews, setLikedReviews] = useState<number[]>([]);
  const [dislikedReviews, setDislikedReviews] = useState<number[]>([]);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleReport = (review: any) => {
    setReportingReview(review);
    setReportModalOpen(true);
  };

  const handleSubmitReport = (values: any) => {
    console.log('Report submitted:', { review: reportingReview, ...values });
    message.success('Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
    setReportModalOpen(false);
    reportForm.resetFields();
  };

  const handleLike = (reviewId: number) => {
    if (likedReviews.includes(reviewId)) {
      setLikedReviews(prev => prev.filter(id => id !== reviewId));
    } else {
      setLikedReviews(prev => [...prev, reviewId]);
      setDislikedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  const handleDislike = (reviewId: number) => {
    if (dislikedReviews.includes(reviewId)) {
      setDislikedReviews(prev => prev.filter(id => id !== reviewId));
    } else {
      setDislikedReviews(prev => [...prev, reviewId]);
      setLikedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  const filteredReviews = filterRating 
    ? reviews.filter(r => Math.floor(r.rate) === filterRating)
    : reviews;

  const getMenuItems = (review: any) => [
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
    <div className="py-4">
      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-[#012643] to-[#023e6d] p-8 rounded-2xl mb-8 text-white">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-2">4.5</h1>
            <Rate disabled defaultValue={4.5} allowHalf className="text-yellow-400" />
            <p className="text-blue-200 mt-2">Dựa trên 128 đánh giá</p>
          </div>
          <div className="flex-1 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const percent = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2;
              return (
                <div 
                  key={star} 
                  className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                >
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-white font-medium">{star}</span>
                    <Rate disabled defaultValue={1} count={1} className="text-yellow-400 text-xs" />
                  </div>
                  <Progress 
                    percent={percent} 
                    strokeColor="#FFCE00" 
                    trailColor="rgba(255,255,255,0.2)"
                    showInfo={false} 
                    className="flex-1"
                  />
                  <span className="w-16 text-right text-blue-200">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-4 border border-gray-100">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-400" />
          <Text className="text-gray-500">Lọc theo:</Text>
          <Select
            value={filterRating}
            onChange={setFilterRating}
            placeholder="Tất cả đánh giá"
            allowClear
            className="w-36"
            options={[
              { value: 5, label: '5 Sao' },
              { value: 4, label: '4 Sao' },
              { value: 3, label: '3 Sao' },
              { value: 2, label: '2 Sao' },
              { value: 1, label: '1 Sao' },
            ]}
          />
        </div>
        <Text className="text-gray-500">
          Hiển thị {filteredReviews.length} trên {reviews.length} đánh giá
        </Text>
      </div>

      {/* Review List */}
      <List
        itemLayout="vertical"
        dataSource={filteredReviews}
        renderItem={(item) => (
          <List.Item className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <List.Item.Meta
              avatar={
                <Avatar 
                  src={item.avatar} 
                  size={56} 
                  className="border-2 border-gray-100"
                />
              }
              title={
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-[#012643] mb-1">{item.user}</h4>
                    <div className="flex items-center gap-3">
                      <Rate disabled defaultValue={item.rate} className="text-sm text-yellow-500" />
                      <Tag color="blue" className="!rounded-full">{item.role}</Tag>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <ClockCircleOutlined /> {item.date}
                    </span>
                    <Dropdown menu={{ items: getMenuItems(item) }} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} className="!text-gray-400" />
                    </Dropdown>
                  </div>
                </div>
              }
              description={
                <div className="mt-4">
                  <p className="text-gray-600 text-base leading-relaxed">{item.content}</p>
                  
                  {/* Review Images */}
                  {item.images && item.images.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {item.images.map((img: string, idx: number) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt="" 
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}

                  {/* Like/Dislike Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <Tooltip title="Hữu ích">
                      <Button 
                        type="text" 
                        icon={likedReviews.includes(item.id) ? <LikeFilled className="text-[#e5698e]" /> : <LikeOutlined />}
                        onClick={() => handleLike(item.id)}
                        className={likedReviews.includes(item.id) ? '!text-[#e5698e]' : '!text-gray-400'}
                      >
                        {12 + (likedReviews.includes(item.id) ? 1 : 0)}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Không hữu ích">
                      <Button 
                        type="text" 
                        icon={dislikedReviews.includes(item.id) ? <DislikeFilled className="text-gray-600" /> : <DislikeOutlined />}
                        onClick={() => handleDislike(item.id)}
                        className="!text-gray-400"
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

      {/* Add Review Form */}
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold mb-2 text-[#012643]">Viết đánh giá</h3>
        <p className="text-gray-500 mb-6">Chia sẻ trải nghiệm của bạn về khóa học này</p>
        
        <Form form={form} onFinish={handleFinishReview} layout="vertical" size="large">
          <Form.Item 
            name="rate" 
            label={<span className="font-medium">Đánh giá của bạn</span>}
            rules={[{ required: true, message: 'Vui lòng chọn mức đánh giá' }]}
          >
            <Rate className="text-2xl text-yellow-500" />
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
              rows={5} 
              placeholder="Bạn thích hoặc không thích điều gì về khóa học? Giảng viên thế nào? Bạn có giới thiệu không?" 
              className="!rounded-lg"
              showCount
              maxLength={1000}
            />
          </Form.Item>
          
          <Form.Item name="images" label={<span className="font-medium">Thêm ảnh (Tùy chọn)</span>}>
            <Upload listType="picture-card" maxCount={5}>
              <div className="text-gray-400">
                <UploadOutlined className="text-xl" />
                <div className="mt-2 text-sm">Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-xl !h-12 !px-8"
            >
              Gửi đánh giá
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Report Modal */}
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
            <Select placeholder="Chọn lý do">
              {REPORT_REASONS.map(reason => (
                <Select.Option key={reason} value={reason}>{reason}</Select.Option>
              ))}
            </Select>
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

export default ReviewsTab;
