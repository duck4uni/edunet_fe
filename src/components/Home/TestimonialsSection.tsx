import React from 'react';
import { Typography, Avatar, Rate, Card } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const { Title, Paragraph, Text } = Typography;

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    role: 'Nhà thiết kế UX tại FPT Software',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    comment: "EduNet đã hoàn toàn thay đổi sự nghiệp của tôi. Các khóa học được tổ chức bài bản và giảng viên rất xuất sắc. Tôi rất khuyến khích cho bất kỳ ai muốn nâng cao kỹ năng.",
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    role: 'Lập trình viên cao cấp tại VNG',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    comment: "Các dự án thực hành trong khóa học lập trình web đã giúp tôi xây dựng portfolio và được tuyển dụng. Cộng đồng hỗ trợ cũng rất tuyệt vời.",
  },
  {
    id: 3,
    name: 'Lê Thị Hương',
    role: 'Trưởng phòng Marketing tại Shopee',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4,
    comment: "Nội dung tuyệt vời và lịch học linh hoạt. Tôi có thể học theo tốc độ của mình trong khi vẫn làm việc toàn thời gian. Các chiến lược marketing học được có thể áp dụng ngay.",
  },
  {
    id: 4,
    name: 'Phạm Đức Anh',
    role: 'Nhà khoa học dữ liệu tại Tiki',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    rating: 5,
    comment: "Lộ trình khoa học dữ liệu toàn diện và dễ theo dõi. Các bài thực hành giúp các khái niệm phức tạp trở nên dễ hiểu.",
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-[#f8fdff] via-[#effaff] to-[#f8fdff] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#30C2EC]/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#00B1F5]/15 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-12 md:mb-14" data-aos="fade-up">
          <div className="inline-block px-4 py-2 bg-[#30C2EC]/10 rounded-full mb-4">
            <span className="text-[#00B1F5] font-semibold">💬 Cảm nhận</span>
          </div>
          <Title level={2} className="!text-2xl md:!text-3xl !font-bold !mb-3 !text-[#012643]">
            Được yêu thích bởi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30C2EC] to-[#00B1F5]">Hàng nghìn</span> học viên
          </Title>
          <Paragraph className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Đừng chỉ nghe chúng tôi nói. Hãy lắng nghe từ cộng đồng học viên đã đạt được mục tiêu của họ.
          </Paragraph>
        </div>

        <div data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="pb-12"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <Card 
                  className="h-full border border-[#30C2EC]/15 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                  bodyStyle={{ padding: 0 }}
                >
                  <div className="bg-gradient-to-r from-[#e0f8ff] to-[#d4f4ff] p-5 relative border-b border-[#30C2EC]/20">
                    <div className="absolute top-3 right-4 text-[#00B1F5]/20 text-5xl">"</div>
                    <div className="flex items-center gap-4">
                      <Avatar 
                        src={item.avatar} 
                        size={64} 
                        className="!border-4 !border-[#30C2EC]/30"
                      />
                      <div>
                        <Text className="font-bold text-[#012643] block text-base md:text-lg">{item.name}</Text>
                        <Text className="text-[#012643]/70 text-sm">{item.role}</Text>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3">
                      <Rate disabled defaultValue={item.rating} className="!text-[#00B1F5]" />
                    </div>
                    <Paragraph className="text-gray-600 text-base leading-relaxed mb-0">
                      "{item.comment}"
                    </Paragraph>
                  </div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
