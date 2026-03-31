import React from 'react';
import { Button, Typography, Spin } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useGetCoursesQuery } from '../../services/courseApi';
import CourseCard from '../common/CourseCard';

const { Title, Paragraph } = Typography;

const CoursesSection: React.FC = () => {
  const { data: coursesData, isLoading } = useGetCoursesQuery({ page: 1, size: 8, include: 'category|teacher', filter: 'status:eq:published' });
  const courses = coursesData?.data?.rows || [];

  return (
    <section className="course-area py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#17EAD9]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#6078EA]/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12" data-aos="fade-up">
          <div>
            <div className="inline-block px-4 py-2 bg-[#e5698e]/10 rounded-full mb-4">
              <span className="text-[#e5698e] font-semibold">🔥 Xu hướng</span>
            </div>
            <Title level={2} className="!mb-2 !text-[#012643] !text-3xl md:!text-4xl">
              Khóa học <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5698e] to-[#6078EA]">Phổ biến</span> nhất
            </Title>
            <Paragraph className="text-gray-500 max-w-lg">Khám phá các khóa học được yêu thích nhất do cộng đồng học viên của chúng tôi bình chọn</Paragraph>
          </div>
          <Link to="/courses">
            <Button 
              className="!rounded-full !border-[#e5698e] !text-[#e5698e] hover:!bg-[#e5698e] hover:!text-white !h-11 !px-6 !font-medium"
              icon={<ArrowRightOutlined />}
            >
              Xem tất cả khóa học
            </Button>
          </Link>
        </div>

        <div data-aos="fade-up" data-aos-delay="200">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : courses.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              pagination={{ clickable: true }}
              className="pb-14"
            >
              {courses.map((course) => (
                <SwiperSlide key={course.id}>
                  <CourseCard course={{
                    id: course.id,
                    title: course.title,
                    author: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Chưa rõ',
                    image: course.thumbnail || 'https://via.placeholder.com/400x200',
                    price: course.price,
                    lessons: course.totalLessons,
                    duration: course.duration || '0h',
                    category: course.category?.name || 'Chung',
                  }} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Chưa có khóa học nào
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
