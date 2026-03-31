import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Radio,
  Progress,
  Modal,
  Breadcrumb,
  Spin,
  Tag,
  Space,
  message,
} from 'antd';
import {
  HomeOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  useGetQuizAttemptByIdQuery,
  useSubmitQuizAttemptMutation,
} from '../../../../services/learningApi';

const { Title, Text } = Typography;

interface Question {
  id: string;
  text: string;
  options: { key: string; label: string }[];
  correctAnswer: string;
}

const Practics: React.FC = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: attemptData, isLoading } = useGetQuizAttemptByIdQuery(attemptId!, {
    skip: !attemptId,
  });
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitQuizAttemptMutation();

  const attempt = attemptData?.data;
  const quiz = attempt?.quiz;

  const questions: Question[] = useMemo(() => {
    if (!quiz?.questions) return [];
    const raw = quiz.questions as Question[];
    return Array.isArray(raw) ? raw : [];
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize timer
  useEffect(() => {
    if (quiz?.duration && attempt?.startedAt) {
      const startMs = new Date(attempt.startedAt).getTime();
      const durationMs = quiz.duration * 60 * 1000;
      const endMs = startMs + durationMs;
      const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTimeLeft(remaining);
    }
  }, [quiz, attempt]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(async () => {
    if (isFinished || !attemptId) return;
    setIsFinished(true);

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    try {
      await submitAttempt({
        attemptId,
        answers,
        score,
        correctAnswers: correctCount,
      }).unwrap();
      message.success('Đã nộp bài kiểm tra!');
      navigate(`/my-course/quizz/answer/detail/${attemptId}`);
    } catch {
      message.error('Nộp bài thất bại');
      setIsFinished(false);
    }
  }, [attemptId, answers, questions, isFinished, submitAttempt, navigate]);

  const confirmSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      icon: <ExclamationCircleOutlined />,
      content: unanswered > 0
        ? `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
        : 'Bạn có chắc muốn nộp bài kiểm tra?',
      okText: 'Nộp bài',
      cancelText: 'Tiếp tục làm',
      onOk: handleSubmit,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Title level={3}>Không tìm thấy bài kiểm tra</Title>
        <Button type="primary" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  if (attempt.status === 'completed' || attempt.status === 'timed_out') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Title level={3}>Bài kiểm tra đã hoàn thành</Title>
        <Button type="primary" onClick={() => navigate(`/my-course/quizz/answer/detail/${attemptId}`)}>
          Xem kết quả
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Title level={3}>Bài kiểm tra chưa có câu hỏi</Title>
        <Button type="primary" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const isTimeWarning = timeLeft < 60;

  return (
    <div className="py-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-4"
          items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/my-course">Khóa học của tôi</Link> },
            { title: 'Làm bài kiểm tra' },
          ]}
        />

        {/* Header with timer */}
        <Card className="rounded-2xl border-0 shadow-md mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Title level={4} className="!mb-1 !text-[#012643]">{quiz.title}</Title>
              <Space>
                <Tag color="blue">{questions.length} câu hỏi</Tag>
                <Tag color="orange">{quiz.duration} phút</Tag>
                <Tag color="green">{answeredCount}/{questions.length} đã trả lời</Tag>
              </Space>
            </div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${isTimeWarning ? 'text-red-500 animate-pulse' : 'text-[#012643]'}`}>
              <ClockCircleOutlined />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress percent={progressPercent} strokeColor="#012643" className="mt-3" />
        </Card>

        {/* Question Navigation */}
        <Card className="rounded-2xl border-0 shadow-md mb-4">
          <Text className="text-gray-500 mb-2 block">Danh sách câu hỏi:</Text>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                size="small"
                type={idx === currentIndex ? 'primary' : 'default'}
                className={`!rounded-lg !min-w-[36px] ${
                  answers[q.id]
                    ? idx === currentIndex
                      ? '!bg-[#012643]'
                      : '!bg-green-500 !text-white !border-green-500'
                    : ''
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        </Card>

        {/* Current Question */}
        <Card className="rounded-2xl border-0 shadow-lg mb-4">
          <div className="mb-4">
            <Tag color="blue" className="mb-3">Câu {currentIndex + 1}/{questions.length}</Tag>
            <Title level={4} className="!text-[#012643] !mb-0">{currentQuestion.text}</Title>
          </div>

          <Radio.Group
            value={answers[currentQuestion.id]}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            className="w-full"
          >
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <Card
                  key={opt.key}
                  className={`cursor-pointer rounded-xl transition-all ${
                    answers[currentQuestion.id] === opt.key
                      ? '!border-[#012643] !bg-blue-50'
                      : 'hover:!border-gray-300'
                  }`}
                  bodyStyle={{ padding: '12px 16px' }}
                  onClick={() => handleAnswer(currentQuestion.id, opt.key)}
                >
                  <Radio value={opt.key} className="w-full">
                    <span className="text-base">
                      <strong className="mr-2">{opt.key}.</strong>
                      {opt.label}
                    </span>
                  </Radio>
                </Card>
              ))}
            </div>
          </Radio.Group>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            icon={<LeftOutlined />}
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="!rounded-lg"
          >
            Câu trước
          </Button>

          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={confirmSubmit}
            loading={isSubmitting}
            className="!bg-green-500 !border-green-500 !rounded-lg"
          >
            Nộp bài ({answeredCount}/{questions.length})
          </Button>

          <Button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="!rounded-lg"
          >
            Câu sau <RightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Practics;
