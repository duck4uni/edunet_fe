import React from 'react';
import { Button, Typography, Row, Col } from 'antd';
import { ArrowRightOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const benefits = [
  'Truy cập khóa học trọn đời',
  'Chứng chỉ khi hoàn thành',
  'Hỗ trợ chuyên gia 24/7',
  'Đảm bảo hoàn tiền',
];

const CTASection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f2fcff] via-[#e5f9ff] to-[#f7fdff] z-0"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#30C2EC] opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00B1F5] opacity-15 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl animate-pulse delay-500"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] border border-[#30C2EC]/15 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] border border-[#00B1F5]/10 rounded-full"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-[#30C2EC] rounded-full animate-bounce delay-100"></div>
      <div className="absolute bottom-20 right-32 w-3 h-3 bg-[#00B1F5] rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-1/3 right-20 w-2 h-2 bg-[#30C2EC] rounded-full animate-bounce delay-500"></div>

      <div className="container mx-auto px-6 relative z-10">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={14}>
            <div data-aos="fade-right">
              <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-5 border border-[#30C2EC]/25">
                <span className="text-[#00B1F5] font-semibold">Bắt đầu học ngay</span>
              </div>
              <Title level={1} className="!text-3xl sm:!text-4xl md:!text-[2.75rem] !font-bold !text-[#012643] !mb-5 !leading-tight">
                Sẵn sàng thay đổi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-[#00B1F5]">Sự nghiệp?</span>
              </Title>
              <Paragraph className="text-base md:text-lg text-[#012643]/80 mb-7 max-w-xl">
                Tham gia cùng hàng nghìn học viên và bắt đầu học các kỹ năng cần thiết cho sự nghiệp tương lai của bạn ngay hôm nay. Không cần thẻ tín dụng.
              </Paragraph>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-[#00B1F5] text-lg" />
                    <Text className="text-[#012643]">{benefit}</Text>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register/student">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="w-full sm:w-auto !h-12 !px-8 !text-base !font-semibold !rounded-xl !bg-gradient-to-r from-[#00B1F5] to-[#30C2EC] !border-none shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                  >
                    Bắt đầu miễn phí <ArrowRightOutlined />
                  </Button>
                </Link>
                <Link to="/auth/register/teacher">
                  <Button 
                    size="large" 
                    className="w-full sm:w-auto !h-12 !px-8 !text-base !font-semibold !rounded-xl !bg-white !border !border-[#00B1F5] !text-[#00B1F5] hover:!bg-[#00B1F5] hover:!text-white"
                    icon={<PlayCircleOutlined />}
                  >
                    Trở thành giảng viên
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={10} className="hidden lg:block">
            <div data-aos="fade-left">
              <div className="relative">
                {/* Decorative Card Stack */}
                <div className="absolute -top-4 -left-4 w-64 h-40 bg-white/60 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-[#30C2EC]/20"></div>
                <div className="absolute -bottom-4 -right-4 w-64 h-40 bg-white/60 backdrop-blur-sm rounded-2xl transform rotate-6 border border-[#00B1F5]/20"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/85 backdrop-blur-md rounded-2xl p-7 border border-[#30C2EC]/25 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#30C2EC] to-[#00B1F5] rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🎓</span>
                    </div>
                    <div>
                      <Text className="text-[#012643] font-bold text-lg block">Tham gia 10,000+</Text>
                      <Text className="text-[#012643]/70">Học viên hài lòng</Text>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Text className="text-[#012643]/70">Khóa học hoàn thành</Text>
                      <Text className="text-[#012643] font-bold">500+</Text>
                    </div>
                    <div className="w-full bg-[#30C2EC]/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#30C2EC] to-[#00B1F5] h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text className="text-[#012643]/70">Tỷ lệ hài lòng</Text>
                      <Text className="text-[#012643] font-bold">98%</Text>
                    </div>
                    <div className="w-full bg-[#30C2EC]/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#00B1F5] to-[#30C2EC] h-2 rounded-full w-[98%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default CTASection;
