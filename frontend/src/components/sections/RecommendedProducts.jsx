import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchPersonalizedRecommendations,
  fetchPopularProducts,
  fetchSurveyBasedRecommendations
} from '../../services/api';

const RecommendedProducts = () => {
  const [recommendations, setRecommendations] = useState({
    userBased: [],
    categoryBased: [],
    products: [] // 인기상품 또는 설문기반 상품용
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState('popular'); // 'personalized', 'popular', 'survey'
  const [currentSlide, setCurrentSlide] = useState({ userBased: 0, categoryBased: 0, products: 0 });
  const autoSlideIntervals = useRef({});

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const preferredSubcategoryIdsStr = localStorage.getItem('preferredSubcategoryIds'); // 설문 결과 (배열)
        const preferredSubcategoryIds = preferredSubcategoryIdsStr ? JSON.parse(preferredSubcategoryIdsStr) : null;

        // 1. 로그인 사용자: 개인 맞춤 추천 시도
        if (token) {
          try {
            const data = await fetchPersonalizedRecommendations();

            // 추천 데이터가 있는지 확인 (빈 배열이 아닌지)
            const hasUserBased = data.recommendations?.userBased?.length > 0;
            const hasCategoryBased = data.recommendations?.categoryBased?.length > 0;

            if (hasUserBased || hasCategoryBased) {
              // 유효한 개인 맞춤 추천이 있음
              setRecommendations(data.recommendations);
              setRecommendationType('personalized');
              console.log('개인 맞춤 추천 표시');
              return;
            } else {
              console.log('개인 맞춤 추천 데이터 없음, 설문/인기 상품으로 전환');
              // 추천 데이터가 비어있으면 아래 로직으로 fallback
            }
          } catch (err) {
            console.log('개인 맞춤 추천 실패:', err);
            // 에러 발생 시 아래 로직으로 fallback
          }
        }

        // 2. 신규 회원 (설문 결과 있음): 설문 기반 추천
        if (preferredSubcategoryIds && preferredSubcategoryIds.length > 0) {
          console.log('설문 기반 추천 호출 - subcategoryIds:', preferredSubcategoryIds);
          const data = await fetchSurveyBasedRecommendations(preferredSubcategoryIds);
          console.log('설문 기반 추천 응답:', data);
          if (data.recommendations) {
            setRecommendations(data.recommendations);
            setRecommendationType('survey');
            console.log('설문 기반 추천 표시');
          }
          return;
        }

        // 3. 비로그인 또는 설문 없음: 인기 상품
        console.log('인기 상품 호출');
        const data = await fetchPopularProducts();
        if (data.recommendations) {
          setRecommendations(data.recommendations);
          setRecommendationType('popular');
          console.log('인기 상품 표시');
        }
      } catch (err) {
        setError(err.message);
        console.error('추천 상품 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  // 컴포넌트 언마운트 시 모든 인터벌 정리
  useEffect(() => {
    return () => {
      Object.values(autoSlideIntervals.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  // 추천 상품이 없으면 렌더링하지 않음
  if (loading) return null;
  if (error) return null;

  const hasPersonalizedRecommendations = recommendations.userBased?.length > 0 || recommendations.categoryBased?.length > 0;
  const hasBasicRecommendations = recommendations.products?.length > 0;

  if (!hasPersonalizedRecommendations && !hasBasicRecommendations) {
    return null;
  }

  const ProductCard = ({ product }) => {
    // 최저가 계산 (배송비 포함)
    const lowestPrice = product.priceDtoList && product.priceDtoList.length > 0
      ? product.priceDtoList[0].price + (product.priceDtoList[0].deliveryFee || 0)
      : 0;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
        <Link to={`/product/${product.productId}`}>
          <div className="relative overflow-hidden flex items-center justify-center">
            <img
              src={product.url}
              alt={product.productName}
              className="w-[300px] h-[300px] object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">
                {product.subCategoryDto?.topCategoryDto?.topName || product.subCategoryDto?.subName || '주류'}
              </span>
            </div>
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product.productId}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary transition-colors line-clamp-2">
              {product.productName}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || `${product.subCategoryDto?.subName || '주류'} 상품`}</p>

          <div className="mt-auto">
            {lowestPrice > 0 && (
              <div className="bg-blue-900 text-white font-bold px-4 py-2 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-90 flex items-center gap-1">
                    <i className="fas fa-tag"></i>
                    최저가
                  </span>
                  <span className="text-lg">₩{lowestPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CarouselSection = ({ title, products, icon, sectionKey }) => {
    if (!products || products.length === 0) return null;

    const itemsPerSlide = 5;
    const totalSlides = Math.ceil(products.length / itemsPerSlide);
    const slideIndex = currentSlide[sectionKey] || 0;

    // 자동 슬라이드 설정
    useEffect(() => {
      if (products.length > itemsPerSlide) {
        // 기존 인터벌 클리어
        if (autoSlideIntervals.current[sectionKey]) {
          clearInterval(autoSlideIntervals.current[sectionKey]);
        }

        // 새 인터벌 설정
        autoSlideIntervals.current[sectionKey] = setInterval(() => {
          setCurrentSlide(prev => ({
            ...prev,
            [sectionKey]: ((prev[sectionKey] || 0) + 1) % totalSlides
          }));
        }, 4000); // 4초마다

        return () => {
          if (autoSlideIntervals.current[sectionKey]) {
            clearInterval(autoSlideIntervals.current[sectionKey]);
          }
        };
      }
    }, [products.length, sectionKey, totalSlides]);

    const nextSlide = () => {
      setCurrentSlide(prev => ({
        ...prev,
        [sectionKey]: ((prev[sectionKey] || 0) + 1) % totalSlides
      }));
      // 수동 조작 시 자동 슬라이드 재시작
      if (autoSlideIntervals.current[sectionKey]) {
        clearInterval(autoSlideIntervals.current[sectionKey]);
        autoSlideIntervals.current[sectionKey] = setInterval(() => {
          setCurrentSlide(prev => ({
            ...prev,
            [sectionKey]: ((prev[sectionKey] || 0) + 1) % totalSlides
          }));
        }, 4000);
      }
    };

    const prevSlide = () => {
      setCurrentSlide(prev => ({
        ...prev,
        [sectionKey]: (prev[sectionKey] || 0) === 0 ? totalSlides - 1 : (prev[sectionKey] || 0) - 1
      }));
      // 수동 조작 시 자동 슬라이드 재시작
      if (autoSlideIntervals.current[sectionKey]) {
        clearInterval(autoSlideIntervals.current[sectionKey]);
        autoSlideIntervals.current[sectionKey] = setInterval(() => {
          setCurrentSlide(prev => ({
            ...prev,
            [sectionKey]: ((prev[sectionKey] || 0) + 1) % totalSlides
          }));
        }, 4000);
      }
    };

    const goToSlide = (index) => {
      setCurrentSlide(prev => ({ ...prev, [sectionKey]: index }));
      // 수동 조작 시 자동 슬라이드 재시작
      if (autoSlideIntervals.current[sectionKey]) {
        clearInterval(autoSlideIntervals.current[sectionKey]);
        autoSlideIntervals.current[sectionKey] = setInterval(() => {
          setCurrentSlide(prev => ({
            ...prev,
            [sectionKey]: ((prev[sectionKey] || 0) + 1) % totalSlides
          }));
        }, 4000);
      }
    };

    return (
      <div className="mb-16">
        <div className="flex items-center mb-6">
          <i className={`${icon} text-2xl text-primary mr-3`}></i>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        </div>

        <div className="relative px-12">
          {/* 왼쪽 화살표 */}
          {products.length > itemsPerSlide && (
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white text-primary p-3 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          )}

          {/* 캐러셀 컨테이너 */}
          <div className="overflow-hidden py-2">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div key={index} className="min-w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {products.slice(index * itemsPerSlide, index * itemsPerSlide + itemsPerSlide).map(product => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽 화살표 */}
          {products.length > itemsPerSlide && (
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white text-primary p-3 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          )}

          {/* 슬라이드 인디케이터 */}
          {products.length > itemsPerSlide && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    slideIndex === index ? 'bg-primary w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 헤더 문구를 추천 타입에 따라 변경
  const getHeaderText = () => {
    switch (recommendationType) {
      case 'personalized':
        return {
          title: '당신을 위한 맞춤 추천',
          subtitle: '취향 분석을 통해 선별된 추천 상품을 만나보세요'
        };
      case 'survey':
        return {
          title: '당신이 선호하는 카테고리의 추천 상품',
          subtitle: '선택하신 카테고리의 인기 상품을 확인해보세요'
        };
      case 'popular':
      default:
        return {
          title: '인기 상품',
          subtitle: '많은 분들이 선택한 인기 상품을 만나보세요'
        };
    }
  };

  const headerText = getHeaderText();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            <i className="fas fa-magic text-primary mr-2"></i>
            {headerText.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {headerText.subtitle}
          </p>
        </div>

        {/* Personalized Recommendations */}
        {recommendationType === 'personalized' && (
          <>
            <CarouselSection
              title="당신이 좋아할 만한 상품"
              products={recommendations.userBased}
              icon="fas fa-star"
              sectionKey="userBased"
            />

            <CarouselSection
              title="비슷한 카테고리 추천"
              products={recommendations.categoryBased}
              icon="fas fa-tags"
              sectionKey="categoryBased"
            />
          </>
        )}

        {/* Popular or Survey-based Recommendations */}
        {(recommendationType === 'popular' || recommendationType === 'survey') && (
          <CarouselSection
            title={recommendationType === 'survey' ? '추천 상품' : '인기 상품'}
            products={recommendations.products}
            icon="fas fa-fire"
            sectionKey="products"
          />
        )}
      </div>
    </section>
  );
};

export default RecommendedProducts;
