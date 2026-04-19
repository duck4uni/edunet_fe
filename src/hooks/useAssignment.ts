import { useState, useMemo } from 'react';

import {
  useGetAssignmentsByCourseQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentMutation,
} from '../services/learningApi';
import { useGetProfileQuery } from '../services/authApi';
import type { AssignmentItem } from '../types/myCourse';

import { notify } from '../utils/notify';
export const useAssignment = (courseId: string) => {
  const { data: profileData } = useGetProfileQuery();
  const userRole = (profileData?.data?.role as 'student' | 'teacher') || 'student';

  const { data: assignmentsData, isLoading } = useGetAssignmentsByCourseQuery(courseId, {
    skip: !courseId,
  });
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [submitAssignment] = useSubmitAssignmentMutation();

  const assignments: AssignmentItem[] = useMemo(() => {
    const raw = assignmentsData?.data;
    if (!raw) return [];
    return raw.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      dueDate: a.dueDate,
      status: a.status,
      grade: a.grade,
      maxGrade: a.maxGrade,
      attachments: [],
      submittedAt: a.submittedAt,
      feedback: a.feedback,
    }));
  }, [assignmentsData]);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchText, filterStatus]);

  const stats = useMemo(() => ({
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
  }), [assignments]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'processing', text: 'Chờ nộp' };
      case 'submitted':
        return { color: 'warning', text: 'Đã nộp' };
      case 'graded':
        return { color: 'success', text: 'Đã chấm' };
      case 'overdue':
        return { color: 'error', text: 'Quá hạn' };
      default:
        return { color: 'default', text: 'Không rõ' };
    }
  };

  const handleCreate = () => {
    setSelectedAssignment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleView = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId).unwrap();
      notify.success('Đã xóa bài tập');
    } catch {
      notify.error('Xóa bài tập thất bại');
    }
  };

  const handleSubmitAssignment = async (assignmentId: string, submissionUrl: string) => {
    try {
      await submitAssignment({ id: assignmentId, submissionUrl }).unwrap();
      notify.success('Đã nộp bài tập');
    } catch {
      notify.error('Nộp bài tập thất bại');
    }
  };

  const handleSubmit = async (values: { title: string; description: string; dueDate: string; maxGrade: number }) => {
    try {
      if (selectedAssignment) {
        await updateAssignment({ id: selectedAssignment.id, data: values }).unwrap();
        notify.success('Đã cập nhật bài tập');
      } else {
        await createAssignment({ ...values, courseId }).unwrap();
        notify.success('Đã tạo bài tập');
      }
      setIsModalOpen(false);
    } catch {
      notify.error(selectedAssignment ? 'Cập nhật thất bại' : 'Tạo bài tập thất bại');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  return {
    userRole,
    assignments,
    filteredAssignments,
    searchText,
    setSearchText,
    filterStatus,
    setFilterStatus,
    isModalOpen,
    isViewModalOpen,
    selectedAssignment,
    stats,
    isLoading,
    getStatusConfig,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleSubmit,
    handleSubmitAssignment,
    closeModal,
    closeViewModal,
  };
};
