import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMainProducts, fetchFavorites, addFavorite, removeFavorite } from '../../services/api';

const FeaturedProducts = () => {
  const [products,setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [favoriteProductIds, setFavoriteProductIds] = useState(new Set());

  // 사용자 ID 가져오기
  const getUserId = () => {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.id || parsed.userId;
    }
    return null;
  };

    useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchMainProducts();

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

        const transformedProducts = data.map(item => {
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

          return {
            id: product.productId,
            name: product.productName,
            lowestPrice: lowestPrice,
            prices: prices,
            image: product.url,
            category: product.subCategoryDto.subName,
            topCategory: product.subCategoryDto.topCategoryDto?.topName || null,
            rating: (avgRating /20).toFixed(1),
            description: product.description ||`${product.subCategoryDto.subName} 상품`
          };
        });

        setProducts(transformedProducts.slice(0, 6));
      } catch (err) {
        setError(err.message);
        console.log(err);
      }
    };

    loadProducts();
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
        await removeFavorite(userId, productId);
        setFavoriteProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await addFavorite(userId, productId);
        setFavoriteProductIds(prev => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error('즐겨찾기 토글 실패:', err);
      alert('즐겨찾기 처리 중 오류가 발생했습니다.');
    }
  };
    

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full">
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
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            인기 주류 최저가 비교
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            소주, 맥주, 와인 등 일상 속 인기 주류를 최저가로 만나보세요
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors inline-block"
          >
            더 많은 상품 보기
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;