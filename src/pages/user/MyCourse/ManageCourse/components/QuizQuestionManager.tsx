import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Divider, Drawer, Empty, Input, Popconfirm, Select, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useUpdateQuizMutation } from '../../../../../services/learningApi';

import { notify } from '../../../../../utils/notify';

const { Text } = Typography;

export interface QuestionType {
  id: string;
  text: string;
  options: { key: string; label: string }[];
  correctAnswer: string;
}

interface QuizQuestionManagerProps {
  visible: boolean;
  onClose: () => void;
  quizId: string;
  initialQuestions: unknown;
}

const normalizeQuestion = (rawQuestion: unknown, index: number): QuestionType | null => {
  if (!rawQuestion || typeof rawQuestion !== 'object') {
    return null;
  }

  const source = rawQuestion as Record<string, unknown>;
  const rawOptions = Array.isArray(source.options) ? source.options : [];
  const options = rawOptions.filter((option): option is string => typeof option === 'string');

  const safeOptions = options.length >= 2 ? options : ['', ''];
  const rawCorrectAnswer = source.correctAnswerIndex;
  const parsedCorrectAnswer = typeof rawCorrectAnswer === 'number' ? rawCorrectAnswer : 0;
  const safeCorrectAnswer =
    parsedCorrectAnswer >= 0 && parsedCorrectAnswer < safeOptions.length ? parsedCorrectAnswer : 0;

  return {
    id: typeof source.id === 'string' && source.id ? source.id : `question-${Date.now()}-${index}`,
    questionText: typeof source.questionText === 'string' ? source.questionText : '',
    options: safeOptions,
    correctAnswerIndex: safeCorrectAnswer,
  };
};

const parseInitialQuestions = (initialQuestions: unknown): QuestionType[] => {
  try {
    const parsedQuestions =
      typeof initialQuestions === 'string' ? (JSON.parse(initialQuestions) as unknown) : initialQuestions;

    if (!Array.isArray(parsedQuestions)) {
      return [];
    }

    return parsedQuestions
      .map((question, index) => normalizeQuestion(question, index))
      .filter((question): question is QuestionType => !!question);
  } catch {
    return [];
  }
};

const QuizQuestionManager: React.FC<QuizQuestionManagerProps> = ({ visible, onClose, quizId, initialQuestions }) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [updateQuiz, { isLoading }] = useUpdateQuizMutation();

  useEffect(() => {
    if (!visible) {
      return;
    }

    setQuestions(parseInitialQuestions(initialQuestions));
  }, [visible, initialQuestions]);

  const handleAddQuestion = () => {
    const newQuestion: QuestionType = {
      id: Date.now().toString(),
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
    };
    setQuestions((previousQuestions) => [...previousQuestions, newQuestion]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((previousQuestions) => previousQuestions.filter((question) => question.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof QuestionType, value: string | number | string[]) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) => (question.id === id ? { ...question, [field]: value } : question)),
    );
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const nextOptions = [...question.options];
        nextOptions[optionIndex] = value;

        return { ...question, options: nextOptions };
      }),
    );
  };

  const handleAddOption = (questionId: string) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) =>
        question.id === questionId ? { ...question, options: [...question.options, ''] } : question,
      ),
    );
  };

  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const nextOptions = question.options.filter((_option, index) => index !== optionIndex);
        let nextCorrectIndex = question.correctAnswerIndex;

        if (nextCorrectIndex === optionIndex) {
          nextCorrectIndex = 0;
        } else if (nextCorrectIndex > optionIndex) {
          nextCorrectIndex -= 1;
        }

        return {
          ...question,
          options: nextOptions,
          correctAnswerIndex: nextCorrectIndex,
        };
      }),
    );
  };

  const handleSave = async () => {
    if (!quizId) {
      notify.error('Không xác định được quiz để lưu câu hỏi.');
      return;
    }

    if (!questions.length) {
      notify.warning('Vui lòng thêm ít nhất 1 câu hỏi.');
      return;
    }

    const cleanedQuestions: QuestionType[] = [];

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      const questionText = question.questionText.trim();
      const options = question.options.map((option) => option.trim()).filter(Boolean);

      if (!questionText) {
        notify.error(`Câu hỏi ${index + 1} chưa có nội dung.`);
        return;
      }

      if (options.length < 2) {
        notify.error(`Câu hỏi ${index + 1} cần tối thiểu 2 lựa chọn.`);
        return;
      }

      const correctAnswerIndex =
        question.correctAnswerIndex >= 0 && question.correctAnswerIndex < options.length
          ? question.correctAnswerIndex
          : 0;

      cleanedQuestions.push({
        ...question,
        questionText,
        options,
        correctAnswerIndex,
      });
    }

    try {
      await updateQuiz({
        id: quizId,
        data: {
          questions: cleanedQuestions,
          totalQuestions: cleanedQuestions.length,
        },
      }).unwrap();
      notify.success('Đã lưu danh sách câu hỏi.');
      onClose();
    } catch {
      notify.error('Không thể lưu câu hỏi. Vui lòng thử lại.');
    }
  };

  return (
    <Drawer
      title="Quản lý câu hỏi quiz"
      placement="right"
      width={760}
      onClose={onClose}
      open={visible}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isLoading}>
            Lưu câu hỏi
          </Button>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        message="Lưu ý"
        description="Mỗi câu hỏi cần ít nhất 2 lựa chọn và phải chọn một đáp án đúng trước khi lưu."
        className="mb-4"
      />

      <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddQuestion} className="mb-4">
        Thêm câu hỏi mới
      </Button>

      {questions.length === 0 ? (
        <Empty description="Chưa có câu hỏi nào." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        questions.map((question, index) => (
          <Card
            key={question.id}
            className="mb-4"
            title={<Text strong>{`Câu hỏi ${index + 1}`}</Text>}
            extra={
              <Popconfirm title="Xóa câu hỏi này?" onConfirm={() => handleDeleteQuestion(question.id)}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            }
          >
            <div className="mb-4">
              <Text strong>Nội dung câu hỏi</Text>
              <Input.TextArea
                rows={3}
                value={question.questionText}
                onChange={(event) => handleQuestionChange(question.id, 'questionText', event.target.value)}
                placeholder="Nhập nội dung câu hỏi"
                className="mt-1"
              />
            </div>

            <Divider className="!my-3" />

            <Text strong>Lựa chọn</Text>
            <div className="mt-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id}-option-${optionIndex}`} className="manage-question-option-row">
                  <span className="w-5 text-center text-gray-500">{optionIndex + 1}</span>
                  <Input
                    value={option}
                    onChange={(event) => handleOptionChange(question.id, optionIndex, event.target.value)}
                    placeholder={`Lựa chọn ${optionIndex + 1}`}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={question.options.length <= 2}
                    onClick={() => handleDeleteOption(question.id, optionIndex)}
                  />
                </div>
              ))}
            </div>

            <Button type="link" icon={<PlusOutlined />} onClick={() => handleAddOption(question.id)} className="!px-0">
              Thêm lựa chọn
            </Button>

            <div className="mt-3">
              <Text strong>Đáp án đúng</Text>
              <Select
                value={question.correctAnswerIndex}
                onChange={(value) => handleQuestionChange(question.id, 'correctAnswerIndex', value)}
                options={question.options.map((_option, optionIndex) => ({
                  value: optionIndex,
                  label: `Lựa chọn ${optionIndex + 1}`,
                }))}
                className="w-full mt-1"
              />
            </div>
          </Card>
        ))
      )}
    </Drawer>
  );
};

export default QuizQuestionManager;
