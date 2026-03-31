import React from 'react';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện tại không có dữ liệu để hiển thị.',
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`py-16 text-center ${className}`}>
      <div className="text-6xl mb-4 text-gray-300">
        {icon || <InboxOutlined />}
      </div>
      <h3 className="text-xl font-semibold text-[#012643] mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button 
          type="primary" 
          onClick={action.onClick}
          className="!bg-[#012643] !rounded-lg"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
