// Admin Sidebar Component
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Tooltip } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  LockOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  IdcardOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onLogout: () => void;
}

const menuItems = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  {
    key: 'courses',
    icon: <BookOutlined />,
    label: 'Quản lý khóa học',
    children: [
      { key: '/admin/courses', label: 'Danh sách khóa học' },
      { key: '/admin/courses/pending', label: 'Chờ duyệt' },
      { key: '/admin/courses/reviews', label: 'Đánh giá' },
    ],
  },
  {
    key: '/admin/teachers',
    icon: <IdcardOutlined />,
    label: 'Quản lý giáo viên',
  },
  {
    key: '/admin/employees',
    icon: <TeamOutlined />,
    label: 'Quản lý nhân viên',
  },
  {
    key: 'recruitment',
    icon: <FileTextOutlined />,
    label: 'Tuyển dụng',
    children: [
      { key: '/admin/recruitment/applications', label: 'Hồ sơ ứng tuyển' },
      { key: '/admin/recruitment/jobs', label: 'Tin tuyển dụng' },
    ],
  },
  {
    key: '/admin/support',
    icon: <CustomerServiceOutlined />,
    label: 'Hỗ trợ',
  },
  {
    key: '/admin/permissions',
    icon: <LockOutlined />,
    label: 'Phân quyền',
  },
  {
    key: '/admin/revenue',
    icon: <DollarOutlined />,
    label: 'Doanh thu',
  },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: 'Cài đặt',
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onCollapse,
  user,
  onLogout,
}) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Find the current active menu key
  const getSelectedKey = () => {
    const path = location.pathname;
    // Find exact match or parent path
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (path.startsWith(child.key)) {
            return [child.key];
          }
        }
      } else if (path === item.key || (item.key !== '/admin' && path.startsWith(item.key))) {
        return [item.key];
      }
    }
    return ['/admin'];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (path.startsWith(child.key)) {
            return [item.key];
          }
        }
      }
    }
    return [];
  };

  React.useEffect(() => {
    if (!collapsed) {
      setOpenKeys(getOpenKeys());
    }
  }, [location.pathname, collapsed]);

  const roleLabels: Record<string, string> = {
    super_admin: 'Quản trị viên cao cấp',
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    support: 'Hỗ trợ',
    hr: 'Nhân sự',
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={260}
      collapsedWidth={80}
      className="admin-sidebar"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              EduNet
            </span>
          )}
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'text-center' : ''}`}>
          <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'}`}>
            <Tooltip title={collapsed ? `${user.firstName} ${user.lastName}` : ''} placement="right">
              <Avatar 
                src={user.avatar} 
                icon={<UserOutlined />}
                size={collapsed ? 40 : 44}
              />
            </Tooltip>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <Text strong className="block truncate text-gray-800 dark:text-white">
                  {user.firstName} {user.lastName}
                </Text>
                <Text type="secondary" className="block text-xs truncate">
                  {roleLabels[user.role] || user.role}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKey()}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={setOpenKeys}
        style={{ 
          border: 'none',
          backgroundColor: 'transparent',
        }}
        items={menuItems.map(item => ({
          ...item,
          label: item.children ? item.label : <Link to={item.key}>{item.label}</Link>,
          children: item.children?.map(child => ({
            ...child,
            label: <Link to={child.key}>{child.label}</Link>,
          })),
        }))}
      />

      {/* Collapse Button & Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700">
        <Menu
          mode="inline"
          selectable={false}
          style={{ border: 'none', backgroundColor: 'transparent' }}
          items={[
            {
              key: 'collapse',
              icon: collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />,
              label: collapsed ? '' : 'Thu gọn',
              onClick: () => onCollapse(!collapsed),
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: collapsed ? '' : 'Đăng xuất',
              danger: true,
              onClick: onLogout,
            },
          ]}
        />
      </div>
    </Sider>
  );
};

export default AdminSidebar;
