import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Tag, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  useGetMaterialsByCourseQuery, 
  useCreateMaterialMutation, 
  useDeleteMaterialMutation,
  useUpdateMaterialMutation 
} from '../../../../../services/learningApi';
import dayjs from 'dayjs';

const { Option } = Select;

interface MaterialsTabProps {
  courseId: string;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ courseId }) => {
  const { data: materialsData, isLoading, refetch } = useGetMaterialsByCourseQuery(courseId);
  const [createMaterial, { isLoading: isCreating }] = useCreateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const materials = materialsData?.data || [];

  const handleFinish = async (values: any) => {
    try {
      await createMaterial({ ...values, courseId }).unwrap();
      message.success('Thêm tài liệu thành công');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm tài liệu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id).unwrap();
      message.success('Đã xóa tài liệu');
      refetch();
    } catch (error) {
      message.error('Không thể xóa tài liệu');
    }
  };

  const handleToggleVisibility = async (material: any) => {
    try {
      await updateMaterial({ id: material.id, data: { isVisible: !material.isVisible } }).unwrap();
      message.success(material.isVisible ? 'Đã ẩn tài liệu' : 'Đã hiện tài liệu');
      refetch();
    } catch {
      message.error('Không thể cập nhật trạng thái hiển thị');
    }
  };

  const columns = [
    { title: 'Tên tài liệu', dataIndex: 'title', key: 'title' },
    { 
      title: 'Loại', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    { title: 'Kích thước', dataIndex: 'size', key: 'size' },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
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
        <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
          <Button icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#012643]">Danh sách Tài liệu</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          className="!bg-[#012643]"
        >
          Thêm Tài liệu
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={materials} 
        rowKey="id" 
        loading={isLoading} 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Thêm Tài liệu"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tên tài liệu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item name="type" label="Loại tài liệu" initialValue="pdf" className="flex-1" rules={[{ required: true }]}>
              <Select>
                <Option value="pdf">PDF</Option>
                <Option value="document">Document</Option>
                <Option value="video">Video</Option>
                <Option value="link">Link</Option>
                <Option value="image">Image</Option>
              </Select>
            </Form.Item>
            <Form.Item name="size" label="Kích thước (vd: 2.5MB)" className="flex-1">
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="downloadUrl" label="Link / URL tải xuống" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" className="w-full !bg-[#012643]" loading={isCreating}>
            Thêm mới
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialsTab;
