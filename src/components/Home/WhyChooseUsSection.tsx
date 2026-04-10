import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import { TeamOutlined, ClockCircleOutlined, SafetyCertificateOutlined, GlobalOutlined, PlayCircleOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <TeamOutlined />,
    title: 'Giảng viên chuyên gia',
    description: 'Học từ các chuyên gia trong ngành, những người đam mê giảng dạy và giúp bạn thành công.',
    color: '#30C2EC',
    bgGradient: 'from-cyan-50 to-sky-50',
  },
  {
    icon: <ClockCircleOutlined />,
    title: 'Học tập linh hoạt',
    description: 'Học theo tốc độ của bạn, mọi lúc, mọi nơi. Nền tảng được thiết kế phù hợp với lịch trình của bạn.',
    color: '#00B1F5',
    bgGradient: 'from-sky-50 to-cyan-100',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Khóa học có chứng chỉ',
    description: 'Nhận chứng chỉ được công nhận khi hoàn thành để nâng cao sự nghiệp và hồ sơ chuyên môn.',
    color: '#30C2EC',
    bgGradient: 'from-cyan-50 to-blue-50',
  },
  {
    icon: <GlobalOutlined />,
    title: 'Cộng đồng toàn cầu',
    description: 'Kết nối với học viên trên toàn thế giới và mở rộng mạng lưới chuyên môn của bạn.',
    color: '#00B1F5',
    bgGradient: 'from-sky-50 to-cyan-50',
  },
  {
    icon: <PlayCircleOutlined />,
    title: 'Nội dung tương tác',
    description: 'Trải nghiệm với video, bài kiểm tra và dự án thực hành giúp việc học trở nên thú vị và hiệu quả.',
    color: '#30C2EC',
    bgGradient: 'from-cyan-50 to-sky-50',
  },
  {
    icon: <CustomerServiceOutlined />,
    title: 'Hỗ trợ 24/7',
    description: 'Nhận hỗ trợ bất cứ lúc nào với đội ngũ hỗ trợ tận tâm luôn sẵn sàng phục vụ.',
    color: '#00B1F5',
    bgGradient: 'from-sky-50 to-cyan-100',
  },
];

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#f3fbff] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#30C2EC]/20 rounded-full opacity-60 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#00B1F5]/20 rounded-full opacity-60 blur-3xl"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-12 md:mb-14" data-aos="fade-up">
          <div className="inline-block px-4 py-2 bg-[#30C2EC]/10 rounded-full mb-4">
            <span className="text-[#00B1F5] font-semibold">✨ Tại sao chọn chúng tôi</span>
          </div>
          <Title level={2} className="!text-2xl md:!text-3xl !font-bold !mb-3 !text-[#012643]">
            Tất cả những gì bạn cần để <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-[#00B1F5]">Thành công</span>
          </Title>
          <Paragraph className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp môi trường học tập toàn diện giúp bạn đạt được mục tiêu với các công cụ và tài nguyên tiên tiến.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
              <Card 
                className={`h-full border border-[#30C2EC]/15 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br ${feature.bgGradient}`}
                bodyStyle={{ padding: '28px' }}
              >
                <div 
                  className="w-14 h-14 mb-5 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <Title level={4} className="!mb-2 !text-[#012643] group-hover:!text-[#00B1F5] transition-colors">
                  {feature.title}
                </Title>
                <Paragraph className="text-gray-600 mb-0 text-sm md:text-base">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
