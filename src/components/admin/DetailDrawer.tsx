// Detail Drawer Component
import React from 'react';
import { Drawer, Descriptions, Avatar, Space, Button, Typography } from 'antd';
import { CloseOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import StatusBadge from './StatusBadge';

const { Text, Title } = Typography;

interface DetailItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  items: DetailItem[];
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  avatar,
  status,
  items,
  extra,
  footer,
  width = 600,
  onEdit,
  onDelete,
}) => {
  const renderHeader = () => (
    <div className="flex items-center gap-4">
      {avatar !== undefined && (
        <Avatar 
          src={avatar} 
          icon={!avatar && <UserOutlined />}
          size={64}
          className="flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Title level={5} className="m-0 truncate">
            {title}
          </Title>
          {status && <StatusBadge status={status} />}
        </div>
        {subtitle && (
          <Text type="secondary" className="block mt-1 truncate">
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  );

  const renderExtra = () => (
    <Space>
      {onEdit && (
        <Button 
          icon={<EditOutlined />} 
          onClick={onEdit}
        >
          Chỉnh sửa
        </Button>
      )}
      {onDelete && (
        <Button 
          icon={<DeleteOutlined />} 
          danger
          onClick={onDelete}
        >
          Xóa
        </Button>
      )}
      {extra}
    </Space>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={width}
      closable={false}
      title={renderHeader()}
      extra={
        <Space>
          {(onEdit || onDelete || extra) && renderExtra()}
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={onClose}
          />
        </Space>
      }
      footer={footer}
      className="detail-drawer"
    >
      <Descriptions 
        column={2}
        bordered
        size="small"
        labelStyle={{ 
          fontWeight: 500,
          backgroundColor: '#fafafa',
          width: '35%',
        }}
        contentStyle={{
          backgroundColor: '#ffffff',
        }}
      >
        {items.map((item, index) => (
          <Descriptions.Item 
            key={index} 
            label={item.label}
            span={item.span || 1}
          >
            {item.value || '-'}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Drawer>
  );
};

export default DetailDrawer;
