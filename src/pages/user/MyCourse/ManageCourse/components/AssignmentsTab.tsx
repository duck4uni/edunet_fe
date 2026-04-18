import React, { useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
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
import {
  BulbOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  type Assignment,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentsByCourseQuery,
  useUpdateAssignmentMutation,
} from '../../../../../services/learningApi';
import dayjs, { type Dayjs } from 'dayjs';

import { notify } from '../../../../../utils/notify';
import {
  type GeneratedAssignmentSuggestion,
  useGenerateCourseContentMutation,
} from '../../../../../services/chatbotApi';

const { Title, Text } = Typography;

type VisibilityFilter = 'all' | 'visible' | 'hidden';

type AssignmentFormValues = {
  title: string;
  description?: string;
  dueDate?: Dayjs;
  maxGrade: number;
  isVisible: boolean;
};

const STATUS_META: Record<Assignment['status'], { label: string; color: string }> = {
  pending: { label: 'Đang chờ nộp', color: 'processing' },
  submitted: { label: 'Đã nộp', color: 'blue' },
  graded: { label: 'Đã chấm', color: 'success' },
  overdue: { label: 'Quá hạn', color: 'error' },
};

interface AssignmentsTabProps {
  courseId: string;
  courseTitle?: string;
  courseDescription?: string;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ courseId, courseTitle, courseDescription }) => {
  const { data: assignmentsData, isLoading, refetch } = useGetAssignmentsByCourseQuery(courseId);
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [generateCourseContent, { isLoading: isAiGenerating }] = useGenerateCourseContentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [searchText, setSearchText] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [aiRequirement, setAiRequirement] = useState('');
  const [form] = Form.useForm();

  const assignments = assignmentsData?.data ?? [];

  const filteredAssignments = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesKeyword =
        !normalizedKeyword ||
        assignment.title.toLowerCase().includes(normalizedKeyword) ||
        (assignment.description || '').toLowerCase().includes(normalizedKeyword);

      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' ? assignment.isVisible : !assignment.isVisible);

      return matchesKeyword && matchesVisibility;
    });
  }, [assignments, searchText, visibilityFilter]);

  const openCreateModal = (initialValues?: Partial<AssignmentFormValues>) => {
    setEditingAssignment(null);
    form.resetFields();
    form.setFieldsValue({
      maxGrade: 100,
      isVisible: true,
      dueDate: dayjs().add(7, 'day'),
      ...initialValues,
    });
    setIsModalOpen(true);
  };

  const handleOpenModal = (record?: Assignment) => {
    if (!record) {
      openCreateModal();
      return;
    }

    setEditingAssignment(record);
    form.setFieldsValue({
      ...record,
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
      isVisible: record.isVisible ?? true,
    });
    setIsModalOpen(true);
  };

  const handleGenerateWithAi = async () => {
    try {
      const result = await generateCourseContent({
        contentType: 'assignment',
        courseTitle: courseTitle?.trim() || 'Khóa học hiện tại',
        courseDescription: courseDescription?.trim() || undefined,
        requirement: aiRequirement.trim() || undefined,
      }).unwrap();

      const suggestion = result?.data?.suggestion as GeneratedAssignmentSuggestion | undefined;
      if (!suggestion) {
        notify.error('AI chưa trả về dữ liệu hợp lệ. Vui lòng thử lại.');
        return;
      }

      const parsedDueDate = dayjs(suggestion.dueDate);

      openCreateModal({
        title: suggestion.title || 'Bài tập mới từ AI',
        description: suggestion.description || '',
        dueDate: parsedDueDate.isValid() ? parsedDueDate : dayjs().add(7, 'day'),
        maxGrade: Number(suggestion.maxGrade) || 100,
        isVisible: typeof suggestion.isVisible === 'boolean' ? suggestion.isVisible : true,
      });

      setIsAiModalOpen(false);
      setAiRequirement('');
      notify.success('AI đã sinh dữ liệu bài tập. Bạn kiểm tra lại rồi bấm lưu.');
    } catch {
      notify.error('Không thể tạo dữ liệu bài tập bằng AI. Vui lòng thử lại.');
    }
  };

  const handleFinish = async (values: AssignmentFormValues) => {
    if (!values.dueDate) {
      notify.error('Vui lòng chọn hạn nộp bài.');
      return;
    }

    const formattedValues = {
      ...values,
      dueDate: values.dueDate.toISOString(),
      maxGrade: Number(values.maxGrade) || 0,
      isVisible: !!values.isVisible,
    };

    try {
      if (editingAssignment) {
        await updateAssignment({ id: editingAssignment.id, data: formattedValues }).unwrap();
        notify.success('Cập nhật bài tập thành công.');
      } else {
        await createAssignment({ ...formattedValues, courseId, status: 'pending' }).unwrap();
        notify.success('Đã tạo bài tập mới.');
      }

      setIsModalOpen(false);
      refetch();
    } catch {
      notify.error('Không thể lưu bài tập. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id).unwrap();
      notify.success('Đã xóa bài tập.');
      refetch();
    } catch {
      notify.error('Không thể xóa bài tập.');
    }
  };

  const handleToggleVisibility = async (assignment: Assignment) => {
    try {
      await updateAssignment({ id: assignment.id, data: { isVisible: !assignment.isVisible } }).unwrap();
      notify.success(assignment.isVisible ? 'Đã ẩn bài tập.' : 'Đã hiển thị bài tập.');
      refetch();
    } catch {
      notify.error('Không thể cập nhật trạng thái hiển thị.');
    }
  };

  const columns: ColumnsType<Assignment> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (_title: string, record: Assignment) => (
        <div>
          <Text strong>{record.title}</Text>
          {record.description ? <div className="manage-tab-subtext">{record.description}</div> : null}
        </div>
      ),
    },
    {
      title: 'Hạn chót',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 165,
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxGrade',
      key: 'maxGrade',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: Assignment['status']) => {
        const meta = STATUS_META[status] || { label: status, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 120,
      render: (_value: boolean, record: Assignment) => (
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
      render: (_value: unknown, record: Assignment) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small" />
          </Tooltip>
          <Popconfirm title="Bạn chắc chắn muốn xóa bài tập này?" onConfirm={() => handleDelete(record.id)}>
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
          Danh sách bài tập
        </Title>

        <div className="manage-tab-toolbar-left">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm bài tập..."
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
            Thêm bài tập
          </Button>

          <Button icon={<BulbOutlined />} onClick={() => setIsAiModalOpen(true)}>
            Tạo với AI
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAssignments}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: 'Chưa có bài tập nào.' }}
        scroll={{ x: 1024 }}
      />

      <Modal
        title={editingAssignment ? 'Cập nhật bài tập' : 'Thêm bài tập mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài tập.' }]}> 
            <Input placeholder="Ví dụ: Bài tập tuần 1" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả / Yêu cầu">
            <Input.TextArea rows={4} placeholder="Mô tả yêu cầu nộp bài" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              name="dueDate"
              label="Hạn nộp bài"
              rules={[{ required: true, message: 'Vui lòng chọn hạn nộp bài.' }]}
            >
              <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
            </Form.Item>

            <Form.Item
              name="maxGrade"
              label="Điểm tối đa"
              rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa.' }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="isVisible" label="Hiển thị cho học viên" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>

          <div className="manage-tab-form-actions">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {editingAssignment ? 'Lưu thay đổi' : 'Tạo bài tập'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Tạo bài tập với AI Gemini"
        open={isAiModalOpen}
        onCancel={() => setIsAiModalOpen(false)}
        onOk={handleGenerateWithAi}
        okText="Sinh dữ liệu"
        cancelText="Hủy"
        confirmLoading={isAiGenerating}
      >
        <p className="manage-tab-subtext">
          Nhập chủ đề hoặc yêu cầu để AI tạo dữ liệu bài tập phù hợp với khóa học hiện tại.
        </p>
        <Input.TextArea
          value={aiRequirement}
          onChange={(event) => setAiRequirement(event.target.value)}
          rows={4}
          placeholder="Ví dụ: Tạo bài tập thực hành về API REST, hạn nộp trong 7 ngày"
        />
      </Modal>
    </div>
  );
};

export default AssignmentsTab;
