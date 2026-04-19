import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tabs,
} from 'antd';
import {
  DeleteOutlined,
  FormOutlined,
  PlusOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  useCreateQuizMutation,
  useGenerateAiQuizMutation,
  type QuizQuestion,
} from '../../../../../services/learningApi';
import { notify } from '../../../../../utils/notify';

interface QuizGenerationDrawerProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onCreated?: () => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const createEmptyQuestion = (): QuizQuestion => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text: '',
  options: OPTION_KEYS.map((key) => ({ key, label: '' })),
  correctAnswer: 'A',
});

const QuizGenerationDrawer: React.FC<QuizGenerationDrawerProps> = ({
  open,
  onClose,
  courseId,
  onCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([createEmptyQuestion()]);

  const [manualForm] = Form.useForm();
  const [aiForm] = Form.useForm();

  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [generateAiQuiz, { isLoading: isGenerating }] = useGenerateAiQuizMutation();

  const isSubmitting = useMemo(
    () => (activeTab === 'manual' ? isCreating : isGenerating),
    [activeTab, isCreating, isGenerating],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab('manual');
    setManualQuestions([createEmptyQuestion()]);

    manualForm.setFieldsValue({
      title: '',
      description: '',
      duration: 30,
      passingScore: 70,
      maxAttempts: 1,
      shuffleQuestions: true,
      showCorrectAnswers: true,
      isVisible: true,
    });

    aiForm.setFieldsValue({
      title: '',
      topic: '',
      description: '',
      questionCount: 10,
      difficulty: 'medium',
      language: 'vi',
      additionalInstructions: '',
      duration: 30,
      passingScore: 70,
      maxAttempts: 1,
      shuffleQuestions: true,
      showCorrectAnswers: true,
      isVisible: true,
    });
  }, [open, manualForm, aiForm]);

  const updateManualQuestion = (
    questionId: string,
    updater: (question: QuizQuestion) => QuizQuestion,
  ) => {
    setManualQuestions((prev) =>
      prev.map((question) => (question.id === questionId ? updater(question) : question)),
    );
  };

  const handleAddManualQuestion = () => {
    setManualQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const handleRemoveManualQuestion = (questionId: string) => {
    setManualQuestions((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((question) => question.id !== questionId);
    });
  };

  const validateManualQuestions = (questions: QuizQuestion[]) => {
    if (questions.length === 0) {
      notify.error('Vui lòng thêm ít nhất 1 câu hỏi.');
      return false;
    }

    const hasInvalidQuestion = questions.some((question) => {
      if (!question.text.trim()) {
        return true;
      }
      if (question.options.length !== 4) {
        return true;
      }
      if (question.options.some((option) => !option.label.trim())) {
        return true;
      }
      return !question.options.some((option) => option.key === question.correctAnswer);
    });

    if (hasInvalidQuestion) {
      notify.error('Mỗi câu hỏi cần có nội dung, đủ 4 đáp án và 1 đáp án đúng.');
      return false;
    }

    return true;
  };

  const handleManualCreate = async () => {
    try {
      const values = await manualForm.validateFields();

      const questions = manualQuestions.map((question) => ({
        id: question.id,
        text: question.text.trim(),
        options: question.options.map((option) => ({
          key: option.key,
          label: option.label.trim(),
        })),
        correctAnswer: question.correctAnswer,
      }));

      if (!validateManualQuestions(questions)) {
        return;
      }

      await createQuiz({
        ...values,
        courseId,
        questions,
        totalQuestions: questions.length,
      }).unwrap();

      notify.success('Tạo quiz thủ công thành công.');
      onCreated?.();
      onClose();
    } catch (error) {
      if (typeof error === 'object' && error && 'errorFields' in error) {
        return;
      }
      notify.error('Không thể tạo quiz thủ công.');
    }
  };

  const handleAiCreate = async () => {
    try {
      const values = await aiForm.validateFields();

      await generateAiQuiz({
        ...values,
        courseId,
      }).unwrap();

      notify.success('Tạo quiz bằng AI thành công.');
      onCreated?.();
      onClose();
    } catch (error) {
      if (typeof error === 'object' && error && 'errorFields' in error) {
        return;
      }
      notify.error('Không thể tạo quiz bằng AI.');
    }
  };

  return (
    <Drawer
      title="Tạo Quiz"
      open={open}
      onClose={onClose}
      placement="right"
      width={920}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={activeTab === 'manual' ? handleManualCreate : handleAiCreate}
          >
            {activeTab === 'manual' ? 'Tạo quiz thủ công' : 'Tạo quiz bằng AI'}
          </Button>
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'manual' | 'ai')}
        items={[
          {
            key: 'manual',
            label: (
              <Space size={6}>
                <FormOutlined />
                <span>Thủ công</span>
              </Space>
            ),
            children: (
              <>
                <Form form={manualForm} layout="vertical">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="title" label="Tiêu đề quiz" rules={[{ required: true }]}> 
                      <Input placeholder="Ví dụ: Kiểm tra chương 1" />
                    </Form.Item>

                    <Form.Item
                      name="duration"
                      label="Thời gian làm bài (phút)"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <Form.Item name="passingScore" label="Điểm qua (%)" rules={[{ required: true }]}> 
                      <InputNumber min={0} max={100} className="w-full" />
                    </Form.Item>

                    <Form.Item name="maxAttempts" label="Số lần làm tối đa" rules={[{ required: true }]}> 
                      <InputNumber min={1} className="w-full" />
                    </Form.Item>
                  </div>

                  <Form.Item name="description" label="Mô tả"> 
                    <Input.TextArea rows={3} placeholder="Mô tả ngắn cho quiz" />
                  </Form.Item>

                  <Space size={24} className="mb-2">
                    <Form.Item name="shuffleQuestions" label="Trộn câu hỏi" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="showCorrectAnswers" label="Hiện đáp án đúng" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="isVisible" label="Hiển thị cho học viên" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Space>
                </Form>

                <Divider>Danh sách câu hỏi</Divider>

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddManualQuestion}
                  block
                  className="mb-4"
                >
                  Thêm câu hỏi
                </Button>

                {manualQuestions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="mb-4"
                    title={`Câu hỏi ${index + 1}`}
                    extra={
                      <Popconfirm
                        title="Xóa câu hỏi này?"
                        onConfirm={() => handleRemoveManualQuestion(question.id)}
                        disabled={manualQuestions.length <= 1}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={manualQuestions.length <= 1}
                        />
                      </Popconfirm>
                    }
                  >
                    <div className="mb-3">
                      <Input.TextArea
                        rows={2}
                        placeholder="Nhập nội dung câu hỏi"
                        value={question.text}
                        onChange={(event) =>
                          updateManualQuestion(question.id, (current) => ({
                            ...current,
                            text: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((option, optionIndex) => (
                        <Input
                          key={option.key}
                          addonBefore={option.key}
                          placeholder={`Đáp án ${option.key}`}
                          value={option.label}
                          onChange={(event) =>
                            updateManualQuestion(question.id, (current) => {
                              const options = [...current.options];
                              options[optionIndex] = {
                                ...options[optionIndex],
                                label: event.target.value,
                              };
                              return { ...current, options };
                            })
                          }
                        />
                      ))}
                    </div>

                    <div className="mt-4">
                      <Select
                        value={question.correctAnswer}
                        className="w-full"
                        onChange={(value) =>
                          updateManualQuestion(question.id, (current) => ({
                            ...current,
                            correctAnswer: value,
                          }))
                        }
                        options={question.options.map((option) => ({
                          value: option.key,
                          label: `Đáp án đúng: ${option.key}`,
                        }))}
                      />
                    </div>
                  </Card>
                ))}
              </>
            ),
          },
          {
            key: 'ai',
            label: (
              <Space size={6}>
                <RobotOutlined />
                <span>AI Gemini</span>
              </Space>
            ),
            children: (
              <Form form={aiForm} layout="vertical">
                <Form.Item name="title" label="Tiêu đề quiz" rules={[{ required: true }]}> 
                  <Input placeholder="Ví dụ: Quiz luyện tập cuối chương" />
                </Form.Item>

                <Form.Item name="topic" label="Chủ đề" rules={[{ required: true }]}> 
                  <Input placeholder="Ví dụ: React Hooks cơ bản" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả"> 
                  <Input.TextArea rows={2} placeholder="Mô tả quiz (tùy chọn)" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="questionCount"
                    label="Số câu hỏi"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} max={30} className="w-full" />
                  </Form.Item>

                  <Form.Item
                    name="difficulty"
                    label="Độ khó"
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={[
                        { value: 'easy', label: 'Dễ' },
                        { value: 'medium', label: 'Trung bình' },
                        { value: 'hard', label: 'Khó' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="language" label="Ngôn ngữ câu hỏi" rules={[{ required: true }]}> 
                    <Select
                      options={[
                        { value: 'vi', label: 'Tiếng Việt' },
                        { value: 'en', label: 'English' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="duration"
                    label="Thời gian làm bài (phút)"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} max={240} className="w-full" />
                  </Form.Item>

                  <Form.Item name="passingScore" label="Điểm qua (%)" rules={[{ required: true }]}> 
                    <InputNumber min={0} max={100} className="w-full" />
                  </Form.Item>

                  <Form.Item name="maxAttempts" label="Số lần làm tối đa" rules={[{ required: true }]}> 
                    <InputNumber min={1} max={20} className="w-full" />
                  </Form.Item>
                </div>

                <Form.Item name="additionalInstructions" label="Yêu cầu thêm cho AI"> 
                  <Input.TextArea
                    rows={3}
                    placeholder="Ví dụ: tập trung câu hỏi tình huống thực tế, tránh câu mẹo"
                  />
                </Form.Item>

                <Space size={24}>
                  <Form.Item name="shuffleQuestions" label="Trộn câu hỏi" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="showCorrectAnswers" label="Hiện đáp án đúng" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="isVisible" label="Hiển thị cho học viên" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Space>
              </Form>
            ),
          },
        ]}
      />
    </Drawer>
  );
};

export default QuizGenerationDrawer;
