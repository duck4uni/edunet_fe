// Revenue & Statistics Hook
import { useState, useEffect, useCallback, useMemo } from 'react';

import type { RevenueData, ChartData } from '../types/admin';
import { revenueData as mockRevenueData, adminCourses, teachers } from '../constants/adminData';

import { notify } from '../utils/notify';
interface DateRange {
  startDate: string;
  endDate: string;
}

interface RevenueFilters {
  dateRange?: DateRange;
  category?: string;
  teacher?: string;
}

export const useRevenue = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RevenueFilters>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRevenueData(mockRevenueData);
    } catch (error) {
      notify.error('Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Summary statistics
  const summary = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
    const totalNetRevenue = revenueData.reduce((sum, r) => sum + r.netRevenue, 0);
    const totalOrders = revenueData.reduce((sum, r) => sum + r.orders, 0);
    const totalRefunds = revenueData.reduce((sum, r) => sum + r.refunds, 0);
    
    const currentMonth = revenueData[revenueData.length - 1];
    const previousMonth = revenueData[revenueData.length - 2];
    
    const revenueGrowth = previousMonth
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;
    
    const ordersGrowth = previousMonth
      ? ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100
      : 0;

    return {
      totalRevenue,
      totalNetRevenue,
      totalOrders,
      totalRefunds,
      refundRate: totalOrders > 0 ? (totalRefunds / totalOrders) * 100 : 0,
      averageOrderValue: totalOrders > 0 ? totalNetRevenue / totalOrders : 0,
      revenueGrowth,
      ordersGrowth,
      currentMonthRevenue: currentMonth?.revenue || 0,
      currentMonthOrders: currentMonth?.orders || 0,
    };
  }, [revenueData]);

  // Revenue chart data
  const revenueChartData: ChartData = useMemo(() => ({
    labels: revenueData.map(r => r.date),
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueData.map(r => r.revenue / 1000000),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        fill: true,
      },
      {
        label: 'Doanh thu ròng',
        data: revenueData.map(r => r.netRevenue / 1000000),
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        fill: true,
      },
    ],
  }), [revenueData]);

  // Orders chart data
  const ordersChartData: ChartData = useMemo(() => ({
    labels: revenueData.map(r => r.date),
    datasets: [
      {
        label: 'Đơn hàng',
        data: revenueData.map(r => r.orders),
        backgroundColor: '#1890ff',
      },
      {
        label: 'Hoàn tiền',
        data: revenueData.map(r => r.refunds),
        backgroundColor: '#f5222d',
      },
    ],
  }), [revenueData]);

  // Revenue by category
  const revenueByCategoryData: ChartData = useMemo(() => {
    const categoryRevenue: Record<string, number> = {};
    adminCourses.forEach(course => {
      categoryRevenue[course.category] = (categoryRevenue[course.category] || 0) + course.revenue;
    });

    const labels = Object.keys(categoryRevenue);
    const data = Object.values(categoryRevenue).map(v => v / 1000000);
    
    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu theo danh mục',
          data,
          backgroundColor: [
            '#1890ff',
            '#52c41a',
            '#faad14',
            '#f5222d',
            '#722ed1',
            '#13c2c2',
            '#eb2f96',
            '#fa8c16',
          ],
        },
      ],
    };
  }, []);

  // Top performing courses
  const topCourses = useMemo(() => {
    return [...adminCourses]
      .filter(c => c.status === 'published')
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        title: c.title,
        teacher: c.teacher.name,
        revenue: c.revenue,
        students: c.totalStudents,
        rating: c.rating,
      }));
  }, []);

  // Top performing teachers
  const topTeachers = useMemo(() => {
    return [...teachers]
      .filter(t => t.status === 'active')
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        avatar: t.avatar,
        earnings: t.earnings,
        courses: t.totalCourses,
        students: t.totalStudents,
        rating: t.rating,
      }));
  }, []);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    if (revenueData.length < 2) return null;
    
    const current = revenueData[revenueData.length - 1];
    const previous = revenueData[revenueData.length - 2];
    
    return {
      current: {
        month: current.date,
        revenue: current.revenue,
        orders: current.orders,
        netRevenue: current.netRevenue,
      },
      previous: {
        month: previous.date,
        revenue: previous.revenue,
        orders: previous.orders,
        netRevenue: previous.netRevenue,
      },
      change: {
        revenue: ((current.revenue - previous.revenue) / previous.revenue) * 100,
        orders: ((current.orders - previous.orders) / previous.orders) * 100,
        netRevenue: ((current.netRevenue - previous.netRevenue) / previous.netRevenue) * 100,
      },
    };
  }, [revenueData]);

  // Export report
  const exportReport = useCallback(async (format: 'excel' | 'pdf') => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate file download
      notify.success(`Đã xuất báo cáo ${format.toUpperCase()}`);
      return { success: true };
    } catch (error) {
      notify.error('Không thể xuất báo cáo');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return {
    revenueData,
    loading,
    filters,
    setFilters,
    selectedPeriod,
    setSelectedPeriod,
    summary,
    revenueChartData,
    ordersChartData,
    revenueByCategoryData,
    topCourses,
    topTeachers,
    monthlyComparison,
    fetchRevenueData,
    exportReport,
  };
};
