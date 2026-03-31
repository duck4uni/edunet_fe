import type { UserProfile, Achievement, Certificate, SupportTicket } from '../types/profile';

export const MOCK_USER_PROFILE: UserProfile = {
  id: '1',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 234 567 890',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  bio: 'Người học đam mê và nhà phát triển web đầy triển vọng. Hiện đang khám phá React và TypeScript để xây dựng các ứng dụng web hiện đại.',
  dateOfBirth: '1995-06-15',
  gender: 'male',
  address: '123 Đường Học Tập',
  city: 'TP. Hồ Chí Minh',
  country: 'Việt Nam',
  joinedDate: '2024-01-01',
  role: 'student',
  socialLinks: {
    facebook: 'https://facebook.com/alexjohnson',
    twitter: 'https://twitter.com/alexjohnson',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson',
  },
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Hoàn thành khóa học đầu tiên',
    description: 'Hoàn thành khóa học đầu tiên trên EduNet',
    icon: '🎓',
    earnedAt: '2024-02-15',
    type: 'course',
  },
  {
    id: '2',
    title: 'Bậc thầy kiểm tra',
    description: 'Đạt 100% trong 5 bài kiểm tra',
    icon: '🏆',
    earnedAt: '2024-03-10',
    type: 'quiz',
  },
  {
    id: '3',
    title: 'Chuỗi 7 ngày',
    description: 'Học liên tục 7 ngày liền',
    icon: '🔥',
    earnedAt: '2024-03-20',
    type: 'streak',
  },
  {
    id: '4',
    title: 'Người đóng góp tích cực',
    description: 'Giúp đỡ 10 học viên trên diễn đàn',
    icon: '🤝',
    earnedAt: '2024-04-05',
    type: 'community',
  },
  {
    id: '5',
    title: 'Người tiên phong',
    description: 'Tham gia EduNet trong năm đầu tiên',
    icon: '⭐',
    earnedAt: '2024-01-01',
    type: 'special',
  },
  {
    id: '6',
    title: 'Chuỗi 30 ngày',
    description: 'Học liên tục 30 ngày liền',
    icon: '💎',
    earnedAt: '2024-05-01',
    type: 'streak',
  },
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    courseName: 'Lớp Tiếp thị Số Nâng cao',
    issueDate: '2024-11-15',
    credentialId: 'CERT-DM-2024-001',
    downloadUrl: '/certificates/dm-masterclass.pdf',
  },
  {
    id: '2',
    courseName: 'Nền tảng HTML & CSS',
    issueDate: '2024-09-20',
    credentialId: 'CERT-WD-2024-045',
    downloadUrl: '/certificates/html-css.pdf',
  },
  {
    id: '3',
    courseName: 'JavaScript Cơ bản',
    issueDate: '2024-10-30',
    credentialId: 'CERT-JS-2024-089',
    downloadUrl: '/certificates/javascript.pdf',
    expiryDate: '2026-10-30',
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-001',
    subject: 'Không thể truy cập video khóa học',
    description: 'Tôi không thể phát video trong khóa học Phát triển Web. Trình phát hiển thị biểu tượng tải nhưng không phát được.',
    category: 'technical',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-11-28T10:30:00',
    updatedAt: '2024-11-29T14:00:00',
    responses: [
      {
        id: '1',
        message: 'Cảm ơn bạn đã báo cáo vấn đề này. Đội ngũ kỹ thuật của chúng tôi đang xem xét.',
        isStaff: true,
        authorName: 'Đội hỗ trợ',
        authorAvatar: '',
        createdAt: '2024-11-28T11:00:00',
      },
      {
        id: '2',
        message: 'Bạn vui lòng thử xóa bộ nhớ đệm trình duyệt và thử lại được không?',
        isStaff: true,
        authorName: 'Hỗ trợ kỹ thuật',
        authorAvatar: '',
        createdAt: '2024-11-29T14:00:00',
      },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'Yêu cầu hóa đơn',
    description: 'Tôi cần hóa đơn cho lần mua khóa học gần đây để hoàn trả chi phí.',
    category: 'billing',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-11-20T09:00:00',
    updatedAt: '2024-11-21T16:00:00',
    responses: [
      {
        id: '1',
        message: 'Hóa đơn đã được gửi đến địa chỉ email đăng ký của bạn.',
        isStaff: true,
        authorName: 'Đội thanh toán',
        authorAvatar: '',
        createdAt: '2024-11-21T16:00:00',
      },
    ],
  },
  {
    id: 'TKT-003',
    subject: 'Nội dung khóa học đã lỗi thời',
    description: 'Khóa học React sử dụng phiên bản 16 nhưng phiên bản hiện tại là 18. Vui lòng cập nhật.',
    category: 'course',
    status: 'open',
    priority: 'low',
    createdAt: '2024-11-25T15:00:00',
    updatedAt: '2024-11-25T15:00:00',
    responses: [],
  },
];

export const SUPPORT_CATEGORIES = [
  { value: 'technical', label: 'Vấn đề kỹ thuật' },
  { value: 'billing', label: 'Thanh toán' },
  { value: 'course', label: 'Nội dung khóa học' },
  { value: 'account', label: 'Tài khoản & Hồ sơ' },
  { value: 'other', label: 'Khác' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'green' },
  { value: 'medium', label: 'Trung bình', color: 'orange' },
  { value: 'high', label: 'Cao', color: 'red' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'magenta' },
];
