import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Button,
  Typography,
  Breadcrumb,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetQuizAttemptByIdQuery } from '../../../../services/learningApi';

const { Title, Text } = Typography;

interface Question {
  id: string;
  text: string;
  options: { key: string; label: string }[];
  correctAnswer: string;
}

const DetailAnswer: React.FC = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: attemptData, isLoading } = useGetQuizAttemptByIdQuery(attemptId!, { skip: !attemptId });

  const attempt = attemptData?.data;
  const quiz = attempt?.quiz;

  const questions: Question[] = useMemo(() => {
    if (!quiz?.questions) return [];
    const raw = quiz.questions as Question[];
    return Array.isArray(raw) ? raw : [];
  }, [quiz]);

  const userAnswers = (attempt?.answers || {}) as Record<string, string>;

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
        <Title level={3}>Không tìm thấy kết quả</Title>
        <Button type="primary" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const score = attempt.score ?? 0;
  const passingScore = quiz.passingScore ?? 70;
  const passed = score >= passingScore;

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/my-course">Khóa học của tôi</Link> },
            { title: <Link to={`/my-course/quizz/answer/${attempt.quizId}`}>Kết quả</Link> },
            { title: 'Chi tiết' },
          ]}
        />

        {/* Score Summary */}
        <Card
          className={`rounded-2xl border-0 shadow-lg mb-6 ${
            passed
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-orange-500'
          }`}
        >
          <div className="text-white text-center py-4">
            <TrophyOutlined className="text-5xl mb-3" />
            <Title level={2} className="!text-white !mb-1">{quiz.title}</Title>
            <div className="text-6xl font-bold my-4">{score}%</div>
            <Tag color={passed ? '#52c41a' : '#ff4d4f'} className="!text-lg !px-4 !py-1">
              {passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
            </Tag>
            <Text className="text-white/70 block mt-2">Điểm yêu cầu: {passingScore}%</Text>
          </div>
        </Card>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <CheckCircleOutlined className="text-2xl text-green-500 mb-2" />
              <div className="text-xl font-bold text-green-500">{attempt.correctAnswers}</div>
              <Text className="text-gray-500 text-sm">Câu đúng</Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <CloseCircleOutlined className="text-2xl text-red-500 mb-2" />
              <div className="text-xl font-bold text-red-500">
                {(attempt.totalAnswered || 0) - (attempt.correctAnswers || 0)}
              </div>
              <Text className="text-gray-500 text-sm">Câu sai</Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <ClockCircleOutlined className="text-2xl text-blue-500 mb-2" />
              <div className="text-xl font-bold text-blue-500">
                {Math.floor((attempt.timeSpent || 0) / 60)}:{((attempt.timeSpent || 0) % 60).toString().padStart(2, '0')}
              </div>
              <Text className="text-gray-500 text-sm">Thời gian</Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm text-center">
              <TrophyOutlined className="text-2xl text-yellow-500 mb-2" />
              <div className="text-xl font-bold text-yellow-500">{attempt.totalAnswered || 0}/{questions.length}</div>
              <Text className="text-gray-500 text-sm">Đã trả lời</Text>
            </Card>
          </Col>
        </Row>

        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="!mb-0 !text-[#012643]">Chi tiết câu hỏi</Title>
          <Text className="text-gray-500">
            {dayjs(attempt.startedAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>

        {/* Questions Review */}
        {quiz.showCorrectAnswers && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const isUnanswered = !userAnswer;

              return (
                <Card
                  key={q.id}
                  className={`rounded-xl border-l-4 ${
                    isUnanswered
                      ? '!border-l-gray-400'
                      : isCorrect
                        ? '!border-l-green-500'
                        : '!border-l-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Tag color={isUnanswered ? 'default' : isCorrect ? 'success' : 'error'}>
                      Câu {idx + 1}
                    </Tag>
                    {isUnanswered ? (
                      <Tag color="warning">Bỏ qua</Tag>
                    ) : isCorrect ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Đúng</Tag>
                    ) : (
                      <Tag color="error" icon={<CloseCircleOutlined />}>Sai</Tag>
                    )}
                  </div>
                  <Text strong className="text-base block mb-3">{q.text}</Text>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isUserChoice = userAnswer === opt.key;
                      const isCorrectChoice = q.correctAnswer === opt.key;
                      let className = 'p-3 rounded-lg border ';
                      if (isCorrectChoice) {
                        className += 'bg-green-50 border-green-300';
                      } else if (isUserChoice && !isCorrectChoice) {
                        className += 'bg-red-50 border-red-300';
                      } else {
                        className += 'bg-gray-50 border-gray-200';
                      }

                      return (
                        <div key={opt.key} className={className}>
                          <div className="flex items-center gap-2">
                            <strong>{opt.key}.</strong>
                            <span>{opt.label}</span>
                            {isCorrectChoice && (
                              <CheckCircleOutlined className="text-green-500 ml-auto" />
                            )}
                            {isUserChoice && !isCorrectChoice && (
                              <CloseCircleOutlined className="text-red-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : questions.length > 0 ? (
          <Card className="rounded-xl border-0 shadow-sm text-center py-8">
            <Text className="text-gray-500">
              Giảng viên đã tắt hiển thị đáp án cho bài kiểm tra này.
            </Text>
          </Card>
        ) : (
          <Card className="rounded-xl border-0 shadow-sm text-center py-8">
            <Text className="text-gray-500">
              Bài kiểm tra không có câu hỏi chi tiết.
            </Text>
          </Card>
        )}

        {/* Back button */}
        <div className="mt-6 text-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/my-course/quizz/answer/${attempt.quizId}`)}
            className="!rounded-lg"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailAnswer;
