import React, { useEffect } from 'react';
import { Button, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import type { Course } from '../../../../../services/courseApi';
import { useUpdateCourseMutation } from '../../../../../services/courseApi';
import { notify } from '../../../../../utils/notify';

const { Title } = Typography;

type CourseDescriptionFormValues = {
  description: string;
  goal?: string;
  language?: string;
  duration?: string;
  level: Course['level'];
  tagsText?: string;
};

interface CourseDescriptionTabProps {
  courseId: string;
  course?: Course;
}

const mapCourseToFormValues = (course?: Course): CourseDescriptionFormValues => ({
  description: course?.description || '',
  goal: course?.goal || '',
  language: course?.language || '',
  duration: course?.duration || '',
  level: course?.level || 'all',
  tagsText: Array.isArray(course?.tags) ? course?.tags.join(', ') : '',
});

const normalizeTags = (tagsText?: string): string[] | undefined => {
  if (!tagsText) {
    return undefined;
  }

  const tags = tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length ? tags : undefined;
};

const CourseDescriptionTab: React.FC<CourseDescriptionTabProps> = ({ courseId, course }) => {
  const [form] = Form.useForm<CourseDescriptionFormValues>();
  const [updateCourse, { isLoading }] = useUpdateCourseMutation();

  useEffect(() => {
    form.setFieldsValue(mapCourseToFormValues(course));
  }, [course, form]);

  const handleFinish = async (values: CourseDescriptionFormValues) => {
    try {
      await updateCourse({
        id: courseId,
        data: {
          description: values.description.trim(),
          goal: values.goal?.trim() || undefined,
          language: values.language?.trim() || undefined,
          duration: values.duration?.trim() || undefined,
          level: values.level,
          tags: normalizeTags(values.tagsText),
        },
      }).unwrap();

      notify.success('Đã cập nhật mô tả khóa học.');
    } catch {
      notify.error('Không thể cập nhật mô tả khóa học.');
    }
  };

  return (
    <div>
      <div className="manage-tab-toolbar">
        <Title level={4} className="manage-tab-title">
          Mô tả khóa học
        </Title>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học.' }]}
        >
          <Input.TextArea
            rows={6}
            placeholder="Nhập mô tả chi tiết khóa học để học viên hiểu rõ nội dung sẽ học."
          />
        </Form.Item>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="goal" label="Mục tiêu khóa học">
              <Input.TextArea rows={4} placeholder="Mục tiêu chính mà học viên đạt được sau khóa học" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="tagsText" label="Từ khóa (phân tách bởi dấu phẩy)">
              <Input placeholder="frontend, react, typescript" />
            </Form.Item>

            <Form.Item name="duration" label="Thời lượng">
              <Input placeholder="Ví dụ: 12 tuần" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="language" label="Ngôn ngữ giảng dạy">
              <Input placeholder="Ví dụ: Tiếng Việt" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="level" label="Cấp độ" rules={[{ required: true, message: 'Vui lòng chọn cấp độ.' }]}
>
              <Select
                options={[
                  { value: 'all', label: 'Mọi cấp độ' },
                  { value: 'beginner', label: 'Cơ bản' },
                  { value: 'intermediate', label: 'Trung cấp' },
                  { value: 'advanced', label: 'Nâng cao' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="manage-tab-form-actions">
          <Space>
            <Button onClick={() => form.setFieldsValue(mapCourseToFormValues(course))}>Khôi phục</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Lưu mô tả
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default CourseDescriptionTab;
