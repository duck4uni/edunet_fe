export interface Course {
  id: number | string;
  title: string;
  author: string;
  image: string;
  price: number;
  lessons: number;
  duration: string;
  category: string;
  startDate?: string;
  discountPrice?: number;
  description?: string;
  goal?: string;
  teacher?: Teacher;
  time?: { startDisplay: string };
  schedule?: string[];
  hours?: string[];
  content?: CourseSection[];
  reviews?: Review[];
}

export interface Teacher {
  name: string;
  avatar: string;
}

export interface CourseSection {
  title: string;
  items: string[];
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
