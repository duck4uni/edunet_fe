import React, { useEffect } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const { Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const {
    token: { },
  } = theme.useToken();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Layout className="min-h-screen bg-white">
      <Header />
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        EduNet ©{new Date().getFullYear()} Được phát triển bởi EduNet Team
      </Footer>
    </Layout>
  );
};

export default AppLayout;
