import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MailOutlined, 
  FacebookFilled, 
  TwitterOutlined, 
  YoutubeFilled, 
  SendOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useGetProfileQuery } from '../../services/authApi';
import { getAccessToken, clearTokens } from '../../services/axiosBaseQuery';
import { useLogoutMutation } from '../../services/authApi';

import Logo from '../../assets/images/Logo.png';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const hasToken = !!getAccessToken();
  const { data: profileData } = useGetProfileQuery(undefined, { skip: !hasToken });
  const [logoutMutation] = useLogoutMutation();
  const user = profileData?.data || null;
  const isLoggedIn = !!user;

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { title: 'Trang chủ', path: '/' },
    { title: 'Khóa học', path: '/courses' },
    { title: 'Khóa học của tôi', path: '/my-course' },
    { title: 'Lịch học', path: '/schedule' },
    { title: 'Tin nhắn', path: '/chat' },
  ];

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
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-[#30C2EC] hover:text-white hover:border-[#30C2EC] transition-all duration-300"
    >
      {icon}
    </a>
  );

  return (
    <header className="bg-white sticky top-0 z-50" style={{ boxShadow: "#88a5bf7a 6px 2px 16px, #fffc -6px -2px 16px" }}>
      {/* Top Bar */}
      <div className="border-b border-gray-100 py-2 hidden md:block">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MailOutlined className="text-[#30C2EC]" />
              <span>nhutphigenz@email.com</span>
            </div>
            <div className="flex items-center gap-2">
              <SocialLink href="https://instagram.com" icon={<FacebookFilled />} />
              <SocialLink href="https://twitter.com" icon={<TwitterOutlined />} />
              <SocialLink href="https://youtube.com" icon={<YoutubeFilled />} />
              <SocialLink href="https://telegram.org" icon={<SendOutlined />} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={Logo} 
                alt="EduNet" 
                className="w-10 h-10 object-cover rounded-full"
              />
              <span className="text-[#30C2EC] text-3xl font-bold font-roboto mt-1">EduNet</span>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium flex items-center gap-1 transition-colors duration-300 ${
                    isActive(link.path) ? 'text-[#30C2EC]' : 'text-gray-600 hover:text-[#30C2EC]'
                  }`}
                >
                  {link.title}
                  <PlusOutlined className="text-xs opacity-50" />
                </Link>
              ))}
            </nav>

            {/* Auth Button */}
            <div className="hidden lg:block">
              {isLoggedIn ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar 
                      src={user?.avatar} 
                      icon={<UserOutlined />}
                      size={36}
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
        title={<span className="text-[#30C2EC] font-bold text-xl">EduNet</span>}
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
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-medium py-2 border-b border-gray-50 ${
                isActive(link.path) ? 'text-[#30C2EC]' : 'text-gray-600'
              }`}
            >
              {link.title}
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
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-600 font-medium py-2"
                >
                  <UserOutlined />
                  <span>Hồ sơ cá nhân</span>
                </Link>
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
