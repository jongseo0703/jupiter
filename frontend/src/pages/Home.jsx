import HeroSection from '../components/sections/HeroSection';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import RecommendedProducts from '../components/sections/RecommendedProducts';

function Home() {
  return (
    <>
      <HeroSection />
      <RecommendedProducts />
      <FeaturedProducts />
    </>
  );
}

export default Home;