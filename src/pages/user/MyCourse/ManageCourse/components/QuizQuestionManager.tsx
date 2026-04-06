import React, { useState, useEffect } from 'react';
import { Drawer, Button, Input, Select, Popconfirm, message, Space, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useUpdateQuizMutation } from '../../../../../services/learningApi';

const { Option } = Select;

export interface QuestionType {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizQuestionManagerProps {
  visible: boolean;
  onClose: () => void;
  quizId: string;
  initialQuestions: any;
}

const QuizQuestionManager: React.FC<QuizQuestionManagerProps> = ({ visible, onClose, quizId, initialQuestions }) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [updateQuiz, { isLoading }] = useUpdateQuizMutation();

  useEffect(() => {
    if (visible && initialQuestions) {
      try {
        // If it's a string, parse it, otherwise if it's already an object/array, use it directly.
        const parsed = typeof initialQuestions === 'string' ? JSON.parse(initialQuestions) : initialQuestions;
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        } else {
          setQuestions([]);
        }
      } catch {
        setQuestions([]);
      }
    } else if (visible && !initialQuestions) {
      setQuestions([]);
    }
  }, [visible, initialQuestions]);

  const handleAddQuestion = () => {
    const newQuestion: QuestionType = {
      id: Date.now().toString(),
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
        // adjust correctAnswerIndex if needed
        let newCorrect = q.correctAnswerIndex;
        if (newCorrect === optionIndex) {
          newCorrect = 0;
        } else if (newCorrect > optionIndex) {
          newCorrect -= 1;
        }
        return { ...q, options: newOptions, correctAnswerIndex: newCorrect };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    try {
      await updateQuiz({ id: quizId, data: { questions } }).unwrap();
      message.success('Đã lưu danh sách câu hỏi');
      onClose();
    } catch (error) {
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
            <Popconfirm title="Xóa câu hỏi này?" onConfirm={() => handleDeleteQuestion(q.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          }
        >
          <div className="mb-4">
            <div className="font-medium mb-1">Nội dung câu hỏi:</div>
            <Input.TextArea 
              rows={2} 
              value={q.questionText} 
              onChange={e => handleQuestionChange(q.id, 'questionText', e.target.value)} 
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          <Divider plain>Các Lựa chọn</Divider>
          
          {q.options.map((opt, optIdx) => (
            <div key={optIdx} className="flex gap-2 items-center mb-2">
              <span className="font-semibold text-gray-500 w-6">{optIdx + 1}.</span>
              <Input 
                value={opt} 
                onChange={e => handleOptionChange(q.id, optIdx, e.target.value)} 
                placeholder={`Lựa chọn ${optIdx + 1}`}
              />
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteOption(q.id, optIdx)} 
                disabled={q.options.length <= 2}
              />
            </div>
          ))}

          <Button type="link" onClick={() => handleAddOption(q.id)} icon={<PlusOutlined />} size="small">
            Thêm lựa chọn
          </Button>

          <div className="mt-4">
            <div className="font-medium mb-1">Đáp án đúng:</div>
            <Select 
              value={q.correctAnswerIndex} 
              onChange={val => handleQuestionChange(q.id, 'correctAnswerIndex', val)}
              className="w-full"
            >
              {q.options.map((_, optIdx) => (
                <Option key={optIdx} value={optIdx}>
                  Lựa chọn {optIdx + 1}
                </Option>
              ))}
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
