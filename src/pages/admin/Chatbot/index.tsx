import React, { useState } from 'react';
import {
  Button, Table, Tag, Typography, Space, Modal, Form, Input, message,
  Popconfirm, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import {
  useGetChatDataListQuery,
  useCreateChatDataMutation,
  useUpdateChatDataMutation,
  useDeleteChatDataMutation,
  type ChatData,
  type CreateChatDataRequest,
} from '../../../services/chatbotApi';
import { PageHeader } from '../../../components/admin';

const { Text } = Typography;
const { TextArea } = Input;

const ChatbotManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChatData | null>(null);
  const [form] = Form.useForm<CreateChatDataRequest>();

  const { data, isLoading, isFetching } = useGetChatDataListQuery({ page, limit: 20 });
  const [createChatData, { isLoading: creating }] = useCreateChatDataMutation();
  const [updateChatData, { isLoading: updating }] = useUpdateChatDataMutation();
  const [deleteChatData] = useDeleteChatDataMutation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: ChatData[] = (data as any)?.data?.rows ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total: number = (data as any)?.data?.count ?? 0;

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (item: ChatData) => {
    setEditingItem(item);
    form.setFieldsValue({ title: item.title, content: item.content });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingItem) {
      const res = await updateChatData({ id: editingItem.id, body: values });
      if ('error' in res) {
        message.error('Cập nhật thất bại');
        return;
      }
      message.success('Cập nhật thành công');
    } else {
      const res = await createChatData(values);
      if ('error' in res) {
        message.error('Thêm mới thất bại');
        return;
      }
      message.success('Thêm mới thành công');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteChatData(id);
    if ('error' in res) {
      message.error('Xóa thất bại');
      return;
    }
    message.success('Đã xóa');
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 240,
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <Tooltip title={content} placement="topLeft">
          <Text type="secondary" className="line-clamp-2">{content}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 90,
      render: (t: string) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 160,
      render: (d: string) => <Text type="secondary" className="text-xs">{d}</Text>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 110,
      render: (_: unknown, record: ChatData) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa chủ đề này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Quản lý chatbot"
        subtitle="Thêm và quản lý các chủ đề kiến thức cho trợ lý AI"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm chủ đề
          </Button>
        }
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={isLoading || isFetching}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `Tổng ${t} chủ đề`,
        }}
        className="mt-4"
      />

      <Modal
        open={modalOpen}
        title={editingItem ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="Tiêu đề chủ đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Ví dụ: Hướng dẫn đăng ký khóa học" maxLength={200} showCount />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung kiến thức"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            extra="Chatbot AI sẽ dùng nội dung này để trả lời câu hỏi liên quan"
          >
            <TextArea
              rows={8}
              placeholder="Nhập nội dung chi tiết về chủ đề này..."
              maxLength={5000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatbotManagement;
