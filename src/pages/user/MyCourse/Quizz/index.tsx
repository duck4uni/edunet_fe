import React from 'react';
import { 
  Card, 
  Tag, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Typography, 
  Popconfirm,
  Breadcrumb,
  Select,
  Row,
  Col,
  Empty,
  Progress,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  HomeOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
  EditOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useQuiz } from '../../../../hooks';
import type { QuizItem } from '../../../../types/myCourse';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Quizz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  const {
    userRole,
    filteredQuizzes,
    searchText,
    setSearchText,
    filterStatus,
    setFilterStatus,
    isModalOpen,
    selectedQuiz,
    stats,
    isLoading,
    getStatusConfig,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleStartQuiz,
    closeModal,
  } = useQuiz(id!);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'in-progress': return <PlayCircleOutlined />;
      case 'not-started':
      default: return <ClockCircleOutlined />;
    }
  };

  const onCreate = () => {
    form.resetFields();
    handleCreate();
  };

  const onEdit = (quiz: QuizItem) => {
    form.setFieldsValue(quiz);
    handleEdit(quiz);
  };

  const onSubmit = (values: any) => {
    handleSubmit(values);
    form.resetFields();
  };

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-6"
          items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/my-course">Khóa học của tôi</Link> },
            { title: <Link to={`/my-course/detail/${id}`}>Chi tiết khóa học</Link> },
            { title: 'Bài kiểm tra' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={2} className="!text-[#012643] !mb-1 flex items-center gap-3">
              <ReadOutlined className="text-green-500" />
              Bài kiểm tra
            </Title>
            <Text className="text-gray-500">
              {userRole === 'teacher' ? 'Tạo và quản lý bài kiểm tra khóa học' : 'Kiểm tra kiến thức với các bài kiểm tra'}
            </Text>
          </div>
          {userRole === 'teacher' && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="!bg-[#012643] !border-[#012643] !rounded-lg"
            >
              Tạo bài kiểm tra
            </Button>
          )}
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#012643]">{stats.total}</div>
                <div className="text-gray-500 text-sm">Tổng bài kiểm tra</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                <div className="text-gray-500 text-sm">Hoàn thành</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{stats.notStarted}</div>
                <div className="text-gray-500 text-sm">Chưa bắt đầu</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{stats.avgScore}%</div>
                <div className="text-gray-500 text-sm">Điểm TB</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="rounded-2xl border-0 shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm bài kiểm tra..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="!rounded-lg sm:!w-64"
              allowClear
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="sm:!w-40"
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'in-progress', label: 'Đang làm' },
                { value: 'not-started', label: 'Chưa bắt đầu' },
              ]}
            />
          </div>
        </Card>

        {/* Quiz Grid */}
        <Spin spinning={isLoading}>
        {filteredQuizzes.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-md">
            <Empty description="Không tìm thấy bài kiểm tra" />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredQuizzes.map(quiz => {
              const statusConfig = getStatusConfig(quiz.status);
              return (
                <Col xs={24} sm={12} lg={8} key={quiz.id}>
                  <Card 
                    className="h-full rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Header */}
                    <div className={`p-5 ${quiz.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-[#012643] to-blue-800'} text-white rounded-t-2xl`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <ReadOutlined className="text-2xl" />
                        </div>
                        <Tag color={statusConfig.color} icon={getStatusIcon(quiz.status)} className="!rounded-full">
                          {statusConfig.text}
                        </Tag>
                      </div>
                      <Title level={4} className="!text-white !mb-1">{quiz.title}</Title>
                      <Text className="text-white/70 text-sm line-clamp-2">{quiz.description}</Text>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      {/* Quiz Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <QuestionCircleOutlined className="text-blue-500" />
                          <span>{quiz.questions} Câu hỏi</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <ClockCircleOutlined className="text-orange-500" />
                          <span>{quiz.duration} phút</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <HistoryOutlined className="text-purple-500" />
                          <span>{quiz.attempts}/{quiz.maxAttempts} Lượt</span>
                        </div>
                        {quiz.bestScore !== undefined && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <TrophyOutlined className="text-yellow-500" />
                            <span>Cao nhất: {quiz.bestScore}%</span>
                          </div>
                        )}
                      </div>

                      {/* Score Progress (if completed) */}
                      {quiz.bestScore !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Điểm cao nhất</span>
                            <span className="font-semibold text-green-500">{quiz.bestScore}%</span>
                          </div>
                          <Progress 
                            percent={quiz.bestScore} 
                            strokeColor={quiz.bestScore >= 70 ? '#10B981' : '#F59E0B'}
                            showInfo={false}
                          />
                        </div>
                      )}

                      {/* Due Date */}
                      {quiz.dueDate && quiz.status === 'not-started' && (
                        <div className="bg-orange-50 p-3 rounded-xl mb-4">
                          <Text className="text-xs text-orange-600">Hạn: {quiz.dueDate}</Text>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {userRole === 'student' ? (
                          <>
                            {quiz.status === 'completed' ? (
                              <>
                                <Link to={`/my-course/quizz/answer/${quiz.id}`} className="flex-1">
                                  <Button block icon={<BarChartOutlined />} className="!rounded-lg">
                                    Xem kết quả
                                  </Button>
                                </Link>
                                {quiz.attempts < quiz.maxAttempts && (
                                  <Button 
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    onClick={() => handleStartQuiz(quiz)}
                                    className="!bg-[#012643] !rounded-lg"
                                  >
                                    Làm lại
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button 
                                type="primary"
                                block
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleStartQuiz(quiz)}
                                className="!bg-[#012643] !rounded-lg"
                                disabled={quiz.attempts >= quiz.maxAttempts}
                              >
                                {quiz.attempts > 0 ? 'Tiếp tục' : 'Bắt đầu làm bài'}
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Button 
                              icon={<EditOutlined />}
                              onClick={() => onEdit(quiz)}
                              className="!rounded-lg flex-1"
                            >
                              Sửa
                            </Button>
                            <Button 
                              icon={<BarChartOutlined />}
                              className="!rounded-lg"
                            >
                              Thống kê
                            </Button>
                            <Popconfirm
                              title="Xóa bài kiểm tra này?"
                              onConfirm={() => handleDelete(quiz.id)}
                            >
                              <Button 
                                icon={<DeleteOutlined />}
                                danger
                                className="!rounded-lg"
                              />
                            </Popconfirm>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
        </Spin>

        {/* Create/Edit Modal */}
        <Modal
          title={selectedQuiz ? 'Sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Nhập tiêu đề bài kiểm tra" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={3} placeholder="Mô tả ngắn về bài kiểm tra..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="duration"
                  label="Thời gian (phút)"
                  rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                >
                  <Input type="number" placeholder="30" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalQuestions"
                  label="Số câu hỏi"
                  rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi' }]}
                >
                  <Input type="number" placeholder="20" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="maxAttempts"
                  label="Số lượt tối đa"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượt tối đa' }]}
                >
                  <Input type="number" placeholder="3" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Hạn nộp (tùy chọn)"
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={closeModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="!bg-[#012643]">
                {selectedQuiz ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Quizz;
