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
      className="hero-section relative pt-0 pb-8 md:pt-1 md:pb-10 px-6 md:px-10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F4FCFF 0%, #E6F9FF 55%, #FFFFFF 100%)' }}
    >
      {/* Decorative Clouds */}
      <img src={Cloud1} alt="" className="absolute top-14 left-8 w-20 opacity-50 animate-float-slow hidden md:block" />
      <img src={Cloud2} alt="" className="absolute top-28 right-16 w-28 opacity-50 animate-float-slower hidden md:block" />

      {/* Floating Elements */}
      <div className="absolute top-10 right-[18%] hidden lg:block xl:right-1/4" data-aos="fade-down" data-aos-delay="500">
        <div className="bg-white rounded-2xl shadow-lg p-2.5 flex items-center gap-2.5 animate-float border border-[#30C2EC]/20">
          <div className="w-10 h-10 bg-gradient-to-br from-[#30C2EC] to-[#00B1F5] rounded-xl flex items-center justify-center">
            <StarFilled className="text-white text-lg" />
          </div>
          <div>
            <Text className="block text-xs text-gray-500">Đánh giá khóa học</Text>
            <Text className="font-bold text-sm text-[#012643]">4.9/5.0</Text>
          </div>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
          <div className="lg:w-1/2 z-10" data-aos="fade-right">
            <Badge.Ribbon text="Nền tảng học tập #1" color="#00B1F5" className="!-ml-6">
              <div className="pt-3 md:pt-4">
                <Title level={1} className="!text-3xl sm:!text-4xl md:!text-[2.5rem] !font-bold !mb-4 !text-[#012643] !leading-tight">
                  Khai phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-[#00B1F5]">Tiềm năng</span> với nền tảng học tập đẳng cấp
                </Title>
              </div>
            </Badge.Ribbon>
            <Paragraph className="text-sm md:text-base text-gray-600 mb-3 max-w-xl">
              Tham gia cùng hàng triệu học viên và thay đổi sự nghiệp của bạn với các khóa học chuyên sâu, dự án thực hành và cộng đồng hỗ trợ.
            </Paragraph>
            
            {/* Search Box */}
            <div className="bg-white p-1.5 md:p-2 rounded-xl shadow-lg border border-[#30C2EC]/20 max-w-xl mb-5">
              <div className="flex flex-col md:flex-row items-center gap-1.5">
                <div className="flex-1 w-full md:w-auto px-3 border-b md:border-b-0 md:border-r border-gray-200 py-1.5 md:py-0">
                  <div className="flex items-center gap-2">
                    <SearchOutlined className="text-[#30C2EC] text-base" />
                    <Input 
                      placeholder="Bạn muốn học gì?" 
                      bordered={false} 
                      className="!text-xs md:!text-sm !p-0 hover:bg-transparent focus:bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full md:w-auto px-3 py-1.5 md:py-0">
                  <div className="flex items-center gap-2">
                    <AppstoreOutlined className="text-[#30C2EC] text-base" />
                    <Select 
                      placeholder="Danh mục" 
                      bordered={false}
                      className="w-full !text-xs md:!text-sm"
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
                  className="w-full md:w-auto !h-9 md:!h-10 !px-5 !rounded-xl !bg-gradient-to-r from-[#30C2EC] to-[#00B1F5] !border-none shadow-md font-semibold !text-sm"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-9 h-9 bg-[#30C2EC]/15 rounded-full flex items-center justify-center">
                  <PlayCircleOutlined className="text-[#00B1F5] text-base" />
                </div>
                <div>
                  <Text className="font-semibold text-[#012643] block text-sm md:text-base">500+ Khóa học</Text>
                  <Text className="text-xs text-gray-500">Học theo tốc độ của bạn</Text>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
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
          
          <div className="lg:w-1/2 relative mt-3 lg:mt-0" data-aos="fade-left">
            <div className="relative z-10 animate-float">
              <img 
                src={MainBg} 
                alt="Hero Banner" 
                className="w-full max-w-[460px] mx-auto h-auto object-contain drop-shadow-2xl"
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
