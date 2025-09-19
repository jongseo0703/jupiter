import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { KOREAN_CATEGORIES, getCategoryStyle } from '../utils/categoryUtils';
import { fetchPosts, fetchPopularPosts } from '../services/api';

function Community() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['전체', ...KOREAN_CATEGORIES];

  // React Query를 사용하여 게시글 목록 조회
  const { data, isLoading: loading, isError, error } = useQuery({
    queryKey: ['posts', selectedCategory, currentPage],
    queryFn: fetchPosts,
    keepPreviousData: true, // 페이지 변경 시 이전 데이터를 유지하여 UX 개선
  });

  // 인기 게시글 조회 (조회수 순)
  const { data: popularPostsData } = useQuery({
    queryKey: ['popularPosts', '전체', 1],
    queryFn: fetchPopularPosts,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  const posts = data?.posts || [];
  const popularPosts = popularPostsData?.posts || [];
  const totalPages = data?.totalPages || 1;

  if (isError) {
    console.error('Failed to fetch posts:', error);
    // 사용자에게 에러를 알리는 UI를 여기에 추가할 수 있습니다.
  }

  const filteredPosts = posts; // 이름 일관성을 위해 유지 (서버에서 이미 필터링됨)

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
            <div className="sticky top-8 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">카테고리</h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const categoryStyle = category === '전체' ? null : getCategoryStyle(category);
                  const isSelected = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1); // 카테고리 변경 시 페이지를 1로 리셋
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : category === '전체'
                          ? 'text-gray-700 hover:bg-gray-100'
                          : `${categoryStyle?.bgColor} ${categoryStyle?.textColor} hover:opacity-80 border ${categoryStyle?.borderColor}`
                      }`}
                    >
                      {categoryStyle && (
                        <i className={`${categoryStyle.icon} ${isSelected ? 'text-white' : categoryStyle.iconColor}`}></i>
                      )}
                      {category === '전체' && <i className="fas fa-list text-gray-600"></i>}
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                <i className="fas fa-fire text-red-500 mr-2"></i>
                인기 게시글
              </h3>
              <div className="space-y-3">
                {popularPosts.slice(0, 3).map(post => (
                  <div key={post.post_id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1 flex items-center">
                      {post.title}
                      {post.has_attachments && (
                        <i className="fas fa-paperclip ml-1 text-red-400 text-xs" title="첨부파일 있음"></i>
                      )}
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
                          {(() => {
                            const categoryStyle = getCategoryStyle(post.category);
                            return (
                              <span className={`${categoryStyle.bgColor} ${categoryStyle.textColor} text-xs px-2 py-1 rounded-full flex items-center space-x-1 border ${categoryStyle.borderColor}`}>
                                <i className={`${categoryStyle.icon} ${categoryStyle.iconColor} text-xs`}></i>
                                <span>{post.category}</span>
                              </span>
                            );
                          })()}
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
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary cursor-pointer flex items-center">
                            {post.title}
                            {post.has_attachments && (
                              <i className="fas fa-paperclip ml-2 text-red-400 text-sm" title="첨부파일 있음"></i>
                            )}
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