import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div
      className="relative py-16 lg:py-20 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold inline-flex items-center shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z"/>
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
              </svg>
              AI 기반 가격 예측
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AI가 예측하는</span>
            <span className="block mt-3">주류 최저가 쇼핑몰</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed font-light max-w-3xl">
            인공지능이 분석한 가격 트렌드로 최적의 구매 시점을 찾아드립니다
          </p>
          <Link
            to="/shop"
            className="bg-secondary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-600 transform hover:scale-105 transition-all duration-300 shadow-lg inline-block text-center"
          >
            <span className="flex items-center justify-center">
              AI 가격 예측 시작
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;