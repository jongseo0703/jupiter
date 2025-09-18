import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlcoholPreloader from '../components/AlcoholPreloader';

function Favorites() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState([
    {
      id: 1,
      name: '참이슬 후레쉬',
      currentPrice: 1890,
      originalPrice: 2100,
      lowestPrice: 1790,
      priceAlert: true,
      image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: '소주',
      priceHistory: [2100, 1950, 1890],
      lastChecked: '2시간 전'
    },
    {
      id: 2,
      name: '하이트 제로',
      currentPrice: 2680,
      originalPrice: 2800,
      lowestPrice: 2450,
      priceAlert: false,
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: '맥주',
      priceHistory: [2800, 2750, 2680],
      lastChecked: '1시간 전'
    }
  ]);

  const removeFavorite = (id) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== id));
  };

  const togglePriceAlert = (id) => {
    setFavoriteItems(favoriteItems.map(item =>
      item.id === id ? { ...item, priceAlert: !item.priceAlert } : item
    ));
  };

  const getPriceChangePercentage = (current, original) => {
    return ((current - original) / original * 100).toFixed(1);
  };

  const handleRefreshPrices = () => {
    setIsRefreshing(true);

    // 실제로는 API 호출하여 가격 정보를 새로고침
    console.log('가격 정보를 새로고침하는 중...');

    // 임시로 1초 후 새로고침 완료
    setTimeout(() => {
      setIsRefreshing(false);
      // 실제로는 새로운 가격 데이터로 state 업데이트
      console.log('가격 정보 새로고침 완료!');
    }, 1000);
  };

  useEffect(() => {
    setIsLoading(true);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (favoriteItems.length === 0) {
    return (
      <>
        <AlcoholPreloader isLoading={isLoading} handleLoadingComplete={handleLoadingComplete} />
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <i className="fas fa-star text-6xl text-gray-300 mb-6"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">즐겨찾기가 비어있습니다</h2>
            <p className="text-gray-600 mb-8">관심있는 주류를 즐겨찾기에 추가하고 가격 변동을 추적해보세요!</p>
            <Link
              to="/shop"
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors duration-300 inline-flex items-center"
            >
              <i className="fas fa-search mr-2"></i>
              주류 검색하기
            </Link>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <AlcoholPreloader isLoading={isLoading} handleLoadingComplete={handleLoadingComplete} />
    <div className="py-16 bg-gray-50">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">즐겨찾기</h1>
          <p className="text-lg">관심있는 주류의 가격 변동을 추적하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-medium">즐겨찾기</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 즐겨찾기 아이템 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">즐겨찾기 목록</h2>
                <button
                  onClick={handleRefreshPrices}
                  disabled={isRefreshing}
                  className="text-primary hover:text-blue-800 font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className={`fas fa-sync-alt mr-2 ${isRefreshing ? 'animate-spin' : ''}`}></i>
                  {isRefreshing ? '새로고침 중...' : '가격 새로고침'}
                </button>
              </div>

              <div className="space-y-4">
                {favoriteItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                          <button
                            onClick={() => removeFavorite(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        {/* 가격 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">현재 최저가</p>
                            <p className="text-xl font-bold text-primary">
                              {item.currentPrice.toLocaleString()}원
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">역대 최저가</p>
                            <p className="text-lg font-semibold text-green-600">
                              {item.lowestPrice.toLocaleString()}원
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">가격 변동</p>
                            <p className={`text-lg font-semibold ${
                              getPriceChangePercentage(item.currentPrice, item.originalPrice) < 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {getPriceChangePercentage(item.currentPrice, item.originalPrice)}%
                              <i className={`fas ml-1 ${
                                getPriceChangePercentage(item.currentPrice, item.originalPrice) < 0
                                  ? 'fa-arrow-down'
                                  : 'fa-arrow-up'
                              }`}></i>
                            </p>
                          </div>
                        </div>

                        {/* 가격 알림 설정 */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <i className="fas fa-bell text-primary"></i>
                            <span className="text-sm font-medium">가격 하락 알림</span>
                            <button
                              onClick={() => togglePriceAlert(item.id)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                item.priceAlert ? 'bg-primary' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  item.priceAlert ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="text-sm text-gray-500">
                            마지막 확인: {item.lastChecked}
                          </div>
                        </div>

                        {/* 가격비교 버튼 */}
                        <div className="mt-4 flex space-x-3">
                          <Link
                            to={`/product/${item.id}`}
                            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors text-center font-medium"
                          >
                            <i className="fas fa-search mr-2"></i>
                            가격비교 보기
                          </Link>
                          <Link
                            to="/shop"
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                          >
                            <i className="fas fa-external-link-alt mr-2"></i>
                            온라인몰에서 구매
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 즐겨찾기 액션 버튼 */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/shop"
                  className="text-primary hover:text-blue-800 font-semibold flex items-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  다른 주류 보기
                </Link>

                <button className="text-gray-600 hover:text-gray-800 font-semibold flex items-center">
                  <i className="fas fa-download mr-2"></i>
                  즐겨찾기 내보내기
                </button>
              </div>
            </div>
          </div>

          {/* 가격 알림 설정 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                <i className="fas fa-bell mr-2 text-primary"></i>
                알림 설정
              </h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">가격 하락 알림</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    즐겨찾기한 상품의 가격이 떨어지면 즉시 알려드립니다.
                  </p>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-mobile-alt text-blue-600"></i>
                    <span className="text-sm text-blue-800">모바일 푸시 알림</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <i className="fas fa-envelope text-blue-600"></i>
                    <span className="text-sm text-blue-800">이메일 알림</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    <i className="fas fa-chart-line mr-2"></i>
                    가격 추적 통계
                  </h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>평균 절약액</span>
                      <span className="font-semibold">210원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>최대 절약액</span>
                      <span className="font-semibold">310원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>추적 중인 상품</span>
                      <span className="font-semibold">{favoriteItems.length}개</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 즐겨찾기 관리 */}
              <div className="space-y-3">
                <Link
                  to="/notification-settings"
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors font-semibold flex items-center justify-center"
                >
                  <i className="fas fa-cog mr-2"></i>
                  알림 설정 관리
                </Link>

              </div>

              {/* 도움말 */}
              <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center text-sm text-yellow-800">
                  <i className="fas fa-lightbulb text-yellow-600 mr-2"></i>
                  <span className="font-semibold">팁:</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  가격 알림을 켜두시면 최저가 정보를 놓치지 않고 받아보실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 추천 주류 섹션 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">이런 주류는 어떠세요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 4, name: '처음처럼', price: 1790, image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
              { id: 5, name: '카스 맥주', price: 2450, image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
              { id: 6, name: '칠레 산타리타 와인', price: 8900, image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
              { id: 7, name: '좋은데이 복분자주', price: 4900, image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' }
            ].map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      최저가 ₩{product.price.toLocaleString()}
                    </span>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center">
                      <i className="fas fa-star mr-1"></i>
                      즐겨찾기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Favorites;