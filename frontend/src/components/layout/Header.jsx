import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = () => {
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
        loadUserInfo();
      }
    };

    const loadUserInfo = async () => {
      if (authService.isLoggedIn()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Failed to load user info:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // 프로필 업데이트 이벤트 리스너 등록
    const handleProfileUpdate = () => {
      loadUserInfo();
    };

    authService.addListener(handleProfileUpdate);

    handleOAuthCallback();
    loadUserInfo();

    // 클린업 함수로 이벤트 리스너 제거
    return () => {
      authService.removeListener(handleProfileUpdate);
    };
  }, [location]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
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
            <div className="flex items-center space-x-3">
              <a href="#" className="hover:text-secondary transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
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
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
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
                    className="text-gray-700 font-medium hover:text-primary transition-colors cursor-pointer"
                  >
                    안녕하세요, {user?.username || user?.name}님
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
                      className="block text-center text-gray-700 font-medium py-2 hover:text-primary transition-colors"
                    >
                      안녕하세요, {user?.username || user?.name}님
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

    </div>
  );
};

export default Header;