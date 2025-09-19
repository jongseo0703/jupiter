import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getEnglishCategory, KOREAN_CATEGORIES } from '../utils/categoryUtils';
import { useFileUpload } from '../hooks/useFileUpload';
import { createPostWithFiles, fetchPopularPosts } from '../services/api';
import { categorizeAttachments } from '../utils/fileUtils';

function PostForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    anonymous_email: '',
    anonymous_pwd: '',
    tags: '',
    is_anonymous: false,
    attachments: []
  });

  // 파일 업로드 훅 사용
  const { previewImages, handleFileUpload, removeFile } = useFileUpload(formData, setFormData);

  const categories = KOREAN_CATEGORIES;

  // 인기 게시글 조회 (전체 카테고리, 첫 번째 페이지, 조회수 순 정렬)
  const { data: popularPostsData } = useQuery({
    queryKey: ['popularPosts', '전체', 1],
    queryFn: fetchPopularPosts,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  const popularPosts = popularPostsData?.posts || [];

  const { mutate, isLoading: isSubmitting } = useMutation({
    mutationFn: createPostWithFiles,
    onSuccess: (data) => {
      // 'posts' 쿼리를 무효화하여 목록 페이지가 최신 데이터를 다시 불러오도록 함
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      alert('게시글이 성공적으로 작성되었습니다!');
      navigate(`/post/${data.postId}`);
    },
    onError: (error) => {
      console.error('게시글 작성 실패:', error);
      alert(`게시글 작성에 실패했습니다: ${error.message}`);
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const postData = {
      category: getEnglishCategory(formData.category),
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
      isAnonymous: formData.is_anonymous,
      authorName: formData.is_anonymous ? '익명' : '현재사용자', // TODO: 실제 로그인된 사용자 정보로 교체
      anonymousEmail: formData.is_anonymous ? formData.anonymous_email : null,
      anonymousPassword: formData.is_anonymous ? formData.anonymous_pwd : null
    };

    mutate({ postData, files: formData.attachments });
  };

  return (
    <div className="py-16 bg-gray-50">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">커뮤니티 글쓰기</h1>
          <p className="text-lg">주류에 대한 의견과 정보를 공유해보세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/community" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">커뮤니티</Link>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-medium">글쓰기</span>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 콘텐츠 영역 */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
            {/* 기본 정보 섹션 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-edit text-primary mr-3"></i>
                게시글 정보
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    태그 (선택)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="예: #소주 #추천 #가격비교 (공백으로 구분)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-gray-500 mt-1">관련 태그를 입력하면 다른 사용자들이 쉽게 찾을 수 있습니다.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="게시글 제목을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 내용 섹션 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-file-alt text-primary mr-3"></i>
                게시글 내용
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="10"
                  placeholder="주류에 대한 의견, 추천, 가격 정보, 매장 후기 등을 자유롭게 작성해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>
            </div>

            {/* 이미지 업로드 섹션 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-camera text-primary mr-3"></i>
                이미지 첨부 (선택)
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">클릭하여 파일을 업로드하세요</p>
                  <p className="text-sm text-gray-500 mt-1">최대 5개, 이미지/문서 파일</p>
                </label>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">선택된 파일</h3>
                  {(() => {
                    // 이미지와 일반 파일 분리
                    const { images, files } = categorizeAttachments(previewImages.map(file => ({
                      ...file,
                      originalFilename: file.name,
                      fileUrl: file.url,
                      fileSize: Math.round(file.size / 1024)
                    })));

                    return (
                      <div className="space-y-4">
                        {/* 이미지들 - 가로로 나열 */}
                        {images.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {images.map((file) => (
                              <div key={file.id} className="relative group">
                                <img
                                  src={file.fileUrl}
                                  alt={file.originalFilename}
                                  className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(file.fileUrl, '_blank')}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                  title="파일 삭제"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="truncate">{file.originalFilename}</p>
                                  <p className="text-center">{file.fileSize}KB</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 일반 파일들 - 세로로 길게 */}
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-file text-gray-400 text-lg"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 font-medium truncate">{file.originalFilename}</p>
                                <p className="text-xs text-gray-500">{file.fileSize}KB</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(file.id)}
                                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors flex-shrink-0"
                                title="파일 삭제"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 작성자 정보 섹션 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-user text-primary mr-3"></i>
                작성자 정보
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={handleInputChange}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <label className="text-gray-700 font-medium">익명으로 작성</label>
                </div>

                {formData.is_anonymous ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 *
                      </label>
                      <input
                        type="email"
                        name="anonymous_email"
                        value={formData.anonymous_email}
                        onChange={handleInputChange}
                        placeholder="익명 사용자 이메일"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required={formData.is_anonymous}
                      />
                      <p className="text-sm text-gray-500 mt-1">게시글 수정/삭제 시 사용</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 *
                      </label>
                      <input
                        type="password"
                        name="anonymous_pwd"
                        value={formData.anonymous_pwd}
                        onChange={handleInputChange}
                        placeholder="게시글 비밀번호"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required={formData.is_anonymous}
                      />
                      <p className="text-sm text-gray-500 mt-1">게시글 수정/삭제 시 사용</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">로그인된 사용자</h4>
                    <p className="text-blue-700">
                      <strong>사용자명:</strong> {/* TODO: 실제 로그인된 사용자 정보로 교체 */}
                      현재사용자
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      * 로그인된 사용자 정보로 게시글이 작성됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* 약관 동의 */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mr-3 mt-1 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  <strong>커뮤니티 이용약관에 동의합니다</strong><br/>
                  - 부적절한 내용이 포함된 게시글은 삭제될 수 있습니다.<br/>
                  - 작성된 게시글은 다른 사용자들에게 공개됩니다.<br/>
                  - 개인정보는 게시글 관리 목적으로만 사용됩니다.
                </span>
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-center space-x-4">
              <Link
                to="/community"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    게시글 등록 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    게시글 등록
                  </>
                )}
              </button>
            </div>
          </form>
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-8">
                {/* 인기 게시글 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <i className="fas fa-fire text-red-500 mr-2"></i>
                    인기 게시글
                  </h3>
                  <div className="space-y-3">
                    {popularPosts.length > 0 ? (
                      popularPosts.slice(0, 3).map(post => (
                        <div key={post.post_id} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <Link to={`/post/${post.post_id}`}>
                            <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1 flex items-center hover:text-primary transition-colors">
                              {post.title}
                              {post.has_attachments && (
                                <i className="fas fa-paperclip ml-1 text-red-400 text-xs" title="첨부파일 있음"></i>
                              )}
                            </h4>
                          </Link>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{post.is_anonymous ? '익명' : post.author_name}</span>
                            <span className="mx-2">•</span>
                            <span>{post.views}회</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm text-center py-4">
                        인기 게시글을 불러오는 중...
                      </div>
                    )}
                  </div>
                </div>

                {/* 커뮤니티 가이드라인 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                    커뮤니티 가이드라인
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1 text-xs"></i>
                      <span>건전하고 유익한 정보를 공유해주세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1 text-xs"></i>
                      <span>주류 관련 후기와 추천을 자유롭게 작성하세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-times text-red-500 mt-1 text-xs"></i>
                      <span>개인정보나 연락처는 공개하지 마세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-times text-red-500 mt-1 text-xs"></i>
                      <span>광고성 게시물은 삭제될 수 있습니다</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-times text-red-500 mt-1 text-xs"></i>
                      <span>다른 사용자를 존중하는 댓글을 작성해주세요</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-times text-red-500 mt-1 text-xs"></i>
                      <span>허위 정보나 부적절한 내용은 신고될 수 있습니다</span>
                    </div>
                  </div>
                </div>

                {/* 커뮤니티 바로가기 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <i className="fas fa-users text-green-500 mr-2"></i>
                    커뮤니티
                  </h3>
                  <div className="space-y-3">
                    <Link to="/community" className="block p-3 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors text-center">
                      <i className="fas fa-list mr-2"></i>
                      전체 게시글 보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostForm;