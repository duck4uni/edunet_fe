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
  Col,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  DeleteOutlined,
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  LinkOutlined,
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useMaterial } from '../../../../hooks';
import type { MaterialItem } from '../../../../types/myCourse';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const Material: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  const {
    userRole,
    filteredMaterials,
    searchText,
    setSearchText,
    filterType,
    setFilterType,
    isModalOpen,
    isLoading,
    stats,
    getTypeConfig,
    handleUpload,
    handleDelete,
    handleSubmit,
    closeModal,
  } = useMaterial(id!);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FilePdfOutlined />;
      case 'video': return <VideoCameraOutlined />;
      case 'document': return <FileTextOutlined />;
      case 'link': return <LinkOutlined />;
      case 'image': return <FileImageOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const onUpload = () => {
    form.resetFields();
    handleUpload();
  };

  const onSubmit = (values: any) => {
    handleSubmit(values);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Tài liệu',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, record: MaterialItem) => {
        const config = getTypeConfig(record.type);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${config.color}-50`}>
              <span className={`text-2xl text-${config.color}-500`}>{getTypeIcon(record.type)}</span>
            </div>
            <div>
              <Text className="font-semibold text-[#012643] block">{record.title}</Text>
              <Text className="text-gray-500 text-sm">{record.description}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config = getTypeConfig(type);
        return (
          <Tag color={config.color} icon={getTypeIcon(type)} className="!rounded-full">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => <Text className="text-gray-500">{size || '-'}</Text>,
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: string) => (
        <Text className="text-gray-500">{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: MaterialItem) => (
        <Space>
          {record.type === 'link' ? (
            <Tooltip title="Mở liên kết">
              <Button 
                type="text" 
                icon={<LinkOutlined />} 
                onClick={() => window.open(record.downloadUrl, '_blank')}
                className="!text-purple-500"
              />
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Xem trước">
                <Button type="text" icon={<EyeOutlined />} className="!text-blue-500" />
              </Tooltip>
              <Tooltip title="Tải xuống">
                <Button type="text" icon={<DownloadOutlined />} className="!text-green-500" />
              </Tooltip>
            </>
          )}
          {userRole === 'teacher' && (
            <Popconfirm
              title="Xóa tài liệu này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Xóa">
                <Button type="text" icon={<DeleteOutlined />} className="!text-red-500" />
              </Tooltip>
            </Popconfirm>
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
            { title: 'Tài liệu' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={2} className="!text-[#012643] !mb-1 flex items-center gap-3">
              <BookOutlined className="text-cyan-500" />
              Tài liệu khóa học
            </Title>
            <Text className="text-gray-500">
              {userRole === 'teacher' ? 'Tải lên và quản lý tài liệu' : 'Tải xuống tài liệu khóa học'}
            </Text>
          </div>
          {userRole === 'teacher' && (
            <Button 
              type="primary" 
              icon={<CloudUploadOutlined />}
              onClick={onUpload}
              className="!bg-[#012643] !border-[#012643] !rounded-lg"
            >
              Tải lên tài liệu
            </Button>
          )}
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#012643]">{stats.total}</div>
                <div className="text-gray-500 text-sm">Tổng tệp</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.pdf}</div>
                <div className="text-gray-500 text-sm">PDF</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.video}</div>
                <div className="text-gray-500 text-sm">Video</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.document}</div>
                <div className="text-gray-500 text-sm">Tài liệu</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters & Table */}
        <Card className="rounded-2xl border-0 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Tìm tài liệu..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="!rounded-lg sm:!w-64"
              allowClear
            />
            <Select
              value={filterType}
              onChange={setFilterType}
              className="sm:!w-40"
              options={[
                { value: 'all', label: 'Tất cả loại' },
                { value: 'pdf', label: 'PDF' },
                { value: 'video', label: 'Video' },
                { value: 'document', label: 'Tài liệu' },
                { value: 'link', label: 'Liên kết' },
                { value: 'image', label: 'Hình ảnh' },
              ]}
            />
          </div>

          {filteredMaterials.length === 0 ? (
            <Empty description="Không tìm thấy tài liệu" />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredMaterials}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
              className="custom-table"
            />
          )}
        </Card>

        {/* Upload Modal */}
        <Modal
          title="Tải lên tài liệu mới"
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
              <Input placeholder="Tiêu đề tài liệu" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={2} placeholder="Mô tả ngắn..." />
            </Form.Item>

            <Form.Item
              name="type"
              label="Loại tài liệu"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select
                options={[
                  { value: 'pdf', label: 'Tài liệu PDF' },
                  { value: 'video', label: 'Video' },
                  { value: 'document', label: 'Word/Doc' },
                  { value: 'link', label: 'Liên kết ngoài' },
                  { value: 'image', label: 'Hình ảnh' },
                ]}
                placeholder="Chọn loại"
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.type !== curr.type}
            >
              {({ getFieldValue }) => 
                getFieldValue('type') === 'link' ? (
                  <Form.Item
                    name="downloadUrl"
                    label="Đường dẫn"
                    rules={[{ required: true, message: 'Vui lòng nhập URL' }]}
                  >
                    <Input placeholder="https://example.com/resource" />
                  </Form.Item>
                ) : (
                  <Form.Item label="Tải lên tệp">
                    <Dragger>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Nhấp hoặc kéo thả tệp để tải lên</p>
                      <p className="ant-upload-hint">Hỗ trợ tải lên từng tệp hoặc nhiều tệp</p>
                    </Dragger>
                  </Form.Item>
                )
              }
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={closeModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="!bg-[#012643]">
                Tải lên
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Material;
