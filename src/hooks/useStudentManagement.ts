import { useCallback, useMemo, useState } from 'react';

import type { User } from '../services/authApi';
import type { Enrollment } from '../services/courseApi';
import { useGetEnrollmentsQuery } from '../services/courseApi';
import { useGetStudentsQuery, useGetUsersQuery, useUpdateUserMutation } from '../services/userApi';
import type { Student } from '../services/userApi';
import type { TableParams } from '../types/admin';
import { notify } from '../utils/notify';

export type StudentLearningStatus = 'not_enrolled' | 'pending' | 'learning' | 'completed' | 'inactive';

export interface StudentCourseSummary {
  enrollmentId: string;
  courseId: string;
  title: string;
  status: Enrollment['status'];
  progress: number;
  enrolledAt: string;
  lastAccessedAt?: string;
}

export interface AdminStudentRecord {
  id: string;
  studentId: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
  school: string;
  grade: string;
  accountStatus: 'active' | 'inactive';
  learningStatus: StudentLearningStatus;
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  averageProgress: number;
  joinedDate: string;
  lastAccessedAt?: string;
  currentCourses: StudentCourseSummary[];
  allCourses: StudentCourseSummary[];
}

interface StudentFilters {
  search?: string;
  accountStatus?: 'active' | 'inactive';
  learningStatus?: StudentLearningStatus;
  grade?: string;
}

const sortByNewestDate = (a?: string, b?: string): number => {
  const aTime = a ? new Date(a).getTime() : 0;
  const bTime = b ? new Date(b).getTime() : 0;
  return bTime - aTime;
};

const toPercent = (value: number): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const getLearningStatus = (enrollments: Enrollment[]): StudentLearningStatus => {
  if (enrollments.length === 0) return 'not_enrolled';

  if (enrollments.some((enrollment) => enrollment.status === 'active')) {
    return 'learning';
  }

  if (enrollments.some((enrollment) => enrollment.status === 'pending')) {
    return 'pending';
  }

  if (enrollments.some((enrollment) => enrollment.status === 'completed')) {
    return 'completed';
  }

  return 'inactive';
};

const mapEnrollmentToCourse = (enrollment: Enrollment): StudentCourseSummary => ({
  enrollmentId: enrollment.id,
  courseId: enrollment.courseId,
  title: enrollment.course?.title || 'Khóa học chưa có tên',
  status: enrollment.status,
  progress: toPercent(enrollment.progress),
  enrolledAt: enrollment.createdAt,
  lastAccessedAt: enrollment.lastAccessedAt,
});

const mapStudent = (
  user: User,
  studentProfile: Student | undefined,
  enrollmentsByUserId: Map<string, Enrollment[]>,
): AdminStudentRecord => {
  const studentEnrollments = enrollmentsByUserId.get(user.id) || [];
  const allCourses = studentEnrollments.map(mapEnrollmentToCourse).sort((a, b) => sortByNewestDate(a.lastAccessedAt, b.lastAccessedAt));
  const currentCourses = allCourses.filter((course) => course.status === 'active' || course.status === 'pending');
  const completedCourses = allCourses.filter((course) => course.status === 'completed').length;

  const averageProgress =
    allCourses.length > 0
      ? Math.round(allCourses.reduce((sum, course) => sum + course.progress, 0) / allCourses.length)
      : 0;

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Chưa có tên';

  const studentId = studentProfile?.studentId || `USR-${user.id.slice(0, 8).toUpperCase()}`;

  return {
    id: user.id,
    studentId,
    userId: user.id,
    firstName,
    lastName,
    fullName,
    email: user.email || '',
    avatar: user.avatar,
    school: studentProfile?.school || '',
    grade: studentProfile?.grade || '',
    accountStatus: user.isActive === false ? 'inactive' : 'active',
    learningStatus: getLearningStatus(studentEnrollments),
    totalCourses: allCourses.length,
    activeCourses: currentCourses.length,
    completedCourses,
    averageProgress,
    joinedDate: user.createdAt || studentProfile?.createdAt || '',
    lastAccessedAt: allCourses.find((course) => Boolean(course.lastAccessedAt))?.lastAccessedAt,
    currentCourses,
    allCourses,
  };
};

export const useStudentManagement = () => {
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentRecord | null>(null);
  const [filters, setFilters] = useState<StudentFilters>({});
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    size: 'unlimited',
    filter: 'role:eq:student',
    sort: 'createdAt:desc',
  });

  const {
    data: studentProfilesData,
    isLoading: isLoadingStudentProfiles,
    isFetching: isFetchingStudentProfiles,
    refetch: refetchStudentProfiles,
  } = useGetStudentsQuery({
    size: 'unlimited',
    sort: 'createdAt:desc',
  });

  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    isFetching: isFetchingEnrollments,
    refetch: refetchEnrollments,
  } = useGetEnrollmentsQuery({
    size: 'unlimited',
    include: 'course,user',
    sort: 'createdAt:desc',
  });

  const [updateUserApi] = useUpdateUserMutation();

  const usersRows = usersData?.data?.rows || [];
  const studentProfiles = studentProfilesData?.data?.rows || [];
  const enrollmentRows = enrollmentsData?.data?.rows || [];

  const studentProfileByUserId = useMemo(() => {
    const grouped = new Map<string, Student>();
    studentProfiles.forEach((student) => {
      grouped.set(student.userId, student);
    });
    return grouped;
  }, [studentProfiles]);

  const enrollmentsByUserId = useMemo(() => {
    const grouped = new Map<string, Enrollment[]>();
    enrollmentRows.forEach((enrollment) => {
      const items = grouped.get(enrollment.userId) || [];
      items.push(enrollment);
      grouped.set(enrollment.userId, items);
    });
    return grouped;
  }, [enrollmentRows]);

  const allStudents = useMemo(
    () =>
      usersRows.map((user) => mapStudent(user, studentProfileByUserId.get(user.id), enrollmentsByUserId)),
    [usersRows, studentProfileByUserId, enrollmentsByUserId],
  );

  const filteredStudents = useMemo(() => {
    let result = [...allStudents];

    if (filters.accountStatus) {
      result = result.filter((student) => student.accountStatus === filters.accountStatus);
    }

    if (filters.learningStatus) {
      result = result.filter((student) => student.learningStatus === filters.learningStatus);
    }

    if (filters.grade) {
      result = result.filter((student) => student.grade === filters.grade);
    }

    if (filters.search) {
      const keyword = filters.search.trim().toLowerCase();
      if (keyword) {
        result = result.filter((student) =>
          student.fullName.toLowerCase().includes(keyword) ||
          student.email.toLowerCase().includes(keyword) ||
          student.studentId.toLowerCase().includes(keyword) ||
          student.school.toLowerCase().includes(keyword) ||
          student.grade.toLowerCase().includes(keyword),
        );
      }
    }

    return result;
  }, [allStudents, filters]);

  const paginatedStudents = useMemo(() => {
    const start = (tableParams.page - 1) * tableParams.pageSize;
    return filteredStudents.slice(start, start + tableParams.pageSize);
  }, [filteredStudents, tableParams]);

  const statistics = useMemo(() => {
    const totalProgress = allStudents.reduce((sum, student) => sum + student.averageProgress, 0);

    return {
      total: allStudents.length,
      activeAccounts: allStudents.filter((student) => student.accountStatus === 'active').length,
      inactiveAccounts: allStudents.filter((student) => student.accountStatus === 'inactive').length,
      learning: allStudents.filter((student) => student.learningStatus === 'learning').length,
      pending: allStudents.filter((student) => student.learningStatus === 'pending').length,
      completed: allStudents.filter((student) => student.learningStatus === 'completed').length,
      notEnrolled: allStudents.filter((student) => student.learningStatus === 'not_enrolled').length,
      totalActiveCourses: allStudents.reduce((sum, student) => sum + student.activeCourses, 0),
      averageProgress: allStudents.length > 0 ? Math.round(totalProgress / allStudents.length) : 0,
    };
  }, [allStudents]);

  const allGrades = useMemo(() => {
    const gradeSet = new Set<string>();
    allStudents.forEach((student) => {
      if (student.grade) {
        gradeSet.add(student.grade);
      }
    });
    return Array.from(gradeSet).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allStudents]);

  const toggleStudentAccountStatus = useCallback(
    async (studentId: string, nextStatus: 'active' | 'inactive') => {
      try {
        const student = allStudents.find((item) => item.id === studentId);
        if (!student) {
          notify.error('Không tìm thấy học viên');
          return { success: false };
        }

        await updateUserApi({
          id: student.userId,
          data: { isActive: nextStatus === 'active' },
        }).unwrap();

        await Promise.all([refetchUsers(), refetchStudentProfiles()]);
        notify.success(nextStatus === 'active' ? 'Đã mở khóa tài khoản học viên' : 'Đã khóa tài khoản học viên');
        return { success: true };
      } catch {
        notify.error('Không thể cập nhật trạng thái tài khoản học viên');
        return { success: false };
      }
    },
    [allStudents, refetchUsers, refetchStudentProfiles, updateUserApi],
  );

  const fetchStudents = useCallback(async () => {
    await Promise.all([refetchUsers(), refetchStudentProfiles(), refetchEnrollments()]);
  }, [refetchUsers, refetchStudentProfiles, refetchEnrollments]);

  const getStudentById = useCallback(
    (studentId: string) => allStudents.find((student) => student.id === studentId) || null,
    [allStudents],
  );

  return {
    students: paginatedStudents,
    allStudents: filteredStudents,
    loading:
      isLoadingUsers ||
      isFetchingUsers ||
      isLoadingStudentProfiles ||
      isFetchingStudentProfiles ||
      isLoadingEnrollments ||
      isFetchingEnrollments,
    selectedStudent,
    setSelectedStudent,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    total: filteredStudents.length,
    statistics,
    allGrades,
    fetchStudents,
    toggleStudentAccountStatus,
    getStudentById,
  };
};
