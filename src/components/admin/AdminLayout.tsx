import React, { useState, useEffect } from 'react';
import { ConfigProvider, Spin, Button, Result } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth, useDashboard } from '../../hooks';

const MIN_ADMIN_WIDTH = 1024;
const isDesktopWidth = () =>
  typeof window === 'undefined' ? true : window.innerWidth >= MIN_ADMIN_WIDTH;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(isDesktopWidth);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { data: dashboardData, markNotificationRead, markAllNotificationsRead } = useDashboard();
  const isAdmin = user?.role === 'admin';
  const isInitialized = !isLoading;

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true, state: { from: location } });
      return;
    }
    if (!isAdmin) navigate('/', { replace: true });
  }, [isAuthenticated, isAdmin, isInitialized]);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(isDesktopWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Result
          status="warning"
          title="Khu vực Admin chỉ hỗ trợ màn hình từ 1024px"
          subTitle="Vui lòng dùng laptop hoặc desktop để truy cập trang quản trị."
          extra={
            <Button onClick={() => navigate('/')}>Về trang chủ</Button>
          }
        />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  const sidebarWidth = collapsed ? 72 : 256;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
          borderRadiusLG: 16,
          colorBgContainer: '#ffffff',
          colorBorder: '#e2e8f0',
          colorBorderSecondary: '#f1f5f9',
          fontFamily: '\'Inter\', \'Segoe UI\', sans-serif',
        },
        components: {
          Menu: { itemBg: 'transparent', darkItemBg: 'transparent' },
          Table: { headerBg: '#f8fafc', headerSplitColor: 'transparent' },
          Card: {
            boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
            paddingLG: 20,
          },
        },
      }}
    >
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          user={
            user
              ? {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  avatar: user.avatar,
                  role: user.role,
                }
              : undefined
          }
          onLogout={async () => await logout()}
        />

        {/* Main area */}
        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <AdminHeader
            user={
              user
                ? {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                  }
                : undefined
            }
            onLogout={async () => await logout()}
            notifications={dashboardData?.notifications}
            onNotificationClick={(n) => {
              markNotificationRead(n.id);
              if (n.link) navigate(n.link);
            }}
            onMarkAllRead={markAllNotificationsRead}
          />

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AdminLayout;

