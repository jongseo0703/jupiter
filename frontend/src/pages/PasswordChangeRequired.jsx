import { useNavigate } from 'react-router-dom';

const PasswordChangeRequired = () => {
  const navigate = useNavigate();

  const handleChangeNow = () => {
    navigate('/mypage', { state: { openPasswordChange: true } });
  };

  const handleChangeLater = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 아이콘 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-2xl text-yellow-600"></i>
            </div>
          </div>

          {/* 제목 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              비밀번호 변경이 필요합니다
            </h2>
            <p className="text-gray-600">
              보안을 위해 정기적인 비밀번호 변경이 필요합니다.
            </p>
          </div>

          {/* 정보 박스 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-info-circle text-yellow-400"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  왜 비밀번호를 변경해야 하나요?
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>계정 보안 강화</li>
                    <li>무단 접근 방지</li>
                    <li>개인정보 보호</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="space-y-3">
            <button
              onClick={handleChangeNow}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <i className="fas fa-key mr-2"></i>
              지금 변경하기
            </button>

            <button
              onClick={handleChangeLater}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <i className="fas fa-clock mr-2"></i>
              다음에 변경하기
            </button>
          </div>

          {/* 추가 안내 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              비밀번호 변경을 미루시는 경우, 다음 로그인 시 다시 안내됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-yellow-100 opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-blue-100 opacity-20"></div>
      </div>
    </div>
  );
};

export default PasswordChangeRequired;