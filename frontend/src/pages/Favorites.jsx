import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AlcoholPreloader from '../components/AlcoholPreloader';
import { fetchFavorites, removeFavorite as removeFavoriteApi, fetchProduct, togglePriceAlert as togglePriceAlertApi } from '../services/api';
import favoriteService from '../services/favoriteService';
import api from '../services/api';

function Favorites() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const autoSlideInterval = useRef(null);

  // 사용자 ID 가져오기 (로그인한 사용자 ID를 localStorage에서 가져온다고 가정)
  const getUserId = () => {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.id || parsed.userId;
    }
    return null;
  };

  // 즐겨찾기 목록 로드
  useEffect(() => {
    const loadFavorites = async () => {
      const userId = getUserId();
      if (!userId) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const favorites = await fetchFavorites(userId);

        // 각 즐겨찾기의 상품 정보를 가져와서 병합
        const favoriteItemsWithDetails = await Promise.all(
          favorites.map(async (fav) => {
            try {
              const productDetail = await fetchProduct(fav.productId);

              // 현재 최저가 계산
              const priceDtoList = productDetail.priceDtoList || [];
              const currentLowestPrice = priceDtoList.length > 0
                ? Math.min(...priceDtoList.map(p => (p.price || 0) + (p.deliveryFee || 0)))
                : 0;

              // 어제 최저가 (API에서 제공 - null이면 현재가 사용)
              const yesterdayLowestPrice = productDetail.yesterdayLowestPrice !== null && productDetail.yesterdayLowestPrice !== undefined
                ? productDetail.yesterdayLowestPrice
                : currentLowestPrice;

              return {
                id: fav.productId,
                favoriteId: fav.id,
                name: productDetail.productName,
                currentPrice: currentLowestPrice,
                originalPrice: yesterdayLowestPrice,
                lowestPrice: currentLowestPrice,
                priceAlert: fav.priceAlert !== undefined ? fav.priceAlert : true,
                image: productDetail.url || 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                category: productDetail.subCategoryDto?.subName || '주류',
                priceHistory: [],
                lastChecked: new Date(fav.createdAt).toLocaleString('ko-KR')
              };
            } catch (err) {
              console.warn(`상품 ${fav.productId}는 더 이상 존재하지 않습니다. 즐겨찾기에서 자동으로 제외됩니다.`);
              // 존재하지 않는 상품은 즐겨찾기에서 자동 삭제
              try {
                await removeFavoriteApi(userId, fav.productId);
              } catch (removeErr) {
                console.error('즐겨찾기 삭제 실패:', removeErr);
              }
              return null;
            }
          })
        );

        const filteredItems = favoriteItemsWithDetails.filter(item => item !== null);
        setFavoriteItems(filteredItems);

        // 연관 상품 로드
        if (filteredItems.length > 0) {
          loadRecommendedProducts(filteredItems);
        }
      } catch (err) {
        console.error('즐겨찾기 목록 로드 실패:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // 연관 상품 로드
  const loadRecommendedProducts = async (favorites) => {
    try {
      // 즐겨찾기한 상품들의 카테고리 수집
      const categories = [...new Set(favorites.map(item => item.category))];

      // 전체 상품 목록 가져오기 (api.get은 이미 파싱된 데이터를 반환)
      const allProductsWithRating = await api.get('/product/api/list');

      // 데이터 유효성 검사
      if (!allProductsWithRating || !Array.isArray(allProductsWithRating)) {
        console.error('API 응답이 배열이 아닙니다:', allProductsWithRating);
        return;
      }

      // API 응답 구조: [{ product: {...}, avgRating: ... }]
      // 즐겨찾기에 없고, 같은 카테고리인 상품들 필터링
      const favoriteIds = favorites.map(item => item.id);
      const recommended = allProductsWithRating
        .filter(item => item && item.product) // product가 있는 항목만
        .map(item => item.product) // product 객체 추출
        .filter(product =>
          product &&
          !favoriteIds.includes(product.productId) &&
          categories.includes(product.subCategoryDto?.subName)
        )
        .map(product => ({
          id: product.productId,
          name: product.productName,
          price: product.priceDtoList?.[0]?.price || 0,
          image: product.url,
          category: product.subCategoryDto?.subName
        }))
        .slice(0, 12); // 최대 12개

      setRecommendedProducts(recommended);
    } catch (error) {
      console.error('연관 상품 로드 실패:', error);
    }
  };

  // 자동 슬라이드
  useEffect(() => {
    if (recommendedProducts.length > 4) {
      autoSlideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.ceil(recommendedProducts.length / 4));
      }, 4000); // 4초마다

      return () => {
        if (autoSlideInterval.current) {
          clearInterval(autoSlideInterval.current);
        }
      };
    }
  }, [recommendedProducts.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.ceil(recommendedProducts.length / 4));
    // 수동 조작 시 자동 슬라이드 재시작
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.ceil(recommendedProducts.length / 4));
      }, 4000);
    }
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? Math.ceil(recommendedProducts.length / 4) - 1 : prev - 1);
    // 수동 조작 시 자동 슬라이드 재시작
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.ceil(recommendedProducts.length / 4));
      }, 4000);
    }
  };

  const removeFavorite = async (productId) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await removeFavoriteApi(userId, productId);
      setFavoriteItems(favoriteItems.filter(item => item.id !== productId));

      // 즐겨찾기 변경 알림
      favoriteService.notifyChange();
    } catch (err) {
      console.error('즐겨찾기 삭제 실패:', err);
      alert('즐겨찾기 삭제에 실패했습니다.');
    }
  };

  const togglePriceAlert = async (productId) => {
    const userId = getUserId();
    if (!userId) return;

    // 먼저 UI 업데이트
    const updatedItem = favoriteItems.find(item => item.id === productId);
    if (!updatedItem) return;

    const newPriceAlertState = !updatedItem.priceAlert;

    setFavoriteItems(favoriteItems.map(item =>
      item.id === productId ? { ...item, priceAlert: newPriceAlertState } : item
    ));

    // 백엔드에 저장
    try {
      await togglePriceAlertApi(userId, productId, newPriceAlertState);
      console.log('가격 알림 설정이 저장되었습니다.');
    } catch (err) {
      console.error('가격 알림 설정 저장 실패:', err);
      // 실패 시 원래 상태로 되돌리기
      setFavoriteItems(favoriteItems.map(item =>
        item.id === productId ? { ...item, priceAlert: updatedItem.priceAlert } : item
      ));
      alert('알림 설정 저장에 실패했습니다.');
    }
  };

  const getPriceChangePercentage = (current, original) => {
    if (original === 0 || !original) return '0.0';
    return ((current - original) / original * 100).toFixed(1);
  };

  // 절약액 통계 계산 (어제 대비 현재 절약액)
  const calculateSavingsStats = () => {
    const savings = favoriteItems
      .map(item => item.originalPrice - item.currentPrice)
      .filter(saving => saving > 0); // 가격이 하락한 상품만

    if (savings.length === 0) {
      return { average: 0, max: 0, total: 0 };
    }

    const total = savings.reduce((sum, saving) => sum + saving, 0);
    const average = Math.round(total / savings.length);
    const max = Math.max(...savings);

    return { average, max, total };
  };

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    const userId = getUserId();
    if (!userId) return;

    try {
      const favorites = await fetchFavorites(userId);
      const favoriteItemsWithDetails = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const productDetail = await fetchProduct(fav.productId);
            const priceDtoList = productDetail.priceDtoList || [];
            const currentLowestPrice = priceDtoList.length > 0
              ? Math.min(...priceDtoList.map(p => (p.price || 0) + (p.deliveryFee || 0)))
              : 0;

            const yesterdayLowestPrice = productDetail.yesterdayLowestPrice !== null && productDetail.yesterdayLowestPrice !== undefined
              ? productDetail.yesterdayLowestPrice
              : currentLowestPrice;

            return {
              id: fav.productId,
              favoriteId: fav.id,
              name: productDetail.productName,
              currentPrice: currentLowestPrice,
              originalPrice: yesterdayLowestPrice,
              lowestPrice: currentLowestPrice,
              priceAlert: true,
              image: productDetail.url || 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
              category: productDetail.subCategoryDto?.subName || '주류',
              priceHistory: [],
              lastChecked: '방금 전'
            };
          } catch (err) {
            return null;
          }
        })
      );

      setFavoriteItems(favoriteItemsWithDetails.filter(item => item !== null));
    } catch (err) {
      console.error('가격 새로고침 실패:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
                            <p className="text-sm text-gray-600">어제 최저가</p>
                            <p className="text-lg font-semibold text-green-600">
                              {item.originalPrice.toLocaleString()}원
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
                    <span className="text-sm text-blue-800">SMS 알림</span>
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
                      <span className="font-semibold">{calculateSavingsStats().average.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>최대 절약액</span>
                      <span className="font-semibold">{calculateSavingsStats().max.toLocaleString()}원</span>
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

        {/* 추천 주류 섹션 - 캐러셀 */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              <i className="fas fa-magic mr-2 text-primary"></i>
              이런 주류는 어떠세요?
            </h2>
            <p className="text-center text-gray-600 mb-6">
              즐겨찾기와 연관된 추천 상품입니다
            </p>

            <div className="relative">
              {/* 왼쪽 화살표 */}
              {recommendedProducts.length > 4 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white text-primary p-3 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}

              {/* 캐러셀 컨테이너 */}
              <div className="overflow-hidden" ref={carouselRef}>
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(recommendedProducts.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                      {recommendedProducts.slice(slideIndex * 4, slideIndex * 4 + 4).map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
                          <Link to={`/product/${product.id}`}>
                            <img
                              src={product.image || 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                          </Link>
                          <div className="p-4">
                            <div className="mb-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {product.category}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {product.price.toLocaleString()}원
                              </span>
                              <Link
                                to={`/product/${product.id}`}
                                className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center text-sm"
                              >
                                <i className="fas fa-star mr-1"></i>
                                보기
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽 화살표 */}
              {recommendedProducts.length > 4 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white text-primary p-3 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}

              {/* 슬라이드 인디케이터 */}
              {recommendedProducts.length > 4 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: Math.ceil(recommendedProducts.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'bg-primary w-8' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Favorites;