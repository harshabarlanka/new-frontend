import HeroBanner from '../components/home/HeroBanner';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedSection from '../components/home/FeaturedSection';
import HeritageBanner from '../components/home/HeritageBanner';
import TestimonialsSection from '../components/home/TestimonialsSection';

const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <CategoriesSection />
      <FeaturedSection />
      <HeritageBanner />
      <TestimonialsSection />
    </>
  );
};

export default HomePage;
