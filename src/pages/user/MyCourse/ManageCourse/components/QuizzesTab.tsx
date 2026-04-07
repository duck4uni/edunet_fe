import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import QuizQuestionManager from './QuizQuestionManager';
import { 
  useGetQuizzesByCourseQuery, 
  useCreateQuizMutation, 
  useUpdateQuizMutation,
  useDeleteQuizMutation 
} from '../../../../../services/learningApi';

interface QuizzesTabProps {
  courseId: string;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ courseId }) => {
  const { data: quizzesData, isLoading, refetch } = useGetQuizzesByCourseQuery(courseId);
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manageQuizId, setManageQuizId] = useState<string | null>(null);
  const [manageQuestionsData, setManageQuestionsData] = useState<any>(null);
  const [isQuestionManagerVisible, setIsQuestionManagerVisible] = useState(false);
  const [form] = Form.useForm();

  const quizzes = quizzesData?.data || [];

  const handleOpenModal = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFinish = async (values: any) => {
    try {
      if (editingId) {
        await updateQuiz({ id: editingId, data: values }).unwrap();
        message.success('Cập nhật Quiz thành công');
      } else {
        await createQuiz({ ...values, courseId }).unwrap();
        message.success('Tạo Quiz thành công');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuiz(id).unwrap();
      message.success('Đã xóa Quiz');
      refetch();
    } catch (error) {
      message.error('Không thể xóa Quiz');
    }
  };

  const handleToggleVisibility = async (quiz: any) => {
    try {
      await updateQuiz({ id: quiz.id, data: { isVisible: !quiz.isVisible } }).unwrap();
      message.success(quiz.isVisible ? 'Đã ẩn Quiz' : 'Đã hiện Quiz');
      refetch();
    } catch {
      message.error('Không thể cập nhật trạng thái hiển thị');
    }
  };

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration' },
    { title: 'Số câu hỏi', dataIndex: 'totalQuestions', key: 'totalQuestions' },
    { title: 'Điểm qua môn', dataIndex: 'passingScore', key: 'passingScore' },
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
          <Button 
            icon={<UnorderedListOutlined />} 
            onClick={() => {
              setManageQuizId(record.id);
              setManageQuestionsData(record.questions);
              setIsQuestionManagerVisible(true);
            }} 
            size="small" 
            title="Quản lý câu hỏi"
          />
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
        <h3 className="text-lg font-semibold text-[#012643]">Danh sách Quiz</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenModal()}
          className="!bg-[#012643]"
        >
          Thêm Quiz
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={quizzes} 
        rowKey="id" 
        loading={isLoading} 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa Quiz" : "Thêm Quiz"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Tiêu đề Quiz" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="duration" label="Thời gian làm bài (phút)" initialValue={30} rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="passingScore" label="Điểm qua (%)" initialValue={50} rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="maxAttempts" label="Số lần thi tối đa" initialValue={1} rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="totalQuestions" label="Tổng số câu hỏi" initialValue={10} rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          <div className="flex gap-8 mb-4">
            <Form.Item name="shuffleQuestions" label="Xáo trộn câu hỏi" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="showCorrectAnswers" label="Hiện đáp án đúng" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </div>
          
          <Button type="primary" htmlType="submit" className="w-full !bg-[#012643]" loading={isCreating || isUpdating}>
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form>
      </Modal>

      <QuizQuestionManager
        visible={isQuestionManagerVisible}
        onClose={() => {
          setIsQuestionManagerVisible(false);
          refetch(); // Refresh to get updated questions list
        }}
        quizId={manageQuizId!}
        initialQuestions={manageQuestionsData}
      />
    </div>
  );
};

export default QuizzesTab;
