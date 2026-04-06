// Dashboard Hook — connected to real API
import { useState, useCallback, useMemo } from 'react';
import type { DashboardStats, ChartData } from '../types/admin';
import {
  useGetCoursesQuery,
  useGetTeachersQuery,
} from '../services/courseApi';
import { useGetUsersQuery } from '../services/userApi';
import { useGetTicketsQuery, useGetTicketStatsQuery } from '../services/supportApi';
import {
  revenueData as mockRevenueData,
  adminNotifications,
  activityLogs,
} from '../constants/adminData';

export const useDashboard = () => {
  const [dateRange, setDateRange] = useState<[string, string]>(['2024-01-01', '2024-12-31']);

  // ── Real API calls ──────────────────────────────────────────────────────
  const { data: coursesData, isLoading: isCoursesLoading } = useGetCoursesQuery({
    size: 'unlimited',
    include: 'category|teacher',
    sort: 'createdAt:desc',
  });
  const { data: teachersData, isLoading: isTeachersLoading } = useGetTeachersQuery({
    size: 'unlimited',
    include: 'user',
  });
  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery({ size: 'unlimited' });
  const { data: ticketsData, isLoading: isTicketsLoading } = useGetTicketsQuery({ size: 5, sort: 'createdAt:desc' });
  const { data: ticketStatsData } = useGetTicketStatsQuery();

  const courses = coursesData?.data?.rows || [];
  const allTeachers = teachersData?.data?.rows || [];
  const allUsers = usersData?.data?.rows || [];
  const recentTicketRows = ticketsData?.data?.rows || [];
  const ticketStats = ticketStatsData?.data;

  const loading = isCoursesLoading || isTeachersLoading || isUsersLoading || isTicketsLoading;

  // ── Derived stats ─────────────────────────────────────────────────────
  const stats: DashboardStats = useMemo(() => {
    const totalRevenue = courses.reduce((s, c) => s + (c.price || 0) * (c.totalStudents || 0), 0);
    return {
      totalUsers: allUsers.length,
      totalTeachers: allTeachers.length,
      totalCourses: courses.length,
      totalRevenue,
      newUsersToday: 0,
      newCoursesToday: 0,
      pendingApprovals: courses.filter(c => c.status === 'pending').length,
      openTickets: ticketStats?.open ?? 0,
      usersGrowth: 0,
      revenueGrowth: 0,
      coursesGrowth: 0,
      teachersGrowth: 0,
    };
  }, [courses, allTeachers, allUsers, ticketStats]);

  // ── Chart data ────────────────────────────────────────────────────────
  const revenueChart: ChartData = useMemo(() => ({
    labels: mockRevenueData.map(r => r.date),
    datasets: [
      {
        label: 'Doanh thu',
        data: mockRevenueData.map(r => r.revenue / 1000000),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        fill: true,
      },
      {
        label: 'Doanh thu ròng',
        data: mockRevenueData.map(r => r.netRevenue / 1000000),
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        fill: true,
      },
    ],
  }), []);

  const usersChart: ChartData = useMemo(() => ({
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Người dùng mới',
        data: [820, 932, 1101, 1234, 1450, 1580, 1620, 1750, 1890, 2050, 2200, 2350],
        backgroundColor: '#1890ff',
      },
    ],
  }), []);

  const coursesChart: ChartData = useMemo(() => {
    // Group courses by category name
    const catMap: Record<string, number> = {};
    courses.forEach(c => {
      const cat = c.category?.name || 'Khác';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];
    return {
      labels,
      datasets: [
        {
          label: 'Số lượng khóa học',
          data,
          backgroundColor: colors.slice(0, labels.length),
        },
      ],
    };
  }, [courses]);

  // ── Top courses ───────────────────────────────────────────────────────
  const topCourses = useMemo(() =>
    [...courses]
      .filter(c => c.status === 'published')
      .sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail || '',
        category: c.category?.name || 'Khác',
        teacher: {
          id: c.teacherId,
          name: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : '',
          avatar: c.teacher?.avatar,
        },
        price: c.price,
        duration: c.duration || '',
        totalLessons: c.totalLessons,
        totalStudents: c.totalStudents || 0,
        rating: c.rating || 0,
        totalReviews: c.totalReviews || 0,
        status: c.status,
        level: c.level,
        language: c.language || 'vi',
        tags: c.tags || [],
        revenue: (c.price || 0) * (c.totalStudents || 0),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    [courses],
  );

  // ── Top teachers ──────────────────────────────────────────────────────
  const topTeachers = useMemo(() =>
    [...allTeachers]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map(t => ({
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
        status: (t.status as 'active' | 'inactive' | 'pending' | 'suspended') || 'active',
        bio: t.bio,
        socialLinks: t.socialLinks,
        joinedDate: t.createdAt || '',
        earnings: t.earnings || 0,
      })),
    [allTeachers],
  );

  // ── Recent tickets (mapped to AdminSupportTicket shape) ───────────────
  const recentTickets = useMemo(() =>
    recentTicketRows.map(t => ({
      id: t.id,
      ticketId: t.id.slice(0, 8).toUpperCase(),
      userId: t.userId,
      userName: t.user ? `${t.user.firstName} ${t.user.lastName}` : '',
      userEmail: t.user?.email || '',
      userAvatar: t.user?.avatar,
      subject: t.subject,
      description: t.message,
      category: t.category,
      priority: t.priority,
      status: t.status === 'in_progress' ? 'in_progress' as const : t.status,
      assignedTo: t.assignedToId,
      assignedName: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : undefined,
      responses: [] as { id: string; message: string; authorId: string; authorName: string; authorAvatar?: string; isStaff: boolean; attachments?: string[]; createdAt: string }[],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    [recentTicketRows],
  );

  // ── Assemble final data object matching the page contract ─────────────
  const data = useMemo(() => ({
    stats,
    revenueData: mockRevenueData,
    notifications: adminNotifications,
    activities: activityLogs,
    revenueChart,
    usersChart,
    coursesChart,
    topCourses,
    topTeachers,
    recentTickets,
  }), [stats, revenueChart, usersChart, coursesChart, topCourses, topTeachers, recentTickets]);

  // ── Notification helpers (local state, no backend) ────────────────────
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const markNotificationRead = useCallback((id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setReadIds(new Set(adminNotifications.map(n => n.id)));
  }, []);

  const refreshData = useCallback(() => {
    // RTK Query handles refetching automatically via cache invalidation
  }, []);

  const unreadNotificationsCount = adminNotifications.filter(n => !n.isRead && !readIds.has(n.id)).length;

  return {
    data,
    loading,
    dateRange,
    setDateRange,
    markNotificationRead,
    markAllNotificationsRead,
    refreshData,
    unreadNotificationsCount,
  };
};
