// Admin Layout Component
import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme as antTheme, Spin, Result, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdminAuth, useDashboard } from '../../hooks';

const { Content } = Layout;
const MIN_ADMIN_WIDTH = 1024;

const isDesktopWidth = () => {
  if (typeof window === 'undefined') {
    return true;
  }
  return window.innerWidth >= MIN_ADMIN_WIDTH;
};

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(isDesktopWidth);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout, isAuthenticated, isInitialized } = useAdminAuth();
  const { data: dashboardData, markNotificationRead, markAllNotificationsRead } = useDashboard();

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

  // Block admin on small screens
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(isDesktopWidth());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    algorithm: antTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
    components: {
      Layout: {
        siderBg: '#ffffff',
        headerBg: '#ffffff',
        bodyBg: '#f5f5f5',
      },
      Menu: {
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
      },
    },
  };

  if (!isDesktop) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Result
          status="warning"
          title="Khu vực Admin chỉ hỗ trợ màn hình từ 1024px"
          subTitle="Vui lòng dùng laptop hoặc desktop để truy cập trang quản trị."
          extra={
            <Button className="text-black" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
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
              backgroundColor: '#f5f5f5',
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
