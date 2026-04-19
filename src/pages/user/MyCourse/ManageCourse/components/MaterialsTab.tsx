import React, { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
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
import {
  BulbOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  type Material,
  useCreateMaterialMutation,
  useDeleteMaterialMutation,
  useGetMaterialsByCourseQuery,
  useUpdateMaterialMutation,
} from '../../../../../services/learningApi';
import dayjs from 'dayjs';

import { notify } from '../../../../../utils/notify';
import {
  type GeneratedMaterialSuggestion,
  useGenerateCourseContentMutation,
} from '../../../../../services/chatbotApi';

const { Title, Text } = Typography;

type VisibilityFilter = 'all' | 'visible' | 'hidden';

type MaterialFormValues = {
  title: string;
  description?: string;
  type: Material['type'];
  size?: string;
  downloadUrl: string;
  isVisible: boolean;
};

const MATERIAL_TYPE_META: Record<Material['type'], { label: string; color: string }> = {
  pdf: { label: 'PDF', color: 'red' },
  document: { label: 'Document', color: 'blue' },
  video: { label: 'Video', color: 'purple' },
  link: { label: 'Link', color: 'cyan' },
  image: { label: 'Image', color: 'green' },
};

interface MaterialsTabProps {
  courseId: string;
  courseTitle?: string;
  courseDescription?: string;
}

const MATERIAL_TYPES: Material['type'][] = ['pdf', 'document', 'video', 'link', 'image'];

const MaterialsTab: React.FC<MaterialsTabProps> = ({ courseId, courseTitle, courseDescription }) => {
  const { data: materialsData, isLoading, refetch } = useGetMaterialsByCourseQuery(courseId);
  const [createMaterial, { isLoading: isCreating }] = useCreateMaterialMutation();
  const [updateMaterial, { isLoading: isUpdating }] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();
  const [generateCourseContent, { isLoading: isAiGenerating }] = useGenerateCourseContentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchText, setSearchText] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [aiRequirement, setAiRequirement] = useState('');
  const [form] = Form.useForm();

  const materials = materialsData?.data ?? [];

  const filteredMaterials = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesKeyword =
        !normalizedKeyword ||
        material.title.toLowerCase().includes(normalizedKeyword) ||
        (material.description || '').toLowerCase().includes(normalizedKeyword);

      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' ? material.isVisible : !material.isVisible);

      return matchesKeyword && matchesVisibility;
    });
  }, [materials, searchText, visibilityFilter]);

  const openCreateModal = (initialValues?: Partial<MaterialFormValues>) => {
    setEditingMaterial(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'pdf',
      isVisible: true,
      ...initialValues,
    });
    setIsModalOpen(true);
  };

  const handleOpenModal = (material?: Material) => {
    if (!material) {
      openCreateModal();
      return;
    }

    setEditingMaterial(material);
    form.setFieldsValue({
      ...material,
      isVisible: material.isVisible ?? true,
    });

    setIsModalOpen(true);
  };

  const handleGenerateWithAi = async () => {
    try {
      const result = await generateCourseContent({
        contentType: 'material',
        courseTitle: courseTitle?.trim() || 'Khóa học hiện tại',
        courseDescription: courseDescription?.trim() || undefined,
        requirement: aiRequirement.trim() || undefined,
      }).unwrap();

      const suggestion = result?.data?.suggestion as GeneratedMaterialSuggestion | undefined;
      if (!suggestion) {
        notify.error('AI chưa trả về dữ liệu hợp lệ. Vui lòng thử lại.');
        return;
      }

      const normalizedType = MATERIAL_TYPES.includes(suggestion.type) ? suggestion.type : 'document';

      openCreateModal({
        title: suggestion.title || 'Tài liệu mới từ AI',
        description: suggestion.description || '',
        type: normalizedType,
        size: suggestion.size || '1.2MB',
        downloadUrl: suggestion.downloadUrl || 'https://example.com/tai-lieu-khoa-hoc',
        isVisible: typeof suggestion.isVisible === 'boolean' ? suggestion.isVisible : true,
      });

      setIsAiModalOpen(false);
      setAiRequirement('');
      notify.success('AI đã sinh dữ liệu tài liệu. Bạn kiểm tra lại rồi bấm lưu.');
    } catch {
      notify.error('Không thể tạo dữ liệu tài liệu bằng AI. Vui lòng thử lại.');
    }
  };

  const handleFinish = async (values: MaterialFormValues) => {
    const payload = {
      ...values,
      isVisible: !!values.isVisible,
    };

    try {
      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial.id, data: payload }).unwrap();
        notify.success('Cập nhật tài liệu thành công.');
      } else {
        await createMaterial({ ...payload, courseId }).unwrap();
        notify.success('Đã thêm tài liệu mới.');
      }

      setIsModalOpen(false);
      refetch();
    } catch {
      notify.error('Không thể lưu tài liệu. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id).unwrap();
      notify.success('Đã xóa tài liệu.');
      refetch();
    } catch {
      notify.error('Không thể xóa tài liệu.');
    }
  };

  const handleToggleVisibility = async (material: Material) => {
    try {
      await updateMaterial({ id: material.id, data: { isVisible: !material.isVisible } }).unwrap();
      notify.success(material.isVisible ? 'Đã ẩn tài liệu.' : 'Đã hiển thị tài liệu.');
      refetch();
    } catch {
      notify.error('Không thể cập nhật trạng thái hiển thị.');
    }
  };

  const columns: ColumnsType<Material> = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'title',
      key: 'title',
      render: (_title: string, record: Material) => (
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
      width: 130,
      render: (type: Material['type']) => {
        const meta = MATERIAL_TYPE_META[type] || { label: type, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size?: string) => size || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 155,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 120,
      render: (_value: boolean, record: Material) => (
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
      render: (_value: unknown, record: Material) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small" />
          </Tooltip>
          <Popconfirm title="Bạn chắc chắn muốn xóa tài liệu này?" onConfirm={() => handleDelete(record.id)}>
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
          Danh sách tài liệu
        </Title>

        <div className="manage-tab-toolbar-left">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm tài liệu..."
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
            Thêm tài liệu
          </Button>

          <Button icon={<BulbOutlined />} onClick={() => setIsAiModalOpen(true)}>
            Tạo với AI
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMaterials}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: 'Chưa có tài liệu nào.' }}
        scroll={{ x: 980 }}
      />

      <Modal
        title={editingMaterial ? 'Cập nhật tài liệu' : 'Thêm tài liệu mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tên tài liệu" rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu.' }]}>
            <Input placeholder="Ví dụ: Tài liệu bài 1" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về tài liệu" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              name="type"
              label="Loại tài liệu"
              rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu.' }]}
            >
              <Select
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'document', label: 'Document' },
                  { value: 'video', label: 'Video' },
                  { value: 'link', label: 'Link' },
                  { value: 'image', label: 'Image' },
                ]}
              />
            </Form.Item>

            <Form.Item name="size" label="Kích thước">
              <Input placeholder="Ví dụ: 2.5MB" />
            </Form.Item>
          </div>

          <Form.Item
            name="downloadUrl"
            label="Link tải xuống"
            rules={[{ required: true, message: 'Vui lòng nhập link tài liệu.' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="isVisible" label="Hiển thị cho học viên" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>

          <div className="manage-tab-form-actions">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {editingMaterial ? 'Lưu thay đổi' : 'Tạo tài liệu'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Tạo tài liệu với AI Gemini"
        open={isAiModalOpen}
        onCancel={() => setIsAiModalOpen(false)}
        onOk={handleGenerateWithAi}
        okText="Sinh dữ liệu"
        cancelText="Hủy"
        confirmLoading={isAiGenerating}
      >
        <p className="manage-tab-subtext">
          Nhập chủ đề hoặc yêu cầu để AI tạo dữ liệu tài liệu phù hợp với khóa học hiện tại.
        </p>
        <Input.TextArea
          value={aiRequirement}
          onChange={(event) => setAiRequirement(event.target.value)}
          rows={4}
          placeholder="Ví dụ: Tạo tài liệu PDF tóm tắt chương 1, dành cho người mới bắt đầu"
        />
      </Modal>
    </div>
  );
};

export default MaterialsTab;
