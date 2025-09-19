import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';
import adminNotificationService from '../services/adminNotificationService';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    notifications: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    checkAdminAccess();
    loadDashboardData();
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

      setUser(userData);
    } catch (error) {
      console.error('Failed to check admin access:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // 최근 가입한 사용자 5명 조회 (ID 기준 내림차순 - 최신 가입자)
      const usersData = await adminService.getAllUsers(0, 5, 'id', 'desc');
      const products = adminService.getHardcodedProducts();

      // API 응답 구조에 따라 안전하게 데이터 추출
      const usersList = usersData?.content || [];
      const totalUsers = usersData?.totalElements || 0;

      setRecentUsers(usersList);
      setRecentProducts(products.slice(0, 5));

      // 읽지 않은 알림 수 조회
      let unreadCount = 0;
      try {
        unreadCount = await adminNotificationService.getUnreadCount();
      } catch (error) {
        console.log('Admin notifications not available yet, using fallback');
        unreadCount = 0;
      }

      setStats({
        totalUsers: totalUsers,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        notifications: unreadCount
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);

      // 에러 발생 시 기본값 설정
      setRecentUsers([]);
      setRecentProducts(adminService.getHardcodedProducts().slice(0, 5));
      setStats({
        totalUsers: 0,
        totalProducts: adminService.getHardcodedProducts().length,
        activeProducts: adminService.getHardcodedProducts().filter(p => p.isActive).length,
        notifications: 0
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <i className="fas fa-tachometer-alt mr-3 text-primary"></i>
            관리자 대시보드
          </h1>
          <p className="text-gray-600 mt-2">
            안녕하세요, {user?.username}님. 시스템 현황을 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="fas fa-box text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 상품</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <i className="fas fa-check-circle text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 상품</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <i className="fas fa-bell text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">알림</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notifications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 최근 사용자 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">최근 가입 사용자</h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-primary hover:text-blue-800 text-sm font-medium"
                >
                  전체 보기 →
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최근 상품 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">최근 등록 상품</h2>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="text-primary hover:text-blue-800 text-sm font-medium"
                >
                  전체 보기 →
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProducts.map(product => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.currentPrice.toLocaleString()}원
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">사용자 관리</h3>
            <p className="text-sm text-gray-600">사용자 정보 조회 및 관리</p>
          </button>

          <button
            onClick={() => navigate('/admin/products')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <i className="fas fa-box text-green-600 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">상품 관리</h3>
            <p className="text-sm text-gray-600">상품 정보 등록 및 수정</p>
          </button>

          <button
            onClick={() => navigate('/admin/notifications')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <i className="fas fa-bell text-yellow-600 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">알림 관리</h3>
            <p className="text-sm text-gray-600">관리자 알림 확인</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <i className="fas fa-cog text-purple-600 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">시스템 설정</h3>
            <p className="text-sm text-gray-600">전체 시스템 설정</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;