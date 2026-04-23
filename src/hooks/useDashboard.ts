import { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import type { DashboardStats, ChartData, AdminNotification } from '../types/admin';
import { useGetDashboardReportQuery } from '../services/reportsApi';
import { useGetTeachersQuery } from '../services/courseApi';
import { useGetTicketsQuery } from '../services/supportApi';
import { activityLogs } from '../constants/adminData';

const ADMIN_READ_NOTIFICATIONS_STORAGE_KEY = 'admin-read-notifications';

export const useDashboard = () => {
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ]);

  const comparisonRange = useMemo(() => {
    const start = dayjs(dateRange[0]);
    const end = dayjs(dateRange[1]);
    const days = Math.max(end.diff(start, 'day') + 1, 1);
    const compareEnd = start.subtract(1, 'day');
    const compareStart = compareEnd.subtract(days - 1, 'day');

    return {
      compareStartDate: compareStart.format('YYYY-MM-DD'),
      compareEndDate: compareEnd.format('YYYY-MM-DD'),
    };
  }, [dateRange]);

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
    refetch: refetchReport,
  } = useGetDashboardReportQuery(
    {
      startDate: dateRange[0],
      endDate: dateRange[1],
      compareStartDate: comparisonRange.compareStartDate,
      compareEndDate: comparisonRange.compareEndDate,
      groupBy: 'auto',
    },
    {
      pollingInterval: 120000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    isFetching: isFetchingTickets,
    refetch: refetchTickets,
  } = useGetTicketsQuery(
    {
      size: 20,
      include: 'user',
      sort: 'createdAt:desc',
    },
    {
      pollingInterval: 120000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const {
    data: pendingTeachersData,
    isLoading: isLoadingPendingTeachers,
    isFetching: isFetchingPendingTeachers,
    refetch: refetchPendingTeachers,
  } = useGetTeachersQuery(
    {
      size: 10,
      include: 'user',
      filter: 'status:eq:pending',
      sort: 'createdAt:desc',
    },
    {
      pollingInterval: 120000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const report = reportData?.data;
  const tickets = useMemo(() => ticketsData?.data?.rows ?? [], [ticketsData?.data?.rows]);
  const pendingTeachers = useMemo(
    () => pendingTeachersData?.data?.rows ?? [],
    [pendingTeachersData?.data?.rows],
  );

  const stats: DashboardStats = useMemo(() => {
    const legacy = report?.legacyStats;
    return {
      totalUsers: legacy?.totalUsers ?? 0,
      totalTeachers: legacy?.totalTeachers ?? 0,
      totalCourses: legacy?.totalCourses ?? 0,
      totalRevenue: legacy?.totalRevenue ?? 0,
      newUsersToday: legacy?.newUsersToday ?? 0,
      newCoursesToday: legacy?.newCoursesToday ?? 0,
      pendingApprovals: legacy?.pendingApprovals ?? 0,
      openTickets: legacy?.openTickets ?? 0,
      usersGrowth: legacy?.usersGrowth ?? 0,
      revenueGrowth: legacy?.revenueGrowth ?? 0,
      coursesGrowth: legacy?.coursesGrowth ?? 0,
      teachersGrowth: legacy?.teachersGrowth ?? 0,
    };
  }, [report]);

  const revenueChart: ChartData = useMemo(() => ({
    labels: report?.trends.labels ?? [],
    datasets: [
      {
        label: 'Doanh thu',
        data: (report?.trends.revenue ?? []).map((value) => value / 1000000),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        fill: true,
      },
    ],
  }), [report]);

  const usersChart: ChartData = useMemo(() => ({
    labels: report?.trends.labels ?? [],
    datasets: [
      {
        label: 'Người dùng mới',
        data: report?.trends.users ?? [],
        backgroundColor: '#1890ff',
      },
    ],
  }), [report]);

  const coursesChart: ChartData = useMemo(() => ({
    labels: report?.widgets.coursesChart.labels ?? [],
    datasets: report?.widgets.coursesChart.datasets ?? [{ label: 'Số lượng khóa học', data: [] }],
  }), [report]);

  const topCourses = report?.widgets.topCourses ?? [];
  const topTeachers = report?.widgets.topTeachers ?? [];
  const recentTickets = report?.widgets.recentTickets ?? [];

  const dynamicNotifications = useMemo<AdminNotification[]>(() => {
    const generatedAt = report?.generatedAt || new Date().toISOString();
    const notifications: AdminNotification[] = [];

    if ((stats?.pendingApprovals ?? 0) > 0) {
      notifications.push({
        id: `pending-courses-${stats.pendingApprovals}`,
        title: 'Khóa học đang chờ duyệt',
        message: `Hiện có ${stats.pendingApprovals} khóa học đang chờ phê duyệt.`,
        type: 'info',
        category: 'course',
        isRead: false,
        link: '/admin/courses/review',
        createdAt: generatedAt,
      });
    }

    if (pendingTeachers.length > 0) {
      notifications.push({
        id: `pending-teachers-${pendingTeachers.length}`,
        title: 'Yêu cầu đăng ký giảng viên mới',
        message: `Có ${pendingTeachers.length} hồ sơ giảng viên đang chờ xử lý.`,
        type: 'warning',
        category: 'user',
        isRead: false,
        link: '/admin/teacher-registrations',
        createdAt: pendingTeachers[0]?.createdAt || generatedAt,
      });
    }

    const urgentTicketCount = tickets.filter(
      (ticket) =>
        (ticket.priority === 'high' || ticket.priority === 'urgent') &&
        (ticket.status === 'open' || ticket.status === 'in_progress'),
    ).length;

    if (urgentTicketCount > 0) {
      notifications.push({
        id: `urgent-tickets-${urgentTicketCount}`,
        title: 'Ticket ưu tiên cao cần xử lý',
        message: `Có ${urgentTicketCount} ticket ưu tiên cao/khẩn cấp cần xử lý ngay.`,
        type: 'error',
        category: 'support',
        isRead: false,
        link: '/admin/support',
        createdAt: tickets[0]?.createdAt || generatedAt,
      });
    }

    (report?.widgets.recentTickets || []).slice(0, 3).forEach((ticket) => {
      notifications.push({
        id: `recent-ticket-${ticket.id}`,
        title: `Ticket #${ticket.ticketId}`,
        message: ticket.subject,
        type: ticket.status === 'open' ? 'warning' : 'info',
        category: 'support',
        isRead: false,
        link: '/admin/support',
        createdAt: ticket.createdAt,
      });
    });

    (report?.warnings || []).forEach((warning, index) => {
      notifications.push({
        id: `report-warning-${warning.code}-${index}`,
        title: 'Cảnh báo dữ liệu báo cáo',
        message: warning.message,
        type: 'warning',
        category: 'system',
        isRead: false,
        link: '/admin/revenue',
        createdAt: generatedAt,
      });
    });

    return notifications.sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
    );
  }, [report, stats, tickets, pendingTeachers]);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_READ_NOTIFICATIONS_STORAGE_KEY);
      if (!saved) return;
      const ids = JSON.parse(saved) as string[];
      setReadIds(new Set(ids));
    } catch {
      setReadIds(new Set());
    }
  }, []);

  useEffect(() => {
    const validIds = new Set(dynamicNotifications.map((notification) => notification.id));
    setReadIds((previous) => {
      const next = new Set<string>();
      previous.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        }
      });

      if (next.size === previous.size) {
        let same = true;
        previous.forEach((id) => {
          if (!next.has(id)) {
            same = false;
          }
        });
        if (same) {
          return previous;
        }
      }

      return next;
    });
  }, [dynamicNotifications]);

  useEffect(() => {
    localStorage.setItem(
      ADMIN_READ_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(Array.from(readIds)),
    );
  }, [readIds]);

  const notifications = useMemo(
    () =>
      dynamicNotifications.map((notification) => ({
        ...notification,
        isRead: readIds.has(notification.id),
      })),
    [dynamicNotifications, readIds],
  );

  const data = useMemo(() => ({
    stats,
    revenueData: (report?.trends.labels ?? []).map((label, index) => ({
      date: label,
      revenue: report?.trends.revenue[index] ?? 0,
      orders: report?.trends.enrollments[index] ?? 0,
      refunds: 0,
      netRevenue: report?.trends.revenue[index] ?? 0,
    })),
    notifications,
    activities: activityLogs,
    revenueChart,
    usersChart,
    coursesChart,
    topCourses,
    topTeachers,
    recentTickets,
    warnings: report?.warnings ?? [],
    availability: report?.availability,
  }), [
    notifications,
    stats,
    report,
    revenueChart,
    usersChart,
    coursesChart,
    topCourses,
    topTeachers,
    recentTickets,
  ]);

  const markNotificationRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setReadIds(new Set(dynamicNotifications.map((notification) => notification.id)));
  }, [dynamicNotifications]);

  const refreshData = useCallback(() => {
    void Promise.all([refetchReport(), refetchTickets(), refetchPendingTeachers()]);
  }, [refetchReport, refetchTickets, refetchPendingTeachers]);

  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;

  const loading =
    isLoadingReport ||
    isFetchingReport ||
    isLoadingTickets ||
    isFetchingTickets ||
    isLoadingPendingTeachers ||
    isFetchingPendingTeachers;

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
