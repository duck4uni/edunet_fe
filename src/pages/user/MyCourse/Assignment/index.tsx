import React from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Typography, 
  Space, 
  Popconfirm,
  Breadcrumb,
  Select,
  Upload,
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  HomeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useAssignment } from '../../../../hooks';
import type { AssignmentItem } from '../../../../types/myCourse';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Assignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  const {
    userRole,
    filteredAssignments,
    searchText,
    setSearchText,
    filterStatus,
    setFilterStatus,
    isModalOpen,
    isViewModalOpen,
    selectedAssignment,
    stats,
    isLoading,
    getStatusConfig,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleSubmit,
    handleSubmitAssignment,
    closeModal,
    closeViewModal,
  } = useAssignment(id!);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'submitted': return <CheckCircleOutlined />;
      case 'graded': return <CheckCircleOutlined />;
      case 'overdue': return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const onCreate = () => {
    form.resetFields();
    handleCreate();
  };

  const onEdit = (assignment: AssignmentItem) => {
    form.setFieldsValue({
      ...assignment,
      dueDate: assignment.dueDate,
    });
    handleEdit(assignment);
  };

  const onSubmit = (values: any) => {
    handleSubmit(values);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Bài tập',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, record: AssignmentItem) => (
        <div>
          <Text className="font-semibold text-[#012643] block">{record.title}</Text>
          <Text className="text-gray-500 text-sm line-clamp-1">{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (
        <Text className="text-gray-600">{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={getStatusIcon(status)} className="!rounded-full">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Điểm',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number | undefined, record: AssignmentItem) => (
        grade !== undefined ? (
          <div className="text-center">
            <Text className="font-bold text-lg text-green-500">{grade}</Text>
            <Text className="text-gray-400">/{record.maxGrade}</Text>
          </div>
        ) : (
          <Text className="text-gray-400">-</Text>
        )
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: AssignmentItem) => (
        <Space>
          <Tooltip title="Xem">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
              className="!text-blue-500"
            />
          </Tooltip>
          {userRole === 'teacher' && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit(record)}
                  className="!text-orange-500"
                />
              </Tooltip>
              <Popconfirm
                title="Xóa bài tập này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip title="Xóa">
                  <Button type="text" icon={<DeleteOutlined />} className="!text-red-500" />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {userRole === 'student' && record.status === 'pending' && (
            <Button type="primary" size="small" className="!bg-[#012643] !rounded-lg" onClick={() => handleSubmitAssignment(record.id, '')}>
              Nộp bài
            </Button>
          )}
        </Space>
      ),
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
            { title: <Link to={`/my-course/detail/${id}`}>Chi tiết khóa học</Link> },
            { title: 'Bài tập' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={2} className="!text-[#012643] !mb-1 flex items-center gap-3">
              <FileTextOutlined className="text-orange-500" />
              Bài tập
            </Title>
            <Text className="text-gray-500">
              {userRole === 'teacher' ? 'Tạo và quản lý bài tập khóa học' : 'Xem và nộp bài tập'}
            </Text>
          </div>
          {userRole === 'teacher' && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="!bg-[#012643] !border-[#012643] !rounded-lg"
            >
              Tạo bài tập
            </Button>
          )}
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#012643]">{stats.total}</div>
                <div className="text-gray-500 text-sm">Tổng</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
                <div className="text-gray-500 text-sm">Chờ nộp</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.submitted}</div>
                <div className="text-gray-500 text-sm">Đã nộp</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.graded}</div>
                <div className="text-gray-500 text-sm">Đã chấm</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
                <div className="text-gray-500 text-sm">Quá hạn</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters & Table */}
        <Card className="rounded-2xl border-0 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Tìm bài tập..."
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
                { value: 'pending', label: 'Chờ nộp' },
                { value: 'submitted', label: 'Đã nộp' },
                { value: 'graded', label: 'Đã chấm' },
                { value: 'overdue', label: 'Quá hạn' },
              ]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredAssignments}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={selectedAssignment ? 'Sửa bài tập' : 'Tạo bài tập mới'}
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
              <Input placeholder="Tiêu đề bài tập" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <TextArea rows={4} placeholder="Mô tả bài tập..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Hạn nộp"
                  rules={[{ required: true, message: 'Vui lòng chọn hạn nộp' }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxGrade"
                  label="Điểm tối đa"
                  rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa' }]}
                >
                  <Input type="number" placeholder="100" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Tệp đính kèm">
              <Upload>
                <Button icon={<UploadOutlined />}>Tải tệp lên</Button>
              </Upload>
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={closeModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="!bg-[#012643]">
                {selectedAssignment ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* View Modal */}
        <Modal
          title="Chi tiết bài tập"
          open={isViewModalOpen}
          onCancel={closeViewModal}
          footer={[
            <Button key="close" onClick={closeViewModal}>Đóng</Button>,
            userRole === 'student' && selectedAssignment?.status === 'pending' && (
              <Button key="submit" type="primary" className="!bg-[#012643]" onClick={() => selectedAssignment && handleSubmitAssignment(selectedAssignment.id, '')}>Nộp bài tập</Button>
            )
          ]}
          width={600}
        >
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Text className="text-gray-500 text-sm">Tiêu đề</Text>
                <Title level={4} className="!mt-1 !mb-0">{selectedAssignment.title}</Title>
              </div>
              <div>
                <Text className="text-gray-500 text-sm">Mô tả</Text>
                <Paragraph className="!mt-1 !mb-0">{selectedAssignment.description}</Paragraph>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Text className="text-gray-500 text-sm">Hạn nộp</Text>
                  <div className="font-semibold">{selectedAssignment.dueDate}</div>
                </Col>
                <Col span={12}>
                  <Text className="text-gray-500 text-sm">Trạng thái</Text>
                  <div>{getStatusConfig(selectedAssignment.status).text}</div>
                </Col>
              </Row>
              {selectedAssignment.grade !== undefined && (
                <div>
                  <Text className="text-gray-500 text-sm">Điểm</Text>
                  <div className="text-2xl font-bold text-green-500">
                    {selectedAssignment.grade}/{selectedAssignment.maxGrade}
                  </div>
                </div>
              )}
              {selectedAssignment.feedback && (
                <div>
                  <Text className="text-gray-500 text-sm">Phản hồi</Text>
                  <Card className="mt-1 bg-green-50 border-green-200">
                    <Paragraph className="!mb-0">{selectedAssignment.feedback}</Paragraph>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Assignment;
