import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip = 'Đang tải...',
  fullScreen = false,
  className = '',
}) => {
  const sizeMap = {
    small: 24,
    default: 36,
    large: 48,
  };

  const antIcon = <LoadingOutlined style={{ fontSize: sizeMap[size] }} spin />;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <Spin indicator={antIcon} />
          {tip && <p className="mt-4 text-gray-500">{tip}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Spin indicator={antIcon} />
      {tip && <p className="mt-4 text-gray-500">{tip}</p>}
    </div>
  );
};

export default LoadingSpinner;
