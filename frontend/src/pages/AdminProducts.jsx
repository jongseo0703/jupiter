import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';

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
    isActive: true
  });

  const categories = ['all', '소주', '맥주', '와인', '양주', '전통주'];

  useEffect(() => {
    checkAdminAccess();
    loadProducts();
  }, []);

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

  const loadProducts = () => {
    try {
      setIsLoading(true);
      const data = adminService.getHardcodedProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name || '',
      currentPrice: product.currentPrice || '',
      originalPrice: product.originalPrice || '',
      lowestPrice: product.lowestPrice || '',
      category: product.category || '',
      image: product.image || '',
      isActive: product.isActive
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedProduct = await adminService.updateProduct(selectedProduct.id, {
        ...editFormData,
        currentPrice: Number(editFormData.currentPrice),
        originalPrice: Number(editFormData.originalPrice),
        lowestPrice: Number(editFormData.lowestPrice)
      });

      setProducts(products.map(p =>
        p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p
      ));
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
      await adminService.deleteProduct(selectedProduct.id);
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      alert('상품이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  const handleAdd = () => {
    setEditFormData({
      name: '',
      currentPrice: '',
      originalPrice: '',
      lowestPrice: '',
      category: '소주',
      image: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    try {
      const newProduct = await adminService.addProduct({
        ...editFormData,
        currentPrice: Number(editFormData.currentPrice),
        originalPrice: Number(editFormData.originalPrice),
        lowestPrice: Number(editFormData.lowestPrice)
      });

      setProducts([...products, newProduct]);
      setShowAddModal(false);
      alert('새 상품이 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('상품 추가에 실패했습니다.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                총 {products.length}개의 상품이 등록되어 있습니다. (하드코딩 데이터)
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              새 상품 추가
            </button>
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
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '전체 카테고리' : category}
                  </option>
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
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">검색 조건에 맞는 상품이 없습니다.</p>
          </div>
        )}

        {/* 수정/추가 모달 */}
        {(showEditModal || showAddModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {showAddModal ? '새 상품 추가' : '상품 정보 수정'}
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
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
                      카테고리
                    </label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      현재 가격
                    </label>
                    <input
                      type="number"
                      value={editFormData.currentPrice}
                      onChange={(e) => setEditFormData({...editFormData, currentPrice: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      원래 가격
                    </label>
                    <input
                      type="number"
                      value={editFormData.originalPrice}
                      onChange={(e) => setEditFormData({...editFormData, originalPrice: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최저 가격
                    </label>
                    <input
                      type="number"
                      value={editFormData.lowestPrice}
                      onChange={(e) => setEditFormData({...editFormData, lowestPrice: e.target.value})}
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

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      활성 상품
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowAddModal(false);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={showAddModal ? handleSaveAdd : handleSaveEdit}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800"
                  >
                    {showAddModal ? '추가' : '저장'}
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