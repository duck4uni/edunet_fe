import type { Course, Category } from '../models/course';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Thiết kế', count: 120, image: 'https://img.freepik.com/free-vector/graphic-design-colorful-geometrical-lettering_52683-34588.jpg' },
  { id: 2, name: 'Lập trình', count: 80, image: 'https://img.freepik.com/free-vector/web-development-programmer-engineering-coding-website-augmented-reality-interface-screens-developer-project-engineer-programming-software-application-design-cartoon-illustration_107791-3863.jpg' },
  { id: 3, name: 'Tiếp thị', count: 50, image: 'https://img.freepik.com/free-vector/marketing-consulting-concept-illustration_114360-9027.jpg' },
  { id: 4, name: 'Kinh doanh', count: 40, image: 'https://img.freepik.com/free-vector/business-team-brainstorming-discussing-startup-project_74855-6909.jpg' },
  { id: 5, name: 'Âm nhạc', count: 60, image: 'https://img.freepik.com/free-vector/musical-notes-frame-with-text-space_1017-32857.jpg' },
];

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Khóa học Phát triển Web Toàn diện 2.0',
    author: 'Rob Percival',
    image: 'https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010125.jpg',
    price: 19.99,
    lessons: 25,
    duration: '12h 30m',
    category: 'Lập trình',
    startDate: '2023-10-01'
  },
  {
    id: 2,
    title: 'Tiếp thị Số Nâng cao - 23 Khóa trong 1',
    author: 'Phil Ebiner',
    image: 'https://img.freepik.com/free-photo/digital-marketing-with-icons-business-people_53876-94833.jpg',
    price: 14.99,
    lessons: 18,
    duration: '8h 15m',
    category: 'Tiếp thị',
    startDate: '2023-10-05'
  },
  {
    id: 3,
    title: 'Thiết kế Đồ họa Nâng cao - Học Thiết kế CHUYÊN NGHIỆP',
    author: 'Lindsay Marsh',
    image: 'https://img.freepik.com/free-photo/graphic-designer-working-tablet_23-2147652935.jpg',
    price: 24.99,
    lessons: 30,
    duration: '15h 45m',
    category: 'Thiết kế',
    startDate: '2023-10-10'
  },
  {
    id: 4,
    title: 'Bootcamp Python Toàn diện: Từ số 0 đến chuyên gia Python 3',
    author: 'Jose Portilla',
    image: 'https://img.freepik.com/free-photo/python-programming-language-program-code-screen_53876-133553.jpg',
    price: 29.99,
    lessons: 40,
    duration: '20h 00m',
    category: 'Lập trình',
    startDate: '2023-10-15'
  },
  {
    id: 5,
    title: 'Học Máy A-Z™: Thực hành Python & R trong Khoa học Dữ liệu',
    author: 'Kirill Eremenko',
    image: 'https://img.freepik.com/free-vector/artificial-intelligence-ai-robot-chip-vector-technology-concept_53876-112302.jpg',
    price: 34.99,
    lessons: 50,
    duration: '40h 00m',
    category: 'Khoa học Dữ liệu',
    startDate: '2023-10-20'
  },
  {
    id: 6,
    title: 'Khóa học Tiếp thị Số Toàn diện - 12 Khóa trong 1',
    author: 'Rob Percival',
    image: 'https://img.freepik.com/free-photo/marketing-strategy-planning-strategy-concept_53876-42950.jpg',
    price: 19.99,
    lessons: 22,
    duration: '22h 30m',
    category: 'Tiếp thị',
    startDate: '2023-10-25'
  },
];

export const COURSE_DETAIL_DATA: Course = {
  id: '1',
  title: 'Khóa học Phát triển Web Toàn diện 2.0',
  price: 4000000,
  discountPrice: 2500000,
  description: '<p>Học Phát triển Web bằng cách xây dựng 25 website và ứng dụng di động sử dụng HTML, CSS, Javascript, PHP, Python, MySQL và nhiều hơn nữa!</p>',
  goal: '<p>Bạn sẽ học cách xây dựng website từ đầu.</p><p>Bạn sẽ học cách kiếm tiền với nghề lập trình viên.</p>',
  image: 'https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010125.jpg',
  author: 'Rob Percival',
  category: 'Lập trình',
  lessons: 25,
  duration: '12h 30m',
  teacher: {
    name: 'Rob Percival',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rob'
  },
  time: { startDisplay: '08:00 AM' },
  schedule: ['T2', 'T4', 'T6'],
  hours: ['2h', '2h', '2h'],
  content: [
    {
      title: 'Giới thiệu',
      items: ['Chào mừng đến với khóa học', 'Cách nhận hỗ trợ', 'Cài đặt phần mềm']
    },
    {
      title: 'HTML 5',
      items: ['HTML cơ bản', 'HTML nâng cao', 'Tính năng HTML 5']
    },
    {
      title: 'CSS 3',
      items: ['CSS cơ bản', 'Định dạng văn bản', 'Bố cục CSS']
    }
  ],
  reviews: [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      rate: 5,
      date: '2 ngày trước',
      content: 'Khóa học tuyệt vời! Tôi đã học được rất nhiều.',
      role: 'Học viên',
      images: []
    },
    {
      id: 2,
      user: 'Trần Thị B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      rate: 4,
      date: '1 tuần trước',
      content: 'Nội dung tốt nhưng chất lượng âm thanh có thể cải thiện hơn.',
      role: 'Học viên',
      images: []
    }
  ]
};

export const FILTER_CATEGORIES = ['Tất cả', 'Tiếp thị', 'Thiết kế', 'Lập trình', 'Kinh doanh', 'Âm nhạc'];
export const FILTER_DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
