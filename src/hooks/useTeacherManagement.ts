import { useState, useCallback, useMemo } from 'react';

import type { Teacher, TableParams } from '../types/admin';
import {
  useGetTeachersQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} from '../services/courseApi';
import type { QueryParams } from '../services/courseApi';

import { notify } from '../utils/notify';
interface TeacherFilters {
  status?: string;
  specialization?: string;
  search?: string;
}

export const useTeacherManagement = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [filters, setFilters] = useState<TeacherFilters>({});
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });

  // Build query
  const queryParams: QueryParams = useMemo(() => {
    const filterParts: string[] = [];
    if (filters.status) filterParts.push(`status:eq:${filters.status}`);
    return {
      page: tableParams.page,
      size: tableParams.pageSize,
      include: 'user',
      ...(filterParts.length > 0 && { filter: filterParts.join('&&') }),
      sort: 'createdAt:desc',
    };
  }, [filters.status, tableParams]);

  // Also fetch all teachers for statistics (once)
  const { data: allTeachersData } = useGetTeachersQuery({ size: 'unlimited', include: 'user' });

  const {
    data: teachersData,
    isLoading: loading,
    refetch: fetchTeachers,
  } = useGetTeachersQuery(queryParams);

  const [updateTeacherApi] = useUpdateTeacherMutation();
  const [deleteTeacherApi] = useDeleteTeacherMutation();
  const [approveTeacherApi] = useApproveTeacherMutation();
  const [rejectTeacherApi] = useRejectTeacherMutation();

  const allApiTeachers = allTeachersData?.data?.rows || [];

  // Map API Teacher → Admin Teacher type
  const mapTeacher = useCallback((t: (typeof allApiTeachers)[0]): Teacher => ({
    id: t.id,
    teacherId: t.teacherId,
    firstName: t.user?.firstName || '',
    lastName: t.user?.lastName || '',
    email: t.user?.email || '',
    phone: '',
    avatar: t.user?.avatar,
    specialization: t.specialization || [],
    qualification: t.qualification || '',
    experience: t.experience || 0,
    rating: t.rating || 0,
    totalCourses: t.totalCourses || 0,
    totalStudents: t.totalStudents || 0,
    status: (t.status as Teacher['status']) || 'active',
    bio: t.bio,
    cvUrl: t.cvUrl,
    rejectionReason: t.rejectionReason,
    socialLinks: t.socialLinks,
    joinedDate: t.createdAt || '',
    earnings: t.earnings || 0,
  }), []);

  // Paginated rows from API (server-side pagination)
  const apiRows = teachersData?.data?.rows || [];
  const total = teachersData?.data?.count || 0;

  // Apply client-side search & specialization filter on the current page
  const teachers = useMemo(() => {
    let result = apiRows.map(mapTeacher);

    if (filters.specialization) {
      result = result.filter(t =>
        t.specialization.some(s => s.toLowerCase().includes(filters.specialization!.toLowerCase()))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        t =>
          `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchLower) ||
          t.email.toLowerCase().includes(searchLower) ||
          t.teacherId.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [apiRows, mapTeacher, filters.specialization, filters.search]);

  // Approve teacher
  const approveTeacher = useCallback(async (teacherId: string) => {
    try {
      await approveTeacherApi(teacherId).unwrap();
      notify.success('Đã phê duyệt giáo viên');
      return { success: true };
    } catch {
      notify.error('Không thể phê duyệt giáo viên');
      return { success: false };
    }
  }, [approveTeacherApi]);

  // Reject teacher
  const rejectTeacher = useCallback(async (teacherId: string, rejectionReason: string) => {
    try {
      await rejectTeacherApi({ id: teacherId, rejectionReason }).unwrap();
      notify.success('Đã từ chối đăng ký giáo viên');
      return { success: true };
    } catch {
      notify.error('Không thể từ chối giáo viên');
      return { success: false };
    }
  }, [rejectTeacherApi]);

  // Suspend teacher
  const suspendTeacher = useCallback(async (teacherId: string, _reason?: string) => {
    try {
      await updateTeacherApi({ id: teacherId, data: { status: 'suspended' } as any }).unwrap();
      notify.success('Đã tạm ngưng giáo viên');
      return { success: true };
    } catch {
      notify.error('Không thể tạm ngưng giáo viên');
      return { success: false };
    }
  }, [updateTeacherApi]);

  // Activate teacher
  const activateTeacher = useCallback(async (teacherId: string) => {
    try {
      await updateTeacherApi({ id: teacherId, data: { status: 'active' } as any }).unwrap();
      notify.success('Đã kích hoạt giáo viên');
      return { success: true };
    } catch {
      notify.error('Không thể kích hoạt giáo viên');
      return { success: false };
    }
  }, [updateTeacherApi]);

  // Update teacher
  const updateTeacher = useCallback(async (teacherId: string, data: Partial<Teacher>) => {
    try {
      await updateTeacherApi({ id: teacherId, data: data as any }).unwrap();
      notify.success('Đã cập nhật thông tin giáo viên');
      return { success: true };
    } catch {
      notify.error('Không thể cập nhật giáo viên');
      return { success: false };
    }
  }, [updateTeacherApi]);

  // Delete teacher
  const deleteTeacher = useCallback(async (teacherId: string) => {
    try {
      await deleteTeacherApi(teacherId).unwrap();
      notify.success('Đã xóa giáo viên');
      return { success: true };
    } catch {
      notify.error('Không thể xóa giáo viên');
      return { success: false };
    }
  }, [deleteTeacherApi]);

  // Get teacher by ID
  const getTeacherById = useCallback((teacherId: string) => {
    const found = apiRows.find(t => t.id === teacherId);
    return found ? mapTeacher(found) : null;
  }, [apiRows, mapTeacher]);

  // Statistics (computed from all teachers, not just current page)
  const allMapped = useMemo(() => allApiTeachers.map(mapTeacher), [allApiTeachers, mapTeacher]);

  const statistics = useMemo(() => ({
    total: allMapped.length,
    active: allMapped.filter(t => t.status === 'active').length,
    pending: allMapped.filter(t => t.status === 'pending').length,
    suspended: allMapped.filter(t => t.status === 'suspended').length,
    totalCourses: allMapped.reduce((sum, t) => sum + t.totalCourses, 0),
    totalStudents: allMapped.reduce((sum, t) => sum + t.totalStudents, 0),
    totalEarnings: allMapped.reduce((sum, t) => sum + t.earnings, 0),
    averageRating: allMapped.length > 0
      ? allMapped.reduce((sum, t) => sum + t.rating, 0) / allMapped.length
      : 0,
  }), [allMapped]);

  // Get all specializations for filters
  const allSpecializations = useMemo(() => {
    const specs = new Set<string>();
    allMapped.forEach(t => t.specialization.forEach(s => specs.add(s)));
    return Array.from(specs).sort();
  }, [allMapped]);

  return {
    teachers,
    allTeachers: teachers,
    loading,
    selectedTeacher,
    setSelectedTeacher,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    statistics,
    total,
    allSpecializations,
    fetchTeachers,
    approveTeacher,
    rejectTeacher,
    suspendTeacher,
    activateTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById,
  };
};
