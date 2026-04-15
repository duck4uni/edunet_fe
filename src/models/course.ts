export interface Course {
  id: number | string;
  title: string;
  author: string;
  image: string;
  price: number;
  lessons: number;
  duration: string;
  category: string;
  startDate?: string | null;
  discountPrice?: number | null;
  description?: string;
  goal?: string;
  teacher?: Teacher;
  time?: { startDisplay: string };
  schedule?: string[];
  hours?: string[];
  content?: CourseSection[];
  reviews?: Review[];
  rating?: number;
  totalReviews?: number;
  totalStudents?: number;
  level?: string;
  language?: string;
  tags?: string[];
  updatedAt?: string;
  publishedAt?: string;
}

export interface Teacher {
  name: string;
  avatar: string;
  bio?: string;
}

export interface CourseSection {
  title: string;
  items: string[];
  duration?: string;
  isFree?: boolean;
  type?: string;
  order?: number;
}

export interface Review {
  id: number | string;
  user: string;
  avatar: string;
  rate: number;
  date: string;
  content: string;
  role: string;
  images: string[];
}

export interface Category {
  id: number;
  name: string;
  count: number;
  image: string;
}
