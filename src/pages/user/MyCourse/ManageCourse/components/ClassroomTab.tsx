import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  useGetLessonsByCourseQuery, 
  useCreateLessonMutation, 
  useUpdateLessonMutation,
  useDeleteLessonMutation 
} from '../../../../../services/courseApi';

const { Option } = Select;

interface ClassroomTabProps {
  courseId: string;
}

const ClassroomTab: React.FC<ClassroomTabProps> = ({ courseId }) => {
  const { data: lessonsData, isLoading, refetch } = useGetLessonsByCourseQuery(courseId);
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const lessons = lessonsData?.data || [];

  const handleOpenModal = (lesson?: any) => {
    if (lesson) {
      setEditingLessonId(lesson.id);
      form.setFieldsValue(lesson);
    } else {
      setEditingLessonId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFinish = async (values: any) => {
    try {
      if (editingLessonId) {
        await updateLesson({ id: editingLessonId, data: values }).unwrap();
        message.success('Cập nhật bài học thành công');
      } else {
        await createLesson({ ...values, courseId }).unwrap();
        message.success('Tạo bài học thành công');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLesson(id).unwrap();
      message.success('Đã xóa bài học');
      refetch();
    } catch (error) {
      message.error('Không thể xóa bài học');
    }
  };

  const handleToggleVisibility = async (lesson: any) => {
    try {
      await updateLesson({ id: lesson.id, data: { isVisible: !lesson.isVisible } }).unwrap();
      message.success(lesson.isVisible ? 'Đã ẩn bài học' : 'Đã hiện bài học');
      refetch();
    } catch {
      message.error('Không thể cập nhật trạng thái hiển thị');
    }
  };

  const columns = [
    { title: 'Thứ tự', dataIndex: 'order', key: 'order', width: 80 },
    { title: 'Tên bài học', dataIndex: 'title', key: 'title' },
    { 
      title: 'Loại', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => {
        const colorMap: Record<string, string> = { video: 'blue', reading: 'green', quiz: 'orange', assignment: 'purple' };
        return <Tag color={colorMap[type] || 'default'}>{type.toUpperCase()}</Tag>;
      }
    },
    { title: 'Thời lượng', dataIndex: 'duration', key: 'duration' },
    { 
      title: 'Miễn phí', 
      dataIndex: 'isFree', 
      key: 'isFree',
      render: (isFree: boolean) => isFree ? <Tag color="success">Có</Tag> : <Tag color="default">Không</Tag>
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 100,
      render: (_: any, record: any) => (
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
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small" />
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#012643]">Danh sách Bài học</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenModal()}
          className="!bg-[#012643]"
        >
          Thêm Bài học
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={lessons} 
        rowKey="id" 
        loading={isLoading} 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingLessonId ? "Sửa Bài học" : "Thêm Bài học"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tên bài học" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="type" label="Loại bài học" initialValue="video">
            <Select>
              <Option value="video">Video</Option>
              <Option value="reading">Đọc hiểu</Option>
              <Option value="quiz">Quiz</Option>
              <Option value="assignment">Bài tập</Option>
            </Select>
          </Form.Item>
          <Form.Item name="videoUrl" label="Video URL / Link nội dung">
            <Input />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item name="order" label="Thứ tự hiển thị" initialValue={1} className="flex-1">
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="duration" label="Thời lượng (vd: 10 phút)" className="flex-1">
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="isFree" label="Miễn phí trải nghiệm">
            <Select defaultValue={false}>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isVisible" label="Hiển thị cho học viên" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
          
          <Button type="primary" htmlType="submit" className="w-full !bg-[#012643]" loading={isCreating || isUpdating}>
            {editingLessonId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassroomTab;
