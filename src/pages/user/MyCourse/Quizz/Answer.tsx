import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Breadcrumb,
  Empty,
} from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetQuizAttemptsQuery, useGetQuizByIdQuery } from '../../../../services/learningApi';

const { Title, Text } = Typography;

const Answer: React.FC = () => {
  const { id: quizId } = useParams<{ id: string }>();
  const { data: quizData, isLoading: quizLoading } = useGetQuizByIdQuery(quizId!, { skip: !quizId });
  const { data: attemptsData, isLoading: attemptsLoading } = useGetQuizAttemptsQuery(quizId!, { skip: !quizId });

  const quiz = quizData?.data;
  const attempts = attemptsData?.data || [];
  const isLoading = quizLoading || attemptsLoading;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> };
      case 'in_progress':
        return { color: 'processing', text: 'Đang làm', icon: <ClockCircleOutlined /> };
      case 'timed_out':
        return { color: 'error', text: 'Hết giờ', icon: <WarningOutlined /> };
      default:
        return { color: 'default', text: status, icon: null };
    }
  };

  const bestAttempt = attempts.reduce<{ score: number; id: string } | null>((best, a) => {
    if (a.status === 'completed' && (a.score ?? 0) > (best?.score ?? -1)) {
      return { score: a.score ?? 0, id: a.id };
    }
    return best;
  }, null);

  const columns = [
    {
      title: 'Lần',
      key: 'index',
      width: 70,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="font-semibold">#{index + 1}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score: number | undefined, record: { status: string }) =>
        record.status === 'completed' ? (
          <span className={`font-bold ${(score ?? 0) >= (quiz?.passingScore ?? 70) ? 'text-green-500' : 'text-red-500'}`}>
            {score ?? 0}%
          </span>
        ) : (
          <Text type="secondary">--</Text>
        ),
    },
    {
      title: 'Đúng',
      key: 'correctAnswers',
      render: (record: { correctAnswers: number; totalAnswered: number; status: string }) =>
        record.status === 'completed' ? (
          <span>{record.correctAnswers}/{record.totalAnswered}</span>
        ) : (
          <Text type="secondary">--</Text>
        ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (timeSpent: number, record: { status: string }) =>
        record.status === 'completed' ? (
          <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
        ) : (
          <Text type="secondary">--</Text>
        ),
    },
    {
      title: 'Ngày làm',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (record: { id: string; status: string }) =>
        record.status === 'completed' || record.status === 'timed_out' ? (
          <Link to={`/my-course/quizz/answer/detail/${record.id}`}>
            <Button icon={<EyeOutlined />} size="small" className="!rounded-lg">
              Xem chi tiết
            </Button>
          </Link>
        ) : null,
    },
  ];

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/my-course">Khóa học của tôi</Link> },
            { title: <Link to={`/my-course/quizz/${quiz?.courseId || ''}`}>Bài kiểm tra</Link> },
            { title: 'Kết quả' },
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="!text-[#012643] !mb-1 flex items-center gap-3">
            <TrophyOutlined className="text-yellow-500" />
            {quiz?.title || 'Kết quả bài kiểm tra'}
          </Title>
          <Text className="text-gray-500">
            Lịch sử các lần làm bài kiểm tra
          </Text>
        </div>

        {/* Summary */}
        {bestAttempt && (
          <Card className="rounded-2xl border-0 shadow-md mb-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                <TrophyOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Text className="text-gray-500">Điểm cao nhất</Text>
                <Title level={2} className="!mb-0 !text-green-600">{bestAttempt.score}%</Title>
              </div>
              <div className="ml-auto text-right">
                <Text className="text-gray-500">Tổng lần làm</Text>
                <Title level={3} className="!mb-0 !text-[#012643]">
                  {attempts.length}/{quiz?.maxAttempts || '∞'}
                </Title>
              </div>
            </div>
          </Card>
        )}

        {/* Attempts table */}
        <Card className="rounded-2xl border-0 shadow-md">
          {attempts.length === 0 && !isLoading ? (
            <Empty description="Chưa có lần làm bài nào" />
          ) : (
            <Table
              dataSource={attempts}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              rowClassName={(record) =>
                record.id === bestAttempt?.id ? 'bg-green-50' : ''
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Answer;
