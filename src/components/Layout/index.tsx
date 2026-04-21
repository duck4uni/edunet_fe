import React, { useEffect, useRef } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import RouteBreadcrumb from './RouteBreadcrumb';
import FloatingChatBot from '../Chat/FloatingChatBot';
import socketService from '../../services/socketService';
import { getAccessToken } from '../../services/axiosBaseQuery';
import { friendChatApi } from '../../services/friendChatApi';
import { useAppDispatch } from '../../redux/hooks';
import { notify } from '../../utils/notify';

const { Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const hasToken = !!getAccessToken();
  const pathnameRef = useRef(location.pathname);
  const {
    token: { },
  } = theme.useToken();

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

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

    const handleNewMessage = (payload?: { senderName?: string }) => {
      dispatch(friendChatApi.util.invalidateTags(['UnreadCounts']));

      if (pathnameRef.current !== '/chat') {
        notify.info(payload?.senderName ? `${payload.senderName} vừa gửi tin nhắn mới` : 'Bạn có tin nhắn mới');
      }
    };

    const handleFriendRequest = () => {
      dispatch(friendChatApi.util.invalidateTags(['PendingRequests']));
      notify.info('Bạn vừa nhận được một lời mời kết bạn');
    };

    const handleFriendAccepted = () => {
      dispatch(friendChatApi.util.invalidateTags(['Friends', 'PendingRequests']));
      notify.success('Lời mời kết bạn của bạn đã được chấp nhận');
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
      <RouteBreadcrumb />
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        Academix ©{new Date().getFullYear()} Được phát triển bởi Academix Team
      </Footer>
      <FloatingChatBot />
    </Layout>
  );
};

export default AppLayout;
