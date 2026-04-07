import React from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AdminNotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <Result
          status="404"
          title={
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-[#012643]">404</h1>
              <p className="text-xl text-gray-700">Trang không tồn tại</p>
            </div>
          }
          subTitle={
            <div className="space-y-4">
              <p className="text-base text-gray-600">
                Trang quản trị bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Mã lỗi: 404 - Không tìm thấy trang</span>
              </div>
            </div>
          }
          extra={
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate('/admin')}
                className="!bg-[#013a5f] !border-[#013a5f] hover:!bg-[#013a5f] hover:!border-[#013a5f] !h-11 !px-8 !rounded-lg"
              >
                Về trang quản trị
              </Button>
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                className="!h-11 !px-8 !rounded-lg"
              >
                Quay lại
              </Button>
            </div>
          }
        />

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-4">Truy cập nhanh:</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button
              onClick={() => navigate('/admin/courses')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Quản lý khóa học
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/admin/teachers')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Quản lý giáo viên
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/admin/support')}
              className="text-[#012643] hover:text-[#013a5f] font-medium hover:underline transition-colors"
            >
              Hỗ trợ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFound;
