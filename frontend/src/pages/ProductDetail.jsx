import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PricePredictionChart from '../components/PricePredictionChart';
import AlcoholPreloader from '../components/AlcoholPreloader';
import { fetchProduct } from '../services/api';

// API 응답 데이터를 컴포넌트에서 사용하는 형태로 변환하는 함수
const transformApiProductData = (apiData) => {
  if (!apiData || !apiData.productId) return null;

  // 필수 데이터 검증
  if (!apiData.priceDtoList || apiData.priceDtoList.length === 0) {
    console.warn('가격 정보가 없습니다.');
    return null;
  }

  // 최저가 계산
  const validPrices = apiData.priceDtoList.filter(p => p.price && p.price > 0);
  if (validPrices.length === 0) {
    console.warn('유효한 가격 정보가 없습니다.');
    return null;
  }

  const lowestPrice = Math.min(...validPrices.map(p => p.price));

  // 가격 비교 데이터 변환 (유효한 데이터만)
  const priceComparison = apiData.priceDtoList
    .filter(priceItem =>
      priceItem.price &&
      priceItem.price > 0 &&
      priceItem.shopDto &&
      priceItem.shopDto.shopName
    )
    .map(priceItem => ({
      store: priceItem.shopDto.shopName,
      price: priceItem.price,
      shipping: priceItem.deliveryFee > 0 ? `${priceItem.deliveryFee.toLocaleString()}원` : "무료배송",
      link: priceItem.link || "#",
      discount: priceItem.price === lowestPrice ? "최저가" : "0%",
      logoIcon: priceItem.shopDto.logoIcon
    }))
    .sort((a, b) => a.price - b.price); // 가격 오름차순 정렬

  // 가격 히스토리 생성 (더미 데이터)
  const priceHistory = [
    { date: "2025-08-26", price: Math.floor(lowestPrice * 0.95), weeksAgo: 3 },
    { date: "2025-09-02", price: Math.floor(lowestPrice * 0.97), weeksAgo: 2 },
    { date: "2025-09-09", price: Math.floor(lowestPrice * 0.99), weeksAgo: 1 }
  ];

  // 리뷰 평점 계산 (rating이 100점 만점이므로 5점 만점으로 변환)
  let averageRating = 4.0;
  let reviewCount = 0;

  if (apiData.reviewDtoList && apiData.reviewDtoList.length > 0) {
    const validReviews = apiData.reviewDtoList.filter(review => review.rating && review.rating > 0);
    if (validReviews.length > 0) {
      averageRating = (validReviews.reduce((sum, review) => sum + (review.rating / 20), 0) / validReviews.length).toFixed(1);
      reviewCount = validReviews.length;
    }
  }

  // features 배열 생성 (빈 값 제외)
  const features = [];
  if (apiData.alcoholPercentage) features.push(`${apiData.alcoholPercentage}% 알코올 도수`);
  if (apiData.volume) features.push(`${apiData.volume}ml 용량`);
  if (apiData.brand) features.push(apiData.brand);
  if (apiData.subCategoryDto && apiData.subCategoryDto.subName) features.push(apiData.subCategoryDto.subName);

  // description 생성
  let description = '';
  if (apiData.description && apiData.description.trim()) {
    description = apiData.description;
  } else {
    // description이 없으면 기본 설명 생성
    const brandText = apiData.brand ? `${apiData.brand}의 ` : '';
    const alcoholText = apiData.alcoholPercentage ? ` 알코올 도수 ${apiData.alcoholPercentage}%` : '';
    const volumeText = apiData.volume ? `, 용량 ${apiData.volume}ml` : '';
    description = `${brandText}${apiData.productName}입니다.${alcoholText}${volumeText}`;
  }

  return {
    id: apiData.productId,
    name: apiData.productName || '상품명 정보 없음',
    lowestPrice: lowestPrice,
    category: (apiData.subCategoryDto && apiData.subCategoryDto.subName) || '기타',
    description: description,
    rating: parseFloat(averageRating),
    reviewCount: reviewCount,
    image: (apiData.url && !apiData.url.includes('noImg')) ? apiData.url : "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    features: features,
    priceComparison: priceComparison,
    priceHistory: priceHistory,
    reviews: apiData.reviewDtoList || []
  };
};

function ProductDetail() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // TODO: 하드코딩된 상품 데이터를 실제 API 또는 데이터베이스에서 가져오도록 수정 필요
  // TODO: 크롤링 시스템과 연동하여 실시간 가격 정보 업데이트 구현 필요
  const fallbackProducts = {
    1: {
      id: 1,
      name: "참이슬 후레쉬",
      lowestPrice: 1890,
      category: "소주",
      description: "대한민국 대표 소주, 깔끔하고 순한 맛으로 오랜 사랑을 받아온 국민 소주입니다.",
      rating: 4.3,
      reviewCount: 1247,
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      features: [
        "20.1% 알코올 도수",
        "360ml 용량",
        "국내산 쌀",
        "진로 대표 소주"
      ],
      // TODO: 실제 크롤링 데이터로 교체 필요 - 각 쇼핑몰의 실시간 가격 정보
      priceComparison: [
        { store: "쿠팡", price: 1890, shipping: "무료배송", link: "#", discount: "5%" },
        { store: "11번가", price: 1950, shipping: "무료배송", link: "#", discount: "2%" },
        { store: "G마켓", price: 2100, shipping: "2,500원", link: "#", discount: "0%" },
        { store: "신세계몰", price: 2050, shipping: "무료배송", link: "#", discount: "0%" },
        { store: "롯데온", price: 1980, shipping: "무료배송", link: "#", discount: "3%" }
      ],
      // TODO: 실제 가격 히스토리 데이터로 교체 필요 - 시계열 최저가 데이터
      priceHistory: [
        { date: "2025-08-26", price: 1820, weeksAgo: 3 },
        { date: "2025-09-02", price: 1850, weeksAgo: 2 },
        { date: "2025-09-09", price: 1890, weeksAgo: 1 }
      ]
    },
    2: {
      id: 2,
      name: "하이트 제로",
      lowestPrice: 2680,
      category: "맥주",
      description: "상쾌하고 깔끔한 맛의 대한민국 대표 맥주로 시원한 목넘김이 일품입니다.",
      rating: 4.1,
      reviewCount: 892,
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      features: [
        "4.5% 알코올 도수",
        "500ml 캔",
        "국내 생산",
        "라거 맥주"
      ],
      priceComparison: [
        { store: "신세계몰", price: 2680, shipping: "무료배송", link: "#", discount: "8%" },
        { store: "롯데온", price: 2850, shipping: "무료배송", link: "#", discount: "3%" },
        { store: "옥션", price: 2990, shipping: "무료배송", link: "#", discount: "0%" },
        { store: "G마켓", price: 2950, shipping: "3,000원", link: "#", discount: "1%" }
      ],
      priceHistory: [
        { date: "2025-08-26", price: 2580, weeksAgo: 3 },
        { date: "2025-09-02", price: 2630, weeksAgo: 2 },
        { date: "2025-09-09", price: 2680, weeksAgo: 1 }
      ]
    },
    3: {
      id: 3,
      name: "칠레 산타리타 와인",
      lowestPrice: 8900,
      category: "와인",
      description: "부드럽고 풍부한 맛의 칠레 레드 와인으로 가성비가 뛰어난 데일리 와인입니다.",
      rating: 4.2,
      reviewCount: 623,
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      features: [
        "13.5% 알코올 도수",
        "750ml 병",
        "칠레 산",
        "레드 와인"
      ],
      priceComparison: [
        { store: "와인나라", price: 8900, shipping: "무료배송", link: "#", discount: "12%" },
        { store: "하이트진로", price: 9800, shipping: "무료배송", link: "#", discount: "7%" },
        { store: "이마트몰", price: 10500, shipping: "2,500원", link: "#", discount: "3%" }
      ],
      priceHistory: [
        { date: "2025-08-26", price: 8500, weeksAgo: 3 },
        { date: "2025-09-02", price: 8700, weeksAgo: 2 },
        { date: "2025-09-09", price: 8900, weeksAgo: 1 }
      ]
    },
    4: {
      id: 4,
      name: "처음처럼",
      lowestPrice: 1790,
      category: "소주",
      description: "부드럽고 깔끔한 맛의 프리미엄 소주로 목넘김이 부드러운 것이 특징입니다.",
      rating: 4.4,
      reviewCount: 985,
      image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      features: [
        "20.1% 알코올 도수",
        "360ml 용량",
        "국내산 쌀",
        "롯데칠성 소주"
      ],
      priceComparison: [
        { store: "11번가", price: 1790, shipping: "무료배송", link: "#", discount: "6%" },
        { store: "쿠팡", price: 1890, shipping: "무료배송", link: "#", discount: "3%" },
        { store: "옥션", price: 1950, shipping: "무료배송", link: "#", discount: "0%" }
      ],
      priceHistory: [
        { date: "2025-08-26", price: 1720, weeksAgo: 3 },
        { date: "2025-09-02", price: 1750, weeksAgo: 2 },
        { date: "2025-09-09", price: 1790, weeksAgo: 1 }
      ]
    },
    5: {
      id: 5,
      name: "카스 맥주",
      lowestPrice: 2450,
      category: "맥주",
      description: "오리온의 대표 맥주, 시원하고 깔끔한 맛으로 많은 사랑을 받고 있습니다.",
      rating: 4.0,
      reviewCount: 756,
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      features: [
        "4.5% 알코올 도수",
        "500ml 캔",
        "국내 생산",
        "라거 맥주"
      ],
      priceComparison: [
        { store: "G마켓", price: 2450, shipping: "무료배송", link: "#", discount: "5%" },
        { store: "신세계몰", price: 2580, shipping: "무료배송", link: "#", discount: "2%" },
        { store: "롯데온", price: 2690, shipping: "무료배송", link: "#", discount: "0%" }
      ],
      priceHistory: [
        { date: "2025-08-26", price: 2350, weeksAgo: 3 },
        { date: "2025-09-02", price: 2400, weeksAgo: 2 },
        { date: "2025-09-09", price: 2450, weeksAgo: 1 }
      ]
    },
    6: {
      id: 6,
      name: "좋은데이 복분자주",
      lowestPrice: 4900,
      category: "과실주",
      description: "달콤하고 부드러운 우리나라 전통 복분자주로 건강에도 좋은 과실주입니다.",
      rating: 4.5,
      reviewCount: 432,
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      features: [
        "15% 알코올 도수",
        "375ml 병",
        "국내산 복분자",
        "과실주"
      ],
      priceComparison: [
        { store: "현대백화점", price: 4900, shipping: "무료배송", link: "#", discount: "10%" },
        { store: "갤러리아", price: 5200, shipping: "무료배송", link: "#", discount: "5%" },
        { store: "롯데백화점", price: 5500, shipping: "무료배송", link: "#", discount: "0%" }
      ],
      priceHistory: [
        { date: "2025-08-26", price: 4700, weeksAgo: 3 },
        { date: "2025-09-02", price: 4800, weeksAgo: 2 },
        { date: "2025-09-09", price: 4900, weeksAgo: 1 }
      ]
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiData = await fetchProduct(id);
        console.log('API Response:', apiData);

        // API 데이터를 컴포넌트 형태로 변환
        const transformedProduct = transformApiProductData(apiData);

        if (transformedProduct) {
          setProduct(transformedProduct);
        } else {
          // API 데이터가 없으면 fallback 데이터 사용
          const fallbackProduct = fallbackProducts[parseInt(id)] || fallbackProducts[1];
          setProduct(fallbackProduct);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);
        // 에러 발생 시 fallback 데이터 사용
        const fallbackProduct = fallbackProducts[parseInt(id)] || fallbackProducts[1];
        setProduct(fallbackProduct);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // 리뷰 별점 통계 계산 함수
  const calculateRatingStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return { distribution: [0, 0, 0, 0, 0], total: 0 };
    }

    const stats = [0, 0, 0, 0, 0]; // 1점, 2점, 3점, 4점, 5점

    reviews.forEach(review => {
      if (review.rating && review.rating > 0) {
        // rating이 100점 만점이므로 5점 만점으로 변환
        const starRating = Math.round(review.rating / 20);
        const index = Math.max(0, Math.min(4, starRating - 1)); // 0-4 인덱스로 변환
        stats[index]++;
      }
    });

    return {
      distribution: stats.reverse(), // [5점, 4점, 3점, 2점, 1점] 순서로 변경
      total: reviews.length
    };
  };

  // 별점 통계 계산
  const ratingStats = product ? calculateRatingStats(product.reviews) : { distribution: [0, 0, 0, 0, 0], total: 0 };

  // 로딩 중일 때
  if (isLoading) {
    return <AlcoholPreloader isLoading={isLoading} handleLoadingComplete={handleLoadingComplete} />;
  }

  // 상품 데이터가 없을 때
  if (!product) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">상품을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">요청하신 상품 정보를 불러올 수 없습니다.</p>
            {error && (
              <p className="text-red-600 text-sm mb-4">오류: {error}</p>
            )}
            <Link to="/shop" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              상품 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/shop" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">가격비교</Link>
          <i className="fas fa-chevron-right"></i>
          {product.subCategoryDto && product.subCategoryDto.topCategoryDto && (
            <>
              <Link to={`/shop?category=${product.subCategoryDto.topCategoryDto.topName}`} className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">
                {product.subCategoryDto.topCategoryDto.topName}
              </Link>
              <i className="fas fa-chevron-right"></i>
            </>
          )}
          {product.subCategoryDto && (
            <>
              <Link to={`/shop?category=${product.subCategoryDto.subName}`} className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">
                {product.subCategoryDto.subName}
              </Link>
              <i className="fas fa-chevron-right"></i>
            </>
          )}
          <span className="text-primary font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* 상품 이미지 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-full aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.floor(product.rating) ? 'text-secondary' : 'text-gray-300'
                      }`}
                    ></i>
                  ))}
                  <span className="ml-2 text-gray-600">({product.rating})</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* 가격 비교 테이블 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-primary text-white p-6">
                <h2 className="text-2xl font-bold mb-2">가격 비교</h2>
                <div className="text-3xl font-bold text-secondary">
                  최저가 ₩{product.lowestPrice.toLocaleString()}
                </div>
              </div>

              <div className="p-6">
                {product.priceComparison && product.priceComparison.length > 0 ? (
                  <div className="space-y-4">
                    {product.priceComparison.map((store, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {store.logoIcon && store.logoIcon.trim() !== '' ? (
                              <img
                                src={store.logoIcon}
                                alt={`${store.store} 로고`}
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <i className="fas fa-store text-gray-600"></i>
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{store.store}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                {store.shipping && <span>{store.shipping}</span>}
                                {store.discount && store.discount !== "0%" && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                    {store.discount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${store.price === product.lowestPrice ? 'text-red-600' : 'text-gray-800'}`}>
                              ₩{store.price.toLocaleString()}
                            </div>
                            {store.link && store.link !== "#" && (
                              <a
                                href={store.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                              >
                                구매하러 가기
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
                    <p className="text-gray-600">가격 정보를 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 상품 상세 정보 - features가 있을 때만 표시 */}
        {product.features && product.features.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">상품 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-check text-primary mr-2"></i>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 가격 추이 그래프 (향후 추가 가능) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">가격 비교 팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-semibold mb-1">최저가 자동 알림</h4>
                <p className="text-sm text-gray-600">관심 상품의 가격이 떨어지면 즉시 알려드립니다.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-heart text-blue-600"></i>
              </div>
              <div>
                <h4 className="font-semibold mb-1">즐겨찾기 추가</h4>
                <p className="text-sm text-gray-600">자주 찾는 상품을 즐겨찾기에 추가해보세요.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 가격 예측 차트 */}
        <PricePredictionChart product={product} />

        {/* 리뷰 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">고객 리뷰</h3>
          </div>

          {/* 리뷰 통계 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{product.rating}</div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star text-sm ${
                          i < Math.floor(product.rating) ? 'text-secondary' : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{ratingStats.total}개 리뷰</div>
                </div>
              </div>
              <div className="flex-1 ml-8">
                {[5, 4, 3, 2, 1].map((star, index) => {
                  const count = ratingStats.distribution[index];
                  const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center mb-1">
                      <span className="text-sm text-gray-600 w-6">{star}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 개별 리뷰 */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-6">
              {(showAllReviews ? product.reviews : product.reviews.slice(0, 3)).map(review => (
                <div key={review.reviewId} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">{review.writer}</span>
                          {review.shopDto && (
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                              {review.shopDto.shopName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star text-xs ${
                                  i < Math.floor(review.rating / 20) ? 'text-secondary' : 'text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                          {review.reviewDate && (
                            <span className="text-sm text-gray-500">{review.reviewDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-gray-600 leading-relaxed mb-4">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-comment-slash text-gray-400 text-3xl mb-4"></i>
              <p className="text-gray-600">아직 등록된 리뷰가 없습니다.</p>
              <p className="text-gray-500 text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
            </div>
          )}

          {/* 더 보기/접기 버튼 - 리뷰가 3개 이상일 때만 표시 */}
          {product.reviews && product.reviews.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-primary hover:text-blue-800 font-semibold transition-colors"
              >
                {showAllReviews ? (
                  <>
                    <i className="fas fa-chevron-up mr-1"></i>
                    리뷰 접기
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down mr-1"></i>
                    리뷰 더보기 ({product.reviews.length - 3}개 더)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductDetail;