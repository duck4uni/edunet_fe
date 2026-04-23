// Admin Header Component
import React from 'react';
import { 
  Input, 
  Badge, 
  Avatar, 
  Dropdown, 
  Space, 
  Button,
  Typography,
} from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { MenuProps } from 'antd';
import type { AdminNotification } from '../../types/admin';

const { Text } = Typography;

interface AdminHeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  notifications?: AdminNotification[];
  onNotificationClick?: (notification: AdminNotification) => void;
  onMarkAllRead?: () => void;
  onToggleCollapse?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  onLogout,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: AdminNotification['type']) => {
    const colors = {
      info: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
    };
    return <CheckCircleOutlined style={{ color: colors[type] }} />;
  };

  const notificationContent = (
    <div className="w-80 max-h-96 overflow-hidden bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && onMarkAllRead && (
          <Button type="link" size="small" onClick={onMarkAllRead}>
            Đánh dấu đã đọc
          </Button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Không có thông báo mới
          </div>
        ) : (
          <div>
            {notifications.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !item.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => onNotificationClick?.(item)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {item.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 border-t border-gray-200 text-center">
        <Link to="/admin/dashboard" className="text-blue-500 text-sm hover:text-blue-600">
          Xem bảng điều khiển
        </Link>
      </div>
    </div>
  );

  const userMenuItems: MenuProps['items'] = [
    // {
    //   key: 'profile',
    //   icon: <UserOutlined />,
    //   label: <Link to="/admin/settings">Hồ sơ</Link>,
    // },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">Cài đặt</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <header
      className="admin-header"
      style={{
        padding: '0 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #bdeaf8',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        width: '100%',
        transition: 'all 0.2s',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="rounded-lg"
          style={{ backgroundColor: '#f3fbff' }}
        />
      </div>

      {/* Right Actions */}
      <Space size="middle">
        {/* Notifications */}
        <Dropdown
          dropdownRender={() => notificationContent}
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              className="flex items-center justify-center"
            />
          </Badge>
        </Dropdown>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-cyan-50 rounded-lg px-2 py-1 transition-colors">
            <Avatar 
              src={user?.avatar} 
              icon={<UserOutlined />}
              size="small"
            />
            <div className="hidden md:block">
              <Text className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </Text>
            </div>
          </div>
        </Dropdown>
      </Space>
    </header>
  );
};

export default AdminHeader;
