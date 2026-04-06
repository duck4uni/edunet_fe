// Confirm Modal Component
import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

type ConfirmType = 'delete' | 'warning' | 'confirm' | 'info';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  content?: React.ReactNode;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
}

const typeConfig: Record<ConfirmType, { icon: React.ReactNode; color: string; defaultTitle: string }> = {
  delete: {
    icon: <DeleteOutlined />,
    color: '#ff4d4f',
    defaultTitle: 'Xác nhận xóa',
  },
  warning: {
    icon: <WarningOutlined />,
    color: '#faad14',
    defaultTitle: 'Cảnh báo',
  },
  confirm: {
    icon: <ExclamationCircleOutlined />,
    color: '#1890ff',
    defaultTitle: 'Xác nhận',
  },
  info: {
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    defaultTitle: 'Thông báo',
  },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  content,
  type = 'confirm',
  confirmText,
  cancelText = 'Hủy',
  loading = false,
  danger,
}) => {
  const config = typeConfig[type];
  const isDanger = danger ?? type === 'delete';

  return (
    <Modal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText || (type === 'delete' ? 'Xóa' : 'Xác nhận')}
      cancelText={cancelText}
      okButtonProps={{ 
        danger: isDanger,
        loading,
      }}
      centered
      width={420}
    >
      <Space align="start" size="middle" className="w-full py-2">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${config.color}15`, color: config.color }}
        >
          {config.icon}
        </div>
        <div className="flex-1">
          <Text strong className="text-base block mb-2">
            {title || config.defaultTitle}
          </Text>
          {content && (
            <Paragraph className="text-gray-500 mb-0">
              {content}
            </Paragraph>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default ConfirmModal;
