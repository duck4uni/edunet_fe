import React from 'react';
import { Typography } from 'antd';
import {
  TeamOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <TeamOutlined />,
    title: 'Giảng viên chuyên gia',
    description: 'Học từ các chuyên gia trong ngành, những người đam mê giảng dạy và giúp bạn thành công.',
    color: '#30C2EC',
    bgGradient: 'from-white via-[#f4fcff] to-[#edf9ff]',
  },
  {
    icon: <ClockCircleOutlined />,
    title: 'Học tập linh hoạt',
    description: 'Học theo tốc độ của bạn, mọi lúc, mọi nơi. Nền tảng được thiết kế phù hợp với lịch trình của bạn.',
    color: '#00B1F5',
    bgGradient: 'from-white via-[#f2fbff] to-[#e8f7ff]',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Khóa học có chứng chỉ',
    description: 'Nhận chứng chỉ được công nhận khi hoàn thành để nâng cao sự nghiệp và hồ sơ chuyên môn.',
    color: '#30C2EC',
    bgGradient: 'from-white via-[#f4fcff] to-[#edf7ff]',
  },
  {
    icon: <GlobalOutlined />,
    title: 'Cộng đồng toàn cầu',
    description: 'Kết nối với học viên trên toàn thế giới và mở rộng mạng lưới chuyên môn của bạn.',
    color: '#00B1F5',
    bgGradient: 'from-white via-[#f2fbff] to-[#eaf9ff]',
  },
  {
    icon: <PlayCircleOutlined />,
    title: 'Nội dung tương tác',
    description: 'Trải nghiệm với video, bài kiểm tra và dự án thực hành giúp việc học trở nên thú vị và hiệu quả.',
    color: '#30C2EC',
    bgGradient: 'from-white via-[#f4fcff] to-[#edf9ff]',
  },
  {
    icon: <CustomerServiceOutlined />,
    title: 'Hỗ trợ 24/7',
    description: 'Nhận hỗ trợ bất cứ lúc nào với đội ngũ hỗ trợ tận tâm luôn sẵn sàng phục vụ.',
    color: '#00B1F5',
    bgGradient: 'from-white via-[#f2fbff] to-[#e8f7ff]',
  },
];

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#f3fbff] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#30C2EC]/20 rounded-full opacity-60 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#00B1F5]/20 rounded-full opacity-60 blur-3xl"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14" data-aos="fade-up">
          <div className="text-center md:text-left">
            <Title level={2} className="!text-2xl md:!text-3xl !font-bold !mb-3 !text-[#012643]">
              Tất cả những gì bạn cần để <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-[#00B1F5]">Thành công</span>
            </Title>
            <Paragraph className="text-base md:text-lg text-gray-600 max-w-2xl">
              Chúng tôi cung cấp môi trường học tập toàn diện giúp bạn đạt được mục tiêu với các công cụ và tài nguyên tiên tiến.
            </Paragraph>
          </div>

          <div className="flex items-center gap-3 self-center md:self-auto">
            <button
              type="button"
              aria-label="Xem thẻ trước"
              className="why-choose-prev w-11 h-11 rounded-xl border border-[#30C2EC]/25 bg-white/90 backdrop-blur-sm text-[#00B1F5] shadow-[0_10px_24px_rgba(48,194,236,0.22)] hover:bg-gradient-to-r hover:from-[#30C2EC] hover:to-[#00B1F5] hover:text-white hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <LeftOutlined className="text-base" />
            </button>
            <button
              type="button"
              aria-label="Xem thẻ tiếp theo"
              className="why-choose-next w-11 h-11 rounded-xl border border-[#30C2EC]/25 bg-white/90 backdrop-blur-sm text-[#00B1F5] shadow-[0_10px_24px_rgba(48,194,236,0.22)] hover:bg-gradient-to-r hover:from-[#30C2EC] hover:to-[#00B1F5] hover:text-white hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <RightOutlined className="text-base" />
            </button>
          </div>
        </div>

        <div data-aos="fade-up" data-aos-delay="120">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={22}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1.25 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation={{
              prevEl: '.why-choose-prev',
              nextEl: '.why-choose-next',
              addIcons: false,
            }}
            autoplay={{
              delay: 3800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            className="why-choose-swiper pb-14"
          >
            {features.map((feature) => (
              <SwiperSlide key={feature.title} className="!h-auto pb-1">
                <article className="group relative h-full rounded-[26px] p-[1px] bg-gradient-to-br from-[#30C2EC]/70 via-[#00B1F5]/40 to-[#30C2EC]/60 transition-all duration-500 hover:-translate-y-2">
                  <div className={`relative h-full rounded-[25px] bg-gradient-to-br ${feature.bgGradient} border border-white/80 shadow-[0_16px_40px_rgba(0,177,245,0.16)] overflow-hidden p-6 md:p-7`}>
                    <div className="absolute -top-16 -right-10 w-36 h-36 bg-[#30C2EC]/20 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-90"></div>
                    <div className="absolute -bottom-14 -left-10 w-32 h-32 bg-[#00B1F5]/20 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125"></div>

                    <div className="relative z-10">
                      <div
                        className="w-14 h-14 mb-5 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_12px_28px_rgba(0,177,245,0.28)]"
                        style={{ backgroundColor: `${feature.color}22`, color: feature.color }}
                      >
                        {feature.icon}
                      </div>

                      <Title level={4} className="!mb-2 !text-[#012643] group-hover:!text-[#00B1F5] transition-colors duration-300">
                        {feature.title}
                      </Title>
                      <Paragraph className="text-gray-600 mb-0 text-sm md:text-base">
                        {feature.description}
                      </Paragraph>

                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#00B1F5]">
                        <span className="w-2 h-2 rounded-full bg-[#00B1F5] animate-pulse"></span>
                        Trải nghiệm học tập hiện đại
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
