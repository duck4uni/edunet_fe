// Admin Authentication Hook
import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { AdminUser } from '../types/admin';
import { currentAdminUser } from '../constants/adminData';

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface LoginHistoryItem {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
  isCurrent: boolean;
}

const mockLoginHistory: LoginHistoryItem[] = [
  {
    id: '1',
    device: 'Windows PC',
    browser: 'Chrome 120',
    ip: '192.168.1.1',
    location: 'Hà Nội, Việt Nam',
    time: new Date().toISOString(),
    status: 'success',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'MacBook Pro',
    browser: 'Safari 17',
    ip: '192.168.1.2',
    location: 'Hồ Chí Minh, Việt Nam',
    time: new Date(Date.now() - 86400000).toISOString(),
    status: 'success',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    ip: '10.0.0.1',
    location: 'Đà Nẵng, Việt Nam',
    time: new Date(Date.now() - 172800000).toISOString(),
    status: 'failed',
    isCurrent: false,
  },
];

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    // Chỉ lấy user từ storage, không dùng mock data
    const savedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [isInitialized] = useState(true); // Đã khởi tạo xong
  const [error, setError] = useState<string | null>(null);
  const [loginHistory] = useState<LoginHistoryItem[]>(mockLoginHistory);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (credentials.email === 'admin@edunet.com' && credentials.password === 'admin123') {
        const loggedInUser = {
          ...currentAdminUser,
          lastLogin: new Date().toISOString(),
        };
        
        setAdmin(loggedInUser);
        
        if (credentials.remember) {
          localStorage.setItem('adminUser', JSON.stringify(loggedInUser));
        } else {
          sessionStorage.setItem('adminUser', JSON.stringify(loggedInUser));
        }
        
        message.success('Đăng nhập thành công!');
        return { success: true, user: loggedInUser };
      } else {
        throw new Error('Email hoặc mật khẩu không chính xác');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminUser');
    message.success('Đã đăng xuất');
  }, []);

  const updateProfile = useCallback(async (data: Partial<AdminUser>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = { ...admin, ...data } as AdminUser;
      setAdmin(updatedUser);
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [admin]);

  const changePassword = useCallback(async (currentPassword: string, _newPassword: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock password validation
      if (currentPassword === 'admin123') {
        message.success('Đổi mật khẩu thành công');
        return { success: true };
      }
      throw new Error('Mật khẩu hiện tại không đúng');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (data.email === 'admin@edunet.com') {
        message.success('Email khôi phục mật khẩu đã được gửi!');
        return { success: true };
      } else {
        throw new Error('Email không tồn tại trong hệ thống');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gửi yêu cầu thất bại';
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      
      if (data.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      
      message.success('Đặt lại mật khẩu thành công!');
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại';
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(() => {
    const savedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    if (savedUser) {
      setAdmin(JSON.parse(savedUser));
      return true;
    }
    return false;
  }, []);

  const hasPermission = useCallback((permissionCode: string) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions.includes(permissionCode) || admin.permissions.includes('all');
  }, [admin]);

  const isAuthenticated = !!admin;

  return {
    admin,
    user: admin, // alias for backward compatibility
    loading,
    error,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    hasPermission,
    updateProfile,
    changePassword,
    loginHistory,
  };
};
