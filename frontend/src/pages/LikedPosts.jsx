import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategoryStyle } from '../utils/categoryUtils';
import { fetchUserLikedPosts } from '../services/api';
import authService from '../services/authService';

function LikedPosts() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
          // 토큰이 유효하지 않을 경우 로그아웃 처리
          await authService.logout();
          setIsLoggedIn(false);
          setCurrentUser(null);
          navigate('/login');
        }
      } else {
        // 비로그인 상태면 로그인 페이지로 리디렉션
        navigate('/login');
      }
    };

    checkAuthStatus().catch(console.error);
  }, [navigate]);

  // 좋아요한 게시글 목록 조회
  const { data, isLoading: loading, isError, error } = useQuery({
    queryKey: ['userLikedPosts', currentUser?.id, currentPage],
    queryFn: fetchUserLikedPosts,
    enabled: !!currentUser?.id, // 사용자 정보가 있을 때만 실행
    keepPreviousData: true,
  });

  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  if (isError) {
    console.error('Failed to fetch liked posts:', error);
  }

  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          사용자 정보를 확인하는 중...
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <i className="fas fa-heart text-red-500 mr-3"></i>
                  좋아요한 게시물
                </h1>
                <p className="text-gray-600">내가 좋아요를 누른 게시물들을 확인할 수 있습니다.</p>
              </div>
              <div className="bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">MY LIKES</p>
                    <p className="text-2xl font-bold text-primary">{totalElements}개</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center ml-4">
                    <i className="fas fa-heart text-red-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 게시글 목록 카드 */}
          <div className="bg-white rounded-lg shadow-md">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <i className="fas fa-list text-primary mr-2"></i>
                  게시물 목록
                </h2>
                <p className="text-sm text-gray-600">
                  좋아요를 누른 순서대로 최신순으로 정렬되어 표시됩니다.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/community"
                  className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                  <i className="fas fa-list mr-2"></i>
                  커뮤니티
                </Link>
                <Link
                  to="/mypage"
                  className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  마이페이지로
                </Link>
              </div>
            </div>

            {/* 게시글 목록 */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">좋아요한 게시물을 불러오는 중...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-heart text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">좋아요한 게시물이 없습니다</h3>
                  <p className="text-gray-600 mb-6">마음에 드는 게시물에 좋아요를 눌러보세요!</p>
                  <Link
                    to="/community"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center"
                  >
                    <i className="fas fa-list mr-2"></i>
                    커뮤니티 둘러보기
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.post_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const categoryStyle = getCategoryStyle(post.category);
                                return (
                                  <span className={`${categoryStyle.bgColor} ${categoryStyle.textColor} text-xs px-2 py-1 rounded-full flex items-center space-x-1 border ${categoryStyle.borderColor}`}>
                                    <i className={`${categoryStyle.icon} ${categoryStyle.iconColor} text-xs`}></i>
                                    <span>{post.category}</span>
                                  </span>
                                );
                              })()}
                              {post.has_attachments && (
                                <i className="fas fa-paperclip text-red-400 text-lg" title="첨부파일 있음"></i>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">{post.created_at}</span>
                          </div>

                          {/* 태그 */}
                          {post.tags && (() => {
                            try {
                              const parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
                              if (Array.isArray(parsedTags) && parsedTags.length > 0) {
                                return (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {parsedTags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                            } catch (e) {
                              return null;
                            }
                            return null;
                          })()}

                          {/* 제목 */}
                          <Link to={`/post/${post.post_id}`} className="block group">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary cursor-pointer">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {post.content}
                            </p>
                          </Link>

                          {/* 통계 정보 */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
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
                            </div>
                            <span className="flex items-center text-red-600 font-bold text-2xl">
                              <i className="fas fa-heart mr-2 text-3xl animate-pulse hover:animate-bounce transition-all duration-300 drop-shadow-sm" style={{animationDuration: '1.2s'}}></i>
                              <span className="text-3xl font-black bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent hover:scale-110 transition-transform duration-200 drop-shadow-sm">{post.likes}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="flex justify-center pt-6">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || loading}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-left mr-1"></i>
                      이전
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.max(1, Math.min(totalPages, 5)) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                          pageNum = start + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loading}
                            className={`px-3 py-2 text-sm border rounded-md ${
                              currentPage === pageNum
                                ? 'text-white bg-primary border-primary shadow-sm'
                                : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || loading}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                      <i className="fas fa-chevron-right ml-1"></i>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LikedPosts;