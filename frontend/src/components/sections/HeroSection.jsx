import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div
      className="relative py-24 lg:py-32 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="lg:w-2/3 mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            주류 최저가
            <span className="text-secondary block">가격 비교</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            국내 주요 쇼핑몰 가격을 한 번에 비교하세요
          </p>
          <Link
            to="/shop"
            className="bg-secondary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-600 transform hover:scale-105 transition-all duration-300 shadow-lg inline-block text-center"
          >
            가격 비교 시작
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;