import { useState } from 'react';
import { Link } from 'react-router-dom';

function Board() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [posts] = useState([
    {
      id: 1,
      title: '조니워커 블루라벨 할인 정보 공유',
      content: '쿠팡에서 조니워커 블루라벨이 20% 할인 중이에요!',
      author: '위스키러버',
      category: '할인정보',
      date: '2024-01-15',
      views: 152,
      comments: 8,
      likes: 23
    },
    {
      id: 2,
      title: '헤네시 XO 시음 후기',
      content: '드디어 헤네시 XO를 마셔봤습니다. 정말 부드럽고...',
      author: '코냑애호가',
      category: '리뷰',
      date: '2024-01-14',
      views: 89,
      comments: 12,
      likes: 45
    },
    {
      id: 3,
      title: '초보자를 위한 위스키 추천',
      content: '위스키를 처음 접하시는 분들께 추천드리는 제품들...',
      author: '위스키선생',
      category: '추천',
      date: '2024-01-13',
      views: 234,
      comments: 15,
      likes: 67
    },
    {
      id: 4,
      title: '보드카 칵테일 레시피 모음',
      content: '집에서 만들 수 있는 간단한 보드카 칵테일들을...',
      author: '홈바텐더',
      category: '정보',
      date: '2024-01-12',
      views: 178,
      comments: 9,
      likes: 34
    },
    {
      id: 5,
      title: '11번가 vs G마켓 가격 비교',
      content: '같은 제품이라도 쇼핑몰마다 가격이 정말 다르네요',
      author: '절약고수',
      category: '가격정보',
      date: '2024-01-11',
      views: 312,
      comments: 22,
      likes: 56
    }
  ]);

  const categories = ['전체', '할인정보', '리뷰', '추천', '정보', '가격정보', '질문'];

  const filteredPosts = selectedCategory === '전체'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="py-16 bg-gray-50">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">커뮤니티</h1>
          <p className="text-lg">주류 애호가들과 정보를 공유하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-medium">커뮤니티</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">카테고리</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">인기 글</h3>
              <div className="space-y-3">
                {posts.slice(0, 3).map(post => (
                  <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{post.author}</span>
                      <span className="mx-2">•</span>
                      <span>{post.views}회</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm">
              {/* 게시판 헤더 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedCategory} ({filteredPosts.length})
                  </h2>
                  <Link
                    to="/community-form"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center"
                  >
                    <i className="fas fa-pen mr-2"></i>
                    글쓰기
                  </Link>
                </div>
              </div>

              {/* 게시글 목록 */}
              <div className="divide-y divide-gray-200">
                {filteredPosts.map(post => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">{post.date}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary cursor-pointer">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.content}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <i className="fas fa-user mr-1"></i>
                            {post.author}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-eye mr-1"></i>
                            {post.views}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-comment mr-1"></i>
                            {post.comments}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-heart mr-1"></i>
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-center">
                  <nav className="flex space-x-2">
                    <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      이전
                    </button>
                    <button className="px-4 py-2 text-white bg-primary border border-primary rounded">
                      1
                    </button>
                    <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      3
                    </button>
                    <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      다음
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Board;