// Recruitment Management Hook
import { useState, useEffect, useCallback, useMemo } from 'react';

import type { CVApplication, JobPosting, TableParams } from '../types/admin';
import { cvApplications as mockApplications, jobPostings as mockJobs } from '../constants/adminData';

import { notify } from '../utils/notify';
interface CVFilters {
  status?: string;
  position?: string;
  department?: string;
  source?: string;
  search?: string;
}

interface JobFilters {
  status?: string;
  department?: string;
  type?: string;
  search?: string;
}

export const useRecruitment = () => {
  const [applications, setApplications] = useState<CVApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<CVApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [cvFilters, setCVFilters] = useState<CVFilters>({});
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setApplications(mockApplications);
      setJobs(mockJobs);
    } catch (error) {
      notify.error('Không thể tải dữ liệu tuyển dụng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (cvFilters.status) {
      result = result.filter(a => a.status === cvFilters.status);
    }

    if (cvFilters.position) {
      result = result.filter(a => a.position === cvFilters.position);
    }

    if (cvFilters.department) {
      result = result.filter(a => a.department === cvFilters.department);
    }

    if (cvFilters.source) {
      result = result.filter(a => a.source === cvFilters.source);
    }

    if (cvFilters.search) {
      const searchLower = cvFilters.search.toLowerCase();
      result = result.filter(
        a =>
          a.applicantName.toLowerCase().includes(searchLower) ||
          a.email.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [applications, cvFilters]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (jobFilters.status) {
      result = result.filter(j => j.status === jobFilters.status);
    }

    if (jobFilters.department) {
      result = result.filter(j => j.department === jobFilters.department);
    }

    if (jobFilters.type) {
      result = result.filter(j => j.type === jobFilters.type);
    }

    if (jobFilters.search) {
      const searchLower = jobFilters.search.toLowerCase();
      result = result.filter(j => j.title.toLowerCase().includes(searchLower));
    }

    return result;
  }, [jobs, jobFilters]);

  // Update CV status
  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: CVApplication['status'],
    notes?: string,
    interviewDate?: string
  ) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApplications(prev =>
        prev.map(a =>
          a.id === applicationId
            ? { ...a, status, notes: notes || a.notes, interviewDate: interviewDate || a.interviewDate }
            : a
        )
      );
      
      notify.success('Đã cập nhật trạng thái ứng viên');
      return { success: true };
    } catch (error) {
      notify.error('Không thể cập nhật trạng thái');
      return { success: false };
    }
  }, []);

  // Rate application
  const rateApplication = useCallback(async (applicationId: string, rating: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setApplications(prev =>
        prev.map(a =>
          a.id === applicationId ? { ...a, rating } : a
        )
      );
      
      notify.success('Đã đánh giá ứng viên');
      return { success: true };
    } catch (error) {
      notify.error('Không thể đánh giá');
      return { success: false };
    }
  }, []);

  // Add notes to application
  const addApplicationNotes = useCallback(async (applicationId: string, notes: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setApplications(prev =>
        prev.map(a =>
          a.id === applicationId ? { ...a, notes } : a
        )
      );
      
      notify.success('Đã lưu ghi chú');
      return { success: true };
    } catch (error) {
      notify.error('Không thể lưu ghi chú');
      return { success: false };
    }
  }, []);

  // Delete application
  const deleteApplication = useCallback(async (applicationId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApplications(prev => prev.filter(a => a.id !== applicationId));
      
      notify.success('Đã xóa hồ sơ ứng tuyển');
      return { success: true };
    } catch (error) {
      notify.error('Không thể xóa hồ sơ');
      return { success: false };
    }
  }, []);

  // Create job posting
  const createJob = useCallback(async (data: Omit<JobPosting, 'id' | 'applicationsCount' | 'createdAt'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newJob: JobPosting = {
        ...data,
        id: `job-${Date.now()}`,
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      setJobs(prev => [...prev, newJob]);
      
      notify.success('Đã tạo tin tuyển dụng mới');
      return { success: true, job: newJob };
    } catch (error) {
      notify.error('Không thể tạo tin tuyển dụng');
      return { success: false };
    }
  }, []);

  // Update job posting
  const updateJob = useCallback(async (jobId: string, data: Partial<JobPosting>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setJobs(prev =>
        prev.map(j =>
          j.id === jobId ? { ...j, ...data } : j
        )
      );
      
      notify.success('Đã cập nhật tin tuyển dụng');
      return { success: true };
    } catch (error) {
      notify.error('Không thể cập nhật tin tuyển dụng');
      return { success: false };
    }
  }, []);

  // Delete job posting
  const deleteJob = useCallback(async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setJobs(prev => prev.filter(j => j.id !== jobId));
      
      notify.success('Đã xóa tin tuyển dụng');
      return { success: true };
    } catch (error) {
      notify.error('Không thể xóa tin tuyển dụng');
      return { success: false };
    }
  }, []);

  // Close job posting
  const closeJob = useCallback(async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setJobs(prev =>
        prev.map(j =>
          j.id === jobId ? { ...j, status: 'closed' as const } : j
        )
      );
      
      notify.success('Đã đóng tin tuyển dụng');
      return { success: true };
    } catch (error) {
      notify.error('Không thể đóng tin tuyển dụng');
      return { success: false };
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics
  const statistics = useMemo(() => ({
    totalApplications: applications.length,
    newApplications: applications.filter(a => a.status === 'new').length,
    inProgress: applications.filter(a => ['reviewing', 'shortlisted', 'interview'].includes(a.status)).length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    closedJobs: jobs.filter(j => j.status === 'closed' || j.status === 'filled').length,
    byDepartment: applications.reduce((acc, a) => {
      acc[a.department] = (acc[a.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [applications, jobs]);

  // Get all positions for filters
  const allPositions = useMemo(() => {
    const positions = new Set<string>();
    applications.forEach(a => positions.add(a.position));
    return Array.from(positions).sort();
  }, [applications]);

  return {
    applications: filteredApplications,
    jobs: filteredJobs,
    loading,
    selectedApplication,
    setSelectedApplication,
    selectedJob,
    setSelectedJob,
    cvFilters,
    setCVFilters,
    jobFilters,
    setJobFilters,
    tableParams,
    setTableParams,
    statistics,
    allPositions,
    fetchData,
    updateApplicationStatus,
    rateApplication,
    addApplicationNotes,
    deleteApplication,
    createJob,
    updateJob,
    deleteJob,
    closeJob,
  };
};
