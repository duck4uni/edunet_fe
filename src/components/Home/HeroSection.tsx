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
      className="hero-section relative pt-12 pb-20 md:pt-20 md:pb-32 px-6 md:px-12 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F3F8FF 0%, #E8F4FD 50%, #FFFFFF 100%)' }}
    >
      {/* Decorative Clouds */}
      <img src={Cloud1} alt="" className="absolute top-20 left-10 w-24 opacity-60 animate-float-slow hidden md:block" />
      <img src={Cloud2} alt="" className="absolute top-40 right-20 w-32 opacity-60 animate-float-slower hidden md:block" />

      {/* Floating Elements */}
      <div className="absolute top-32 right-1/4 hidden lg:block" data-aos="fade-down" data-aos-delay="500">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <StarFilled className="text-white text-xl" />
          </div>
          <div>
            <Text className="block text-xs text-gray-500">Đánh giá khóa học</Text>
            <Text className="font-bold text-lg text-[#012643]">4.9/5.0</Text>
          </div>
        </div>
      </div>

      <div className="absolute bottom-40 left-1/4 hidden lg:block" data-aos="fade-up" data-aos-delay="700">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float-slow">
          <div className="flex -space-x-2">
            <img src="https://randomuser.me/api/portraits/women/1.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
            <img src="https://randomuser.me/api/portraits/men/1.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
            <img src="https://randomuser.me/api/portraits/women/2.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
          </div>
          <div>
            <Text className="block text-xs text-gray-500">Học viên đang hoạt động</Text>
            <Text className="font-bold text-[#012643]">10,000+</Text>
          </div>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="lg:w-1/2 z-10" data-aos="fade-right">
            <Badge.Ribbon text="🎓 Nền tảng học tập #1" color="#e5698e" className="!-ml-6">
              <div className="pt-8">
                <Title level={1} className="!text-4xl sm:!text-5xl md:!text-6xl !font-bold !mb-6 !text-[#012643] !leading-tight">
                  Khai phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17EAD9] to-[#6078EA]">Tiềm năng</span> với nền tảng học tập đẳng cấp
                </Title>
              </div>
            </Badge.Ribbon>
            <Paragraph className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
              Tham gia cùng hàng triệu học viên và thay đổi sự nghiệp của bạn với các khóa học chuyên sâu, dự án thực hành và cộng đồng hỗ trợ.
            </Paragraph>
            
            {/* Search Box */}
            <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mb-8">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 w-full md:w-auto px-4 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0">
                  <div className="flex items-center gap-3">
                    <SearchOutlined className="text-gray-400 text-xl" />
                    <Input 
                      placeholder="Bạn muốn học gì?" 
                      bordered={false} 
                      className="!text-base !p-0 hover:bg-transparent focus:bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full md:w-auto px-4 py-2 md:py-0">
                  <div className="flex items-center gap-3">
                    <AppstoreOutlined className="text-gray-400 text-xl" />
                    <Select 
                      placeholder="Danh mục" 
                      bordered={false}
                      className="w-full !text-base"
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
                  className="w-full md:w-auto !h-12 !px-8 !rounded-xl !bg-gradient-to-r from-[#17EAD9] to-[#6078EA] !border-none hover:!opacity-90 shadow-md font-semibold"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <PlayCircleOutlined className="text-green-600 text-lg" />
                </div>
                <div>
                  <Text className="font-bold text-[#012643] block">500+ Khóa học</Text>
                  <Text className="text-xs text-gray-500">Học theo tốc độ của bạn</Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <StarFilled className="text-purple-600 text-lg" />
                </div>
                <div>
                  <Text className="font-bold text-[#012643] block">Giảng viên chuyên gia</Text>
                  <Text className="text-xs text-gray-500">Chuyên gia hàng đầu</Text>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative mt-8 lg:mt-0" data-aos="fade-left">
            <div className="relative z-10 animate-float">
              <img 
                src={MainBg} 
                alt="Hero Banner" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
            {/* Decorative shapes */}
            <div className="absolute top-10 -right-10 w-32 h-32 bg-[#17EAD9] rounded-full opacity-20 blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#6078EA] rounded-full opacity-20 blur-2xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 right-0 w-24 h-24 bg-[#e5698e] rounded-full opacity-20 blur-2xl animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
