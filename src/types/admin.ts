// Admin Types/Interfaces

// User & Auth
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: AdminRole;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'support' | 'hr';

// Employee Management
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  position: string;
  role: AdminRole;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  salary?: number;
  address?: string;
  emergencyContact?: string;
  createdAt: string;
}

// Teacher Management  
export interface Teacher {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  specialization: string[];
  qualification: string;
  experience: number;
  rating: number;
  totalCourses: number;
  totalStudents: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'rejected';
  bio?: string;
  cvUrl?: string;
  rejectionReason?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  joinedDate: string;
  earnings: number;
}

// Course Management
export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  subcategory?: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  price: number;
  discountPrice?: number;
  duration: string;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  totalReviews: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'archived';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  language: string;
  tags: string[];
  revenue: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  rejectionReason?: string;
}

// Course Review
export interface CourseReview {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isReported: boolean;
  reportReason?: string;
  status: 'visible' | 'hidden' | 'flagged';
  createdAt: string;
}

// CV/Recruitment
export interface CVApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  cvUrl: string;
  coverLetter?: string;
  experience: number;
  education: string;
  skills: string[];
  expectedSalary?: number;
  availability: string;
  status: 'new' | 'reviewing' | 'shortlisted' | 'interview' | 'offered' | 'hired' | 'rejected';
  rating?: number;
  notes?: string;
  interviewDate?: string;
  appliedAt: string;
  source: 'website' | 'linkedin' | 'referral' | 'other';
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  benefits: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  status: 'draft' | 'active' | 'closed' | 'filled';
  applicationsCount: number;
  deadline?: string;
  createdAt: string;
}

// Support Ticket
export interface AdminSupportTicket {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'course' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedName?: string;
  responses: TicketResponse[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketResponse {
  id: string;
  message: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isStaff: boolean;
  attachments?: string[];
  createdAt: string;
}

// Permission & Role
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
}

export interface RoleGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  isSystem: boolean;
  createdAt: string;
}

// Revenue & Statistics
export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  refunds: number;
  netRevenue: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
  newUsersToday: number;
  newCoursesToday: number;
  pendingApprovals: number;
  openTickets: number;
  usersGrowth: number;
  revenueGrowth: number;
  coursesGrowth: number;
  teachersGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

// Notification
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'course' | 'user' | 'support' | 'system' | 'revenue';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  details: string;
  ipAddress?: string;
  module: string;
  createdAt: string;
}

// Table & Filter
export interface TableParams {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  filters?: Record<string, any>;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
