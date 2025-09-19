import { useState } from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const faqData = [
    {
      id: 1,
      category: '가격 비교',
      question: '가격 정보는 얼마나 자주 업데이트 되나요?',
      answer: '가격 정보는 실시간으로 업데이트되며, 주요 온라인 쇼핑몰의 가격을 정기적으로 수집하여 최신 정보를 제공합니다.'
    },
    {
      id: 2,
      category: '알림 설정',
      question: '가격 하락 알림을 받으려면 어떻게 해야 하나요?',
      answer: '즐겨찾기에 원하는 상품을 추가한 후, 설정 > 알림 설정에서 가격 하락 알림을 활성화하면 됩니다.'
    },
    {
      id: 3,
      category: '계정 관리',
      question: '비밀번호를 잊어버렸어요.',
      answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하고 등록된 이메일을 입력하면 재설정 링크를 받을 수 있습니다.'
    },
    {
      id: 4,
      category: '즐겨찾기',
      question: '즐겨찾기는 몇 개까지 추가할 수 있나요?',
      answer: '즐겨찾기에는 제한 없이 원하는 만큼 상품을 추가할 수 있습니다.'
    },
    {
      id: 5,
      category: '가격 비교',
      question: '어떤 쇼핑몰의 가격을 비교하나요?',
      answer: '주요 온라인 쇼핑몰(쿠팡, 네이버쇼핑, G마켓, 11번가 등)의 가격을 비교하여 최저가를 찾아드립니다.'
    },
    {
      id: 6,
      category: '기술 지원',
      question: '앱이 제대로 작동하지 않아요.',
      answer: '브라우저 캐시를 삭제하거나 페이지를 새로고침해보세요. 문제가 지속되면 고객지원으로 문의해주세요.'
    }
  ];

  const filteredFaq = faqData.filter(
    item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link to="/settings" className="inline-flex items-center text-primary hover:text-blue-800 mb-4">
            <i className="fas fa-arrow-left mr-2"></i>
            설정으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-question-circle mr-3 text-primary"></i>
            도움말 및 지원
          </h1>
          <p className="text-gray-600">
            궁금한 점이 있으시면 아래 자주 묻는 질문을 확인하거나 고객지원팀에 문의하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            {/* 탭 메뉴 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'faq'
                        ? 'border-primary text-primary bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    자주 묻는 질문
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'contact'
                        ? 'border-primary text-primary bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    고객지원
                  </button>
                </nav>
              </div>

              {/* FAQ 탭 */}
              {activeTab === 'faq' && (
                <div className="p-6">
                  {/* 검색 */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="질문을 검색해보세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  {/* 카테고리 필터 */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSearchTerm('')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          searchTerm === ''
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        전체
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSearchTerm(category)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            searchTerm === category
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FAQ 목록 */}
                  <div className="space-y-4">
                    {filteredFaq.map((item) => (
                      <details
                        key={item.id}
                        className="group border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <summary className="cursor-pointer list-none">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-3">
                                {item.category}
                              </span>
                              <span className="font-medium text-gray-900">{item.question}</span>
                            </div>
                            <i className="fas fa-chevron-down text-gray-400 group-open:rotate-180 transition-transform"></i>
                          </div>
                        </summary>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      </details>
                    ))}

                    {filteredFaq.length === 0 && (
                      <div className="text-center py-12">
                        <i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
                        <p className="text-gray-500">검색 결과가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 고객지원 탭 */}
              {activeTab === 'contact' && (
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">고객지원팀에 문의하세요</h3>
                      <p className="text-gray-600">문제 해결을 위해 최선을 다해 도와드리겠습니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <i className="fas fa-envelope text-blue-500 text-2xl mb-3"></i>
                        <h4 className="font-medium text-gray-900 mb-2">이메일 문의</h4>
                        <p className="text-gray-600 text-sm mb-3">24시간 내 답변</p>
                        <a href="mailto:support@jupiter.com" className="text-primary hover:underline">
                          support@jupiter.com
                        </a>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <i className="fas fa-phone text-green-500 text-2xl mb-3"></i>
                        <h4 className="font-medium text-gray-900 mb-2">전화 상담</h4>
                        <p className="text-gray-600 text-sm mb-3">평일 09:00 - 18:00</p>
                        <a href="tel:1588-0000" className="text-primary hover:underline">
                          1588-0000
                        </a>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">문의 시 도움이 되는 정보</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 사용 중인 브라우저 및 버전</li>
                        <li>• 문제가 발생한 페이지나 기능</li>
                        <li>• 문제 발생 시간</li>
                        <li>• 에러 메시지 (있는 경우)</li>
                        <li>• 스크린샷 (가능한 경우)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
                서비스 이용 팁
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">가격 추적</h4>
                  <p className="text-blue-700">관심 상품을 즐겨찾기에 추가하여 가격 변동을 실시간으로 확인하세요.</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-1">알림 설정</h4>
                  <p className="text-green-700">원하는 할인율에 도달하면 즉시 알림을 받을 수 있습니다.</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-1">가격 기록</h4>
                  <p className="text-purple-700">상품의 가격 변동 기록을 확인하여 최적의 구매 시점을 찾으세요.</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">앱 버전</p>
                  <p className="text-sm font-medium text-gray-900">v1.2.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;