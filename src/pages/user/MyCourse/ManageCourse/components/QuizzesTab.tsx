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
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import QuizQuestionManager from './QuizQuestionManager';
import { notify } from '../../../../../utils/notify';
import {
  type Quiz,
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useGetQuizzesByCourseQuery,
  useUpdateQuizMutation,
} from '../../../../../services/learningApi';

const { Title, Text } = Typography;

type VisibilityFilter = 'all' | 'visible' | 'hidden';

type QuizFormValues = {
  title: string;
  description?: string;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  totalQuestions: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  isVisible: boolean;
};

type QuestionManagerState = {
  quizId: string;
  questions: unknown;
};

interface QuizzesTabProps {
  courseId: string;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ courseId }) => {
  const { data: quizzesData, isLoading, refetch } = useGetQuizzesByCourseQuery(courseId);
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [searchText, setSearchText] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [questionManagerState, setQuestionManagerState] = useState<QuestionManagerState | null>(null);
  const [form] = Form.useForm();

  const quizzes = quizzesData?.data ?? [];

  const filteredQuizzes = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const matchesKeyword =
        !normalizedKeyword ||
        quiz.title.toLowerCase().includes(normalizedKeyword) ||
        (quiz.description || '').toLowerCase().includes(normalizedKeyword);

      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' ? quiz.isVisible : !quiz.isVisible);

      return matchesKeyword && matchesVisibility;
    });
  }, [quizzes, searchText, visibilityFilter]);

  const openModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      form.setFieldsValue({
        ...quiz,
        duration: Number(quiz.duration) || 30,
        passingScore: Number(quiz.passingScore) || 50,
        maxAttempts: Number(quiz.maxAttempts) || 1,
        totalQuestions: Number(quiz.totalQuestions) || 10,
        shuffleQuestions: quiz.shuffleQuestions ?? true,
        showCorrectAnswers: quiz.showCorrectAnswers ?? true,
        isVisible: quiz.isVisible ?? true,
      });
    } else {
      setEditingQuiz(null);
      form.resetFields();
      form.setFieldsValue({
        duration: 30,
        passingScore: 50,
        maxAttempts: 1,
        totalQuestions: 10,
        shuffleQuestions: true,
        showCorrectAnswers: true,
        isVisible: true,
      });
    }

    setIsModalOpen(true);
  };

  const handleFinish = async (values: QuizFormValues) => {
    const payload = {
      ...values,
      duration: Number(values.duration) || 0,
      passingScore: Number(values.passingScore) || 0,
      maxAttempts: Number(values.maxAttempts) || 1,
      totalQuestions: Number(values.totalQuestions) || 1,
      shuffleQuestions: !!values.shuffleQuestions,
      showCorrectAnswers: !!values.showCorrectAnswers,
      isVisible: !!values.isVisible,
    };

    try {
      if (editingQuiz) {
        await updateQuiz({ id: editingQuiz.id, data: payload }).unwrap();
        notify.success('Cập nhật quiz thành công.');
      } else {
        await createQuiz({ ...payload, courseId }).unwrap();
        notify.success('Đã tạo quiz mới.');
      }

      setIsModalOpen(false);
      refetch();
    } catch {
      notify.error('Không thể lưu quiz. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuiz(id).unwrap();
      notify.success('Đã xóa quiz.');
      refetch();
    } catch {
      notify.error('Không thể xóa quiz.');
    }
  };

  const handleToggleVisibility = async (quiz: Quiz) => {
    try {
      await updateQuiz({ id: quiz.id, data: { isVisible: !quiz.isVisible } }).unwrap();
      notify.success(quiz.isVisible ? 'Đã ẩn quiz.' : 'Đã hiển thị quiz.');
      refetch();
    } catch {
      notify.error('Không thể cập nhật trạng thái hiển thị.');
    }
  };

  const columns: ColumnsType<Quiz> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (_title: string, record: Quiz) => (
        <div>
          <Text strong>{record.title}</Text>
          {record.description ? <div className="manage-tab-subtext">{record.description}</div> : null}
        </div>
      ),
    },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration', width: 130 },
    {
      title: 'Số câu hỏi',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      width: 120,
      render: (totalQuestions: number) => totalQuestions || 0,
    },
    {
      title: 'Điểm qua môn',
      dataIndex: 'passingScore',
      key: 'passingScore',
      width: 130,
      render: (passingScore: number) => <Tag color="blue">{passingScore || 0}%</Tag>,
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 120,
      render: (_value: boolean, record: Quiz) => (
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
      width: 180,
      render: (_value: unknown, record: Quiz) => (
        <Space size={4}>
          <Tooltip title="Quản lý câu hỏi">
            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => {
                setQuestionManagerState({
                  quizId: record.id,
                  questions: record.questions,
                });
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small" />
          </Tooltip>
          <Popconfirm title="Bạn chắc chắn muốn xóa quiz này?" onConfirm={() => handleDelete(record.id)}>
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
          Danh sách quiz
        </Title>

        <div className="manage-tab-toolbar-left">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm quiz..."
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

          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm quiz
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredQuizzes}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: 'Chưa có quiz nào.' }}
        scroll={{ x: 1080 }}
      />

      <Modal
        title={editingQuiz ? 'Cập nhật quiz' : 'Thêm quiz mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={740}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tiêu đề quiz" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề quiz.' }]}> 
            <Input placeholder="Ví dụ: Kiểm tra chương 1" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn về quiz" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              name="duration"
              label="Thời gian làm bài (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian làm bài.' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item
              name="passingScore"
              label="Điểm qua (%)"
              rules={[{ required: true, message: 'Vui lòng nhập điểm qua.' }]}
            >
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>

            <Form.Item
              name="maxAttempts"
              label="Số lần thi tối đa"
              rules={[{ required: true, message: 'Vui lòng nhập số lần thi.' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item
              name="totalQuestions"
              label="Tổng số câu hỏi"
              rules={[{ required: true, message: 'Vui lòng nhập tổng số câu hỏi.' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Form.Item name="shuffleQuestions" label="Xáo trộn câu hỏi" valuePropName="checked">
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>

            <Form.Item name="showCorrectAnswers" label="Hiện đáp án đúng" valuePropName="checked">
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
                {editingQuiz ? 'Lưu thay đổi' : 'Tạo quiz'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <QuizGenerationDrawer
        open={isGenerationDrawerOpen}
        onClose={() => setIsGenerationDrawerOpen(false)}
        courseId={courseId}
        onCreated={refetch}
      />

      <QuizQuestionManager
        visible={!!questionManagerState}
        onClose={() => {
          setQuestionManagerState(null);
          refetch();
        }}
        quizId={questionManagerState?.quizId || ''}
        initialQuestions={questionManagerState?.questions}
      />
    </div>
  );
};

export default QuizzesTab;
