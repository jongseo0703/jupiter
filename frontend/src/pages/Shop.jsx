import { useState } from 'react';
import { Link } from 'react-router-dom';

function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('기본순');

  const categories = ['전체', '소주', '맥주', '와인', '과실주', '전통주'];

  const products = [
    {
      id: 1,
      name: "참이슬 후레쉬",
      lowestPrice: 1890,
      prices: [
        { store: "쿠팡", price: 1890 },
        { store: "11번가", price: 1950 },
        { store: "G마켓", price: 2100 }
      ],
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "소주",
      rating: 4.3,
      description: "대한민국 대표 소주, 깔끔하고 순한 맛"
    },
    {
      id: 2,
      name: "하이트 제로",
      lowestPrice: 2680,
      prices: [
        { store: "신세계몰", price: 2680 },
        { store: "롯데온", price: 2850 },
        { store: "옥션", price: 2990 }
      ],
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "맥주",
      rating: 4.1,
      description: "상쾌하고 깔끔한 맛의 대한민국 대표 맥주"
    },
    {
      id: 3,
      name: "칠레 산타리타 와인",
      lowestPrice: 8900,
      prices: [
        { store: "와인나라", price: 8900 },
        { store: "하이트진로", price: 9800 },
        { store: "이마트몰", price: 10500 }
      ],
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "와인",
      rating: 4.2,
      description: "부드럽고 풍부한 맛의 칠레 레드 와인"
    },
    {
      id: 4,
      name: "처음처럼",
      lowestPrice: 1790,
      prices: [
        { store: "11번가", price: 1790 },
        { store: "쿠팡", price: 1890 },
        { store: "옥션", price: 1950 }
      ],
      image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "소주",
      rating: 4.4,
      description: "부드럽고 깔끔한 맛의 프리미엄 소주"
    },
    {
      id: 5,
      name: "카스 맥주",
      lowestPrice: 2450,
      prices: [
        { store: "G마켓", price: 2450 },
        { store: "신세계몰", price: 2580 },
        { store: "롯데온", price: 2690 }
      ],
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "맥주",
      rating: 4.0,
      description: "오리온의 대표 맥주, 시원하고 깔끔한 맛"
    },
    {
      id: 6,
      name: "좋은데이 복분자주",
      lowestPrice: 4900,
      prices: [
        { store: "현대백화점", price: 4900 },
        { store: "갤러리아", price: 5200 },
        { store: "롯데백화점", price: 5500 }
      ],
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "과실주",
      rating: 4.5,
      description: "달콤하고 부드러운 우리나라 전통 복분자주"
    },
    {
      id: 7,
      name: "안동소주",
      lowestPrice: 3500,
      prices: [
        { store: "쿠팡", price: 3500 },
        { store: "11번가", price: 3800 },
        { store: "G마켓", price: 4000 }
      ],
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "전통주",
      rating: 4.6,
      description: "경상북도 안동의 전통 증류식 소주"
    },
    {
      id: 8,
      name: "프랑스 보르도 와인",
      lowestPrice: 15000,
      prices: [
        { store: "롯데온", price: 15000 },
        { store: "신세계몰", price: 16500 },
        { store: "이마트몰", price: 18000 }
      ],
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "와인",
      rating: 4.4,
      description: "프랑스 보르도 지역의 고품질 레드 와인"
    }
  ];

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === '전체' || product.category === selectedCategory;
    const priceMatch = product.lowestPrice >= priceRange[0] * 1000 && product.lowestPrice <= priceRange[1] * 1000;
    return categoryMatch && priceMatch;
  });

  return (
    <div className="py-16 bg-gray-50">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">가격 비교</h1>
          <p className="text-lg">소주, 맥주, 와인 등 일상 주류의 최저가를 찾아보세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 필터 */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">카테고리</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">가격 범위</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{priceRange[0] * 1000}원</span>
                    <span>{priceRange[1] * 1000}원</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-800">정렬</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="기본순">기본순</option>
                <option value="가격낮은순">가격 낮은순</option>
                <option value="가격높은순">가격 높은순</option>
                <option value="평점순">평점순</option>
              </select>
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{filteredProducts.length}개의 상품</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 z-10">
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors">
                          <i className="fas fa-heart text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>

                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star text-xs ${
                            i < Math.floor(product.rating) ? 'text-secondary' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                      <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-primary font-bold text-xl mb-2">
                        최저가 ₩{product.lowestPrice.toLocaleString()}
                      </div>
                      <div className="space-y-2">
                        {product.prices.map((priceInfo, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{priceInfo.store}</span>
                            <span className={`font-semibold ${priceInfo.price === product.lowestPrice ? 'text-red-600' : 'text-gray-800'}`}>
                              ₩{priceInfo.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Link to={`/product/${product.id}`} className="block">
                        <button className="w-full bg-secondary text-white py-2 rounded-full hover:bg-yellow-600 transition-colors">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          가격 비교하기
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-12">
              <nav className="flex space-x-2">
                <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  이전
                </button>
                <button className="px-4 py-2 text-white bg-primary border border-primary rounded">
                  1
                </button>
                <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  3
                </button>
                <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;