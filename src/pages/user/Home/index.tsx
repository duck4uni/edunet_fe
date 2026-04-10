import React from 'react';
import { useAOS } from '../../../hooks/useAOS';
import HeroSection from '../../../components/Home/HeroSection';
import CategoriesSection from '../../../components/Home/CategoriesSection';
import CoursesSection from '../../../components/Home/CoursesSection';
import WhyChooseUsSection from '../../../components/Home/WhyChooseUsSection';
import StatsSection from '../../../components/Home/StatsSection';
import TestimonialsSection from '../../../components/Home/TestimonialsSection';
import CTASection from '../../../components/Home/CTASection';

const Home: React.FC = () => {
  useAOS();

  return (
    <div className="home-page overflow-hidden bg-[#f9fdff]">
      <HeroSection />
      <StatsSection />
      <WhyChooseUsSection />
      <CategoriesSection />
      <CoursesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Home;
