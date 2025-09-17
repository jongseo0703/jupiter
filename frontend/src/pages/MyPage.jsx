import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!authService.isLoggedIn()) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setEditFormData({
          username: userData.username || userData.name || '',
          email: userData.email || ''
        });
      } catch (error) {
        console.error('Failed to load user info:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // 편집 취소 시 원래 데이터로 복원
      setEditFormData({
        username: user?.username || user?.name || '',
        email: user?.email || ''
      });
    }
    setIsEditing(!isEditing);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      // 백엔드에 프로필 업데이트 요청
      const updatedUser = await authService.updateProfile(editFormData);

      // 성공 시 사용자 정보 업데이트
      setUser(updatedUser);
      setIsEditing(false);

      // 성공 메시지 (임시로 콘솔에)
      console.log('프로필이 성공적으로 업데이트되었습니다.');

    } catch (error) {
      console.error('Profile update failed:', error);
      setError(error.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSave = async () => {
    try {
      setIsPasswordSaving(true);
      setError('');

      // 비밀번호 확인
      if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
        setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return;
      }

      if (passwordFormData.newPassword.length < 8) {
        setError('새 비밀번호는 8자 이상이어야 합니다.');
        return;
      }

      // 백엔드에 비밀번호 업데이트 요청
      await authService.updateProfile({
        password: passwordFormData.newPassword
      });

      // 성공 시 폼 초기화 및 섹션 닫기
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);

      // 성공 메시지
      console.log('비밀번호가 성공적으로 변경되었습니다.');

    } catch (error) {
      console.error('Password update failed:', error);
      setError(error.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
                <p className="text-gray-600">회원 정보 및 설정을 관리할 수 있습니다.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    isEditing
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isEditing ? '편집 취소' : '정보 수정'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 사용자 정보 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  <i className="fas fa-user text-primary mr-2"></i>
                  회원 정보
                </h2>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        저장 중...
                      </div>
                    ) : (
                      '저장'
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자명
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={editFormData.username}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="사용자명을 입력하세요"
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md">
                      {user?.username || user?.name || '정보 없음'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="이메일을 입력하세요"
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md">
                      {user?.email || '정보 없음'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가입일
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('ko-KR')
                      : '정보 없음'
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    계정 상태
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      활성
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 활동 정보 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className="fas fa-chart-line text-primary mr-2"></i>
                활동 정보
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-500 mr-3 text-xl"></i>
                    <div>
                      <p className="font-medium text-gray-900">즐겨찾기</p>
                      <p className="text-sm text-gray-600">저장된 상품</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">0</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-comments text-green-500 mr-3 text-xl"></i>
                    <div>
                      <p className="font-medium text-gray-900">작성 글</p>
                      <p className="text-sm text-gray-600">커뮤니티 게시글</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">0</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-search text-purple-500 mr-3 text-xl"></i>
                    <div>
                      <p className="font-medium text-gray-900">검색 기록</p>
                      <p className="text-sm text-gray-600">최근 검색어</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">0</span>
                </div>
              </div>
            </div>

            {/* 설정 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className="fas fa-cog text-primary mr-2"></i>
                설정 및 기능
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-key text-primary text-2xl mb-2"></i>
                  <span className="font-medium">비밀번호 변경</span>
                  <span className="text-sm text-gray-600 text-center">계정 비밀번호 수정</span>
                </button>

                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fas fa-bell text-primary text-2xl mb-2"></i>
                  <span className="font-medium">알림 설정</span>
                  <span className="text-sm text-gray-600 text-center">푸시 알림 및 이메일 설정</span>
                </button>

                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fas fa-shield-alt text-primary text-2xl mb-2"></i>
                  <span className="font-medium">개인정보 보호</span>
                  <span className="text-sm text-gray-600 text-center">계정 보안 및 개인정보</span>
                </button>
              </div>
            </div>

            {/* 비밀번호 변경 카드 */}
            {showPasswordChange && (
              <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <i className="fas fa-key text-primary mr-2"></i>
                    비밀번호 변경
                  </h2>
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="새 비밀번호를 다시 입력하세요"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowPasswordChange(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handlePasswordSave}
                      disabled={isPasswordSaving}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      {isPasswordSaving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          변경 중...
                        </div>
                      ) : (
                        '비밀번호 변경'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;