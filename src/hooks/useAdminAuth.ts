// Admin Authentication Hook
import { useState, useCallback, useEffect } from 'react';

import { useLoginMutation, useGetProfileQuery } from '../services/authApi';
import { setTokens, clearTokens, getAccessToken } from '../services/axiosBaseQuery';
import type { User } from '../services/authApi';
import type { AdminUser } from '../types/admin';

import { notify } from '../utils/notify';
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

const ADMIN_USER_STORAGE_KEY = 'adminUser';

const isAdminRole = (role: unknown): role is AdminUser['role'] => {
  return role === 'admin' || role === 'super_admin';
};

const clearStoredAdminUser = (): void => {
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  sessionStorage.removeItem(ADMIN_USER_STORAGE_KEY);
};

const persistAdminUser = (user: AdminUser, remember?: boolean): void => {
  if (remember) {
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
    sessionStorage.removeItem(ADMIN_USER_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
};

const syncStoredAdminUser = (user: AdminUser): void => {
  if (localStorage.getItem(ADMIN_USER_STORAGE_KEY)) {
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  }

  if (sessionStorage.getItem(ADMIN_USER_STORAGE_KEY)) {
    sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  }
};

const getStoredAdminUser = (): AdminUser | null => {
  const savedUser = localStorage.getItem(ADMIN_USER_STORAGE_KEY) || sessionStorage.getItem(ADMIN_USER_STORAGE_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<AdminUser>;

    if (!isAdminRole(parsedUser.role)) {
      clearStoredAdminUser();
      return null;
    }

    return {
      id: parsedUser.id || '',
      email: parsedUser.email || '',
      firstName: parsedUser.firstName || '',
      lastName: parsedUser.lastName || '',
      avatar: parsedUser.avatar,
      role: parsedUser.role,
      permissions: Array.isArray(parsedUser.permissions) ? parsedUser.permissions : ['all'],
      status: parsedUser.status || 'active',
      lastLogin: parsedUser.lastLogin,
      createdAt: parsedUser.createdAt || new Date().toISOString(),
    };
  } catch {
    clearStoredAdminUser();
    return null;
  }
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const typedError = error as {
      data?: { message?: string } | string;
      message?: string;
    };

    if (typeof typedError.data === 'string') {
      return typedError.data;
    }

    if (typedError.data && typeof typedError.data === 'object' && typedError.data.message) {
      return typedError.data.message;
    }

    if (typedError.message) {
      return typedError.message;
    }
  }

  return fallback;
};

type ApiAuthUser = User & {
  lastLogin?: string | null;
};

const mapApiUserToAdmin = (user: ApiAuthUser): AdminUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar || undefined,
  role: 'admin',
  permissions: ['all'],
  status: user.isActive ? 'active' : 'inactive',
  lastLogin: user.lastLogin || undefined,
  createdAt: user.createdAt,
});

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
  const [admin, setAdmin] = useState<AdminUser | null>(getStoredAdminUser);
  const [loginMutation] = useLoginMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginHistory] = useState<LoginHistoryItem[]>(mockLoginHistory);

  const hasToken = !!getAccessToken();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useGetProfileQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
  });

  const isInitialized = !hasToken || !isProfileLoading;

  useEffect(() => {
    if (!hasToken) {
      clearStoredAdminUser();
      setAdmin(null);
      return;
    }

    const status = (profileError as { status?: number } | undefined)?.status;
    if (status === 401 || status === 403) {
      clearTokens();
      clearStoredAdminUser();
      setAdmin(null);
      return;
    }

    const apiUser = profileData?.data as ApiAuthUser | undefined;
    if (!apiUser) {
      return;
    }

    if (apiUser.role !== 'admin') {
      clearStoredAdminUser();
      setAdmin(null);
      return;
    }

    const syncedAdmin = mapApiUserToAdmin(apiUser);
    setAdmin(syncedAdmin);
    syncStoredAdminUser(syncedAdmin);
  }, [hasToken, profileData, profileError]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginMutation({
        email: credentials.email,
        password: credentials.password,
      }).unwrap();

      if (!response.success || !response.data?.user) {
        throw new Error('Đăng nhập thất bại');
      }

      const apiUser = response.data.user as ApiAuthUser;

      if (apiUser.role !== 'admin') {
        clearTokens();
        clearStoredAdminUser();
        throw new Error('Bạn không có quyền truy cập trang quản trị');
      }

      const loggedInUser = mapApiUserToAdmin(apiUser);

      setTokens(response.data.accessToken, response.data.refreshToken);
      setAdmin(loggedInUser);
      persistAdminUser(loggedInUser, credentials.remember);

      notify.success('Đăng nhập thành công!');
      return { success: true, user: loggedInUser };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Đăng nhập thất bại');
      setError(errorMessage);
      notify.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loginMutation]);

  const logout = useCallback(() => {
    setAdmin(null);
    clearTokens();
    clearStoredAdminUser();
    notify.success('Đã đăng xuất');
  }, []);

  const updateProfile = useCallback(async (data: Partial<AdminUser>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = { ...admin, ...data } as AdminUser;
      setAdmin(updatedUser);
      syncStoredAdminUser(updatedUser);
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
        notify.success('Đổi mật khẩu thành công');
        return { success: true };
      }
      throw new Error('Mật khẩu hiện tại không đúng');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại';
      notify.error(errorMessage);
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
        notify.success('Email khôi phục mật khẩu đã được gửi!');
        return { success: true };
      } else {
        throw new Error('Email không tồn tại trong hệ thống');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gửi yêu cầu thất bại';
      setError(errorMessage);
      notify.error(errorMessage);
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
      
      notify.success('Đặt lại mật khẩu thành công!');
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại';
      setError(errorMessage);
      notify.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(() => {
    if (!getAccessToken()) {
      clearStoredAdminUser();
      setAdmin(null);
      return false;
    }

    const savedAdmin = getStoredAdminUser();

    if (savedAdmin) {
      setAdmin(savedAdmin);
      return true;
    }

    setAdmin(null);
    return false;
  }, []);

  const hasPermission = useCallback((permissionCode: string) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return (admin.permissions || []).includes(permissionCode) || (admin.permissions || []).includes('all');
  }, [admin]);

  const isAuthenticated = !!admin && hasToken && isAdminRole(admin.role);

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
