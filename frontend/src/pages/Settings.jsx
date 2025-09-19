import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

const Settings = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('확인 중');
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
    loadNotificationStatus();
  }, []);

  const loadUserInfo = async () => {
    try {
      if (!authService.isLoggedIn()) {
        navigate('/login');
        return;
      }

      const userData = await authService.getCurrentUser();
      setUserInfo(userData);
    } catch (error) {
      console.error('Failed to load user info:', error);
      // 토큰이 만료되었거나 유효하지 않은 경우 로그인 페이지로 이동
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationStatus = async () => {
    try {
      const settings = await notificationService.getSettings();
      // 이메일 알림 또는 푸시 알림 중 하나라도 활성화되어 있으면 '활성화'
      const isActive = settings.emailNotifications || settings.pushNotifications;
      setNotificationStatus(isActive ? '활성화' : '비활성화');
    } catch (error) {
      // 설정이 없거나 에러가 발생하면 '비활성화'
      setNotificationStatus('비활성화');
    }
  };

  const settingsMenu = [
    {
      id: 'profile',
      title: '프로필 설정',
      description: '개인정보 및 계정 정보를 관리합니다',
      icon: 'fas fa-user-circle',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      action: () => navigate('/mypage')
    },
    {
      id: 'notifications',
      title: '알림 설정',
      description: '가격 하락 알림 및 푸시 알림을 설정합니다',
      icon: 'fas fa-bell',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      action: () => navigate('/notification-settings')
    },
    {
      id: 'privacy',
      title: '개인정보 처리방침',
      description: '개인정보 보호 정책을 확인합니다',
      icon: 'fas fa-shield-alt',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      action: () => navigate('/privacy')
    },
    {
      id: 'terms',
      title: '이용약관',
      description: '서비스 이용약관을 확인합니다',
      icon: 'fas fa-file-contract',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      action: () => navigate('/terms')
    },
    {
      id: 'help',
      title: '도움말 및 지원',
      description: '자주 묻는 질문과 고객지원을 확인합니다',
      icon: 'fas fa-question-circle',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      action: () => navigate('/help')
    }
  ];

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        await authService.logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // 실패해도 로컬 토큰은 제거하고 로그인 페이지로 이동
        navigate('/login');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link to="/favorites" className="inline-flex items-center text-primary hover:text-blue-800 mb-4">
            <i className="fas fa-arrow-left mr-2"></i>
            즐겨찾기로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-cog mr-3 text-primary"></i>
            설정
          </h1>
          <p className="text-gray-600">
            계정 설정과 앱 환경을 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 설정 메뉴 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">설정 메뉴</h2>
                <p className="text-sm text-gray-600 mt-1">원하는 설정을 선택하세요</p>
              </div>

              <div className="divide-y divide-gray-200">
                {settingsMenu.map((item) => (
                  <div
                    key={item.id}
                    onClick={item.action}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                        <i className={`${item.icon} ${item.color} text-xl`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-gray-400 group-hover:text-primary transition-colors">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 계정 관리 */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">계정 관리</h2>
              </div>

              <div className="p-6 space-y-4">
                <button
                  onClick={() => navigate('/mypage', { state: { openPasswordChange: true } })}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-key text-blue-500"></i>
                      <span className="font-medium text-gray-900 group-hover:text-primary">비밀번호 변경</span>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400 group-hover:text-primary"></i>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left p-4 border border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-sign-out-alt text-red-500"></i>
                      <span className="font-medium text-red-600 group-hover:text-red-700">로그아웃</span>
                    </div>
                    <i className="fas fa-chevron-right text-red-400 group-hover:text-red-600"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 - 사용자 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{userInfo.username || userInfo.name}</h3>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">휴대폰</span>
                  <span className="text-gray-900">{userInfo.phone || '정보 없음'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">가입일</span>
                  <span className="text-gray-900">
                    {userInfo.createdAt
                      ? new Date(userInfo.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\. /g, '.').replace(/\.$/, '')
                      : '정보 없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">즐겨찾기</span>
                  <span className="text-gray-900">{favoriteCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">알림</span>
                  <span className={notificationStatus === '활성화' ? 'text-green-600' : 'text-gray-500'}>
                    {notificationStatus}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">앱 버전</div>
                  <div className="text-sm font-medium text-gray-900">v1.2.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;