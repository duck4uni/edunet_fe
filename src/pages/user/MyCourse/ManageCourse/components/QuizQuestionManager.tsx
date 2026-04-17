import React, { useState, useEffect } from 'react';
import { Drawer, Button, Input, Select, Popconfirm, message, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useUpdateQuizMutation } from '../../../../../services/learningApi';

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
  initialQuestions: any;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const createEmptyQuestion = (): QuestionType => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text: '',
  options: OPTION_KEYS.map((key) => ({ key, label: '' })),
  correctAnswer: 'A',
});

const normalizeQuestions = (rawQuestions: unknown): QuestionType[] => {
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  return rawQuestions
    .map((rawQuestion, index) => {
      if (!rawQuestion || typeof rawQuestion !== 'object') {
        return null;
      }

      const question = rawQuestion as Record<string, unknown>;
      const rawText = question.text ?? question.questionText ?? question.question;
      const text = typeof rawText === 'string' ? rawText.trim() : '';

      const rawOptions = question.options;
      const normalizedOptions = Array.isArray(rawOptions)
        ? rawOptions
            .map((rawOption, optionIndex) => {
              if (typeof rawOption === 'string') {
                const label = rawOption.trim();
                if (!label) {
                  return null;
                }
                return { key: OPTION_KEYS[optionIndex] || `OPT${optionIndex + 1}`, label };
              }

              if (!rawOption || typeof rawOption !== 'object') {
                return null;
              }

              const optionRecord = rawOption as Record<string, unknown>;
              const rawLabel = optionRecord.label ?? optionRecord.text ?? optionRecord.value;
              const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
              if (!label) {
                return null;
              }

              const rawKey =
                typeof optionRecord.key === 'string' && optionRecord.key.trim().length > 0
                  ? optionRecord.key.trim().toUpperCase()
                  : OPTION_KEYS[optionIndex] || `OPT${optionIndex + 1}`;

              return { key: rawKey, label };
            })
            .filter((option): option is { key: string; label: string } => Boolean(option))
        : [];

      const options = OPTION_KEYS.map((key, optionIndex) => {
        const matched = normalizedOptions.find((option) => option.key === key);
        if (matched) {
          return matched;
        }

        return {
          key,
          label: normalizedOptions[optionIndex]?.label || '',
        };
      });

      let correctAnswer = 'A';
      if (typeof question.correctAnswer === 'string') {
        const candidate = question.correctAnswer.trim().toUpperCase();
        if (OPTION_KEYS.includes(candidate)) {
          correctAnswer = candidate;
        }
      } else if (typeof question.correctAnswerIndex === 'number') {
        const key = OPTION_KEYS[question.correctAnswerIndex];
        if (key) {
          correctAnswer = key;
        }
      }

      return {
        id:
          typeof question.id === 'string' && question.id.trim().length > 0
            ? question.id.trim()
            : `${Date.now()}-${index}`,
        text,
        options,
        correctAnswer,
      };
    })
    .filter((question): question is QuestionType => Boolean(question));
};

const QuizQuestionManager: React.FC<QuizQuestionManagerProps> = ({ visible, onClose, quizId, initialQuestions }) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [updateQuiz, { isLoading }] = useUpdateQuizMutation();

  useEffect(() => {
    if (visible && initialQuestions) {
      try {
        const parsed = typeof initialQuestions === 'string' ? JSON.parse(initialQuestions) : initialQuestions;
        const normalized = normalizeQuestions(parsed);
        setQuestions(normalized.length > 0 ? normalized : [createEmptyQuestion()]);
      } catch {
        setQuestions([createEmptyQuestion()]);
      }
    } else if (visible && !initialQuestions) {
      setQuestions([createEmptyQuestion()]);
    }
  }, [visible, initialQuestions]);

  const handleAddQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionTextChange = (id: string, value: string) => {
    setQuestions(
      questions.map((question) =>
        question.id === id
          ? {
              ...question,
              text: value,
            }
          : question,
      ),
    );
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const options = [...question.options];
        options[optionIndex] = {
          ...options[optionIndex],
          label: value,
        };

        return {
          ...question,
          options,
        };
      }),
    );
  };

  const handleSave = async () => {
    const hasInvalidQuestion = questions.some((question) => {
      if (!question.text.trim()) {
        return true;
      }
      if (question.options.some((option) => !option.label.trim())) {
        return true;
      }
      return !OPTION_KEYS.includes(question.correctAnswer);
    });

    if (hasInvalidQuestion) {
      message.error('Mỗi câu hỏi cần có nội dung, đủ 4 đáp án và chọn đáp án đúng.');
      return;
    }

    try {
      await updateQuiz({
        id: quizId,
        data: {
          questions: questions.map((question) => ({
            ...question,
            text: question.text.trim(),
            options: question.options.map((option) => ({
              ...option,
              label: option.label.trim(),
            })),
          })),
          totalQuestions: questions.length,
        },
      }).unwrap();
      message.success('Đã lưu danh sách câu hỏi');
      onClose();
    } catch {
      message.error('Lỗi khi lưu câu hỏi');
    }
  };

  return (
    <Drawer
      title="Quản lý Câu hỏi Quiz"
      placement="right"
      width={700}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" className="!bg-[#012643]" icon={<SaveOutlined />} onClick={handleSave} loading={isLoading}>
            Lưu tất cả
          </Button>
        </Space>
      }
    >
      <div className="mb-4">
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddQuestion}>
          Thêm câu hỏi mới
        </Button>
      </div>

      {questions.map((q, index) => (
        <Card 
          key={q.id} 
          className="mb-4 shadow-sm" 
          title={`Câu hỏi ${index + 1}`}
          extra={
            <Popconfirm
              title="Xóa câu hỏi này?"
              onConfirm={() => handleDeleteQuestion(q.id)}
              disabled={questions.length <= 1}
            >
              <Button type="text" danger icon={<DeleteOutlined />} disabled={questions.length <= 1} />
            </Popconfirm>
          }
        >
          <div className="mb-4">
            <div className="font-medium mb-1">Nội dung câu hỏi:</div>
            <Input.TextArea 
              rows={2} 
              value={q.text} 
              onChange={(e) => handleQuestionTextChange(q.id, e.target.value)} 
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>
          
          {q.options.map((opt, optIdx) => (
            <div key={optIdx} className="flex gap-2 items-center mb-2">
              <span className="font-semibold text-gray-500 w-6">{opt.key}.</span>
              <Input 
                value={opt.label} 
                onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)} 
                placeholder={`Lựa chọn ${opt.key}`}
              />
            </div>
          ))}

          <div className="mt-4">
            <div className="font-medium mb-1">Đáp án đúng:</div>
            <Select 
              value={q.correctAnswer} 
              onChange={(value) =>
                setQuestions(
                  questions.map((question) =>
                    question.id === q.id
                      ? {
                          ...question,
                          correctAnswer: value,
                        }
                      : question,
                  ),
                )
              }
              className="w-full"
              options={q.options.map((option) => ({
                value: option.key,
                label: `Lựa chọn ${option.key}`,
              }))}
            >
            </Select>
          </div>
        </Card>
      ))}

      {questions.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi mới".
        </div>
      )}
    </Drawer>
  );
};

export default QuizQuestionManager;
