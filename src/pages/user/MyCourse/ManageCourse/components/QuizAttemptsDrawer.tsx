import React, { useEffect, useMemo } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  type Quiz,
  type TeacherQuizAttemptDetail,
  useGetQuizAttemptsForTeacherQuery,
} from '../../../../../services/learningApi';
import { notify } from '../../../../../utils/notify';

const { Text } = Typography;

interface QuizAttemptsDrawerProps {
  open: boolean;
  onClose: () => void;
  quiz: Quiz | null;
}

const statusConfig: Record<
  TeacherQuizAttemptDetail['status'],
  { color: string; label: string }
> = {
  completed: { color: 'green', label: 'Hoàn thành' },
  in_progress: { color: 'blue', label: 'Đang làm' },
  timed_out: { color: 'gold', label: 'Hết giờ' },
};

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '-';
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '-';
};

const formatTimeSpent = (timeSpent: number): string => {
  const safeSeconds = Number.isFinite(timeSpent) ? Math.max(0, Math.floor(timeSpent)) : 0;

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }

  return `${seconds}s`;
};

const QuizAttemptsDrawer: React.FC<QuizAttemptsDrawerProps> = ({ open, onClose, quiz }) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetQuizAttemptsForTeacherQuery(quiz?.id || '', {
    skip: !open || !quiz?.id,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (open && isError) {
      notify.error('Không thể tải dữ liệu bài làm của học viên.');
    }
  }, [isError, open]);

  const report = data?.data;
  const attempts = report?.attempts || [];
  const summary = report?.summary;
  const totalQuestions = report?.quiz.totalQuestions || quiz?.totalQuestions || 0;
  const passingScore = Number(report?.quiz.passingScore || quiz?.passingScore || 0);

  const columns = useMemo<ColumnsType<TeacherQuizAttemptDetail>>(
    () => [
      {
        title: 'Học viên',
        key: 'student',
        width: 260,
        render: (_value, record) => (
          <Space size={10} align="start">
            <Avatar size={34} src={record.studentAvatar || undefined} icon={<UserOutlined />} />
            <div>
              <Text strong>{record.studentName || 'N/A'}</Text>
              <div className="manage-tab-subtext">{record.studentEmail || 'Không có email'}</div>
            </div>
          </Space>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: TeacherQuizAttemptDetail['status']) => {
          const config = statusConfig[status] || {
            color: 'default',
            label: status,
          };

          return <Tag color={config.color}>{config.label}</Tag>;
        },
      },
      {
        title: 'Điểm',
        dataIndex: 'score',
        key: 'score',
        width: 100,
        render: (score: number) => {
          const safeScore = Number(score || 0);
          return <Tag color={safeScore >= passingScore ? 'green' : 'red'}>{safeScore}%</Tag>;
        },
      },
      {
        title: 'Đúng / Trả lời',
        key: 'answers',
        width: 140,
        render: (_value, record) => {
          const answered = record.totalAnswered || 0;
          const maxQuestions = totalQuestions > 0 ? totalQuestions : answered;
          return `${record.correctAnswers || 0}/${maxQuestions}`;
        },
      },
      {
        title: 'Thời gian làm',
        dataIndex: 'timeSpent',
        key: 'timeSpent',
        width: 120,
        render: (timeSpent: number) => formatTimeSpent(timeSpent),
      },
      {
        title: 'Bắt đầu',
        dataIndex: 'startedAt',
        key: 'startedAt',
        width: 160,
        render: (startedAt: string) => formatDateTime(startedAt),
      },
      {
        title: 'Nộp bài',
        dataIndex: 'completedAt',
        key: 'completedAt',
        width: 160,
        render: (completedAt?: string | null) => formatDateTime(completedAt),
      },
    ],
    [passingScore, totalQuestions],
  );

  return (
    <Drawer
      title={`Kết quả học viên${report?.quiz.title ? `: ${report.quiz.title}` : ''}`}
      open={open}
      onClose={onClose}
      placement="right"
      width={1060}
      destroyOnHidden
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
            Tải lại
          </Button>
        </Space>
      }
    >
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} md={6}>
          <Card size="small" loading={isLoading}>
            <Statistic title="Số học viên đã làm" value={summary?.totalStudents || 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" loading={isLoading}>
            <Statistic title="Tổng lượt làm" value={summary?.totalAttempts || 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" loading={isLoading}>
            <Statistic title="Điểm trung bình" value={summary?.averageScore || 0} suffix="%" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" loading={isLoading}>
            <Statistic title="Tỷ lệ đạt" value={summary?.passRate || 0} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        style={{ marginBottom: 12 }}
        loading={isLoading}
        title="Tổng quan"
      >
        <Space size={[8, 8]} wrap>
          <Tag color="green">Hoàn thành: {summary?.completedAttempts || 0}</Tag>
          <Tag color="blue">Đang làm: {summary?.inProgressAttempts || 0}</Tag>
          <Tag color="gold">Hết giờ: {summary?.timedOutAttempts || 0}</Tag>
          <Tag color="cyan">Điểm cao nhất: {summary?.highestScore || 0}%</Tag>
          <Tag color="purple">Điểm đạt: {passingScore}%</Tag>
        </Space>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={attempts}
        loading={isLoading || isFetching}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 980 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có học viên nào làm quiz này."
            />
          ),
        }}
      />
    </Drawer>
  );
};

export default QuizAttemptsDrawer;
