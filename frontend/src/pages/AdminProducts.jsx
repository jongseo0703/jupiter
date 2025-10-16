import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { fetchProducts, fetchProduct, updateProductAvailability, updateProduct, deleteProduct, updatePrice, fethCategory } from '../services/api';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    currentPrice: '',
    originalPrice: '',
    lowestPrice: '',
    category: '',
    image: '',
    isActive: true,
    prices: [] // 각 상점별 가격 정보 (priceId, shopName, price 포함)
  });

  // 페이징 관련 state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 카테고리 state
  const [topCategories, setTopCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);

  useEffect(() => {
    checkAdminAccess();
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const categoryData = await fethCategory();

      // API 응답이 객체이므로 키에서 topCategory 정보 추출하고 값에서 subCategories 가져오기
      const topCats = [];
      const subCats = [];

      // 객체를 순회하며 처리
      Object.entries(categoryData).forEach(([key, subCategories]) => {
        // 키에서 topCategoryId와 topName 추출 (정규식 사용)
        const idMatch = key.match(/topCategoryId=(\d+)/);
        const nameMatch = key.match(/topName=([^)]+)\)/);

        if (idMatch && nameMatch) {
          const topCategoryId = parseInt(idMatch[1]);
          const topName = nameMatch[1] === 'null' ? '기타' : nameMatch[1];

          // null이나 빈 이름은 건너뛰기
          if (!topName || topName === 'null') return;

          // 상위 카테고리 추가
          topCats.push({
            id: topCategoryId,
            name: topName
          });

          // 하위 카테고리들 추가
          if (Array.isArray(subCategories)) {
            subCategories.forEach(sub => {
              // subName이 null이거나 빈 문자열이 아닌 경우만 추가
              if (sub.subName && sub.subName.trim()) {
                subCats.push({
                  id: sub.subCategoryId,
                  name: sub.subName,
                  topCategoryId: topCategoryId,
                  topCategoryName: topName
                });
              }
            });
          }
        }
      });

      // ID 순으로 정렬
      topCats.sort((a, b) => a.id - b.id);
      subCats.sort((a, b) => a.id - b.id);

      setTopCategories(topCats);
      setAllSubCategories(subCats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // 카테고리 변경 시 첫 페이지로 이동하면서 새로 로드
  useEffect(() => {
    loadProducts(0);
  }, [selectedCategory]);

  // 검색어 변경 시 첫 페이지로 이동하면서 새로 로드 (디바운스 적용)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(0);
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const checkAdminAccess = async () => {
    try {
      if (!authService.isLoggedIn()) {
        navigate('/login');
        return;
      }

      const userData = await authService.getCurrentUser();
      if (userData.role !== 'ADMIN') {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      navigate('/login');
    }
  };

  const loadProducts = async (page = currentPage) => {
    try {
      setIsLoading(true);
      // 관리자는 비활성 상품도 포함하여 모든 상품을 조회 (페이징 + 카테고리 필터링 + 검색 포함)
      const data = await fetchProducts(true, page, pageSize, selectedCategory, searchTerm); // includeInactive=true

      console.log('API Response:', data); // 디버깅용

      // 페이징 메타데이터 설정
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.currentPage || 0);

      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const productList = data.content || [];
      const transformedProducts = productList.map(item => {
        const product = item.product;
        // 배송비 포함한 최저가 계산
        const lowestPrice = product.priceDtoList && product.priceDtoList.length > 0
          ? Math.min(...product.priceDtoList.map(p => (p.price || 0) + (p.deliveryFee || 0)))
          : 0;

        // 현재가 (첫 번째 상점 가격 + 배송비)
        const currentPrice = product.priceDtoList?.[0]
          ? (product.priceDtoList[0].price || 0) + (product.priceDtoList[0].deliveryFee || 0)
          : 0;

        return {
          id: product.productId,
          name: product.productName,
          currentPrice: currentPrice,
          originalPrice: product.yesterdayLowestPrice || lowestPrice,
          lowestPrice: lowestPrice,
          category: product.subCategoryDto?.subName || '기타',
          image: product.url || 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
          isActive: product.isAvailable !== undefined ? product.isAvailable : true
        };
      });

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (product) => {
    try {
      setSelectedProduct(product);

      // 상품의 전체 정보를 가져와서 가격 정보 포함
      const detailData = await fetchProduct(product.id);

      setEditFormData({
        name: product.name || '',
        currentPrice: product.currentPrice || '',
        originalPrice: product.originalPrice || '',
        lowestPrice: product.lowestPrice || '',
        category: product.category || '',
        image: product.image || '',
        isActive: product.isActive,
        prices: detailData.priceDtoList || [] // 각 상점별 가격 정보
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      alert('상품 정보를 불러오는데 실패했습니다.');
    }
  };

  const handlePriceChange = (priceId, newPrice) => {
    setEditFormData({
      ...editFormData,
      prices: editFormData.prices.map(p =>
        p.priceId === priceId ? { ...p, price: Number(newPrice), modified: true } : p
      )
    });
  };

  const handleSaveEdit = async () => {
    try {
      // 상품 기본 정보 업데이트
      await updateProduct(selectedProduct.id, {
        productName: editFormData.name,
        url: editFormData.image
      });

      // 가격 정보 업데이트 (변경된 가격들만)
      const priceUpdatePromises = editFormData.prices
        .filter(priceInfo => priceInfo.modified)
        .map(priceInfo => updatePrice(priceInfo.priceId, priceInfo.price));

      await Promise.all(priceUpdatePromises);

      // UI 업데이트를 위해 다시 로드
      await loadProducts();
      setShowEditModal(false);
      alert('상품 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('상품 정보 수정에 실패했습니다.');
    }
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      // 삭제된 상품을 목록에서 완전히 제거
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      alert('상품이 완전히 삭제되었습니다.');
      // 상품 목록 새로고침
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const newStatus = !product.isActive;
      await updateProductAvailability(product.id, newStatus);

      setProducts(products.map(p =>
        p.id === product.id ? { ...p, isActive: newStatus } : p
      ));

      alert(`상품이 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('Failed to toggle product status:', error);
      alert('상품 상태 변경에 실패했습니다.');
    }
  };

  // 백엔드에서 검색과 카테고리 필터링을 모두 처리하므로 프론트엔드 필터링 불필요
  const filteredProducts = products;

  const getPriceChangePercentage = (current, original) => {
    return ((current - original) / original * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">상품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="text-primary hover:text-blue-800 mb-4 flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                관리자 대시보드로 돌아가기
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                <i className="fas fa-box mr-3 text-primary"></i>
                상품 관리
              </h1>
              <p className="text-gray-600 mt-2">
                총 {products.length}개의 상품이 등록되어 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="상품명 또는 카테고리로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">전체 카테고리</option>
                {topCategories.map(topCat => (
                  <optgroup key={topCat.id} label={topCat.name}>
                    {allSubCategories
                      .filter(sub => sub.topCategoryId === topCat.id)
                      .map(subCat => (
                        <option key={subCat.id} value={subCat.name}>
                          {subCat.name}
                        </option>
                      ))
                    }
                  </optgroup>
                ))}
              </select>
            </div>
            <button
              onClick={loadProducts}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              새로고침
            </button>
          </div>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">현재가</span>
                    <span className="text-lg font-bold text-primary">
                      {product.currentPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">최저가</span>
                    <span className="text-sm font-medium text-green-600">
                      {product.lowestPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">변동률</span>
                    <span className={`text-sm font-medium ${
                      getPriceChangePercentage(product.currentPrice, product.originalPrice) < 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {getPriceChangePercentage(product.currentPrice, product.originalPrice)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleToggleActive(product)}
                    className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                      product.isActive
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <i className={`fas ${product.isActive ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
                    {product.isActive ? '비활성화' : '활성화'}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">검색 조건에 맞는 상품이 없습니다.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button
              onClick={() => loadProducts(0)}
              disabled={currentPage === 0}
              className={`px-3 py-2 rounded ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              onClick={() => loadProducts(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-3 py-2 rounded ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-angle-left"></i>
            </button>

            {[...Array(totalPages)].map((_, index) => {
              // 현재 페이지 근처만 표시
              if (
                index === 0 || // 첫 페이지
                index === totalPages - 1 || // 마지막 페이지
                (index >= currentPage - 2 && index <= currentPage + 2) // 현재 페이지 근처
              ) {
                return (
                  <button
                    key={index}
                    onClick={() => loadProducts(index)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              } else if (
                index === currentPage - 3 ||
                index === currentPage + 3
              ) {
                return <span key={index} className="px-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => loadProducts(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`px-3 py-2 rounded ${
                currentPage >= totalPages - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              onClick={() => loadProducts(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className={`px-3 py-2 rounded ${
                currentPage >= totalPages - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
            <span className="ml-4 text-sm text-gray-600">
              {currentPage + 1} / {totalPages} 페이지 (총 {totalElements}개)
            </span>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-10">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  상품 정보 수정
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이미지 URL
                    </label>
                    <input
                      type="url"
                      value={editFormData.image}
                      onChange={(e) => setEditFormData({...editFormData, image: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {editFormData.image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        미리보기
                      </label>
                      <img
                        src={editFormData.image}
                        alt="미리보기"
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400';
                        }}
                      />
                    </div>
                  )}

                  {/* 가격 정보 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-won-sign mr-2"></i>
                      상점별 가격 정보
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {editFormData.prices && editFormData.prices.length > 0 ? (
                        editFormData.prices.map((priceInfo) => (
                          <div key={priceInfo.priceId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="text-xs text-gray-600 mb-1">
                                {priceInfo.shopDto?.shopName || '상점명 없음'}
                              </div>
                              <input
                                type="number"
                                value={priceInfo.price}
                                onChange={(e) => handlePriceChange(priceInfo.priceId, e.target.value)}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="가격 입력"
                              />
                            </div>
                            <span className="text-xs text-gray-500">원</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">
                          가격 정보가 없습니다.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      가격은 수동으로 수정할 수 있으며, 크롤링으로도 자동 업데이트됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">상품 삭제</h3>
                <p className="text-sm text-gray-500 mb-6">
                  정말로 "{selectedProduct?.name}" 상품을 삭제하시겠습니까?<br/>
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;