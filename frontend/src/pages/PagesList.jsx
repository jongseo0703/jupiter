import { Link } from 'react-router-dom';

const PagesList = () => {
  const pages = [
    {
      category: "메인 페이지",
      items: [
        { name: "홈", path: "/", description: "메인 홈페이지" },
        { name: "가격비교", path: "/shop", description: "주류 가격 비교 페이지" },
        { name: "상품 상세", path: "/product/1", description: "상품 상세 정보 페이지" },
        { name: "즐겨찾기", path: "/favorites", description: "관심 상품 가격 추적" },
        { name: "알림 설정", path: "/notification-settings", description: "가격 하락 알림 설정 관리" },
        { name: "커뮤니티", path: "/board", description: "게시판 페이지" },
        { name: "글쓰기", path: "/community-form", description: "커뮤니티 글 작성" },
        { name: "회사소개", path: "/about", description: "회사 소개 페이지" }
      ]
    },
    {
      category: "인증 페이지",
      items: [
        { name: "로그인", path: "/login", description: "로그인 페이지 (일반 + 소셜)" },
        { name: "회원가입", path: "/register", description: "회원가입 페이지 (일반 + 소셜)" },
        { name: "비밀번호 찾기", path: "/forgot-password", description: "비밀번호 재설정" }
      ]
    },
    {
      category: "약관/정책 페이지",
      items: [
        { name: "이용약관", path: "/terms", description: "서비스 이용약관" },
        { name: "개인정보처리방침", path: "/privacy", description: "개인정보 보호 정책" }
      ]
    },
    {
      category: "에러 페이지",
      items: [
        { name: "404 에러", path: "/nonexistent-page", description: "존재하지 않는 페이지 접근 시" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-primary hover:text-blue-800 mb-6">
            <i className="fas fa-wine-bottle mr-2"></i>
            <span className="text-2xl font-bold">Ju(酒)piter</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">페이지 목록</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            현재 구현된 모든 페이지들을 확인할 수 있습니다. 각 페이지를 클릭하여 테스트해보세요.
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {pages.map((category) => (
            <div key={category.category} className="bg-white rounded-lg p-6 shadow-md text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.category}</h3>
              <div className="text-3xl font-bold text-primary">{category.items.length}</div>
              <p className="text-sm text-gray-500">페이지</p>
            </div>
          ))}
        </div>

        {/* 페이지 목록 */}
        <div className="space-y-8">
          {pages.map((category) => (
            <div key={category.category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary text-white px-6 py-4">
                <h2 className="text-xl font-semibold flex items-center">
                  {category.category === "메인 페이지" && <i className="fas fa-home mr-3"></i>}
                  {category.category === "인증 페이지" && <i className="fas fa-user-shield mr-3"></i>}
                  {category.category === "약관/정책 페이지" && <i className="fas fa-file-contract mr-3"></i>}
                  {category.category === "에러 페이지" && <i className="fas fa-exclamation-triangle mr-3"></i>}
                  {category.category}
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((page) => (
                    <Link
                      key={page.path}
                      to={page.path}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {page.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                          <div className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                            {page.path}
                          </div>
                        </div>
                        <i className="fas fa-external-link-alt text-gray-400 group-hover:text-primary transition-colors ml-2"></i>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 개발 정보 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            <i className="fas fa-info-circle mr-2"></i>
            개발 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">구현된 기능</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• React Router를 활용한 페이지 라우팅</li>
                <li>• 팝업에서 페이지 형태로 로그인/회원가입 변경</li>
                <li>• 일반 로그인 + 소셜 로그인 (네이버, 구글, 카카오)</li>
                <li>• 위시리스트 → 즐겨찾기로 변경 (가격 추적 기능)</li>
                <li>• 가격 하락 알림 기능 (모바일 푸시 + 이메일)</li>
                <li>• 알림 설정 관리 페이지 (연락처, 시간대, 조건 설정)</li>
                <li>• 가격 새로고침 버튼 로딩 애니메이션</li>
                <li>• 이용약관 및 개인정보처리방침 페이지</li>
                <li>• 404 에러 페이지 및 비밀번호 찾기</li>
                <li>• Footer 링크 연동</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">기술 스택</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• React 18</li>
                <li>• React Router Dom</li>
                <li>• Tailwind CSS</li>
                <li>• Font Awesome Icons</li>
                <li>• Responsive Design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            <i className="fas fa-home mr-2"></i>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PagesList;