import { useState, useMemo } from 'react';

import { 
  useGetEnrollmentsByCourseQuery,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useUpdateEnrollmentProgressMutation,
} from '../services/courseApi';
import { useGetProfileQuery } from '../services/authApi';
import type { ClassMember } from '../types/myCourse';

import { notify } from '../utils/notify';
export const useClassroom = (courseId: string) => {
  const { data: profileData } = useGetProfileQuery();
  const userRole = (profileData?.data?.role as 'student' | 'teacher') || 'student';

  const { data: enrollmentsData, isLoading, refetch } = useGetEnrollmentsByCourseQuery(courseId, {
    skip: !courseId,
  });
  const [approveEnrollment] = useApproveEnrollmentMutation();
  const [rejectEnrollment] = useRejectEnrollmentMutation();
  const [deleteEnrollment] = useDeleteEnrollmentMutation();
  const [updateProgress] = useUpdateEnrollmentProgressMutation();

  const members: ClassMember[] = useMemo(() => {
    const enrollments = enrollmentsData?.data;
    if (!enrollments) return [];
    return enrollments.map((enrollment) => {
      const user = enrollment.user;
      return {
        id: enrollment.id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Không rõ',
        email: user?.email || '',
        avatar: user?.avatar || '',
        role: 'student' as const,
        joinedAt: enrollment.createdAt,
        status: (enrollment.status === 'active' ? 'active' : enrollment.status === 'pending' ? 'pending' : 'inactive') as 'active' | 'inactive' | 'pending',
        progress: enrollment.progress,
      };
    });
  }, [enrollmentsData]);

  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ClassMember | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchText.toLowerCase()) ||
                            member.email.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [members, searchText, filterRole]);

  const stats = useMemo(() => ({
    total: members.length,
    teachers: members.filter(m => m.role === 'teacher').length,
    students: members.filter(m => m.role === 'student').length,
    active: members.filter(m => m.status === 'active').length,
  }), [members]);

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'teacher':
        return { color: 'gold', text: 'Giảng viên' };
      case 'assistant':
        return { color: 'purple', text: 'Trợ giảng' };
      case 'student':
      default:
        return { color: 'blue', text: 'Học viên' };
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: ClassMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteEnrollment(memberId).unwrap();
      notify.success('Đã xóa thành viên');
      refetch();
    } catch {
      notify.error('Không thể xóa thành viên');
    }
  };

  const handleApproveMember = async (memberId: string) => {
    try {
      await approveEnrollment(memberId).unwrap();
      notify.success('Đã duyệt thành viên');
      refetch();
    } catch {
      notify.error('Không thể duyệt thành viên');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    try {
      await rejectEnrollment(memberId).unwrap();
      notify.success('Đã từ chối thành viên');
      refetch();
    } catch {
      notify.error('Không thể từ chối thành viên');
    }
  };

  const handleUpdateProgress = async (memberId: string, progress: number) => {
    try {
      await updateProgress({ id: memberId, progress }).unwrap();
      notify.success('Đã cập nhật tiến độ');
      refetch();
    } catch {
      notify.error('Không thể cập nhật tiến độ');
    }
  };

  const handleSubmit = (_values: Record<string, unknown>) => {
    if (editingMember) {
      notify.success('Đã cập nhật thành viên');
    } else {
      notify.success('Đã thêm thành viên');
    }
    setIsModalOpen(false);
    refetch();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    userRole,
    members,
    filteredMembers,
    searchText,
    setSearchText,
    filterRole,
    setFilterRole,
    isModalOpen,
    editingMember,
    stats,
    isLoading,
    getRoleConfig,
    handleAddMember,
    handleEditMember,
    handleDeleteMember,
    handleApproveMember,
    handleRejectMember,
    handleUpdateProgress,
    handleSubmit,
    closeModal,
  };
};
