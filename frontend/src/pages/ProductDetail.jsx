import { useParams, Link, useNavigate } from 'react-router-dom';
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
  let averageRating = 0.0;
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
  if (apiData.volume) {
    const volumeText = apiData.volume >= 1000
      ? `${(apiData.volume / 1000).toFixed(1)}L`
      : `${apiData.volume}ml`;
    features.push(volumeText);
  }
  if (apiData.brand) features.push(`브랜드: ${apiData.brand}`);
  if (apiData.subCategoryDto && apiData.subCategoryDto.subName) features.push(`종류: ${apiData.subCategoryDto.subName}`);

  // description 생성
  let description = '';
  if (apiData.description && apiData.description.trim()) {
    description = apiData.description;
  } else {
    // description이 없으면 기본 설명 생성
    const brandText = apiData.brand ? `${apiData.brand}의 ` : '';
    const alcoholText = apiData.alcoholPercentage ? ` 알코올 도수 ${apiData.alcoholPercentage}%` : '';
    const volumeText = apiData.volume
      ? `, ${apiData.volume >= 1000 ? `${(apiData.volume / 1000).toFixed(1)}L` : `${apiData.volume}ml`}`
      : '';
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
    image: (apiData.url && !apiData.url.includes('noImg')) ? apiData.url : "/images/no_image.png",
    features: features,
    priceComparison: priceComparison,
    priceHistory: priceHistory,
    reviews: apiData.reviewDtoList || [],
    subCategoryDto: apiData.subCategoryDto // 카테고리 정보 추가
  };
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);


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
          // API 데이터가 없으면 에러 페이지로 리디렉션
          navigate('/err');
          return;
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);

        // 에러 발생 시 에러 페이지로 리디렉션
        navigate('/err');
        return;
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, navigate]);

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
          <span className="text-primary font-medium">{product?.name || '상품명 로딩 중...'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* 상품 이미지 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-full aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className={
                    product.image && !product.image.includes('no_image.png')
                      ? "w-full h-full object-cover rounded-lg"
                      : "max-w-full max-h-full object-contain rounded-lg"
                  }
                />
              </div>
              <div className="mb-3">
                {product?.subCategoryDto?.topCategoryDto?.topName ? (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">
                    {product.subCategoryDto.topCategoryDto.topName}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">
                    기타
                  </span>
                )}
                {product?.subCategoryDto?.subName ? (
                  <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                    {product.subCategoryDto.subName}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                    {product?.category || '미분류'}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
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
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-lg">{store.store}</h3>
                                {store.discount && store.discount !== "0%" && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
                                    {store.discount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                {store.shipping && (
                                  <div className="flex items-center space-x-1">
                                    <img
                                      src="/images/delivery_icon.png"
                                      alt="배송"
                                      className="w-4 h-4 object-contain"
                                    />
                                    <span>{store.shipping}</span>
                                  </div>
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