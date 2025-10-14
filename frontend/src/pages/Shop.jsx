import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {fetchProducts, fethCategory, fetchFavorites, addFavorite, removeFavorite, recordUserActivity} from '../services/api';
import favoriteService from '../services/favoriteService';
import AlcoholPreloader from '../components/AlcoholPreloader';

function Shop() {
  const [selectedTopCategory, setSelectedTopCategory] = useState('전체');
  const [selectedSubCategory, setSelectedSubCategory] = useState('전체');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [alcoholRange, setAlcoholRange] = useState([0, 60]);
  const [selectedVolumeCategories, setSelectedVolumeCategories] = useState([]);
  const [sortBy, setSortBy] = useState('기본순');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(1);
  const itemsPerPage = 6;

  const [categoryData, setCategoryData] = useState({'전체': []});
  const [topCategories, setTopCategories] = useState(['전체']);
  const [products, setProducts] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState(new Set());

  // 사용자 ID 가져오기 (JWT 토큰에서 추출)
  const getUserId = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return null;

    try {
      // JWT의 payload 부분 디코딩 (base64)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub; // sub 필드에 userId가 저장되어 있음
    } catch (err) {
      console.error('토큰 디코딩 실패:', err);
      return null;
    }
  };

  // 용량 카테고리 정의
  const volumeCategories = [
    { id: 'small', label: '소용량 (500ml 이하)', min: 0, max: 500 },
    { id: 'medium', label: '일반 (500ml ~ 1L)', min: 500, max: 1000 },
    { id: 'large', label: '대용량 (1L 이상)', min: 1000, max: Infinity }
  ];


  const filteredProducts = products.filter(product => {
    let categoryMatch = true;

    if (selectedTopCategory !== '전체') {
      // 상위 카테고리가 선택된 경우
      if (selectedSubCategory === '전체') {
        // 하위 카테고리가 '전체'인 경우 상위 카테고리만 확인
        categoryMatch = categoryData[selectedTopCategory].includes(product.category) ||
                       product.category === selectedTopCategory;
      } else {
        // 하위 카테고리가 선택된 경우 하위 카테고리와 정확히 매칭
        categoryMatch = product.category === selectedSubCategory;
      }
    }

    const priceMatch = product.lowestPrice >= priceRange[0] * 1000 &&
                      (priceRange[1] >= 300 ? true : product.lowestPrice <= priceRange[1] * 1000);

    const alcoholMatch = (product.alcoholPercentage >= alcoholRange[0]) &&
                        (alcoholRange[1] >= 60 ? true : product.alcoholPercentage <= alcoholRange[1]);

    // 용량 필터링 (선택된 카테고리가 없으면 모든 상품 표시)
    const volumeMatch = selectedVolumeCategories.length === 0 ||
                       selectedVolumeCategories.some(categoryId => {
                         const category = volumeCategories.find(vc => vc.id === categoryId);
                         return product.volume >= category.min && product.volume <= category.max;
                       });

    return categoryMatch && priceMatch && alcoholMatch && volumeMatch;
  });

  // 정렬 적용
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case '가격낮은순':
        return a.lowestPrice - b.lowestPrice;
      case '가격높은순':
        return b.lowestPrice - a.lowestPrice;
      case '평점순':
        return b.rating - a.rating;
      case '기본순':
      default:
        return a.id - b.id; // ID 순으로 정렬
    }
  });

  // 페이지네이션 로직
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // 카테고리나 필터, 정렬이 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
    setPageGroup(1);
  }, [selectedTopCategory, selectedSubCategory, priceRange, alcoholRange, selectedVolumeCategories, sortBy]);

   useEffect(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);

          // 카테고리 데이터와 상품 데이터를 병렬로 가져오기
          const [categoryResponse, productsResponse] = await Promise.all([
            fethCategory(),
            fetchProducts()
          ]);

          // 즐겨찾기 목록 가져오기 (로그인한 경우)
          const userId = getUserId();
          if (userId) {
            try {
              const favorites = await fetchFavorites(userId);
              const favoriteIds = new Set(favorites.map(fav => fav.productId));
              setFavoriteProductIds(favoriteIds);
            } catch (err) {
              console.error('즐겨찾기 목록 로드 실패:', err);
            }
          }

          // 카테고리 데이터 변환
          const transformedCategoryData = {'전체': []};
          const topCategoryNames = ['전체'];

          Object.keys(categoryResponse).forEach(topCategoryKey => {
            // "TopCategoryDto(topCategoryId=4, topName=와인)" 형태에서 topName 추출
            const match = topCategoryKey.match(/topName=([^)]+)\)/);
            if (match) {
              const topCategoryName = match[1];
              const subCategories = categoryResponse[topCategoryKey].map(sub => sub.subName);

              transformedCategoryData[topCategoryName] = subCategories;
              topCategoryNames.push(topCategoryName);
            }
          });

          // "기타"가 포함된 카테고리를 맨 아래로 정렬
          const sortedTopCategories = topCategoryNames.sort((a, b) => {
            if (a === '전체') return -1; // '전체'는 항상 맨 위
            if (b === '전체') return 1;
            if (a.includes('기타')) return 1; // '기타'가 포함된 것은 아래로
            if (b.includes('기타')) return -1;
            return a.localeCompare(b); // 나머지는 알파벳 순
          });

          // 하위 카테고리 통합 및 정리
          Object.keys(transformedCategoryData).forEach(topCategory => {
            if (transformedCategoryData[topCategory].length > 0) {
              // 카테고리 통합 로직
              const categoryMap = {};
              transformedCategoryData[topCategory].forEach(subCategory => {
                if (subCategory === '레드' || subCategory === '레드와인') {
                  categoryMap['레드와인'] = true;
                } else if (subCategory === '로제' || subCategory === '로제와인') {
                  categoryMap['로제와인'] = true;
                } else if (subCategory === '화이트' || subCategory === '화이트와인') {
                  categoryMap['화이트와인'] = true;
                } else {
                  categoryMap[subCategory] = true;
                }
              });

              // 통합된 카테고리 배열로 변환
              const mergedCategories = Object.keys(categoryMap);

              // "기타"가 포함된 것을 아래로 정렬
              mergedCategories.sort((a, b) => {
                if (a.includes('기타')) return 1;
                if (b.includes('기타')) return -1;
                return a.localeCompare(b);
              });

              transformedCategoryData[topCategory] = mergedCategories;
            }
          });

          setCategoryData(transformedCategoryData);
          setTopCategories(sortedTopCategories);

          // 상품 데이터 변환
          const transformedProducts = productsResponse.map(item => {
            const product = item.product;
            const avgRating = item.avgRating;

            // 백엔드에서 이미 배송비 포함 총액 기준으로 정렬됨 -> 첫 번째 항목이 최저가
            const lowestPrice = product.priceDtoList.length > 0
              ? (product.priceDtoList[0].price + product.priceDtoList[0].deliveryFee)
              : 0;

            const prices = product.priceDtoList.map(priceInfo => ({
              store: priceInfo.shopDto.shopName,
              price: priceInfo.price
            }));

            // 카테고리명 통합
            let categoryName = product.subCategoryDto.subName;
            if (categoryName === '레드' || categoryName === '레드와인') {
              categoryName = '레드와인';
            } else if (categoryName === '로제' || categoryName === '로제와인') {
              categoryName = '로제와인';
            } else if (categoryName === '화이트' || categoryName === '화이트와인') {
              categoryName = '화이트와인';
            }

            return {
              id: product.productId,
              name: product.productName,
              alcoholPercentage: product.alcoholPercentage,
              volume: product.volume,
              lowestPrice: lowestPrice,
              prices: prices,
              image: product.url,
              category: categoryName,
              topCategory: product.subCategoryDto.topCategoryDto?.topName || null,
              rating: (avgRating /20).toFixed(1),
              description: product.description ||`${categoryName} 상품`
            };
          });

          setProducts(transformedProducts);
          
          // 데이터 로드 완료 후 로딩 상태 해제
          setIsLoading(false); 
        } catch (err) {
          console.log(err);
          setIsLoading(false);
        }
      };

      loadData();
    }, []);

  // 즐겨찾기 토글 함수
  const toggleFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = getUserId();
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const isFavorite = favoriteProductIds.has(productId);

      if (isFavorite) {
        // 즐겨찾기 삭제
        await removeFavorite(userId, productId);
        setFavoriteProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        // 즐겨찾기 추가
        await addFavorite(userId, productId);
        setFavoriteProductIds(prev => new Set([...prev, productId]));

        // 즐겨찾기 활동 기록 (비동기로 실행, 에러 무시)
        recordUserActivity(productId, 'FAVORITE').catch(err => {
          console.log('즐겨찾기 활동 기록 실패 (무시):', err);
        });
      }

      // 즐겨찾기 변경 알림
      favoriteService.notifyChange();
    } catch (err) {
      console.error('즐겨찾기 토글 실패:', err);
      alert('즐겨찾기 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <AlcoholPreloader isLoading={isLoading} />
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

              {/* 상위 카테고리 */}
              <div className="space-y-3 mb-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2">상위 카테고리</h4>
                {topCategories.map(category => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="topCategory"
                      value={category}
                      checked={selectedTopCategory === category}
                      onChange={(e) => {
                        setSelectedTopCategory(e.target.value);
                        setSelectedSubCategory('전체'); // 상위 카테고리 변경시 하위 카테고리 초기화
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">{category}</span>
                  </label>
                ))}
              </div>

              {/* 하위 카테고리 */}
              {selectedTopCategory !== '전체' && categoryData[selectedTopCategory]?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">하위 카테고리</h4>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="subCategory"
                      value="전체"
                      checked={selectedSubCategory === '전체'}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">전체</span>
                  </label>
                  {categoryData[selectedTopCategory].map(subCategory => (
                    <label key={subCategory} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="subCategory"
                        value={subCategory}
                        checked={selectedSubCategory === subCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-700 pl-4">{subCategory}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">가격 범위</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{priceRange[0] * 1000}원</span>
                    <span>{priceRange[1] >= 300 ? '300,000+원' : `${priceRange[1] * 1000}원`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">도수 범위</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={alcoholRange[1]}
                    onChange={(e) => setAlcoholRange([alcoholRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{alcoholRange[0]}%</span>
                    <span>{alcoholRange[1] >= 60 ? '+60%' : `${alcoholRange[1]}%`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">용량</h3>
              <div className="space-y-3">
                {volumeCategories.map(category => (
                  <label key={category.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVolumeCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVolumeCategories([...selectedVolumeCategories, category.id]);
                        } else {
                          setSelectedVolumeCategories(selectedVolumeCategories.filter(id => id !== category.id));
                        }
                      }}
                      className="text-primary focus:ring-primary mr-2"
                    />
                    <span className="text-gray-700">{category.label}</span>
                  </label>
                ))}
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
              <p className="text-gray-600">{sortedProducts.length}개의 상품</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative overflow-hidden flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-[300px] h-[300px] object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        {product.topCategory ? (
                          <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {product.topCategory}
                          </span>
                        ) : (
                          <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={(e) => toggleFavorite(e, product.id)}
                          className={`p-2 rounded-full shadow-md transition-colors ${
                            favoriteProductIds.has(product.id)
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-white text-gray-600 hover:bg-yellow-500 hover:text-white'
                          }`}
                        >
                          <i className={`fas fa-star text-sm ${favoriteProductIds.has(product.id) ? 'text-white' : ''}`}></i>
                        </button>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-grow">
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

                    <div className="space-y-3 flex-grow flex flex-col">
                      <div className="text-primary font-bold text-xl mb-2">
                        최저가 ₩{product.lowestPrice.toLocaleString()}
                      </div>
                      <div className="space-y-2 flex-grow">
                        {product.prices.map((priceInfo, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{priceInfo.store}</span>
                            <span className={`font-semibold ${priceInfo.price === product.lowestPrice ? 'text-red-600' : 'text-gray-800'}`}>
                              ₩{priceInfo.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Link to={`/product/${product.id}`} className="block mt-auto">
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
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(prev => prev - 1);
                        // 현재 페이지가 현재 그룹의 첫 번째 페이지면 이전 그룹으로 이동
                        if (currentPage === (pageGroup - 1) * 5 + 1) {
                          setPageGroup(prev => Math.max(prev - 1, 1));
                        }
                      }
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border border-gray-300 rounded ${
                      currentPage === 1
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    이전
                  </button>

                  {(() => {
                    const maxVisible = 5;
                    const startPage = (pageGroup - 1) * maxVisible + 1;
                    const endPage = Math.min(startPage + maxVisible - 1, totalPages);

                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return pages.map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 border rounded ${
                          currentPage === pageNum
                            ? 'text-white bg-primary border-primary'
                            : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(prev => prev + 1);
                        // 현재 페이지가 현재 그룹의 마지막 페이지면 다음 그룹으로 이동
                        if (currentPage === pageGroup * 5) {
                          setPageGroup(prev => prev + 1);
                        }
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border border-gray-300 rounded ${
                      currentPage === totalPages
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Shop;