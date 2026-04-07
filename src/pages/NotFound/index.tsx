import React from 'react';
import { Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full text-center">
        {/* Animated 404 Illustration */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
          </div>
          <div className="relative">
            <svg
              className="w-full max-w-2xl mx-auto"
              viewBox="0 0 800 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 404 Text */}
              <text
                x="400"
                y="200"
                fontSize="160"
                fontWeight="bold"
                fill="#012643"
                textAnchor="middle"
                dominantBaseline="middle"
                className="animate-pulse"
              >
                404
              </text>
              
              {/* Decorative Elements */}
              <circle cx="120" cy="100" r="30" fill="#60A5FA" opacity="0.3" className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
              <circle cx="680" cy="120" r="40" fill="#3B82F6" opacity="0.2" className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
              <circle cx="150" cy="300" r="25" fill="#93C5FD" opacity="0.4" className="animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
              <circle cx="650" cy="280" r="35" fill="#2563EB" opacity="0.25" className="animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }} />
              
              {/* Book Icon */}
              <g transform="translate(280, 240)">
                <rect x="0" y="0" width="80" height="60" rx="4" fill="#012643" opacity="0.8" />
                <rect x="8" y="8" width="32" height="44" rx="2" fill="#60A5FA" opacity="0.3" />
                <rect x="44" y="8" width="28" height="44" rx="2" fill="#3B82F6" opacity="0.3" />
                <line x1="20" y1="20" x2="32" y2="20" stroke="white" strokeWidth="2" />
                <line x1="20" y1="28" x2="32" y2="28" stroke="white" strokeWidth="2" />
                <line x1="52" y1="20" x2="64" y2="20" stroke="white" strokeWidth="2" />
                <line x1="52" y1="28" x2="64" y2="28" stroke="white" strokeWidth="2" />
              </g>
              
              {/* Magnifying Glass */}
              <g transform="translate(440, 240)">
                <circle cx="25" cy="25" r="20" stroke="#012643" strokeWidth="4" fill="none" opacity="0.8" />
                <line x1="40" y1="40" x2="55" y2="55" stroke="#012643" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                <circle cx="25" cy="25" r="12" fill="#60A5FA" opacity="0.2" />
              </g>
              
              {/* Stars */}
              <path d="M100 200 L105 215 L120 215 L108 224 L113 239 L100 230 L87 239 L92 224 L80 215 L95 215 Z" fill="#FCD34D" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
              <path d="M700 200 L703 210 L713 210 L705 216 L708 226 L700 220 L692 226 L695 216 L687 210 L697 210 Z" fill="#FCD34D" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#012643] mb-4">
            Oops! Trang không tồn tại
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Có vẻ như bạn đã đi lạc đường. Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Mã lỗi: 404 - Không tìm thấy trang</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            className="!bg-[#013a5f] !border-[#013a5f] hover:!bg-[#013a5f] hover:!border-[#013a5f] !h-12 !px-8 !rounded-lg !text-base font-medium shadow-lg"
          >
            Về trang chủ
          </Button>
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            className="!h-12 !px-8 !rounded-lg !text-base font-medium !border-2 !border-[#012643] !text-[#012643] hover:!border-[#012643] hover:!text-[#012643]"
          >
            Quay lại trang trước
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">Hoặc bạn có thể truy cập:</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button
              onClick={() => navigate('/courses')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Khóa học
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/schedule')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Lịch học
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/my-course')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Khóa học của tôi
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/profile')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Hồ sơ cá nhân
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
