import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { useGetProfileQuery } from '../../services/authApi';
import { getAccessToken, clearTokens } from '../../services/axiosBaseQuery';
import { useLogoutMutation } from '../../services/authApi';
import {
  useGetLastMessagesQuery,
  useGetPendingRequestsQuery,
  useGetUnreadCountsQuery,
} from '../../services/friendChatApi';
import { useGetMyTicketsQuery } from '../../services/supportApi';
import { useGetMyEnrollmentsQuery } from '../../services/courseApi';
import { useGetUpcomingSchedulesQuery } from '../../services/learningApi';
import dayjs from 'dayjs';

type HeaderNotificationLevel = 'info' | 'warning' | 'success';

interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  link?: string;
  level: HeaderNotificationLevel;
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [readMap, setReadMap] = useState<Record<string, true>>({});
  const [hydrated, setHydrated] = useState(false);
  
  const hasToken = !!getAccessToken();
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
  });
  const [logoutMutation] = useLogoutMutation();
  const user = profileData?.data || null;
  const isLoggedIn = !!user;

  // Notification queries
  const { data: unreadRes } = useGetUnreadCountsQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const { data: pendingRequestsRes } = useGetPendingRequestsQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const { data: lastMessagesRes } = useGetLastMessagesQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const { data: myTicketsRes } = useGetMyTicketsQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 60000,
    refetchOnFocus: true,
  });
  const { data: myEnrollmentsRes } = useGetMyEnrollmentsQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 60000,
    refetchOnFocus: true,
  });
  const { data: upcomingSchedulesRes } = useGetUpcomingSchedulesQuery(3, {
    skip: !hasToken,
    pollingInterval: 60000,
    refetchOnFocus: true,
  });

  const unreadCounts = useMemo(() => unreadRes?.data ?? [], [unreadRes?.data]);
  const pendingRequests = useMemo(() => pendingRequestsRes?.data ?? [], [pendingRequestsRes?.data]);
  const myTickets = useMemo(() => myTicketsRes?.data ?? [], [myTicketsRes?.data]);
  const myEnrollments = useMemo(() => myEnrollmentsRes?.data ?? [], [myEnrollmentsRes?.data]);
  const upcomingSchedules = useMemo(() => upcomingSchedulesRes?.data ?? [], [upcomingSchedulesRes?.data]);
  const lastMessages = useMemo(() => lastMessagesRes?.data ?? [], [lastMessagesRes?.data]);

  const totalUnreadMessages = unreadCounts.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0,
  );

  const notificationStorageKey = useMemo(
    () => (user?.id ? `client-read-notifications:${user.id}` : null),
    [user?.id],
  );

  const notifications = useMemo<HeaderNotification[]>(() => {
    const items: HeaderNotification[] = [];
    const nowIso = new Date().toISOString();
    const latestMessageTime = lastMessages[0]?.createdAt || nowIso;

    if (totalUnreadMessages > 0) {
      items.push({
        id: `chat-unread-${totalUnreadMessages}`,
        title: 'Tin nhắn chưa đọc',
        message: `Bạn đang có ${totalUnreadMessages} tin nhắn chưa đọc.`,
        createdAt: latestMessageTime,
        link: '/chat',
        level: 'info',
      });
    }

    pendingRequests.slice(0, 3).forEach((request) => {
      const name = `${request.firstName || ''} ${request.lastName || ''}`.trim() || request.email;
      items.push({
        id: `friend-request-${request.friendshipId}`,
        title: 'Lời mời kết bạn mới',
        message: `${name} vừa gửi lời mời kết bạn cho bạn.`,
        createdAt: request.createdAt,
        link: '/friends',
        level: 'info',
      });
    });

    myTickets
      .filter((ticket) => ticket.status === 'open' || ticket.status === 'in_progress')
      .slice(0, 3)
      .forEach((ticket) => {
        items.push({
          id: `my-ticket-${ticket.id}`,
          title: 'Ticket hỗ trợ đang xử lý',
          message: `Ticket "${ticket.subject}" đang ở trạng thái ${ticket.status === 'open' ? 'mở' : 'đang xử lý'}.`,
          createdAt: ticket.updatedAt || ticket.createdAt,
          level: ticket.priority === 'urgent' || ticket.priority === 'high' ? 'warning' : 'info',
        });
      });

    myEnrollments
      .filter((enrollment) => enrollment.status === 'pending')
      .slice(0, 3)
      .forEach((enrollment) => {
        items.push({
          id: `enrollment-pending-${enrollment.id}`,
          title: 'Yêu cầu ghi danh đang chờ duyệt',
          message: `Khóa học "${enrollment.course?.title || 'Khóa học'}" đang chờ duyệt yêu cầu của bạn.`,
          createdAt: enrollment.createdAt,
          link: '/my-course',
          level: 'warning',
        });
      });

    upcomingSchedules
      .filter((schedule) => schedule.status !== 'cancelled')
      .slice(0, 3)
      .forEach((schedule) => {
        items.push({
          id: `upcoming-schedule-${schedule.id}`,
          title: 'Lịch học sắp diễn ra',
          message: `${schedule.title} vào ${dayjs(schedule.date).format('DD/MM/YYYY')} lúc ${schedule.startTime}.`,
          createdAt: `${schedule.date}T${schedule.startTime}`,
          link: '/schedule',
          level: 'success',
        });
      });

    return items.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [lastMessages, totalUnreadMessages, pendingRequests, myTickets, myEnrollments, upcomingSchedules]);

  useEffect(() => {
    if (!notificationStorageKey) {
      setReadMap({});
      setHydrated(true);
      return;
    }

    try {
      const raw = localStorage.getItem(notificationStorageKey);
      if (!raw) {
        setReadMap({});
      } else {
        const parsed = JSON.parse(raw) as string[];
        const next = parsed.reduce<Record<string, true>>((accumulator, itemId) => {
          accumulator[itemId] = true;
          return accumulator;
        }, {});
        setReadMap(next);
      }
    } catch {
      setReadMap({});
    } finally {
      setHydrated(true);
    }
  }, [notificationStorageKey]);

  useEffect(() => {
    if (!hydrated) return;

    const validIds = new Set(notifications.map((item) => item.id));
    setReadMap((previous) => {
      const next: Record<string, true> = {};
      Object.keys(previous).forEach((id) => {
        if (validIds.has(id)) {
          next[id] = true;
        }
      });

      const prevKeys = Object.keys(previous);
      const nextKeys = Object.keys(next);
      if (prevKeys.length === nextKeys.length) {
        const same = prevKeys.every((key) => next[key]);
        if (same) {
          return previous;
        }
      }

      return next;
    });
  }, [hydrated, notifications]);

  useEffect(() => {
    if (!hydrated || !notificationStorageKey) return;
    localStorage.setItem(notificationStorageKey, JSON.stringify(Object.keys(readMap)));
  }, [hydrated, notificationStorageKey, readMap]);

  const notificationsWithReadState = useMemo(
    () => notifications.map((item) => ({ ...item, isRead: !!readMap[item.id] })),
    [notifications, readMap],
  );

  const unreadNotificationsCount = notificationsWithReadState.filter((item) => !item.isRead).length;

  const markNotificationRead = (id: string) => {
    setReadMap((previous) => {
      if (previous[id]) return previous;
      return {
        ...previous,
        [id]: true,
      };
    });
  };

  const markAllNotificationsRead = () => {
    const allRead = notifications.reduce<Record<string, true>>((accumulator, item) => {
      accumulator[item.id] = true;
      return accumulator;
    }, {});
    setReadMap(allRead);
  };

  const getNotificationIcon = (level: HeaderNotificationLevel) => {
    if (level === 'warning') {
      return <ExclamationCircleOutlined className="text-orange-500" />;
    }
    if (level === 'success') {
      return <CheckCircleOutlined className="text-emerald-500" />;
    }
    return <InfoCircleOutlined className="text-blue-500" />;
  };

  const formatNotificationTime = (createdAt: string) => {
    const parsed = dayjs(createdAt);
    if (!parsed.isValid()) return '-';
    return parsed.format('DD/MM HH:mm');
  };

  const notificationDropdown = (
    <div className="w-96 max-h-96 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <span className="font-semibold text-[#012643]">Thông báo của bạn</span>
        {unreadNotificationsCount > 0 && (
          <Button type="link" size="small" onClick={markAllNotificationsRead}>
            Đánh dấu đã đọc
          </Button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notificationsWithReadState.length === 0 ? (
          <div className="p-5 text-center text-gray-400 text-sm">Bạn chưa có thông báo mới</div>
        ) : (
          notificationsWithReadState.slice(0, 8).map((item) => (
            <button
              type="button"
              key={item.id}
              className={`w-full text-left px-3 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                item.isRead ? 'bg-white' : 'bg-cyan-50/60'
              }`}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.link) {
                  navigate(item.link);
                }
              }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-1">{getNotificationIcon(item.level)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{formatNotificationTime(item.createdAt)}</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { title: 'Trang chủ', path: '/' },
    { title: 'Khóa học', path: '/courses' },
    { title: 'Khóa học của tôi', path: '/my-course', requiresAuth: true },
    { title: 'Lịch học', path: '/schedule', requiresAuth: true },
    { title: 'Tin nhắn', path: '/chat', badge: totalUnreadMessages, requiresAuth: true },
  ];

  const handleNavClick = (e: React.MouseEvent, link: { requiresAuth?: boolean }) => {
    if (link.requiresAuth && !isLoggedIn) {
      e.preventDefault();
      message.warning('Vui lòng đăng nhập để sử dụng chức năng này');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      navigate('/auth/login');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    ...(user?.role === 'admin'
      ? [
          {
            key: 'admin',
            icon: <SafetyCertificateOutlined />,
            label: 'Quản lý website',
            onClick: () => navigate('/admin'),
          },
          { type: 'divider' as const },
        ]
      : []),
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'Cài đặt',
    //   onClick: () => navigate('/profile'),
    // },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="bg-white sticky top-0 z-50" >
      {/* Top Bar */}
      {/* <div className="border-b border-gray-100 py-2 hidden md:block">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MailOutlined className="text-[#30C2EC]" />
              <span>edunet@.edu.vn</span>
            </div>
            <div className="flex items-center gap-2">
              <SocialLink href="https://instagram.com" icon={<FacebookFilled />} />
              <SocialLink href="https://twitter.com" icon={<TwitterOutlined />} />
              <SocialLink href="https://youtube.com" icon={<YoutubeFilled />} />
              <SocialLink href="https://telegram.org" icon={<SendOutlined />} />
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Navbar */}
      <div className="py-2">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/academix.png"
                alt="Academix" 
                className="w-12 h-12 object-cover rounded-full"
              />
              <span className="text-[#30C2EC] text-[24px] -mt-1 font-bold font-roboto ">Academix</span>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`text-base font-medium flex items-center gap-1 transition-colors duration-300 ${
                    isActive(link.path) ? 'text-[#30C2EC]' : 'text-gray-600 hover:text-[#30C2EC]'
                  }`}
                >
                  <Badge count={'badge' in link ? link.badge : 0} size="small" offset={[8, -2]}>
                    <span className={`text-base font-medium ${
                      isActive(link.path) ? 'text-[#30C2EC]' : 'text-gray-600'
                    }`}>
                      {link.title}
                    </span>
                  </Badge>
                  <PlusOutlined className="text-xs opacity-50" />
                </Link>
              ))}
            </nav>

            {/* Auth Button */}
            <div className="hidden lg:block">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Dropdown dropdownRender={() => notificationDropdown} placement="bottomRight" trigger={['click']}>
                    <Badge count={unreadNotificationsCount} size="small" offset={[-2, 2]}>
                      <Button
                        type="text"
                        icon={<BellOutlined className="text-lg text-[#012643]" />}
                        className="flex items-center justify-center"
                      />
                    </Badge>
                  </Dropdown>

                  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar
                        src={user?.avatar}
                        icon={<UserOutlined />}
                        className="!bg-[#30C2EC]"
                      />
                      <div className="hidden xl:block">
                        <div className="text-sm font-medium text-[#012643] leading-tight">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-400 leading-tight">
                          {user?.role === 'student' ? 'Học viên' : user?.role === 'teacher' ? 'Giảng viên' : 'Admin'}
                        </div>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <Link to="/auth/login" className="flex items-center gap-2 text-[#30C2EC] font-medium hover:opacity-80">
                  <div className="w-8 h-8 rounded-full bg-[#30C2EC] flex items-center justify-center text-white">
                    <UserOutlined />
                  </div>
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button 
              type="text" 
              icon={<MenuOutlined className="text-2xl text-[#30C2EC]" />} 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={<span className="text-[#30C2EC] font-bold text-xl">Academix</span>}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              onClick={(e) => { handleNavClick(e, link); if (!link.requiresAuth || isLoggedIn) setMobileMenuOpen(false); }}
              className={`text-lg font-medium py-2 border-b border-gray-50 ${
                isActive(link.path) ? 'text-[#30C2EC]' : 'text-gray-600'
              }`}
            >
              <Badge count={'badge' in link ? link.badge : 0} size="small" offset={[8, -2]}>
                {link.title}
              </Badge>
            </Link>
          ))}
          <div className="mt-4">
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <Avatar 
                    src={user?.avatar} 
                    icon={<UserOutlined />} 
                    size={40}
                    className="!bg-[#30C2EC]"
                  />
                  <div>
                    <div className="font-medium text-[#012643]">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#012643]">
                      <BellOutlined />
                      <span>Thông báo ({unreadNotificationsCount})</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <Button type="link" size="small" onClick={markAllNotificationsRead}>
                        Đã đọc hết
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {notificationsWithReadState.slice(0, 3).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`w-full text-left rounded-md px-2 py-2 border border-transparent ${
                          item.isRead ? 'bg-white' : 'bg-cyan-50 border-cyan-100'
                        }`}
                        onClick={() => {
                          markNotificationRead(item.id);
                          if (item.link) {
                            navigate(item.link);
                            setMobileMenuOpen(false);
                          }
                        }}
                      >
                        <div className="text-xs font-medium text-gray-800">{item.title}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.message}</div>
                      </button>
                    ))}
                    {notificationsWithReadState.length === 0 && (
                      <div className="text-xs text-gray-400">Bạn chưa có thông báo mới</div>
                    )}
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-600 font-medium py-2"
                >
                  <UserOutlined />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[#012643] font-medium py-2"
                  >
                    <SafetyCertificateOutlined />
                    <span>Quản lý website</span>
                  </Link>
                )}
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-red-500 font-medium py-2 w-full text-left"
                >
                  <LogoutOutlined />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/auth/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[#30C2EC] font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-[#30C2EC] flex items-center justify-center text-white">
                  <UserOutlined />
                </div>
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;
