import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Spin, Empty, Tag, Modal, Form, Input, Select, InputNumber, DatePicker, message, Alert, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SettingOutlined, SendOutlined, ExclamationCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetProfileQuery } from '../../../services/authApi';
import { useGetCoursesQuery, useCreateCourseMutation, useUpdateCourseMutation, useGetCategoriesQuery, useSubmitCourseForReviewMutation } from '../../../services/courseApi';
import type { Course } from '../../../services/courseApi';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Bản nháp', color: 'default', icon: <FileTextOutlined /> },
  pending: { label: 'Chờ duyệt', color: 'processing', icon: <ClockCircleOutlined /> },
  approved: { label: 'Đã duyệt', color: 'success', icon: <CheckCircleOutlined /> },
  published: { label: 'Đã xuất bản', color: 'green', icon: <CheckCircleOutlined /> },
  rejected: { label: 'Bị từ chối', color: 'error', icon: <CloseCircleOutlined /> },
  archived: { label: 'Đã lưu trữ', color: 'warning', icon: <ClockCircleOutlined /> },
};

const TeacherDashboard: React.FC = () => {
  const { data: profileResponse } = useGetProfileQuery();
  const user = profileResponse?.data;
  const isTeacher = user?.role === 'teacher';

  const { data: coursesData, isLoading, refetch } = useGetCoursesQuery({
    filter: user?.id ? `teacherId:eq:${user.id}` : undefined,
    include: 'category',
    sort: 'createdAt:desc',
  });
  
  const { data: categoriesData } = useGetCategoriesQuery();

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [submitForReview, { isLoading: isSubmitting }] = useSubmitCourseForReviewMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rejectionCourse, setRejectionCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();

  const myCourses = coursesData?.data?.rows || [];

  const handleOpenModal = (record?: Course) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? dayjs(record.startDate) : undefined,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      await submitForReview(courseId).unwrap();
      message.success('Đã gửi khóa học để xét duyệt');
      refetch();
    } catch {
      message.error('Không thể gửi xét duyệt, vui lòng thử lại');
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        price: values.price ? Number(values.price) : 0,
        discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
        totalLessons: values.totalLessons ? Number(values.totalLessons) : 0,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
      };

      if (editingId) {
        await updateCourse({ id: editingId, data: payload }).unwrap();
        message.success('Cập nhật thành công');
      } else {
        await createCourse({
          ...payload,
          teacherId: user?.id,
        }).unwrap();
        message.success('Tạo khóa học thành công — khóa học đang chờ xét duyệt');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      console.error('Failed to save course:', error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const canEdit = (course: Course) => course.status === 'draft' || course.status === 'rejected';
  const canSubmit = (course: Course) => course.status === 'draft' || course.status === 'rejected';

  if (!isTeacher) {
    return <Empty description="Bạn không có quyền truy cập." />;
  }

  const stats = {
    total: myCourses.length,
    published: myCourses.filter(c => c.status === 'published').length,
    pending: myCourses.filter(c => c.status === 'pending').length,
    rejected: myCourses.filter(c => c.status === 'rejected').length,
    draft: myCourses.filter(c => c.status === 'draft').length,
  };

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="!text-[#012643] !mb-2">Quản lý khóa học (Giảng viên)</Title>
            <Text className="text-gray-500 text-lg">Tạo và quản lý các khóa học của bạn</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            className="!bg-[#17EAD9] !border-none hover:!opacity-80 text-[#012643]"
            onClick={() => handleOpenModal()}
          >
            Tạo khóa học
          </Button>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <div className="text-2xl font-bold text-[#012643]">{stats.total}</div>
              <div className="text-gray-500 text-sm">Tổng cộng</div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <div className="text-2xl font-bold text-green-500">{stats.published}</div>
              <div className="text-gray-500 text-sm">Đã xuất bản</div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
              <div className="text-gray-500 text-sm">Chờ duyệt</div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
              <div className="text-gray-500 text-sm">Bị từ chối</div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-400">{stats.draft}</div>
              <div className="text-gray-500 text-sm">Bản nháp</div>
            </Card>
          </Col>
        </Row>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" tip="Đang tải danh sách..." />
          </div>
        ) : myCourses.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-md">
            <Empty 
              description="Bạn chưa tạo khóa học nào."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => handleOpenModal()} className="!bg-[#012643]">
                Tạo khóa học đầu tiên
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {myCourses.map(course => {
              const statusCfg = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.draft;
              return (
                <Col xs={24} sm={12} lg={8} key={course.id}>
                  <Card 
                    className="h-full rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                    cover={
                      <div className="h-44 relative bg-gray-200">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Không có ảnh</div>
                        )}
                        <Tag
                          icon={statusCfg.icon}
                          color={statusCfg.color}
                          className="!absolute top-3 right-3 !rounded-full !border-0"
                        >
                          {statusCfg.label}
                        </Tag>
                      </div>
                    }
                    bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div className="flex-1">
                      <Title level={5} className="!line-clamp-2 !mb-1">{course.title}</Title>
                      <Text type="secondary" className="block text-sm mb-1">
                        {course.category?.name && <Tag color="blue" className="!rounded-full !text-xs">{course.category.name}</Tag>}
                      </Text>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{course.price.toLocaleString('vi-VN')} đ</span>
                        <span>{dayjs(course.createdAt).format('DD/MM/YYYY')}</span>
                      </div>

                      {/* Rejection reason alert */}
                      {course.status === 'rejected' && course.rejectionReason && (
                        <Alert
                          type="error"
                          showIcon
                          icon={<ExclamationCircleOutlined />}
                          message="Lý do từ chối"
                          description={
                            <Paragraph className="!mb-0 !text-xs text-red-700">{course.rejectionReason}</Paragraph>
                          }
                          className="!mb-3 !text-xs"
                        />
                      )}

                      {/* Pending status info */}
                      {course.status === 'pending' && (
                        <Alert
                          type="info"
                          showIcon
                          message="Đang chờ admin xét duyệt"
                          className="!mb-3 !text-xs"
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap mt-auto pt-3 border-t border-gray-100">
                      {canEdit(course) && (
                        <Tooltip title="Chỉnh sửa thông tin">
                          <Button 
                            size="small"
                            icon={<EditOutlined />} 
                            onClick={() => handleOpenModal(course)}
                          >
                            Sửa
                          </Button>
                        </Tooltip>
                      )}
                      {canSubmit(course) && (
                        <Popconfirm
                          title="Gửi khóa học để xét duyệt?"
                          description="Admin sẽ xem xét và phê duyệt khóa học của bạn."
                          onConfirm={() => handleSubmitForReview(course.id)}
                          okText="Gửi"
                          cancelText="Hủy"
                        >
                          <Button 
                            size="small"
                            type="primary"
                            icon={<SendOutlined />}
                            loading={isSubmitting}
                            className="!bg-[#012643]"
                          >
                            Gửi xét duyệt
                          </Button>
                        </Popconfirm>
                      )}
                      <Link to={`/my-course/manage-course/${course.id}`}>
                        <Button size="small" icon={<SettingOutlined />} className="text-blue-500">
                          Nội dung
                        </Button>
                      </Link>
                      {(course.status === 'published' || course.status === 'approved') && (
                        <Link to={`/course/${course.id}`} target="_blank">
                          <Button size="small" icon={<EyeOutlined />} className="text-green-500">
                            Xem
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* Rejection reason detail modal */}
      <Modal
        title={<span className="flex items-center gap-2 text-red-500"><ExclamationCircleOutlined /> Lý do từ chối</span>}
        open={!!rejectionCourse}
        onCancel={() => setRejectionCourse(null)}
        footer={[
          <Button key="close" onClick={() => setRejectionCourse(null)}>Đóng</Button>,
          rejectionCourse && canSubmit(rejectionCourse) && (
            <Popconfirm
              key="submit"
              title="Gửi lại để xét duyệt?"
              onConfirm={async () => {
                if (rejectionCourse) {
                  await handleSubmitForReview(rejectionCourse.id);
                  setRejectionCourse(null);
                }
              }}
              okText="Gửi"
              cancelText="Hủy"
            >
              <Button type="primary" icon={<SendOutlined />} className="!bg-[#012643]">
                Gửi lại xét duyệt
              </Button>
            </Popconfirm>
          ),
        ].filter(Boolean)}
      >
        {rejectionCourse && (
          <div>
            <p className="text-gray-600 mb-2 font-medium">{rejectionCourse.title}</p>
            <Alert
              type="error"
              showIcon
              message={rejectionCourse.rejectionReason || 'Không có lý do cụ thể'}
            />
          </div>
        )}
      </Modal>

      <Modal
        title={editingId ? "Cập nhật khóa học" : "Tạo khóa học mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tên khóa học" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên khóa học" />
          </Form.Item>
          
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả khóa học" rows={3} />
          </Form.Item>

          <Form.Item name="thumbnail" label="URL Ảnh đại diện">
            <Input placeholder="https://example.com/image.png" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Giá (VNĐ)" initialValue={0} rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discountPrice" label="Giá KM (VNĐ)">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Danh mục">
                <Select placeholder="Chọn danh mục" allowClear>
                  {categoriesData?.data?.rows?.map((cat) => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label="Cấp độ" initialValue="beginner">
                <Select>
                  <Option value="beginner">Mới bắt đầu</Option>
                  <Option value="intermediate">Trung bình</Option>
                  <Option value="advanced">Nâng cao</Option>
                  <Option value="all">Tất cả</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="duration" label="Thời lượng (vd: '20 giờ')">
                <Input placeholder="Khoảng thời gian" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalLessons" label="Tổng số bài dự kiến" initialValue={0}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="language" label="Ngôn ngữ" initialValue="Vietnamese">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Nhập tags..." />
          </Form.Item>
          
          <Form.Item name="schedule" label="Lịch học">
            <Select mode="tags" placeholder="Nhập lịch học (vd: Thứ 2, Thứ 4)..." />
          </Form.Item>
          
          <Form.Item name="goal" label="Mục tiêu khóa học">
            <Input.TextArea rows={2} placeholder="Các mục tiêu đạt được..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full !bg-[#012643]" loading={isCreating || isUpdating}>
              {editingId ? 'Cập nhật khóa học' : 'Tạo khóa học'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
