import React from 'react';
import { Row, Col, Typography } from 'antd';
import { UserOutlined, ReadOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const stats = [
  {
    icon: <UserOutlined />,
    count: '10k+',
    label: 'Học viên tích cực',
    color: '#17EAD9',
    bgColor: 'rgba(23, 234, 217, 0.15)',
  },
  {
    icon: <ReadOutlined />,
    count: '500+',
    label: 'Khóa học chất lượng',
    color: '#6078EA',
    bgColor: 'rgba(96, 120, 234, 0.15)',
  },
  {
    icon: <TrophyOutlined />,
    count: '100+',
    label: 'Giải thưởng',
    color: '#e5698e',
    bgColor: 'rgba(229, 105, 142, 0.15)',
  },
  {
    icon: <GlobalOutlined />,
    count: '50+',
    label: 'Quốc gia',
    color: '#FFCE00',
    bgColor: 'rgba(255, 206, 0, 0.15)',
  },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#012643] via-[#01385f] to-[#012643] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-4 border-white"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-white"></div>
      </div>

      {/* Floating Dots */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-[#17EAD9] rounded-full animate-ping"></div>
      <div className="absolute bottom-20 left-32 w-2 h-2 bg-[#e5698e] rounded-full animate-ping delay-300"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12" data-aos="fade-up">
          <Title level={2} className="!text-3xl md:!text-4xl !font-bold !text-white !mb-3">
            Thành tựu của chúng tôi qua con số
          </Title>
          <Text className="text-blue-200 text-lg">Tham gia cộng đồng học viên đang ngày càng lớn mạnh toàn cầu</Text>
        </div>

        <Row gutter={[32, 32]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} md={6} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="text-center group cursor-pointer">
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <Title level={2} className="!text-white !mb-0 !text-4xl md:!text-5xl font-bold">
                  {stat.count}
                </Title>
                <Text className="text-gray-300 text-base md:text-lg">
                  {stat.label}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default StatsSection;
