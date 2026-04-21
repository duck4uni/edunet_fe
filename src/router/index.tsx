import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/Layout';
import Home from '../pages/user/Home';
import ListCourse from '../pages/user/ListCourse';
import DetailCourse from '../pages/user/DetailCourse';
import Schedule from '../pages/user/Schedule';
import MyCourse from '../pages/user/MyCourse';
import DetailMyCourse from '../pages/user/MyCourse/DetailMyCourse';
import Classroom from '../pages/user/MyCourse/Classroom';
import Material from '../pages/user/MyCourse/Material';
import Assignment from '../pages/user/MyCourse/Assignment';
import Quizz from '../pages/user/MyCourse/Quizz';
import Notifications from '../pages/user/MyCourse/Notifications';
import Practics from '../pages/user/MyCourse/Quizz/Practics';
import Answer from '../pages/user/MyCourse/Quizz/Answer';
import DetailAnswer from '../pages/user/MyCourse/Quizz/DetailAnswer';
import ManageCourse from '../pages/user/MyCourse/ManageCourse';
import Chat from '../pages/user/Chat';
import Friends from '../pages/user/Friends';
import Profile from '../pages/user/Profile';
import Login from '../pages/auth/Login';
import RegisterStudent from '../pages/auth/Register/Student';
import RegisterTeacher from '../pages/auth/Register/Teacher';
import NotFound from '../pages/NotFound';
import AdminNotFound from '../pages/NotFound/AdminNotFound';

// Admin imports
import { AdminLayout } from '../components/admin';
import {
  AdminForgotPassword,
  AdminDashboard,
  CourseManagement,
  PendingRejectedManagement,
  AdminCourseDetail,
  TeacherManagement,
  TeacherRegistrationManagement,
  EmployeeManagement,
  RecruitmentManagement,
  SupportManagement,
  PermissionManagement,
  RevenueManagement,
  ReviewManagement,
  AdminProfile,
  ChatbotManagement,
  AssistantManagement,
} from '../pages/admin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    handle: { hideBreadcrumb: true },
    children: [
      {
        index: true,
        element: <Home />,
        handle: { breadcrumb: 'Trang chủ' },
      },
      {
        path: 'courses',
        element: <ListCourse />,
        handle: { breadcrumb: 'Khóa học' },
      },
      {
        path: 'courses/:id',
        element: <DetailCourse />,
        handle: { breadcrumb: 'Chi tiết khóa học' },
      },
      {
        path: 'schedule',
        element: <Schedule />,
        handle: { breadcrumb: 'Lịch học' },
      },
      {
        path: 'chat',
        element: <Chat />,
        handle: { breadcrumb: 'Tin nhắn' },
      },
      {
        path: 'friends',
        element: <Friends />,
      },
      {
        path: 'profile',
        element: <Profile />,
        handle: { breadcrumb: 'Hồ sơ cá nhân' },
      },
      {
        path: 'my-course',
        handle: { breadcrumb: 'Khóa học của tôi' },
        children: [
          {
            index: true,
            element: <MyCourse />,
            handle: { breadcrumb: 'Danh sách khóa học' },
          },
          {
            path: 'detail/:id',
            element: <DetailMyCourse />,
            handle: { breadcrumb: 'Chi tiết khóa học' },
          },
          {
            path: 'classroom/:id',
            element: <Classroom />,
            handle: { breadcrumb: 'Lớp học' },
          },
          {
            path: 'material/:id',
            element: <Material />,
            handle: { breadcrumb: 'Tài liệu' },
          },
          {
            path: 'assignment/index/:id',
            element: <Assignment />,
            handle: { breadcrumb: 'Bài tập' },
          },
          {
            path: 'quizz/:id',
            element: <Quizz />,
            handle: { breadcrumb: 'Bài kiểm tra' },
          },
          {
            path: 'notifications/:id',
            element: <Notifications />,
            handle: { breadcrumb: 'Thông báo' },
          },
          {
            path: 'quizz/practics/:id',
            element: <Practics />,
            handle: { breadcrumb: 'Làm bài' },
          },
          {
            path: 'quizz/answer/:id',
            element: <Answer />,
            handle: { breadcrumb: 'Kết quả làm bài' },
          },
          {
            path: 'quizz/answer/detail/:id',
            element: <DetailAnswer />,
            handle: { breadcrumb: 'Chi tiết kết quả' },
          },
          {
            path: 'manage-course/:id',
            element: <ManageCourse />,
            handle: { breadcrumb: 'Quản lý khóa học' },
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
        handle: { hideBreadcrumb: true },
      },
    ],
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/auth/register/student',
    element: <RegisterStudent />,
  },
  {
    path: '/auth/register/teacher',
    element: <RegisterTeacher />,
  },
  // Admin Auth Routes (without layout)
  {
    path: '/admin/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/admin/forgot-password',
    element: <AdminForgotPassword />,
  },
  // Admin Routes (with layout)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'courses',
        element: <CourseManagement />,
      },
      {
        path: 'courses/review',
        element: <PendingRejectedManagement />,
      },
      {
        path: 'courses/:id',
        element: <AdminCourseDetail />,
      },
      {
        path: 'teachers',
        element: <TeacherManagement />,
      },
      {
        path: 'teacher-registrations',
        element: <TeacherRegistrationManagement />,
      },
      {
        path: 'employees',
        element: <EmployeeManagement />,
      },
      {
        path: 'recruitment',
        element: <RecruitmentManagement />,
      },
      {
        path: 'support',
        element: <SupportManagement />,
      },
      {
        path: 'chatbot',
        element: <ChatbotManagement />,
      },
      {
        path: 'assistant',
        element: <AssistantManagement />,
      },
      {
        path: 'reviews',
        element: <ReviewManagement />,
      },
      {
        path: 'permissions',
        element: <PermissionManagement />,
      },
      {
        path: 'revenue',
        element: <RevenueManagement />,
      },
      {
        path: 'profile',
        element: <AdminProfile />,
      },
      {
        path: 'settings',
        element: <AdminProfile />,
      },
      {
        path: '*',
        element: <AdminNotFound />,
      },
    ],
  },
]);
