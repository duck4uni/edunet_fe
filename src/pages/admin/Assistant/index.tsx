import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../components/admin';
import {
  useCreateAssistantQuickActionMutation,
  useDeleteAssistantQuickActionMutation,
  useGetAssistantIntentConfigsQuery,
  useGetAssistantQuickActionsAdminQuery,
  useUpdateAssistantIntentConfigMutation,
  useUpdateAssistantQuickActionMutation,
  type PersonalAssistantQuickAction,
} from '../../../services/personalAssistantApi';
import { notify } from '../../../utils/notify';

const { Text } = Typography;

const iconOptions = [
  'BookOutlined',
  'FileTextOutlined',
  'CalendarOutlined',
  'TrophyOutlined',
  'SearchOutlined',
  'QuestionCircleOutlined',
];

const AssistantManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<PersonalAssistantQuickAction | null>(null);

  const { data: intentsRes, isLoading: intentsLoading } = useGetAssistantIntentConfigsQuery();
  const { data: actionsRes, isLoading: actionsLoading, isFetching: actionsFetching } = useGetAssistantQuickActionsAdminQuery();

  const [updateIntent, { isLoading: updatingIntent }] = useUpdateAssistantIntentConfigMutation();
  const [createAction, { isLoading: creatingAction }] = useCreateAssistantQuickActionMutation();
  const [updateAction, { isLoading: updatingAction }] = useUpdateAssistantQuickActionMutation();
  const [deleteAction] = useDeleteAssistantQuickActionMutation();

  const intents = useMemo(() => intentsRes?.data ?? [], [intentsRes]);
  const actions = useMemo(() => actionsRes?.data ?? [], [actionsRes]);

  const handleToggleIntent = async (intent: string, enabled: boolean) => {
    try {
      await updateIntent({ intent, enabled }).unwrap();
      notify.success('Đã cập nhật trạng thái intent');
    } catch {
      notify.error('Không thể cập nhật intent');
    }
  };

  const openCreateModal = () => {
    setEditingAction(null);
    form.resetFields();
    form.setFieldsValue({
      icon: 'QuestionCircleOutlined',
      enabled: true,
      order: actions.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: PersonalAssistantQuickAction) => {
    setEditingAction(item);
    form.setFieldsValue(item);
    setModalOpen(true);
  };

  const handleSubmitAction = async () => {
    try {
      const values = await form.validateFields();
      if (editingAction) {
        await updateAction({ id: editingAction.id, ...values }).unwrap();
        notify.success('Đã cập nhật quick action');
      } else {
        await createAction(values).unwrap();
        notify.success('Đã thêm quick action');
      }
      setModalOpen(false);
    } catch {
      notify.error('Không thể lưu quick action');
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      await deleteAction({ id }).unwrap();
      notify.success('Đã xóa quick action');
    } catch {
      notify.error('Không thể xóa quick action');
    }
  };

  const handleToggleAction = async (id: string, enabled: boolean) => {
    try {
      await updateAction({ id, enabled }).unwrap();
      notify.success('Đã cập nhật trạng thái quick action');
    } catch {
      notify.error('Không thể cập nhật quick action');
    }
  };

  const intentColumns = [
    {
      title: 'Intent',
      dataIndex: 'intent',
      key: 'intent',
      width: 180,
      render: (value: string) => <Text code>{value}</Text>,
    },
    {
      title: 'Tên chức năng',
      dataIndex: 'label',
      key: 'label',
      width: 200,
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: 'Ví dụ',
      dataIndex: 'examples',
      key: 'examples',
      width: 260,
      render: (examples: string[]) => <Text type="secondary">{(examples || []).join(' | ')}</Text>,
    },
    {
      title: 'Bật/Tắt',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 120,
      render: (enabled: boolean, row: { intent: string }) => (
        <Switch
          checked={enabled}
          loading={updatingIntent}
          onChange={(checked) => handleToggleIntent(row.intent, checked)}
        />
      ),
    },
  ];

  const actionColumns = [
    {
      title: 'Nhãn',
      dataIndex: 'label',
      key: 'label',
      width: 180,
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      width: 180,
      render: (value: string) => <Text code>{value}</Text>,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: 'Hiển thị',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 110,
      render: (enabled: boolean, row: PersonalAssistantQuickAction) => (
        <Switch checked={enabled} onChange={(checked) => handleToggleAction(row.id, checked)} />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_: unknown, row: PersonalAssistantQuickAction) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(row)} />
          <Popconfirm
            title="Xóa quick action này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteAction(row.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Quản lý Trợ lý học tập"
        subtitle="Quản lý intent và quick actions cho trợ lý học tập dùng API"
      />

      <Card className="mt-4">
        <Tabs
          items={[
            {
              key: 'intents',
              label: 'Intent API',
              children: (
                <Table
                  rowKey="intent"
                  columns={intentColumns}
                  dataSource={intents}
                  loading={intentsLoading}
                  pagination={false}
                />
              ),
            },
            {
              key: 'quick-actions',
              label: 'Quick Actions',
              children: (
                <>
                  <div className="mb-4">
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                      Thêm quick action
                    </Button>
                  </div>
                  <Table
                    rowKey="id"
                    columns={actionColumns}
                    dataSource={actions}
                    loading={actionsLoading || actionsFetching}
                    pagination={false}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editingAction ? 'Chỉnh sửa quick action' : 'Thêm quick action'}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmitAction}
        confirmLoading={creatingAction || updatingAction}
        okText={editingAction ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="label" label="Nhãn" rules={[{ required: true, message: 'Nhập nhãn hiển thị' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="question" label="Câu hỏi gửi API" rules={[{ required: true, message: 'Nhập câu hỏi' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="icon" label="Icon" rules={[{ required: true, message: 'Chọn icon' }]}>
            <Select options={iconOptions.map((icon) => ({ label: icon, value: icon }))} />
          </Form.Item>
          <Form.Item name="order" label="Thứ tự hiển thị">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="enabled" label="Hiển thị" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssistantManagement;
