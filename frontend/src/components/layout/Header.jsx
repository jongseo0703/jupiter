import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import favoriteService from '../../services/favoriteService';
import { fetchFavorites } from '../../services/api';
import api from '../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [favoriteCount, setFavoriteCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // URL에서 토큰 파라미터 제거
        const newUrl = location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // 사용자 정보 로드
        await loadUserInfo();

        // 설문 완료 여부 확인
        try {
          const surveyResponse = await api.get('/auth/api/v1/preferences/status');
          const surveyCompleted = surveyResponse.data;

          if (!surveyCompleted) {
            // 설문 미완료 시 설문조사 페이지로
            navigate('/preference-survey');
          }
        } catch (error) {
          console.error('Failed to check survey status:', error);
        }
      }
    };

    const loadUserInfo = async () => {
      if (authService.isLoggedIn()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);

          // 즐겨찾기 개수 로드
          loadFavoriteCount(userData.id || userData.userId);
        } catch (error) {
          console.error('Failed to load user info:', error);
          setIsLoggedIn(false);
          setUser(null);
          setFavoriteCount(0);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setFavoriteCount(0);
      }
    };

    const loadFavoriteCount = async (userId) => {
      try {
        const favorites = await fetchFavorites(userId);
        setFavoriteCount(favorites.length);
      } catch (error) {
        console.error('Failed to load favorite count:', error);
        setFavoriteCount(0);
      }
    };

    // 프로필 업데이트 이벤트 리스너 등록
    const handleProfileUpdate = () => {
      loadUserInfo();
    };

    // 즐겨찾기 변경 이벤트 리스너 등록
    const handleFavoriteChange = () => {
      // 로그인 상태 확인 후 즐겨찾기 로드
      if (authService.isLoggedIn()) {
        const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          const userId = parsed.id || parsed.userId;
          if (userId) {
            loadFavoriteCount(userId);
          }
        }
      }
    };

    authService.addListener(handleProfileUpdate);
    favoriteService.addListener(handleFavoriteChange);

    handleOAuthCallback();
    loadUserInfo();

    // 클린업 함수로 이벤트 리스너 제거
    return () => {
      authService.removeListener(handleProfileUpdate);
      favoriteService.removeListener(handleFavoriteChange);
    };
  }, [location]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      showToastMessage('로그아웃이 완료되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      showToastMessage('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="relative">
      {/* Top Bar */}
      <div className="bg-primary text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                서울특별시 강남구 테헤란로 123
              </span>
              <span className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                Email@Example.com
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary hover:text-accent transition-colors">
                <i className="fas fa-wine-bottle mr-2 text-secondary"></i>
                Ju(酒)piter
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
                홈
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">
                가격비교
              </Link>
              <Link to="/board" className="text-gray-700 hover:text-primary font-medium transition-colors">
                커뮤니티
              </Link>
            </div>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="검색..."
                  className="hidden lg:block w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary"
                />
                <button className="lg:absolute lg:right-3 lg:top-1/2 lg:transform lg:-translate-y-1/2 p-2 text-gray-500 hover:text-primary">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              
              <div className="relative">
                <Link to="/favorites" className="flex items-center space-x-1 p-2 text-gray-700 hover:text-primary">
                  <i className="fas fa-star text-xl"></i>
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favoriteCount}
                    </span>
                  )}
                </Link>
              </div>

              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="p-2 text-gray-700 hover:text-primary transition-colors"
                      title="관리자 페이지"
                    >
                      <i className="fas fa-tachometer-alt text-xl"></i>
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="p-2 text-gray-700 hover:text-primary transition-colors"
                    title="설정"
                  >
                    <i className="fas fa-cog text-xl"></i>
                  </Link>
                  <Link
                    to="/mypage"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 font-medium hover:text-primary hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                    title="마이페이지로 이동"
                  >
                    <i className="fas fa-user-circle text-lg"></i>
                    <span>안녕하세요, {user?.username || user?.name}님</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-colors font-medium"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-800 transition-colors font-medium"
                >
                  로그인
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-primary"
              >
                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-4">
                <Link to="/" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>홈</Link>
                <Link to="/shop" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>가격비교</Link>
                <Link to="/board" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>커뮤니티</Link>
                <Link to="/favorites" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>즐겨찾기</Link>
                <Link to="/community-form" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>글쓰기</Link>
                <Link to="/about" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>회사소개</Link>
                {isLoggedIn && user?.role === 'ADMIN' && (
                  <Link to="/admin" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>관리자 페이지</Link>
                )}
                {isLoggedIn && (
                  <Link to="/settings" className="block text-gray-700 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>설정</Link>
                )}
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      to="/mypage"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 text-gray-700 font-medium py-3 px-4 mx-2 rounded-lg hover:text-primary hover:bg-gray-200 transition-all duration-200"
                      title="마이페이지로 이동"
                    >
                      <i className="fas fa-user-circle text-lg"></i>
                      <span>안녕하세요, {user?.username || user?.name}님</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                  >
                    로그인
                  </Link>
                )}
                <div className="pt-4">
                  <input 
                    type="text" 
                    placeholder="검색..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-4 rounded-lg shadow-xl flex items-center animate-fade-in">
          <i className="fas fa-check-circle mr-3 text-lg"></i>
          <span className="text-lg font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default Header;