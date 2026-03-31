import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../services/authApi';
import { setTokens, clearTokens, getAccessToken } from '../services/axiosBaseQuery';
import type { User, LoginRequest, RegisterRequest } from '../services/authApi';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const hasToken = !!getAccessToken();
  
  const { data: profileData, isLoading: isProfileLoading, refetch } = useGetProfileQuery(undefined, {
    skip: !hasToken,
  });
  
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [forgotPasswordMutation] = useForgotPasswordMutation();
  const [resetPasswordMutation] = useResetPasswordMutation();

  const user = profileData?.data || null;
  const isAuthenticated = !!user;
  const isLoading = isProfileLoading || isLoginLoading || isRegisterLoading;

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setError(null);
      const result = await loginMutation(credentials).unwrap();
      
      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        await refetch();
        return true;
      }
      
      setError('Đăng nhập thất bại');
      return false;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      return false;
    }
  }, [loginMutation, refetch]);

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    try {
      setError(null);
      const result = await registerMutation(data).unwrap();
      
      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        await refetch();
        return true;
      }
      
      setError('Đăng ký thất bại');
      return false;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Đăng ký thất bại';
      setError(errorMessage);
      return false;
    }
  }, [registerMutation, refetch]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      navigate('/login');
    }
  }, [logoutMutation, navigate]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await forgotPasswordMutation({ email }).unwrap();
      return result.success;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Gửi email đặt lại mật khẩu thất bại';
      setError(errorMessage);
      return false;
    }
  }, [forgotPasswordMutation]);

  const resetPassword = useCallback(async (token: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await resetPasswordMutation({ token, password }).unwrap();
      return result.success;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Đặt lại mật khẩu thất bại';
      setError(errorMessage);
      return false;
    }
  }, [resetPasswordMutation]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
};

// Hook to protect routes
export const useRequireAuth = (redirectTo: string = '/login'): { isAuthenticated: boolean; isLoading: boolean } => {
  const navigate = useNavigate();
  const hasToken = !!getAccessToken();
  
  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !hasToken,
  });
  
  const isAuthenticated = !!data?.data;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && hasToken) {
      clearTokens();
      navigate(redirectTo);
    } else if (!hasToken) {
      navigate(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasToken, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};
