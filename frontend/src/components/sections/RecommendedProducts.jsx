import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecommendedProducts } from '../../services/api';

const RecommendedProducts = () => {
  const [recommendations, setRecommendations] = useState({
    userBased: [],
    categoryBased: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // JWT 토큰을 통해 사용자 인증 (Gateway에서 검증 후 userId 전달)
        const data = await fetchRecommendedProducts();

        if (data.recommendations) {
          setRecommendations(data.recommendations);
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

  // 추천 상품이 없으면 렌더링하지 않음
  if (loading) return null;
  if (error) return null;
  if (recommendations.userBased.length === 0 &&
      recommendations.categoryBased.length === 0) {
    return null;
  }

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.productId}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative overflow-hidden">
          <img
            src={product.url}
            alt={product.productName}
            className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">
              {product.subCategory?.subName || '주류'}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
            {product.productName}
          </h3>
          <p className="text-gray-600 text-sm mb-2 truncate">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">{product.brand}</span>
            <span className="text-primary font-semibold">{product.alcoholPercentage}%</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const RecommendationSection = ({ title, products, icon }) => {
    if (!products || products.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <i className={`${icon} text-2xl text-primary mr-3`}></i>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.slice(0, 5).map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            <i className="fas fa-magic text-primary mr-2"></i>
            당신을 위한 맞춤 추천
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            취향 분석을 통해 선별된 추천 상품을 만나보세요
          </p>
        </div>

        {/* Recommendations */}
        <RecommendationSection
          title="당신이 좋아할 만한 상품"
          products={recommendations.userBased}
          icon="fas fa-star"
        />

        <RecommendationSection
          title="비슷한 카테고리 추천"
          products={recommendations.categoryBased}
          icon="fas fa-tags"
        />
      </div>
    </section>
  );
};

export default RecommendedProducts;
