import React from 'react';
import { Button, Card, Typography, Tag, Spin } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../services/courseApi';

const { Title, Paragraph, Text } = Typography;

// Default category images
const getCategoryImage = (name: string) => {
  const images: Record<string, string> = {
    'Design': 'https://img.freepik.com/free-vector/graphic-design-colorful-geometrical-lettering_52683-34588.jpg',
    'Development': 'https://img.freepik.com/free-vector/web-development-programmer-engineering-coding-website-augmented-reality-interface-screens-developer-project-engineer-programming-software-application-design-cartoon-illustration_107791-3863.jpg',
    'Marketing': 'https://img.freepik.com/free-vector/marketing-consulting-concept-illustration_114360-9027.jpg',
    'Business': 'https://img.freepik.com/free-vector/business-team-brainstorming-discussing-startup-project_74855-6909.jpg',
    'Music': 'https://img.freepik.com/free-vector/musical-notes-frame-with-text-space_1017-32857.jpg',
  };
  return images[name] || 'https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg';
};

const CategoriesSection: React.FC = () => {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({ size: 'unlimited' });
  const categories = categoriesData?.data?.rows || [];

  return (
    <section className="category-area py-20 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-pink-100/50 to-purple-100/50 rounded-full blur-3xl translate-y-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12" data-aos="fade-up">
          <div>
            <div className="inline-block px-4 py-2 bg-[#17EAD9]/10 rounded-full mb-4">
              <span className="text-[#17EAD9] font-semibold">📚 Danh mục</span>
            </div>
            <Title level={2} className="!mb-2 !text-[#012643] !text-3xl md:!text-4xl">
              Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17EAD9] to-[#6078EA]">Danh mục</span> nổi bật
            </Title>
            <Paragraph className="text-gray-500 max-w-lg">Khám phá các khóa học trong những lĩnh vực thịnh hành và bắt đầu hành trình học tập của bạn ngay hôm nay</Paragraph>
          </div>
          <Link to="/courses">
            <Button 
              className="!rounded-full !border-[#6078EA] !text-[#6078EA] hover:!bg-[#6078EA] hover:!text-white !h-11 !px-6 !font-medium"
              icon={<ArrowRightOutlined />}
            >
              Xem tất cả danh mục
            </Button>
          </Link>
        </div>

        <div data-aos="fade-up" data-aos-delay="200">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : categories.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="pb-14"
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.id}>
                  <Link to={`/courses?category=${cat.id}`}>
                    <Card 
                      hoverable 
                      className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group"
                      styles={{ body: { padding: 0 } }}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img 
                          src={cat.image || getCategoryImage(cat.name)} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <Tag 
                          className="!absolute !top-3 !right-3 !border-0 !bg-white/90 !backdrop-blur-sm !rounded-full !px-3 !py-1 !text-[#012643] !font-medium"
                        >
                          {cat.courses?.length || 0} Khóa học
                        </Tag>
                      </div>
                      <div className="p-5">
                        <Title level={5} className="!mb-1 !text-[#012643] group-hover:!text-[#6078EA] transition-colors">
                          {cat.name}
                        </Title>
                        <Text type="secondary" className="text-sm">Bắt đầu học ngay →</Text>
                      </div>
                    </Card>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Chưa có danh mục nào
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
