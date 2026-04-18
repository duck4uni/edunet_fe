import React, { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { notify } from '../../../../../utils/notify';
import {
  type Lesson,
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useGetLessonsByCourseQuery,
  useUpdateLessonMutation,
} from '../../../../../services/courseApi';

const { Text, Title } = Typography;

type VisibilityFilter = 'all' | 'visible' | 'hidden';

type LessonFormValues = {
  title: string;
  description?: string;
  type: Lesson['type'];
  videoUrl?: string;
  order: number;
  duration?: string;
  isFree: boolean;
  isVisible: boolean;
};

const LESSON_TYPE_META: Record<Lesson['type'], { label: string; color: string }> = {
  video: { label: 'Video', color: 'blue' },
  reading: { label: 'Đọc hiểu', color: 'green' },
  quiz: { label: 'Quiz', color: 'gold' },
  assignment: { label: 'Bài tập', color: 'purple' },
};

interface ClassroomTabProps {
  courseId: string;
}

const ClassroomTab: React.FC<ClassroomTabProps> = ({ courseId }) => {
  const { data: lessonsData, isLoading, refetch } = useGetLessonsByCourseQuery(courseId);
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [searchText, setSearchText] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [form] = Form.useForm();

  const lessons = lessonsData?.data ?? [];

  const filteredLessons = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const matchesKeyword =
        !normalizedKeyword ||
        lesson.title.toLowerCase().includes(normalizedKeyword) ||
        (lesson.description || '').toLowerCase().includes(normalizedKeyword);

      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' ? lesson.isVisible : !lesson.isVisible);

      return matchesKeyword && matchesVisibility;
    });
  }, [lessons, searchText, visibilityFilter]);

  const handleOpenModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      form.setFieldsValue({
        ...lesson,
        isFree: lesson.isFree ?? false,
        isVisible: lesson.isVisible ?? true,
        order: lesson.order || 1,
      });
    } else {
      setEditingLesson(null);
      form.resetFields();
      form.setFieldsValue({
        type: 'video',
        order: lessons.length + 1,
        isFree: false,
        isVisible: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleFinish = async (values: LessonFormValues) => {
    const payload = {
      ...values,
      order: Number(values.order) || 1,
      isFree: !!values.isFree,
      isVisible: !!values.isVisible,
    };

    try {
      if (editingLesson) {
        await updateLesson({ id: editingLesson.id, data: payload }).unwrap();
        notify.success('Cập nhật bài học thành công.');
      } else {
        await createLesson({ ...payload, courseId }).unwrap();
        notify.success('Đã tạo bài học mới.');
      }

      setIsModalOpen(false);
      refetch();
    } catch {
      notify.error('Không thể lưu bài học. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLesson(id).unwrap();
      notify.success('Đã xóa bài học.');
      refetch();
    } catch {
      notify.error('Không thể xóa bài học.');
    }
  };

  const handleToggleVisibility = async (lesson: Lesson) => {
    try {
      await updateLesson({ id: lesson.id, data: { isVisible: !lesson.isVisible } }).unwrap();
      notify.success(lesson.isVisible ? 'Đã ẩn bài học.' : 'Đã hiển thị bài học.');
      refetch();
    } catch {
      notify.error('Không thể cập nhật trạng thái hiển thị.');
    }
  };

  const columns: ColumnsType<Lesson> = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 88,
      render: (order?: number) => order || '-',
    },
    {
      title: 'Tên bài học',
      dataIndex: 'title',
      key: 'title',
      render: (_title: string, record: Lesson) => (
        <div>
          <Text strong>{record.title}</Text>
          {record.description ? <div className="manage-tab-subtext">{record.description}</div> : null}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: Lesson['type']) => {
        const meta = LESSON_TYPE_META[type] || { label: type, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 130,
      render: (duration?: string) => duration || '-',
    },
    {
      title: 'Miễn phí',
      dataIndex: 'isFree',
      key: 'isFree',
      width: 110,
      render: (isFree: boolean) => <Tag color={isFree ? 'success' : 'default'}>{isFree ? 'Có' : 'Không'}</Tag>,
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 120,
      render: (_value: boolean, record: Lesson) => (
        <Switch
          checked={record.isVisible}
          onChange={() => handleToggleVisibility(record)}
          checkedChildren="Hiện"
          unCheckedChildren="Ẩn"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 130,
      render: (_value: unknown, record: Lesson) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small" />
          </Tooltip>
          <Popconfirm title="Bạn chắc chắn muốn xóa bài học này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="manage-tab-toolbar">
        <Title level={4} className="manage-tab-title">
          Danh sách bài học
        </Title>

        <div className="manage-tab-toolbar-left">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm bài học..."
            allowClear
            className="manage-tab-search"
          />

          <Select<VisibilityFilter>
            value={visibilityFilter}
            onChange={setVisibilityFilter}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'visible', label: 'Đang hiển thị' },
              { value: 'hidden', label: 'Đang ẩn' },
            ]}
            className="manage-tab-filter"
          />

          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Thêm bài học
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLessons}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: 'Chưa có bài học nào.' }}
        scroll={{ x: 960 }}
      />

      <Modal
        title={editingLesson ? 'Cập nhật bài học' : 'Thêm bài học mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tên bài học" rules={[{ required: true, message: 'Vui lòng nhập tên bài học.' }]}>
            <Input placeholder="Ví dụ: Tổng quan về khóa học" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả ngắn">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về nội dung bài học" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item name="type" label="Loại bài học" rules={[{ required: true, message: 'Vui lòng chọn loại bài học.' }]}>
              <Select
                options={[
                  { value: 'video', label: 'Video' },
                  { value: 'reading', label: 'Đọc hiểu' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'assignment', label: 'Bài tập' },
                ]}
              />
            </Form.Item>

            <Form.Item name="order" label="Thứ tự hiển thị" rules={[{ required: true, message: 'Vui lòng nhập thứ tự.' }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item name="duration" label="Thời lượng">
              <Input placeholder="Ví dụ: 15 phút" />
            </Form.Item>

            <Form.Item name="videoUrl" label="Link nội dung / video">
              <Input placeholder="https://..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item name="isFree" label="Cho phép học thử" valuePropName="checked">
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>

            <Form.Item name="isVisible" label="Hiển thị cho học viên" valuePropName="checked">
              <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
            </Form.Item>
          </div>

          <div className="manage-tab-form-actions">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {editingLesson ? 'Lưu thay đổi' : 'Tạo bài học'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassroomTab;
