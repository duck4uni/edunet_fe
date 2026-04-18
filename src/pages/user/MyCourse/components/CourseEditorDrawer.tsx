import React from 'react';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  TimePicker,
  Typography,
  Upload,
} from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { FormInstance, UploadProps } from 'antd';
import type { Dayjs } from 'dayjs';
import './CourseEditorDrawer.css';

const { Option } = Select;
const { Text } = Typography;
const COURSE_EDITOR_SELECT_DROPDOWN_CLASS = 'course-editor-select-dropdown';

export type CourseDrawerFormValues = {
  title: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  discountPrice?: number;
  categoryId?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration?: string;
  totalLessons?: number;
  language?: string;
  startDate?: Dayjs;
  tags?: string[];
  goal?: string;
  createTimetable?: boolean;
  timetableTitle?: string;
  timetableDescription?: string;
  timetableType?: 'class' | 'exam' | 'assignment' | 'event';
  recurrenceStartDate?: Dayjs;
  recurrenceEndDate?: Dayjs;
  weekDays?: number[];
  scheduleStartTime?: Dayjs;
  scheduleEndTime?: Dayjs;
  isOnline?: boolean;
  location?: string;
  meetingLink?: string;
};

type CourseCategoryOption = {
  id: string;
  name: string;
};

type CourseEditorDrawerProps = {
  open: boolean;
  editingId: string | null;
  form: FormInstance<CourseDrawerFormValues>;
  onClose: () => void;
  onFinish: (values: CourseDrawerFormValues) => void | Promise<void>;
  categories: CourseCategoryOption[];
  isSubmitting: boolean;
  thumbnailUploading: boolean;
  thumbnailUrl?: string;
  beforeThumbnailUpload: UploadProps['beforeUpload'];
  onThumbnailUpload: UploadProps['customRequest'];
  onRemoveThumbnail: () => void;
};

const CourseEditorDrawer: React.FC<CourseEditorDrawerProps> = ({
  open,
  editingId,
  form,
  onClose,
  onFinish,
  categories,
  isSubmitting,
  thumbnailUploading,
  thumbnailUrl,
  beforeThumbnailUpload,
  onThumbnailUpload,
  onRemoveThumbnail,
}) => {
  const requiredLabel = (label: string) => (
    <span className="course-editor-label-with-star">
      {label}
      <span className="course-editor-label-star">*</span>
    </span>
  );

  return (
    <Drawer
      title={editingId ? 'Cập nhật khóa học' : 'Tạo khóa học mới'}
      open={open}
      onClose={onClose}
      mask={false}
      destroyOnClose
      placement="right"
      width="min(760px, 100vw)"
      className="mycourse-course-drawer course-editor-drawer"
      footer={
        <div className="mycourse-course-drawer-footer">
          <Button onClick={onClose}>Trở về</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isSubmitting}>
            {editingId ? 'Cập nhật khóa học' : 'Tạo khóa học'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        size="small"
        requiredMark={false}
        layout="vertical"
        onFinish={onFinish}
        className="mycourse-course-form course-editor-form"
      >
        <Form.Item name="title" label={requiredLabel('Tên khóa học')} rules={[{ required: true }]}>
          <Input placeholder="Nhập tên khóa học" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea placeholder="Nhập mô tả khóa học" autoSize={{ minRows: 1, maxRows: 1 }} />
        </Form.Item>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={8}>
            <Form.Item label="Ảnh đại diện">
              <div className="mycourse-cloudinary-uploader">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={beforeThumbnailUpload}
                  customRequest={onThumbnailUpload}
                  disabled={thumbnailUploading}
                >
                  <Button icon={<UploadOutlined />} loading={thumbnailUploading}>
                    Upload Cloudinary
                  </Button>
                </Upload>

                {thumbnailUrl ? (
                  <div className="mycourse-cloudinary-preview">
                    <img src={thumbnailUrl} alt="thumbnail" />
                    <Button type="text" icon={<DeleteOutlined />} onClick={onRemoveThumbnail}>
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <Text className="mycourse-subtext">Chưa có ảnh đại diện</Text>
                )}
              </div>
            </Form.Item>

            <Form.Item name="thumbnail" hidden rules={[{ required: true, message: 'Vui lòng tải ảnh đại diện' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="price" label={requiredLabel('Giá (VND)')} initialValue={0} rules={[{ required: true }]}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="discountPrice" label="Giá khuyến mãi (VND)">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={8}>
            <Form.Item name="categoryId" label="Danh mục">
              <Select popupClassName={COURSE_EDITOR_SELECT_DROPDOWN_CLASS} placeholder="Chọn danh mục" allowClear>
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="level"
              label={requiredLabel('Cấp độ')}
              initialValue="beginner"
              rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
            >
              <Select popupClassName={COURSE_EDITOR_SELECT_DROPDOWN_CLASS}>
                <Option value="beginner">Mới bắt đầu</Option>
                <Option value="intermediate">Trung bình</Option>
                <Option value="advanced">Nâng cao</Option>
                <Option value="all">Tất cả</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="duration" label="Thời lượng (ví dụ: 20 giờ)">
              <Input placeholder="Khoảng thời gian" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={8}>
            <Form.Item name="totalLessons" label="Tổng số bài dự kiến" initialValue={0}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="language" label="Ngôn ngữ" initialValue="Vietnamese">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="startDate" label="Ngày bắt đầu">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="tags"
            popupClassName={COURSE_EDITOR_SELECT_DROPDOWN_CLASS}
            maxTagCount="responsive"
            placeholder="Nhập tags..."
          />
        </Form.Item>

        <Divider className="!my-2">Thời khóa biểu</Divider>

        <Form.Item name="createTimetable" valuePropName="checked">
          <Checkbox>
            {editingId ? 'Tạo thêm thời khóa biểu cho khóa học này' : 'Tạo thời khóa biểu ngay khi tạo khóa học'}
          </Checkbox>
        </Form.Item>

        <Form.Item noStyle dependencies={['createTimetable']}>
          {({ getFieldValue }) =>
            getFieldValue('createTimetable') ? (
              <>
                <Row gutter={[12, 0]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="timetableTitle"
                      label={requiredLabel('Tên lịch học')}
                      rules={[{ required: true, message: 'Vui lòng nhập tên lịch học' }]}
                    >
                      <Input placeholder="Ví dụ: React Fundamentals - Morning" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="timetableType"
                      label={requiredLabel('Loại lịch')}
                      initialValue="class"
                      rules={[{ required: true }]}
                    >
                      <Select popupClassName={COURSE_EDITOR_SELECT_DROPDOWN_CLASS}>
                        <Option value="class">Lớp học</Option>
                        <Option value="exam">Kiểm tra</Option>
                        <Option value="assignment">Bài tập</Option>
                        <Option value="event">Sự kiện</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="isOnline" label="Hình thức" initialValue={false}>
                      <Select popupClassName={COURSE_EDITOR_SELECT_DROPDOWN_CLASS}>
                        <Option value={false}>Học trực tiếp</Option>
                        <Option value={true}>Học online</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="timetableDescription" label="Mô tả lịch học">
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 1 }} placeholder="Mô tả ngắn cho chuỗi buổi học" />
                </Form.Item>

                <Row gutter={[12, 0]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="recurrenceStartDate"
                      label={requiredLabel('Ngày bắt đầu lịch')}
                      rules={[{ required: true, message: 'Chọn ngày bắt đầu lịch' }]}
                    >
                      <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="recurrenceEndDate"
                      label={requiredLabel('Ngày kết thúc lịch')}
                      rules={[{ required: true, message: 'Chọn ngày kết thúc lịch' }]}
                    >
                      <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="weekDays"
                      label={requiredLabel('Các ngày học trong tuần')}
                      rules={[{ required: true, message: 'Chọn ít nhất 1 ngày học' }]}
                    >
                      <Select
                        mode="multiple"
                        popupClassName={COURSE_EDITOR_SELECT_DROPDOWN_CLASS}
                        maxTagCount="responsive"
                        placeholder="Chọn thứ học"
                      >
                        <Option value={1}>Thứ 2</Option>
                        <Option value={2}>Thứ 3</Option>
                        <Option value={3}>Thứ 4</Option>
                        <Option value={4}>Thứ 5</Option>
                        <Option value={5}>Thứ 6</Option>
                        <Option value={6}>Thứ 7</Option>
                        <Option value={0}>Chủ nhật</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[12, 0]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="scheduleStartTime"
                      label={requiredLabel('Giờ bắt đầu')}
                      rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
                    >
                      <TimePicker className="w-full" format="HH:mm" minuteStep={5} needConfirm={false} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="scheduleEndTime"
                      label={requiredLabel('Giờ kết thúc')}
                      rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}
                    >
                      <TimePicker className="w-full" format="HH:mm" minuteStep={5} needConfirm={false} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item noStyle dependencies={['isOnline']}>
                      {({ getFieldValue: getFieldValueOnline }) =>
                        getFieldValueOnline('isOnline') ? (
                          <Form.Item
                            name="meetingLink"
                              label={requiredLabel('Link học online')}
                            rules={[{ required: true, message: 'Vui lòng nhập link phòng học online' }]}
                          >
                            <Input placeholder="https://meet.google.com/..." />
                          </Form.Item>
                        ) : (
                          <Form.Item
                            name="location"
                              label={requiredLabel('Địa điểm học')}
                            rules={[{ required: true, message: 'Vui lòng nhập địa điểm học' }]}
                          >
                            <Input placeholder="Phòng 201, Cơ sở A" />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : null
          }
        </Form.Item>

        <Form.Item name="goal" label="Mục tiêu khóa học">
          <Input.TextArea autoSize={{ minRows: 1, maxRows: 1 }} placeholder="Các mục tiêu đạt được..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CourseEditorDrawer;
