import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMainProducts } from '../../services/api';

const FeaturedProducts = () => {
  const [products,setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchMainProducts();

        const transformedProducts = data.map(item => {
          const product = item.product;
          const avgRating = item.avgRating;

          const lowestPrice = Math.min(...product.priceDtoList.map(p =>p.price));

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
            category:product.subCategoryDto.subName,
            rating: (avgRating /20).toFixed(1),
            description: product.description ||`${product.subCategoryDto.subName} 상품`
          };
        });

        setProducts(transformedProducts.slice(0, 6));
      } catch (err) {
        setError(err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
    

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