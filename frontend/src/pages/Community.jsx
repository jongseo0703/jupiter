import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKoreanCategory, getEnglishCategory, KOREAN_CATEGORIES } from '../utils/categoryUtils';

function Community() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [posts, setPosts] = useState([]);

  const categories = ['전체', ...KOREAN_CATEGORIES];

  // 게시글 목록 조회 API 호출
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        if (selectedCategory !== '전체') {
          const englishCategory = getEnglishCategory(selectedCategory);
          if (englishCategory) {
            queryParams.append('category', englishCategory);
          }
        }

        queryParams.append('page', (currentPage - 1).toString());
        queryParams.append('size', '20');

        const response = await fetch(`http://localhost:8080/community/api/posts?${queryParams.toString()}`);
        const result = await response.json();
        const pageData = result.data;

        // 백엔드 응답 데이터를 프론트엔드 형식으로 변환
        /**
         * JSX 파일에서 객체 속성을 인식하지 못해서 발생하는 경고 방지
         * @typedef {Object} PostData
         * @property {number} postId
         * @property {string} title
         * @property {string} content
         * @property {string} authorName
         * @property {string} category
         * @property {string} createdAt
         * @property {number} views
         * @property {number} commentsCount
         * @property {number} likes
         * @property {string} tags
         * @property {boolean} isAnonymous
         */

        const transformedPosts = pageData.content.map(
          /** @param {PostData} post */
          post => ({
          post_id: post.postId,
          title: post.title,
          content: post.content,
          author_name: post.authorName,
          category: getKoreanCategory(post.category),
          created_at: new Date(post.createdAt).toLocaleDateString('ko-KR'),
          views: post.views || 0,
          comments_count: post.commentsCount || 0,
          likes: post.likes || 0,
          tags: post.tags,
          is_anonymous: post.isAnonymous
        }));

        setPosts(transformedPosts);
        setTotalPages(pageData.totalPages);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        alert('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, currentPage]);

  const filteredPosts = posts; // 서버에서 이미 필터링됨

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
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1); // 카테고리 변경 시 페이지를 1로 리셋
                    }}
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
                  <div key={post.post_id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{post.is_anonymous ? '익명' : post.author_name}</span>
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
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">게시글을 불러오는 중...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="p-12 text-center">
                    <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">게시글이 없습니다</h3>
                    <p className="text-gray-600 mb-4">선택한 카테고리에 게시글이 없습니다.</p>
                    <Link
                      to="/community-form"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-pen mr-2"></i>
                      첫 게시글 작성하기
                    </Link>
                  </div>
                ) : filteredPosts.map(post => (
                  <div key={post.post_id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">{post.created_at}</span>
                        </div>

                        {post.tags && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.tags.split(' ').map((tag, index) => (
                              <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <Link to={`/post/${post.post_id}`}>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary cursor-pointer">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.content}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <i className="fas fa-user mr-1"></i>
                            {post.is_anonymous ? '익명' : post.author_name}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-eye mr-1"></i>
                            {post.views}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-comment mr-1"></i>
                            {post.comments_count}
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
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex justify-center">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        이전
                      </button>

                      {/* 동적 페이지 버튼 생성 */}
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          // 현재 페이지 주변의 페이지들을 보여줌
                          const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                          pageNum = start + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loading}
                            className={`px-4 py-2 border rounded ${
                              currentPage === pageNum
                                ? 'text-white bg-primary border-primary'
                                : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;