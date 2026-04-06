// Admin Layout Component
import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme as antTheme, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdminAuth, useDashboard, useTheme } from '../../hooks';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout, isAuthenticated, isInitialized } = useAdminAuth();
  const { data: dashboardData, markNotificationRead, markAllNotificationsRead } = useDashboard();
  const { isDark, toggleTheme } = useTheme();

  // Check authentication on mount and when auth state changes
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isInitialized, navigate, location]);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Ant Design theme configuration
  const themeConfig = {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
    components: {
      Layout: {
        siderBg: isDark ? '#141414' : '#ffffff',
        headerBg: isDark ? '#141414' : '#ffffff',
        bodyBg: isDark ? '#0a0a0a' : '#f5f5f5',
      },
      Menu: {
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
      },
    },
  };

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className="min-h-screen">
        <AdminSidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          user={user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          } : undefined}
          onLogout={handleLogout}
        />
        
        <Layout 
          style={{ 
            marginLeft: collapsed ? 80 : 260,
            transition: 'margin-left 0.2s',
          }}
        >
          <AdminHeader
            user={user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar,
            } : undefined}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            notifications={dashboardData?.notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={markAllNotificationsRead}
            collapsed={collapsed}
          />
          
          <Content
            style={{
              margin: '24px',
              padding: '24px',
              minHeight: 'calc(100vh - 112px)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
