import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login(formData.email, formData.password, formData.rememberMe);
      // 로그인 성공 시 홈으로 리다이렉트
      navigate('/');
    } catch (error) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    // OAuth 로그인 URL로 리다이렉트
    const oauthUrl = authService.getOAuthLoginUrl(provider);
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="text-3xl font-bold text-primary">
            <i className="fas fa-wine-bottle mr-2 text-secondary"></i>
            Ju(酒)piter
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          아직 계정이 없으신가요?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-blue-800">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 일반 로그인 폼 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-blue-800">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </button>
            </div>
          </form>

          {/* 구분선 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="mt-6 space-y-3">
            {/* 네이버 로그인 */}
            <button
              onClick={() => handleOAuthLogin('naver')}
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <img src="/images/naver.png" alt="Naver" width="20" height="20" className="object-contain" />
              <span>네이버로 로그인</span>
            </button>

            {/* 구글 로그인 */}
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <img src="/images/google.png" alt="Google" width="20" height="20" className="object-contain" />
              <span>구글로 로그인</span>
            </button>

            {/* 카카오 로그인 */}
            <button
              onClick={() => handleOAuthLogin('kakao')}
              disabled={isLoading}
              className="w-full bg-yellow-400 text-gray-900 py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 1.5C5.30558 1.5 1.5 4.74765 1.5 8.75C1.5 11.5547 3.19677 14.0234 5.79688 15.3711L4.87891 18.3516C4.8125 18.5859 5.07422 18.7695 5.28516 18.6406L9.0625 16.4688C9.375 16.4922 9.6875 16.5 10 16.5C14.6944 16.5 18.5 13.2523 18.5 9.25C18.5 5.24765 14.6944 1.5 10 1.5Z" fill="#3C1E1E"/>
              </svg>
              <span>카카오톡으로 로그인</span>
            </button>
          </div>

          {/* 이용약관 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            로그인 시 <Link to="/terms" className="text-primary hover:underline">이용약관</Link> 및{' '}
            <Link to="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>에 동의합니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;