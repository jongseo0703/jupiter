import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PricePredictionChart from '../components/PricePredictionChart';
import AlcoholPreloader from '../components/AlcoholPreloader';

function ProductDetail() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  // TODO: 하드코딩된 상품 데이터를 실제 API 또는 데이터베이스에서 가져오도록 수정 필요
  // TODO: 크롤링 시스템과 연동하여 실시간 가격 정보 업데이트 구현 필요
  const products = {
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

  const product = products[parseInt(id)] || products[1];

  useEffect(() => {
    setIsLoading(true);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      <AlcoholPreloader isLoading={isLoading} handleLoadingComplete={handleLoadingComplete} />
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/shop" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">가격비교</Link>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* 상품 이미지 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
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
                <div className="space-y-4">
                  {product.priceComparison.map((store, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-store text-gray-600"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{store.store}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{store.shipping}</span>
                              {store.discount !== "0%" && (
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  {store.discount} 할인
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${store.price === product.lowestPrice ? 'text-red-600' : 'text-gray-800'}`}>
                            ₩{store.price.toLocaleString()}
                          </div>
                          <a
                            href={store.link}
                            className="inline-block mt-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            구매하러 가기
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 상세 정보 */}
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
                  <div className="text-sm text-gray-600 mt-1">{product.reviewCount}개 리뷰</div>
                </div>
              </div>
              <div className="flex-1 ml-8">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center mb-1">
                    <span className="text-sm text-gray-600 w-6">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{star === 5 ? 240 : star === 4 ? 68 : star === 3 ? 17 : star === 2 ? 10 : 7}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 개별 리뷰 */}
          <div className="space-y-6">
            {[
              {
                id: 1,
                author: "소주매니아",
                rating: 5,
                date: "2024-01-15",
                title: "역시 안정적인 맛",
                content: "항상 마시던 참이슬이지만 이번에 처음 온라인으로 주문해봤어요. 가격도 마트보다 저렴하고 배송도 빨라서 만족합니다.",
                helpful: 12,
                verified: true
              },
              {
                id: 2,
                author: "주류애호가",
                rating: 4,
                date: "2024-01-10",
                title: "배송 빠르고 좋아요",
                content: "언제나 빠른 배송으로 만족합니다. 소주는 역시 참이슬이 최고죠. 깨끗하고 마시기 좋아요.",
                helpful: 8,
                verified: true
              },
              {
                id: 3,
                author: "반주사랑",
                rating: 5,
                date: "2024-01-05",
                title: "회식에 딱 좋아요",
                content: "가끔 마시는 소주인데 역시 국민 소주답게 맑고 마시기 좋네요. 집에서 반주 한잔 하기에 딱 좋은 소주입니다.",
                helpful: 15,
                verified: false
              }
            ].map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-600"></i>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{review.author}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                            구매확인
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-xs ${
                                i < review.rating ? 'text-secondary' : 'text-gray-300'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                <p className="text-gray-600 leading-relaxed mb-4">{review.content}</p>

                <div className="flex items-center space-x-4 text-sm">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-primary">
                    <i className="fas fa-thumbs-up"></i>
                    <span>도움됨 ({review.helpful})</span>
                  </button>
                  <button className="text-gray-500 hover:text-primary">
                    신고
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 더 보기 버튼 */}
          <div className="text-center mt-6">
            <button className="text-primary hover:text-blue-800 font-semibold">
              리뷰 더보기 ({product.reviewCount - 3}개 더)
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductDetail;