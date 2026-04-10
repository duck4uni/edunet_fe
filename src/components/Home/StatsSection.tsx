import React from 'react';
import { Row, Col, Typography } from 'antd';
import { UserOutlined, ReadOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const stats = [
  {
    icon: <UserOutlined />,
    count: '10k+',
    label: 'Học viên tích cực',
    color: '#30C2EC',
    bgColor: 'rgba(48, 194, 236, 0.18)',
  },
  {
    icon: <ReadOutlined />,
    count: '500+',
    label: 'Khóa học chất lượng',
    color: '#00B1F5',
    bgColor: 'rgba(0, 177, 245, 0.18)',
  },
  {
    icon: <TrophyOutlined />,
    count: '100+',
    label: 'Giải thưởng',
    color: '#30C2EC',
    bgColor: 'rgba(48, 194, 236, 0.12)',
  },
  {
    icon: <GlobalOutlined />,
    count: '50+',
    label: 'Quốc gia',
    color: '#00B1F5',
    bgColor: 'rgba(0, 177, 245, 0.12)',
  },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-[#012643] via-[#00B1F5] to-[#012643] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white/40"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-4 border-white/30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-white/30"></div>
      </div>

      {/* Floating Dots */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-[#30C2EC] rounded-full animate-ping"></div>
      <div className="absolute bottom-20 left-32 w-2 h-2 bg-[#00B1F5] rounded-full animate-ping delay-300"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10" data-aos="fade-up">
          <Title level={2} className="!text-2xl md:!text-3xl !font-bold !text-white !mb-2">
            Thành tựu của chúng tôi qua con số
          </Title>
          <Text className="text-white/90 text-base md:text-lg">Tham gia cộng đồng học viên đang ngày càng lớn mạnh toàn cầu</Text>
        </div>

        <Row gutter={[24, 24]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} md={6} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="text-center group cursor-pointer">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <Title level={2} className="!text-white !mb-0 !text-3xl md:!text-4xl font-bold">
                  {stat.count}
                </Title>
                <Text className="text-white/90 text-sm md:text-base">
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
