import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
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
    }
  ];

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
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