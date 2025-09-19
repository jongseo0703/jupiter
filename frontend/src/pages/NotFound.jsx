import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 이미지/아이콘 */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary opacity-20">404</div>
          <div className="relative -mt-16">
            <i className="fas fa-wine-bottle text-6xl text-secondary"></i>
          </div>
        </div>

        {/* 메시지 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-2">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <p className="text-gray-600">
            URL을 다시 확인해 주시기 바랍니다.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            <i className="fas fa-home mr-2"></i>
            홈으로 돌아가기
          </Link>

          <div className="flex space-x-4">
            <Link
              to="/shop"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              <i className="fas fa-search mr-2"></i>
              주류 검색
            </Link>
            <Link
              to="/board"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              <i className="fas fa-comments mr-2"></i>
              커뮤니티
            </Link>
          </div>

          <button
            onClick={() => window.history.back()}
            className="w-full text-primary hover:text-blue-800 py-2 font-medium"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            이전 페이지로 돌아가기
          </button>
        </div>

        {/* 추가 도움말 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">도움이 필요하신가요?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <i className="fas fa-question-circle text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-600">자주 묻는 질문</p>
            </div>
            <div className="text-center">
              <i className="fas fa-envelope text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-600">고객센터 문의</p>
            </div>
          </div>
        </div>

        {/* 인기 페이지 추천 */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">인기 페이지</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/shop" className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
              주류 가격비교
            </Link>
            <Link to="/board" className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
              커뮤니티
            </Link>
            <Link to="/favorites" className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors">
              즐겨찾기
            </Link>
            <Link to="/about" className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
              회사소개
            </Link>
          </div>
        </div>
      </div>

      {/* 푸터 정보 */}
      <div className="mt-16 text-center text-xs text-gray-400">
        <p>© 2024 Ju(酒)piter. 모든 권리 보유.</p>
      </div>
    </div>
  );
};

export default NotFound;