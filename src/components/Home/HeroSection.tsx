import React from 'react';
import { Button, Input, Select, Typography, Badge } from 'antd';
import { SearchOutlined, AppstoreOutlined, PlayCircleOutlined, StarFilled } from '@ant-design/icons';
import MainBg from '../../assets/images/main-bg.png';
import Cloud1 from '../../assets/images/cloud-1.png';
import Cloud2 from '../../assets/images/cloud-2.png';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const HeroSection: React.FC = () => {
  return (
    <section 
      className="hero-section relative pt-2 pb-14 md:pt-4 md:pb-20 px-6 md:px-10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F4FCFF 0%, #E6F9FF 55%, #FFFFFF 100%)' }}
    >
      {/* Decorative Clouds */}
      <img src={Cloud1} alt="" className="absolute top-14 left-8 w-20 opacity-50 animate-float-slow hidden md:block" />
      <img src={Cloud2} alt="" className="absolute top-28 right-16 w-28 opacity-50 animate-float-slower hidden md:block" />

      {/* Floating Elements */}
      <div className="absolute top-24 right-1/4 hidden lg:block" data-aos="fade-down" data-aos-delay="500">
        <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-float border border-[#30C2EC]/20">
          <div className="w-11 h-11 bg-gradient-to-br from-[#30C2EC] to-[#00B1F5] rounded-xl flex items-center justify-center">
            <StarFilled className="text-white text-xl" />
          </div>
          <div>
            <Text className="block text-xs text-gray-500">Đánh giá khóa học</Text>
            <Text className="font-bold text-base text-[#012643]">4.9/5.0</Text>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 left-1/4 hidden lg:block" data-aos="fade-up" data-aos-delay="700">
        <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-float-slow border border-[#30C2EC]/20">
          <div className="flex -space-x-2">
            <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Học viên 1" className="w-8 h-8 rounded-full border-2 border-white" />
            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Học viên 2" className="w-8 h-8 rounded-full border-2 border-white" />
            <img src="https://randomuser.me/api/portraits/women/2.jpg" alt="Học viên 3" className="w-8 h-8 rounded-full border-2 border-white" />
          </div>
          <div>
            <Text className="block text-xs text-gray-500">Học viên đang hoạt động</Text>
            <Text className="font-bold text-[#012643]">10,000+</Text>
          </div>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="lg:w-1/2 z-10" data-aos="fade-right">
            <Badge.Ribbon text="🎓 Nền tảng học tập #1" color="#00B1F5" className="!-ml-6">
              <div className="pt-6 md:pt-7">
                <Title level={1} className="!text-3xl sm:!text-4xl md:!text-5xl !font-bold !mb-4 !text-[#012643] !leading-tight">
                  Khai phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-[#00B1F5]">Tiềm năng</span> với nền tảng học tập đẳng cấp
                </Title>
              </div>
            </Badge.Ribbon>
            <Paragraph className="text-base md:text-lg text-gray-600 mb-6 max-w-xl">
              Tham gia cùng hàng triệu học viên và thay đổi sự nghiệp của bạn với các khóa học chuyên sâu, dự án thực hành và cộng đồng hỗ trợ.
            </Paragraph>
            
            {/* Search Box */}
            <div className="bg-white p-2 md:p-2.5 rounded-2xl shadow-lg border border-[#30C2EC]/20 max-w-2xl mb-6">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 w-full md:w-auto px-4 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0">
                  <div className="flex items-center gap-3">
                    <SearchOutlined className="text-[#30C2EC] text-lg" />
                    <Input 
                      placeholder="Bạn muốn học gì?" 
                      bordered={false} 
                      className="!text-sm md:!text-base !p-0 hover:bg-transparent focus:bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full md:w-auto px-4 py-2 md:py-0">
                  <div className="flex items-center gap-3">
                    <AppstoreOutlined className="text-[#30C2EC] text-lg" />
                    <Select 
                      placeholder="Danh mục" 
                      bordered={false}
                      className="w-full !text-sm md:!text-base"
                      dropdownStyle={{ borderRadius: '12px', padding: '8px' }}
                    >
                      <Option value="design">Thiết kế</Option>
                      <Option value="development">Lập trình</Option>
                      <Option value="marketing">Marketing</Option>
                      <Option value="business">Kinh doanh</Option>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="large" 
                  className="w-full md:w-auto !h-11 !px-7 !rounded-xl !bg-gradient-to-r from-[#30C2EC] to-[#00B1F5] !border-none shadow-md font-semibold"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#30C2EC]/15 rounded-full flex items-center justify-center">
                  <PlayCircleOutlined className="text-[#00B1F5] text-base" />
                </div>
                <div>
                  <Text className="font-semibold text-[#012643] block text-sm md:text-base">500+ Khóa học</Text>
                  <Text className="text-xs text-gray-500">Học theo tốc độ của bạn</Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#00B1F5]/15 rounded-full flex items-center justify-center">
                  <StarFilled className="text-[#00B1F5] text-base" />
                </div>
                <div>
                  <Text className="font-semibold text-[#012643] block text-sm md:text-base">Giảng viên chuyên gia</Text>
                  <Text className="text-xs text-gray-500">Chuyên gia hàng đầu</Text>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative mt-6 lg:mt-0" data-aos="fade-left">
            <div className="relative z-10 animate-float">
              <img 
                src={MainBg} 
                alt="Hero Banner" 
                className="w-full max-w-[540px] mx-auto h-auto object-contain drop-shadow-2xl"
              />
            </div>
            {/* Decorative shapes */}
            <div className="absolute top-8 -right-8 w-28 h-28 bg-[#30C2EC] rounded-full opacity-20 blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#00B1F5] rounded-full opacity-20 blur-2xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 right-0 w-20 h-20 bg-[#30C2EC] rounded-full opacity-20 blur-2xl animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
