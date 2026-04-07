import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, DatePicker, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  useGetAssignmentsByCourseQuery, 
  useCreateAssignmentMutation, 
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation 
} from '../../../../../services/learningApi';
import dayjs from 'dayjs';

interface AssignmentsTabProps {
  courseId: string;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ courseId }) => {
  const { data: assignmentsData, isLoading, refetch } = useGetAssignmentsByCourseQuery(courseId);
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const assignments = assignmentsData?.data || [];

  const handleOpenModal = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        dueDate: record.dueDate ? dayjs(record.dueDate) : undefined
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFinish = async (values: any) => {
    const formattedValues = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    };

    try {
      if (editingId) {
        await updateAssignment({ id: editingId, data: formattedValues }).unwrap();
        message.success('Cập nhật bài tập thành công');
      } else {
        await createAssignment({ ...formattedValues, courseId, status: 'pending' }).unwrap();
        message.success('Tạo bài tập thành công');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id).unwrap();
      message.success('Đã xóa bài tập');
      refetch();
    } catch (error) {
      message.error('Không thể xóa bài tập');
    }
  };

  const handleToggleVisibility = async (assignment: any) => {
    try {
      await updateAssignment({ id: assignment.id, data: { isVisible: !assignment.isVisible } }).unwrap();
      message.success(assignment.isVisible ? 'Đã ẩn bài tập' : 'Đã hiện bài tập');
      refetch();
    } catch {
      message.error('Không thể cập nhật trạng thái hiển thị');
    }
  };

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { 
      title: 'Hạn chót', 
      dataIndex: 'dueDate', 
      key: 'dueDate',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    { title: 'Điểm tối đa', dataIndex: 'maxGrade', key: 'maxGrade' },
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
        <h3 className="text-lg font-semibold text-[#012643]">Danh sách Bài tập</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenModal()}
          className="!bg-[#012643]"
        >
          Thêm Bài tập
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={assignments} 
        rowKey="id" 
        loading={isLoading} 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa Bài tập" : "Thêm Bài tập"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả / Yêu cầu">
            <Input.TextArea rows={4} />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item name="dueDate" label="Hạn nộp bài" className="flex-1" rules={[{ required: true }]}>
              <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
            </Form.Item>
            <Form.Item name="maxGrade" label="Điểm tối đa" initialValue={100} className="flex-1" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
          
          <Button type="primary" htmlType="submit" className="w-full !bg-[#012643]" loading={isCreating || isUpdating}>
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentsTab;
