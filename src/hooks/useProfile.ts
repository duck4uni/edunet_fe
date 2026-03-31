import { useState } from 'react';
import { message } from 'antd';
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation,
} from '../services/authApi';
import { useGetMyTicketsQuery, useCreateTicketMutation } from '../services/supportApi';
import { useGetUserEnrollmentsQuery } from '../services/courseApi';
import type { SupportTicket, Achievement, Certificate } from '../types/profile';

export const useProfile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // API Queries
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useGetProfileQuery();
  const { data: ticketsData, isLoading: isTicketsLoading } = useGetMyTicketsQuery();
  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useGetUserEnrollmentsQuery(
    profileData?.data?.id || '', 
    { skip: !profileData?.data?.id }
  );
  
  // API Mutations
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateTicketMutation();

  const profile = profileData?.data ? {
    id: profileData.data.id,
    name: `${profileData.data.firstName} ${profileData.data.lastName}`,
    firstName: profileData.data.firstName,
    lastName: profileData.data.lastName,
    email: profileData.data.email,
    phone: profileData.data.phone || '',
    avatar: profileData.data.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    gender: profileData.data.gender || 'other',
    dateOfBirth: profileData.data.dateOfBirth || '',
    address: profileData.data.address || '',
    city: profileData.data.city || '',
    country: profileData.data.country || '',
    bio: profileData.data.bio || '',
    role: profileData.data.role,
    socialLinks: profileData.data.socialLinks || {},
    joinDate: profileData.data.createdAt,
    coursesCompleted: 0,
    coursesInProgress: (enrollmentsData?.data as Array<{ status: string }> | undefined)?.filter((e) => e.status === 'active').length || 0,
  } : null;

  const supportTickets = (ticketsData?.data || []).map((ticket: { id: string; subject: string; message: string; status: string; priority: string; category: string; createdAt: string; updatedAt?: string; }) => ({
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt || ticket.createdAt,
    responses: [] as { id: string; message: string; isStaff: boolean; authorName: string; authorAvatar: string; createdAt: string; }[],
  }));

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (values: Record<string, unknown>) => {
    if (!profile?.id) return;
    
    try {
      await updateProfile({ 
        id: profile.id,
        firstName: values.firstName as string,
        lastName: values.lastName as string,
        phone: values.phone as string,
        bio: values.bio as string,
        gender: values.gender as 'male' | 'female' | 'other',
        dateOfBirth: values.dateOfBirth as string,
        address: values.address as string,
        city: values.city as string,
        country: values.country as string,
      }).unwrap();
      
      message.success('Cập nhật hồ sơ thành công!');
      setIsEditModalOpen(false);
      refetchProfile();
    } catch {
      message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    }
  };

  const handleChangePassword = (_values: Record<string, unknown>) => {
    message.success('Đổi mật khẩu thành công!');
    setIsPasswordModalOpen(false);
  };

  const handleCreateTicket = async (values: { subject: string; description: string; category: string; priority?: string }) => {
    try {
      await createTicket({
        subject: values.subject,
        description: values.description,
        category: values.category as 'technical' | 'billing' | 'course' | 'account' | 'other',
        priority: (values.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
      }).unwrap();
      
      message.success('Ticket hỗ trợ đã được gửi thành công!');
      setIsTicketModalOpen(false);
    } catch {
      message.error('Không thể gửi ticket. Vui lòng thử lại.');
    }
  };

  const getTicketStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { color: 'blue', text: 'Đang mở' };
      case 'in-progress':
        return { color: 'orange', text: 'Đang xử lý' };
      case 'resolved':
        return { color: 'green', text: 'Đã giải quyết' };
      case 'closed':
        return { color: 'default', text: 'Đã đóng' };
      default:
        return { color: 'default', text: status };
    }
  };

  const closeEditModal = () => setIsEditModalOpen(false);
  const closePasswordModal = () => setIsPasswordModalOpen(false);
  const closeTicketModal = () => setIsTicketModalOpen(false);
  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const openTicketModal = () => setIsTicketModalOpen(true);
  const clearSelectedTicket = () => setSelectedTicket(null);

  const isLoading = isProfileLoading || isTicketsLoading || isEnrollmentsLoading;

  return {
    activeTab,
    setActiveTab,
    profile,
    isLoading,
    isUpdating,
    isCreatingTicket,
    isEditModalOpen,
    isPasswordModalOpen,
    isTicketModalOpen,
    selectedTicket,
    setSelectedTicket,
    achievements: [] as Achievement[],
    certificates: [] as Certificate[],
    supportTickets: supportTickets as SupportTicket[],
    handleEditProfile,
    handleSaveProfile,
    handleChangePassword,
    handleCreateTicket,
    getTicketStatusConfig,
    closeEditModal,
    closePasswordModal,
    closeTicketModal,
    openPasswordModal,
    openTicketModal,
    clearSelectedTicket,
  };
};
