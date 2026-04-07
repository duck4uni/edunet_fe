// Types for My Course module
export interface ClassMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'teacher' | 'assistant';
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
  progress?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  status: 'locked' | 'available' | 'completed' | 'in-progress';
  lessons: PathLesson[];
}

export interface PathLesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration: string;
  completed: boolean;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  maxGrade: number;
  attachments: string[];
  submittedAt?: string;
  feedback?: string;
}

export interface QuizItem {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: number;
  attempts: number;
  maxAttempts: number;
  bestScore?: number;
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate?: string;
}

export interface MaterialItem {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'link' | 'image';
  size?: string;
  uploadedAt: string;
  downloadUrl: string;
  description?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'grade' | 'assignment' | 'general';
  createdAt: string;
  isRead: boolean;
  author: {
    name: string;
    avatar: string;
  };
}

export interface MyCourseDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  teacher: {
    id: string;
    name: string;
    avatar: string;
  };
  members: ClassMember[];
  learningPath: LearningPath[];
  assignments: AssignmentItem[];
  quizzes: QuizItem[];
  materials: MaterialItem[];
  notifications: NotificationItem[];
}

export type UserRole = 'student' | 'teacher' | 'admin';
