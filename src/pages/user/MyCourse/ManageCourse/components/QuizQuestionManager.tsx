import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Divider, Drawer, Empty, Input, Popconfirm, Select, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { type QuizQuestion, useUpdateQuizMutation } from '../../../../../services/learningApi';
import { notify } from '../../../../../utils/notify';

const { Text } = Typography;

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export interface QuestionType extends QuizQuestion {}

interface QuizQuestionManagerProps {
  visible: boolean;
  onClose: () => void;
  quizId: string;
  initialQuestions: unknown;
}

const getOptionKey = (index: number) => OPTION_KEYS[index] || `OPT${index + 1}`;

const createEmptyQuestion = (): QuestionType => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  text: '',
  options: OPTION_KEYS.map((key) => ({ key, label: '' })),
  correctAnswer: 'A',
});

const normalizeOption = (
  rawOption: unknown,
  optionIndex: number,
): { key: string; label: string } | null => {
  if (typeof rawOption === 'string') {
    return {
      key: getOptionKey(optionIndex),
      label: rawOption,
    };
  }

  if (!rawOption || typeof rawOption !== 'object') {
    return null;
  }

  const option = rawOption as Record<string, unknown>;
  const rawLabel = option.label ?? option.text ?? option.value;
  const label = typeof rawLabel === 'string' ? rawLabel : '';
  const key =
    typeof option.key === 'string' && option.key.trim().length > 0
      ? option.key.trim().toUpperCase()
      : getOptionKey(optionIndex);

  return { key, label };
};

const withDefaultOptions = (options: { key: string; label: string }[]): { key: string; label: string }[] => {
  const normalized = options.slice(0, 4).map((option, index) => ({
    key: option.key || getOptionKey(index),
    label: option.label || '',
  }));

  for (let index = normalized.length; index < 4; index += 1) {
    normalized.push({
      key: getOptionKey(index),
      label: '',
    });
  }

  return normalized;
};

const normalizeQuestion = (rawQuestion: unknown, index: number): QuestionType | null => {
  if (!rawQuestion || typeof rawQuestion !== 'object') {
    return null;
  }

  const source = rawQuestion as Record<string, unknown>;
  const rawText = source.text ?? source.questionText ?? source.question;
  const text = typeof rawText === 'string' ? rawText : '';

  const rawOptions = Array.isArray(source.options) ? source.options : [];
  const options = withDefaultOptions(
    rawOptions
      .map((option, optionIndex) => normalizeOption(option, optionIndex))
      .filter((option): option is { key: string; label: string } => Boolean(option)),
  );

  let correctAnswer = options[0].key;
  if (typeof source.correctAnswer === 'string') {
    const candidate = source.correctAnswer.trim().toUpperCase();
    if (options.some((option) => option.key === candidate)) {
      correctAnswer = candidate;
    }
  } else if (typeof source.correctAnswerIndex === 'number') {
    const option = options[source.correctAnswerIndex];
    if (option) {
      correctAnswer = option.key;
    }
  }

  return {
    id:
      typeof source.id === 'string' && source.id.trim().length > 0
        ? source.id.trim()
        : `question-${Date.now()}-${index}`,
    text,
    options,
    correctAnswer,
  };
};

const parseInitialQuestions = (initialQuestions: unknown): QuestionType[] => {
  try {
    const parsedQuestions =
      typeof initialQuestions === 'string' ? (JSON.parse(initialQuestions) as unknown) : initialQuestions;

    if (!Array.isArray(parsedQuestions)) {
      return [createEmptyQuestion()];
    }

    const normalizedQuestions = parsedQuestions
      .map((question, index) => normalizeQuestion(question, index))
      .filter((question): question is QuestionType => Boolean(question));

    return normalizedQuestions.length > 0 ? normalizedQuestions : [createEmptyQuestion()];
  } catch {
    return [createEmptyQuestion()];
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
    setQuestions((previousQuestions) => [...previousQuestions, createEmptyQuestion()]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((previousQuestions) => {
      if (previousQuestions.length <= 1) {
        return previousQuestions;
      }

      return previousQuestions.filter((question) => question.id !== id);
    });
  };

  const handleQuestionTextChange = (questionId: string, value: string) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) =>
        question.id === questionId ? { ...question, text: value } : question,
      ),
    );
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const options = [...question.options];
        options[optionIndex] = {
          ...options[optionIndex],
          key: options[optionIndex]?.key || getOptionKey(optionIndex),
          label: value,
        };

        return { ...question, options };
      }),
    );
  };

  const handleCorrectAnswerChange = (questionId: string, value: string) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question) =>
        question.id === questionId ? { ...question, correctAnswer: value } : question,
      ),
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

    const cleanedQuestions: QuizQuestion[] = [];

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      const text = question.text.trim();
      const options = question.options.slice(0, 4).map((option, optionIndex) => ({
        key: (option.key || getOptionKey(optionIndex)).trim().toUpperCase(),
        label: option.label.trim(),
      }));

      if (!text) {
        notify.error(`Câu hỏi ${index + 1} chưa có nội dung.`);
        return;
      }

      if (options.length !== 4 || options.some((option) => !option.label)) {
        notify.error(`Câu hỏi ${index + 1} cần đủ 4 đáp án và không được để trống.`);
        return;
      }

      const hasValidCorrectAnswer = options.some((option) => option.key === question.correctAnswer);
      cleanedQuestions.push({
        id: question.id,
        text,
        options,
        correctAnswer: hasValidCorrectAnswer ? question.correctAnswer : options[0].key,
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
      destroyOnHidden
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
        description="Mỗi câu hỏi cần có nội dung, đủ 4 lựa chọn và một đáp án đúng trước khi lưu."
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
              <Popconfirm
                title="Xóa câu hỏi này?"
                onConfirm={() => handleDeleteQuestion(question.id)}
                disabled={questions.length <= 1}
              >
                <Button type="text" danger icon={<DeleteOutlined />} disabled={questions.length <= 1} />
              </Popconfirm>
            }
          >
            <div className="mb-4">
              <Text strong>Nội dung câu hỏi</Text>
              <Input.TextArea
                rows={3}
                value={question.text}
                onChange={(event) => handleQuestionTextChange(question.id, event.target.value)}
                placeholder="Nhập nội dung câu hỏi"
                className="mt-1"
              />
            </div>

            <Divider className="!my-3" />

            <Text strong>Lựa chọn</Text>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, optionIndex) => (
                <Input
                  key={`${question.id}-option-${option.key}`}
                  addonBefore={option.key}
                  value={option.label}
                  onChange={(event) => handleOptionChange(question.id, optionIndex, event.target.value)}
                  placeholder={`Nhập đáp án ${option.key}`}
                />
              ))}
            </div>

            <div className="mt-3">
              <Text strong>Đáp án đúng</Text>
              <Select
                value={question.correctAnswer}
                onChange={(value) => handleCorrectAnswerChange(question.id, value)}
                options={question.options.map((option) => ({
                  value: option.key,
                  label: `Đáp án ${option.key}`,
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
