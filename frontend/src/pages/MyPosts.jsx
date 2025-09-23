import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getKoreanCategory, getCategoryStyle } from '../utils/categoryUtils';
import authService from '../services/authService';
import { fetchUserPosts } from '../services/api';

const MyPosts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!authService.isLoggedIn()) {
        navigate('/login');
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user info:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo().catch(console.error);
  }, [navigate]);

  // 사용자 작성 게시물 목록 조회
  const { data: postsData, isLoading: isPostsLoading, error } = useQuery({
    queryKey: ['userPosts', user?.id, currentPage],
    queryFn: fetchUserPosts,
    enabled: !!user?.id,
    keepPreviousData: true,
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (isLoading || isPostsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">게시물을 불러오는데 실패했습니다.</p>
          <Link
            to="/mypage"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium inline-block no-underline"
            style={{ textDecoration: 'none' }}
          >
            마이페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const posts = postsData?.content || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <i className="fas fa-comments text-green-500 mr-3"></i>
                  내가 작성한 글
                </h1>
                <p className="text-gray-600">내가 작성한 게시물들을 확인할 수 있습니다.</p>
              </div>
              <div className="bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">MY POSTS</p>
                    <p className="text-2xl font-bold text-primary">{postsData?.totalElements || 0}개</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-4">
                    <i className="fas fa-comments text-green-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 게시물 목록 */}
          <div className="bg-white rounded-lg shadow-md">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <i className="fas fa-list text-primary mr-2"></i>
                  게시물 목록
                </h2>
                <p className="text-sm text-gray-600">
                  작성한 순서대로 최신순으로 정렬되어 표시됩니다.
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
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-pencil-alt text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">작성한 게시글이 없습니다</h3>
                  <p className="text-gray-600 mb-6">첫 번째 게시글을 작성해보세요!</p>
                  <Link
                    to="/community-form"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center"
                  >
                    <i className="fas fa-pencil-alt mr-2"></i>
                    글쓰기
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.postId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const koreanCategory = getKoreanCategory(post.category);
                                const categoryStyle = getCategoryStyle(koreanCategory);
                                return (
                                  <span className={`${categoryStyle.bgColor} ${categoryStyle.textColor} text-xs px-2 py-1 rounded-full flex items-center space-x-1 border ${categoryStyle.borderColor}`}>
                                    <i className={`${categoryStyle.icon} ${categoryStyle.iconColor} text-xs`}></i>
                                    <span>{koreanCategory}</span>
                                  </span>
                                );
                              })()}
                              {post.hasAttachments && (
                                <i className="fas fa-paperclip text-red-400 text-lg" title="첨부파일"></i>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                              <Link
                                to={`/post/edit/${post.postId}`}
                                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                title="수정"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                            </div>
                          </div>

                          {/* 태그 */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-200"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <Link
                            to={`/post/${post.postId}`}
                            className="block group"
                          >
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {post.content?.replace(/<[^>]*>/g, '') || ''}
                            </p>
                          </Link>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <i className="fas fa-eye mr-1"></i>
                                {post.views}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-comment mr-1"></i>
                                {post.commentCount || 0}
                              </span>
                            </div>
                            <span className="flex items-center text-red-500 font-medium text-lg">
                              <i className="fas fa-heart mr-1 text-xl"></i>
                              <span className="text-xl">{post.likes}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {postsData && postsData.totalElements > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md">
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="flex justify-center pt-6">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || isPostsLoading}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-left mr-1"></i>
                      이전
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.max(1, Math.min(Math.max(1, postsData.totalPages), 5)) }, (_, i) => {
                        let pageNum;
                        const totalPages = Math.max(1, postsData.totalPages);
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
                            disabled={isPostsLoading}
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, postsData.totalPages)))}
                      disabled={currentPage >= Math.max(1, postsData.totalPages) || isPostsLoading}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                      <i className="fas fa-chevron-right ml-1"></i>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;