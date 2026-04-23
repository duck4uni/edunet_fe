import { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import type { ChartData, RevenueData } from '../types/admin';
import {
  useGetDashboardReportQuery,
  useLazyExportDashboardReportQuery,
  type ReportGroupBy,
  type ReportQueryParams,
} from '../services/reportsApi';
import { notify } from '../utils/notify';

type RevenueFilters = {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  groupBy: ReportGroupBy;
  userRole?: ReportQueryParams['userRole'];
  courseStatus?: ReportQueryParams['courseStatus'];
  enrollmentStatus?: ReportQueryParams['enrollmentStatus'];
  ticketStatus?: ReportQueryParams['ticketStatus'];
  categoryId?: string;
};

type ReportPreset = {
  id: string;
  name: string;
  filters: RevenueFilters;
  compareEnabled: boolean;
  createdAt: string;
};

const PRESET_STORAGE_KEY = 'edunet_admin_report_presets';

const buildDateRangeByMonth = (month: dayjs.Dayjs) => {
  return {
    startDate: month.startOf('month').format('YYYY-MM-DD'),
    endDate: month.endOf('month').format('YYYY-MM-DD'),
  };
};

const loadPresets = (): ReportPreset[] => {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReportPreset[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const savePresets = (presets: ReportPreset[]): void => {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
};

export const useRevenue = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'));
  const [savedPresets, setSavedPresets] = useState<ReportPreset[]>(() => loadPresets());
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const [filters, setFilters] = useState<RevenueFilters>({
    dateRange: buildDateRangeByMonth(dayjs()),
    groupBy: 'month',
  });

  useEffect(() => {
    const month = dayjs(`${selectedMonth}-01`);
    if (!month.isValid()) return;

    setFilters((prev) => ({
      ...prev,
      dateRange: buildDateRangeByMonth(month),
      groupBy: 'month',
    }));
  }, [selectedMonth]);

  const comparisonRange = useMemo(() => {
    const currentMonth = dayjs(`${selectedMonth}-01`);
    const previousMonth = currentMonth.subtract(1, 'month');

    return {
      compareStartDate: previousMonth.startOf('month').format('YYYY-MM-DD'),
      compareEndDate: previousMonth.endOf('month').format('YYYY-MM-DD'),
    };
  }, [selectedMonth]);

  const queryArgs = useMemo<ReportQueryParams>(() => ({
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    groupBy: 'month',
    userRole: filters.userRole,
    courseStatus: filters.courseStatus,
    enrollmentStatus: filters.enrollmentStatus,
    ticketStatus: filters.ticketStatus,
    categoryId: filters.categoryId,
    compareStartDate: comparisonRange.compareStartDate,
    compareEndDate: comparisonRange.compareEndDate,
  }), [comparisonRange, filters]);

  const {
    data: reportResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDashboardReportQuery(queryArgs);

  const [triggerExport, { isFetching: isExporting }] = useLazyExportDashboardReportQuery();

  const report = reportResponse?.data;
  const loading = isLoading || isFetching;

  useEffect(() => {
    if (!report?.warnings?.length) return;
    report.warnings.forEach((warning) => notify.warning(warning.message));
  }, [report?.generatedAt]);

  useEffect(() => {
    if (!isError) return;

    const apiError = error as { status?: number; data?: unknown } | undefined;
    const message =
      typeof apiError?.data === 'string'
        ? apiError.data
        : `Không thể tải dữ liệu báo cáo (mã lỗi: ${apiError?.status ?? 'unknown'})`;

    notify.error(message);
  }, [isError, error]);

  const revenueData: RevenueData[] = useMemo(() => (
    (report?.trends.labels ?? []).map((label, index) => ({
      date: label,
      revenue: report?.trends.revenue[index] ?? 0,
      orders: report?.trends.enrollments[index] ?? 0,
      refunds: 0,
      netRevenue: report?.trends.revenue[index] ?? 0,
    }))
  ), [report]);

  const summary = useMemo(() => {
    const totalRevenue = report?.overview.grossRevenue ?? 0;
    const totalOrders = report?.overview.revenueEnrollments ?? 0;
    const totalRefunds = 0;
    const totalNetRevenue = totalRevenue;

    return {
      totalRevenue,
      totalNetRevenue,
      totalOrders,
      totalRefunds,
      refundRate: 0,
      averageOrderValue: totalOrders > 0 ? totalNetRevenue / totalOrders : 0,
      revenueGrowth: report?.comparison?.delta.revenuePct ?? 0,
      ordersGrowth: report?.comparison?.delta.enrollmentsPct ?? 0,
      currentMonthRevenue: revenueData[revenueData.length - 1]?.revenue ?? 0,
      currentMonthOrders: revenueData[revenueData.length - 1]?.orders ?? 0,
    };
  }, [report, revenueData]);

  const revenueChartData: ChartData = useMemo(() => ({
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

  const ordersChartData: ChartData = useMemo(() => ({
    labels: report?.trends.labels ?? [],
    datasets: [
      {
        label: 'Ghi danh',
        data: report?.trends.enrollments ?? [],
        backgroundColor: '#1890ff',
      },
      {
        label: 'Ticket hỗ trợ',
        data: report?.trends.tickets ?? [],
        backgroundColor: '#faad14',
      },
    ],
  }), [report]);

  const revenueByCategoryData: ChartData = useMemo(() => {
    const labels = report?.breakdowns.revenueByCategory.map((item) => item.categoryName) ?? [];
    const data = report?.breakdowns.revenueByCategory.map((item) => item.revenue / 1000000) ?? [];

    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu theo danh mục (triệu VND)',
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
  }, [report]);

  const topCourses = useMemo(() => (
    (report?.widgets.topCourses ?? []).map((course) => ({
      id: course.id,
      title: course.title,
      teacher: course.teacher.name,
      revenue: 0,
      students: course.totalStudents,
      rating: course.rating,
    }))
  ), [report]);

  const topTeachers = useMemo(() => (
    (report?.widgets.topTeachers ?? []).map((teacher) => ({
      id: teacher.id,
      name: `${teacher.firstName} ${teacher.lastName}`.trim(),
      avatar: teacher.avatar,
      earnings: 0,
      courses: teacher.totalCourses,
      students: teacher.totalStudents,
      rating: teacher.rating,
    }))
  ), [report]);

  const monthlyComparison = useMemo(() => {
    if (!report?.comparison) return null;

    return {
      current: {
        month: `${report.range.startDate} - ${report.range.endDate}`,
        revenue: report.overview.grossRevenue,
        orders: report.overview.enrollments,
        netRevenue: report.overview.grossRevenue,
      },
      previous: {
        month: `${report.comparison.range.startDate} - ${report.comparison.range.endDate}`,
        revenue: report.comparison.overview.grossRevenue,
        orders: report.comparison.overview.enrollments,
        netRevenue: report.comparison.overview.grossRevenue,
      },
      change: {
        revenue: report.comparison.delta.revenuePct,
        orders: report.comparison.delta.enrollmentsPct,
        netRevenue: report.comparison.delta.revenuePct,
      },
    };
  }, [report]);

  const fetchRevenueData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const exportReport = useCallback(async (format: 'csv' | 'json') => {
    try {
      const response = await triggerExport({ ...queryArgs, format }).unwrap();
      const exported = response.data;

      const blob = typeof exported.content === 'string'
        ? new Blob([exported.content], { type: exported.mimeType })
        : new Blob([JSON.stringify(exported.content, null, 2)], { type: exported.mimeType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exported.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notify.success(`Đã xuất báo cáo ${format.toUpperCase()} thành công`);
      return { success: true };
    } catch {
      notify.error('Không thể xuất báo cáo');
      return { success: false };
    }
  }, [queryArgs, triggerExport]);

  const saveCurrentPreset = useCallback((name: string) => {
    if (!name.trim()) {
      notify.warning('Vui lòng nhập tên bộ lọc');
      return;
    }

    const nextPreset: ReportPreset = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      filters,
      compareEnabled: true,
      createdAt: new Date().toISOString(),
    };

    const nextPresets = [nextPreset, ...savedPresets].slice(0, 20);
    setSavedPresets(nextPresets);
    savePresets(nextPresets);
    setActivePresetId(nextPreset.id);
    notify.success('Đã lưu bộ lọc báo cáo');
  }, [filters, savedPresets]);

  const applyPreset = useCallback((id: string) => {
    const preset = savedPresets.find((item) => item.id === id);
    if (!preset) return;

    const presetMonth = dayjs(preset.filters.dateRange.startDate);
    const normalizedMonth = (presetMonth.isValid() ? presetMonth : dayjs()).format('YYYY-MM');

    setSelectedMonth(normalizedMonth);
    setFilters({
      ...preset.filters,
      dateRange: buildDateRangeByMonth(dayjs(`${normalizedMonth}-01`)),
      groupBy: 'month',
    });
    setActivePresetId(preset.id);
  }, [savedPresets]);

  const deletePreset = useCallback((id: string) => {
    const next = savedPresets.filter((item) => item.id !== id);
    setSavedPresets(next);
    savePresets(next);

    if (activePresetId === id) {
      setActivePresetId(null);
    }
  }, [activePresetId, savedPresets]);

  return {
    report,
    revenueData,
    loading,
    exporting: isExporting,
    filters,
    setFilters,
    selectedMonth,
    setSelectedMonth,
    summary,
    revenueChartData,
    ordersChartData,
    revenueByCategoryData,
    topCourses,
    topTeachers,
    monthlyComparison,
    fetchRevenueData,
    exportReport,
    savedPresets,
    activePresetId,
    saveCurrentPreset,
    applyPreset,
    deletePreset,
  };
};
