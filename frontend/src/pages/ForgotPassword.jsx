import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 이메일 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsEmailSent(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '비밀번호 재설정 요청에 실패했습니다.');
      }
    } catch (error) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || '이메일 재발송에 실패했습니다.');
        setIsEmailSent(false);
      }
    } catch (error) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      setIsEmailSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center">
            <div className="text-3xl font-bold text-primary">
              <i className="fas fa-wine-bottle mr-2 text-secondary"></i>
              Ju(酒)piter
            </div>
          </Link>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* 성공 메시지 */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <i className="fas fa-envelope text-2xl text-green-600"></i>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                이메일을 확인해주세요
              </h2>

              <p className="text-gray-600 mb-2">
                <strong>{email}</strong>로
              </p>
              <p className="text-gray-600 mb-6">
                비밀번호 재설정 링크를 발송했습니다.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  이메일이 도착하지 않았다면 스팸함을 확인해주세요.
                </p>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      재발송 중...
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-redo mr-2"></i>
                      이메일 재발송
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  로그인 페이지로 돌아가기
                </Link>
              </div>

              {/* 추가 도움말 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  여전히 문제가 해결되지 않나요?
                </p>
                <a href="mailto:support@jupiter.com" className="text-sm text-primary hover:underline">
                  고객센터에 문의하기
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          비밀번호 찾기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          가입 시 사용한 이메일 주소를 입력해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 주소
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example@jupiter.com"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
                    전송 중...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    재설정 링크 보내기
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-info-circle text-blue-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    비밀번호 재설정 안내
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>입력하신 이메일로 재설정 링크가 발송됩니다.</li>
                      <li>링크는 24시간 동안 유효합니다.</li>
                      <li>이메일이 도착하지 않으면 스팸함을 확인해주세요.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 링크들 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                로그인
              </Link>

              <Link
                to="/register"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <i className="fas fa-user-plus mr-2"></i>
                회원가입
              </Link>
            </div>
          </div>

          {/* 고객센터 연락처 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              계정 복구에 문제가 있으신가요?
            </p>
            <a href="mailto:support@jupiter.com" className="text-xs text-primary hover:underline">
              support@jupiter.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;