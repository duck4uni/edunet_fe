export interface RouteSeoConfig {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  robots?: string;
}

export const DEFAULT_SEO = {
  title: 'Academix | Nền tảng học tập trực tuyến thông minh',
  description:
    'Academix là nền tảng học tập trực tuyến với khóa học chất lượng, giảng viên uy tín và hệ thống học tập tối ưu cho học viên Việt Nam.',
  keywords: [
    'Academix',
    'học trực tuyến',
    'nền tảng học tập',
    'khóa học online',
    'e-learning',
    'học tập thông minh',
  ],
  robots: 'index, follow',
};

export const AUTH_DEFAULT_SEO = {
  title: 'Tài khoản | Academix',
  description:
    'Đăng nhập, đăng ký và quản lý tài khoản học viên trên hệ thống Academix.',
  keywords: ['Academix', 'đăng nhập', 'đăng ký', 'tài khoản học viên'],
  robots: 'noindex, nofollow',
};

export const ADMIN_DEFAULT_SEO = {
  title: 'Quản trị | Academix',
  description:
    'Khu vực quản trị Academix dành cho nhân sự vận hành, kiểm duyệt khóa học và theo dõi thống kê.',
  keywords: ['Academix', 'admin', 'quản trị', 'dashboard'],
  robots: 'noindex, nofollow',
};

export const ROUTE_SEO_CONFIG: RouteSeoConfig[] = [
  {
    path: '/',
    title: 'Trang chủ | Academix',
    description:
      'Academix cung cấp khóa học trực tuyến đa lĩnh vực, giúp bạn học nhanh hơn và ứng dụng ngay vào công việc.',
    keywords: ['Academix', 'trang chủ', 'khóa học trực tuyến', 'học online'],
  },
  {
    path: '/courses',
    title: 'Danh sách khóa học | Academix',
    description:
      'Khám phá danh sách khóa học tại Academix theo danh mục, cấp độ, mức giá và đánh giá từ học viên.',
    keywords: ['Academix', 'danh sách khóa học', 'khóa học online', 'tìm khóa học'],
  },
  {
    path: '/courses/:id',
    title: 'Chi tiết khóa học | Academix',
    description:
      'Xem thông tin chi tiết khóa học trên Academix: nội dung bài học, giảng viên, đánh giá và học phí.',
    keywords: ['Academix', 'chi tiết khóa học', 'chương trình học'],
  },
  {
    path: '/schedule',
    title: 'Lịch học | Academix',
    description:
      'Quản lý lịch học và theo dõi tiến độ học tập cá nhân trên Academix.',
    keywords: ['Academix', 'lịch học', 'tiến độ học tập'],
  },
  {
    path: '/chat',
    title: 'Tin nhắn | Academix',
    description:
      'Nhắn tin với bạn học, giảng viên và trợ lý hỗ trợ ngay trên Academix.',
    keywords: ['Academix', 'chat', 'tin nhắn học tập'],
  },
  {
    path: '/friends',
    title: 'Bạn bè học tập | Academix',
    description:
      'Kết nối với bạn bè và mở rộng mạng lưới học tập trên nền tảng Academix.',
    keywords: ['Academix', 'bạn bè', 'mạng lưới học tập'],
  },
  {
    path: '/profile',
    title: 'Hồ sơ cá nhân | Academix',
    description:
      'Cập nhật thông tin hồ sơ, theo dõi thành tích và quản lý tài khoản trên Academix.',
    keywords: ['Academix', 'hồ sơ', 'tài khoản'],
  },
  {
    path: '/my-course',
    title: 'Khóa học của tôi | Academix',
    description:
      'Theo dõi các khóa học đã đăng ký và tiến độ học tập của bạn trên Academix.',
    keywords: ['Academix', 'khóa học của tôi', 'tiến độ'],
  },
  {
    path: '/my-course/detail/:id',
    title: 'Chi tiết khóa học đang học | Academix',
    description:
      'Theo dõi thông tin khóa học đang học, bài học và tài liệu trên Academix.',
    keywords: ['Academix', 'chi tiết khóa học', 'học viên'],
  },
  {
    path: '/my-course/classroom/:id',
    title: 'Lớp học trực tuyến | Academix',
    description:
      'Tham gia lớp học trực tuyến và tương tác với giảng viên trên Academix.',
    keywords: ['Academix', 'lớp học', 'classroom'],
  },
  {
    path: '/my-course/material/:id',
    title: 'Tài liệu khóa học | Academix',
    description:
      'Truy cập tài liệu học tập và tài nguyên bổ trợ của khóa học trên Academix.',
    keywords: ['Academix', 'tài liệu', 'học liệu'],
  },
  {
    path: '/my-course/assignment/index/:id',
    title: 'Bài tập khóa học | Academix',
    description:
      'Làm bài tập và nộp bài trực tuyến trong khóa học trên Academix.',
    keywords: ['Academix', 'bài tập', 'assignment'],
  },
  {
    path: '/my-course/quizz/:id',
    title: 'Bài kiểm tra | Academix',
    description:
      'Thực hiện bài kiểm tra và đánh giá năng lực học tập trên Academix.',
    keywords: ['Academix', 'quiz', 'bài kiểm tra'],
  },
  {
    path: '/my-course/notifications/:id',
    title: 'Thông báo khóa học | Academix',
    description:
      'Nhận các thông báo mới nhất từ khóa học và giảng viên trên Academix.',
    keywords: ['Academix', 'thông báo', 'khóa học'],
  },
  {
    path: '/my-course/quizz/practics/:id',
    title: 'Luyện tập | Academix',
    description:
      'Luyện tập câu hỏi và nâng cao kiến thức trước bài kiểm tra trên Academix.',
    keywords: ['Academix', 'luyện tập', 'practice'],
  },
  {
    path: '/my-course/quizz/answer/:id',
    title: 'Kết quả bài làm | Academix',
    description:
      'Xem kết quả bài làm và nhận xét để cải thiện kết quả học tập trên Academix.',
    keywords: ['Academix', 'kết quả quiz', 'đánh giá'],
  },
  {
    path: '/my-course/quizz/answer/detail/:id',
    title: 'Chi tiết kết quả | Academix',
    description:
      'Phân tích chi tiết đáp án và tổng kết bài làm trên Academix.',
    keywords: ['Academix', 'chi tiết kết quả', 'đáp án'],
  },
  {
    path: '/my-course/manage-course/:id',
    title: 'Quản lý khóa học | Academix',
    description:
      'Công cụ quản lý nội dung khóa học dành cho giảng viên trên Academix.',
    keywords: ['Academix', 'quản lý khóa học', 'giảng viên'],
  },
  {
    path: '/auth/login',
    title: 'Đăng nhập | Academix',
    description:
      'Đăng nhập vào Academix để tiếp tục hành trình học tập trực tuyến của bạn.',
    keywords: ['Academix', 'đăng nhập', 'tài khoản'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/auth/register/student',
    title: 'Đăng ký học viên | Academix',
    description:
      'Tạo tài khoản học viên mới trên Academix để bắt đầu học trực tuyến.',
    keywords: ['Academix', 'đăng ký học viên', 'tạo tài khoản'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/auth/register/teacher',
    title: 'Đăng ký giảng viên | Academix',
    description:
      'Đăng ký trở thành giảng viên trên Academix và xây dựng khóa học của bạn.',
    keywords: ['Academix', 'đăng ký giảng viên', 'teacher'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin',
    title: 'Tổng quan quản trị | Academix',
    description:
      'Bảng điều khiển tổng quan cho hệ thống quản trị Academix.',
    keywords: ['Academix', 'admin dashboard', 'quản trị'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/dashboard',
    title: 'Dashboard quản trị | Academix',
    description:
      'Theo dõi số liệu vận hành và hiệu suất hệ thống trên dashboard Academix.',
    keywords: ['Academix', 'dashboard', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/courses',
    title: 'Quản lý khóa học | Academix Admin',
    description:
      'Quản lý danh sách khóa học, trạng thái và thông tin nội dung trên Academix Admin.',
    keywords: ['Academix', 'admin courses', 'quản lý khóa học'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/courses/review',
    title: 'Duyệt khóa học | Academix Admin',
    description:
      'Kiểm duyệt khóa học để xuất bản hoặc từ chối trên Academix.',
    keywords: ['Academix', 'duyệt khóa học', 'admin review'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/courses/:id',
    title: 'Chi tiết khóa học quản trị | Academix Admin',
    description:
      'Xem và xử lý chi tiết khóa học trong khu vực quản trị Academix.',
    keywords: ['Academix', 'admin course detail', 'quản trị khóa học'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/teachers',
    title: 'Quản lý giảng viên | Academix Admin',
    description:
      'Quản lý danh sách giảng viên và trạng thái hoạt động trên Academix.',
    keywords: ['Academix', 'admin teachers', 'quản lý giảng viên'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/students',
    title: 'Quản lý học viên | Academix Admin',
    description:
      'Quản lý tài khoản học viên, trạng thái học và các khóa học đang theo dõi trên Academix.',
    keywords: ['Academix', 'admin students', 'quản lý học viên'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/teacher-registrations',
    title: 'Đăng ký giảng viên | Academix Admin',
    description:
      'Kiểm duyệt và xử lý hồ sơ đăng ký giảng viên trên Academix.',
    keywords: ['Academix', 'teacher registrations', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/employees',
    title: 'Quản lý nhân sự | Academix Admin',
    description:
      'Quản lý tài khoản nhân sự và quyền hạn trong hệ thống Academix.',
    keywords: ['Academix', 'admin employees', 'quản lý nhân sự'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/recruitment',
    title: 'Tuyển dụng | Academix Admin',
    description:
      'Theo dõi và quản lý quy trình tuyển dụng nội bộ trên Academix.',
    keywords: ['Academix', 'recruitment', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/support',
    title: 'Hỗ trợ khách hàng | Academix Admin',
    description:
      'Xử lý ticket hỗ trợ và phản hồi học viên trong Academix.',
    keywords: ['Academix', 'support', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/chatbot',
    title: 'Quản lý chatbot | Academix Admin',
    description:
      'Quản lý nội dung và cấu hình chatbot trên Academix.',
    keywords: ['Academix', 'chatbot', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/assistant',
    title: 'Quản lý trợ lý ảo | Academix Admin',
    description:
      'Theo dõi và cấu hình trợ lý ảo học tập trong Academix.',
    keywords: ['Academix', 'assistant', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/reviews',
    title: 'Quản lý đánh giá | Academix Admin',
    description:
      'Kiểm duyệt và quản lý đánh giá khóa học từ học viên trên Academix.',
    keywords: ['Academix', 'reviews', 'đánh giá', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/permissions',
    title: 'Phân quyền hệ thống | Academix Admin',
    description:
      'Cấu hình vai trò và quyền truy cập cho nhân sự trên Academix.',
    keywords: ['Academix', 'permissions', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/revenue',
    title: 'Báo cáo doanh thu | Academix Admin',
    description:
      'Thống kê doanh thu và hiệu quả kinh doanh trong hệ thống Academix.',
    keywords: ['Academix', 'revenue', 'admin'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/profile',
    title: 'Hồ sơ quản trị viên | Academix Admin',
    description:
      'Quản lý thông tin tài khoản quản trị viên trên Academix.',
    keywords: ['Academix', 'admin profile'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/settings',
    title: 'Cài đặt quản trị | Academix Admin',
    description:
      'Cấu hình hệ thống quản trị và tài khoản trên Academix Admin.',
    keywords: ['Academix', 'admin settings'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/forgot-password',
    title: 'Khôi phục mật khẩu admin | Academix',
    description:
      'Khôi phục mật khẩu tài khoản quản trị trên hệ thống Academix.',
    keywords: ['Academix', 'admin forgot password'],
    robots: 'noindex, nofollow',
  },
  {
    path: '/admin/*',
    title: 'Trang quản trị | Academix',
    description:
      'Khu vực quản trị hệ thống Academix.',
    robots: 'noindex, nofollow',
  },
  {
    path: '/*',
    title: 'Không tìm thấy trang | Academix',
    description:
      'Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển trên Academix.',
    keywords: ['Academix', '404', 'not found'],
  },
];