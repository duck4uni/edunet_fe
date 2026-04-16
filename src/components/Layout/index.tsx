import React, { useEffect } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import FloatingChatBot from '../Chat/FloatingChatBot';
import socketService from '../../services/socketService';
import { getAccessToken } from '../../services/axiosBaseQuery';
import { friendChatApi } from '../../services/friendChatApi';
import { useAppDispatch } from '../../redux/hooks';

const { Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const hasToken = !!getAccessToken();
  const {
    token: { },
  } = theme.useToken();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Connect socket globally for notifications
  useEffect(() => {
    if (!hasToken) return;

    let socket: ReturnType<typeof socketService.connect> | null = null;
    try {
      socket = socketService.connect();
    } catch {
      return;
    }

    const handleNewMessage = () => {
      dispatch(friendChatApi.util.invalidateTags(['UnreadCounts']));
    };
    const handleFriendRequest = () => {
      dispatch(friendChatApi.util.invalidateTags(['PendingRequests']));
    };
    const handleFriendAccepted = () => {
      dispatch(friendChatApi.util.invalidateTags(['Friends', 'PendingRequests']));
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('friend:request', handleFriendRequest);
    socket.on('friend:accepted', handleFriendAccepted);

    return () => {
      socket?.off('message:receive', handleNewMessage);
      socket?.off('friend:request', handleFriendRequest);
      socket?.off('friend:accepted', handleFriendAccepted);
      socketService.disconnect();
    };
  }, [hasToken, dispatch]);

  return (
    <Layout className="min-h-screen bg-white">
      <Header />
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        EduNet ©{new Date().getFullYear()} Được phát triển bởi EduNet Team
      </Footer>
      <FloatingChatBot />
    </Layout>
  );
};

export default AppLayout;
