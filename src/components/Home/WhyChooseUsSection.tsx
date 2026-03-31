import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import { TeamOutlined, ClockCircleOutlined, SafetyCertificateOutlined, GlobalOutlined, PlayCircleOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <TeamOutlined />,
    title: 'Giảng viên chuyên gia',
    description: 'Học từ các chuyên gia trong ngành, những người đam mê giảng dạy và giúp bạn thành công.',
    color: '#17EAD9',
    bgGradient: 'from-cyan-50 to-teal-50',
  },
  {
    icon: <ClockCircleOutlined />,
    title: 'Học tập linh hoạt',
    description: 'Học theo tốc độ của bạn, mọi lúc, mọi nơi. Nền tảng được thiết kế phù hợp với lịch trình của bạn.',
    color: '#6078EA',
    bgGradient: 'from-blue-50 to-indigo-50',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Khóa học có chứng chỉ',
    description: 'Nhận chứng chỉ được công nhận khi hoàn thành để nâng cao sự nghiệp và hồ sơ chuyên môn.',
    color: '#e5698e',
    bgGradient: 'from-pink-50 to-rose-50',
  },
  {
    icon: <GlobalOutlined />,
    title: 'Cộng đồng toàn cầu',
    description: 'Kết nối với học viên trên toàn thế giới và mở rộng mạng lưới chuyên môn của bạn.',
    color: '#FFCE00',
    bgGradient: 'from-yellow-50 to-amber-50',
  },
  {
    icon: <PlayCircleOutlined />,
    title: 'Nội dung tương tác',
    description: 'Trải nghiệm với video, bài kiểm tra và dự án thực hành giúp việc học trở nên thú vị và hiệu quả.',
    color: '#10B981',
    bgGradient: 'from-emerald-50 to-green-50',
  },
  {
    icon: <CustomerServiceOutlined />,
    title: 'Hỗ trợ 24/7',
    description: 'Nhận hỗ trợ bất cứ lúc nào với đội ngũ hỗ trợ tận tâm luôn sẵn sàng phục vụ.',
    color: '#8B5CF6',
    bgGradient: 'from-violet-50 to-purple-50',
  },
];

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-100 rounded-full opacity-30 blur-3xl"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-block px-4 py-2 bg-[#e5698e]/10 rounded-full mb-4">
            <span className="text-[#e5698e] font-semibold">✨ Tại sao chọn chúng tôi</span>
          </div>
          <Title level={2} className="!text-3xl md:!text-4xl !font-bold !mb-4 !text-[#012643]">
            Tất cả những gì bạn cần để <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17EAD9] to-[#6078EA]">Thành công</span>
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp môi trường học tập toàn diện giúp bạn đạt được mục tiêu với các công cụ và tài nguyên tiên tiến.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
              <Card 
                className={`h-full border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br ${feature.bgGradient}`}
                bodyStyle={{ padding: '32px' }}
              >
                <div 
                  className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <Title level={4} className="!mb-3 !text-[#012643] group-hover:!text-opacity-80 transition-colors">
                  {feature.title}
                </Title>
                <Paragraph className="text-gray-500 mb-0 text-base">
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
