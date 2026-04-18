// Status Badge Component
import React from 'react';
import Badge from '../common/Tag';

interface StatusConfig {
  label: string;
  color: string;
}

interface StatusBadgeProps {
  status: string;
  statusMap?: Record<string, StatusConfig>;
  size?: 'small' | 'default';
}

// Default status configurations
const defaultStatusMap: Record<string, StatusConfig> = {
  // General
  active: { label: 'Hoạt động', color: 'green' },
  inactive: { label: 'Không hoạt động', color: 'default' },
  pending: { label: 'Chờ duyệt', color: 'orange' },
  suspended: { label: 'Tạm ngưng', color: 'red' },
  
  // Course status
  draft: { label: 'Bản nháp', color: 'default' },
  approved: { label: 'Đã duyệt', color: 'blue' },
  rejected: { label: 'Từ chối', color: 'red' },
  published: { label: 'Đã xuất bản', color: 'green' },
  archived: { label: 'Lưu trữ', color: 'default' },
  
  // Ticket status
  open: { label: 'Mở', color: 'blue' },
  in_progress: { label: 'Đang xử lý', color: 'orange' },
  waiting: { label: 'Chờ phản hồi', color: 'purple' },
  resolved: { label: 'Đã giải quyết', color: 'green' },
  closed: { label: 'Đã đóng', color: 'default' },
  
  // Priority
  low: { label: 'Thấp', color: 'default' },
  medium: { label: 'Trung bình', color: 'blue' },
  high: { label: 'Cao', color: 'orange' },
  urgent: { label: 'Khẩn cấp', color: 'red' },
  
  // Employee status
  on_leave: { label: 'Nghỉ phép', color: 'orange' },
  
  // CV status
  new: { label: 'Mới', color: 'blue' },
  reviewing: { label: 'Đang xem xét', color: 'orange' },
  shortlisted: { label: 'Vào vòng trong', color: 'purple' },
  interview: { label: 'Phỏng vấn', color: 'cyan' },
  offered: { label: 'Đã offer', color: 'green' },
  hired: { label: 'Đã tuyển', color: 'green' },
  
  // Review status
  visible: { label: 'Hiển thị', color: 'green' },
  hidden: { label: 'Ẩn', color: 'default' },
  flagged: { label: 'Bị báo cáo', color: 'red' },
  
  // Job status
  filled: { label: 'Đã tuyển', color: 'green' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusMap,
  size = 'default',
}) => {
  const config = statusMap?.[status] || defaultStatusMap[status] || { 
    label: status, 
    color: 'default' 
  };

  return (
    <Badge 
      color={config.color}
      style={size === 'small' ? { fontSize: '11px', padding: '0 6px' } : undefined}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
