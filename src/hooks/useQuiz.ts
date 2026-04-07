import { useState, useMemo } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  useGetQuizzesByCourseQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useStartQuizAttemptMutation,
  useGetMyQuizProgressQuery,
} from '../services/learningApi';
import { useGetProfileQuery } from '../services/authApi';
import type { QuizItem } from '../types/myCourse';

export const useQuiz = (courseId: string) => {
  const navigate = useNavigate();
  const { data: profileData } = useGetProfileQuery();
  const userRole = (profileData?.data?.role as 'student' | 'teacher') || 'student';

  const { data: quizzesData, isLoading } = useGetQuizzesByCourseQuery(courseId, {
    skip: !courseId,
  });
  const { data: progressData } = useGetMyQuizProgressQuery(courseId, {
    skip: !courseId || userRole !== 'student',
  });
  const [createQuiz] = useCreateQuizMutation();
  const [updateQuiz] = useUpdateQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();
  const [startQuizAttempt] = useStartQuizAttemptMutation();

  const quizzes: QuizItem[] = useMemo(() => {
    const raw = quizzesData?.data;
    if (!raw) return [];
    const progressMap = progressData?.data || {};
    return raw.map((q) => {
      const progress = progressMap[q.id];
      return {
        id: q.id,
        title: q.title,
        description: q.description || '',
        duration: q.duration,
        questions: q.totalQuestions,
        attempts: progress?.attempts || 0,
        maxAttempts: q.maxAttempts,
        bestScore: progress?.bestScore,
        status: (progress?.status || 'not-started') as 'not-started' | 'in-progress' | 'completed',
      };
    });
  }, [quizzesData, progressData]);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quizzes, searchText, filterStatus]);

  const stats = useMemo(() => ({
    total: quizzes.length,
    completed: quizzes.filter(q => q.status === 'completed').length,
    notStarted: quizzes.filter(q => q.status === 'not-started').length,
    avgScore: Math.round(
      quizzes.filter(q => q.bestScore !== undefined).reduce((acc, q) => acc + (q.bestScore || 0), 0) / 
      Math.max(quizzes.filter(q => q.bestScore !== undefined).length, 1)
    ),
  }), [quizzes]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'success', text: 'Hoàn thành' };
      case 'in-progress':
        return { color: 'processing', text: 'Đang làm' };
      case 'not-started':
      default:
        return { color: 'default', text: 'Chưa bắt đầu' };
    }
  };

  const handleCreate = () => {
    setSelectedQuiz(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quiz: QuizItem) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    try {
      await deleteQuiz(quizId).unwrap();
      message.success('Đã xóa bài kiểm tra');
    } catch {
      message.error('Xóa bài kiểm tra thất bại');
    }
  };

  const handleSubmit = async (values: { title: string; description?: string; duration: number; totalQuestions: number; maxAttempts: number }) => {
    try {
      if (selectedQuiz) {
        await updateQuiz({ id: selectedQuiz.id, data: values }).unwrap();
        message.success('Đã cập nhật bài kiểm tra');
      } else {
        await createQuiz({ ...values, courseId }).unwrap();
        message.success('Đã tạo bài kiểm tra');
      }
      setIsModalOpen(false);
    } catch {
      message.error(selectedQuiz ? 'Cập nhật thất bại' : 'Tạo bài kiểm tra thất bại');
    }
  };

  const handleStartQuiz = async (quiz: QuizItem) => {
    try {
      const result = await startQuizAttempt(quiz.id).unwrap();
      if (result.data) {
        navigate(`/my-course/quizz/practics/${result.data.id}`);
      }
    } catch {
      message.error('Không thể bắt đầu bài kiểm tra');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    userRole,
    quizzes,
    filteredQuizzes,
    searchText,
    setSearchText,
    filterStatus,
    setFilterStatus,
    isModalOpen,
    selectedQuiz,
    stats,
    isLoading,
    getStatusConfig,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleStartQuiz,
    closeModal,
  };
};
