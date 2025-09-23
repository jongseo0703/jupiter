import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEnglishCategory, KOREAN_CATEGORIES } from '../utils/categoryUtils';
import { useFileUpload } from '../hooks/useFileUpload';
import { categorizeAttachments } from '../utils/fileUtils';
import { fetchPopularPosts, fetchPost, updatePost, deleteAttachment, uploadAttachments } from '../services/api';
import authService from '../services/authService';

function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 정보를 가져오는 Hook
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    tags: '',
    attachments: []
  });

  // 태그 상태 관리
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [deletedAttachments, setDeletedAttachments] = useState([]); // 삭제된 첨부파일 ID 추적

  // 파일 업로드 훅 사용
  const { previewImages, handleFileUpload, removeFile } = useFileUpload(formData, setFormData);

  const alcoholIcons = [
    '🍷', // 와인잔
    '🍺', // 맥주잔
    '🍾', // 샴페인병
    '🍶', // 소주병
    '🥃', // 위스키잔
    '🍻', // 맥주 건배
    '🥂', // 샴페인 건배
    '🍸'  // 칵테일
  ];

  // 인기 게시글 조회 (전체 카테고리, 첫 번째 페이지, 조회수 순 정렬)
  const { data: popularPostsData } = useQuery({
    queryKey: ['popularPosts', '전체', 1],
    queryFn: fetchPopularPosts,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  const popularPosts = popularPostsData?.posts || [];

  // currentUser는 useState로 관리됨

  const categories = KOREAN_CATEGORIES;

  // React Query를 사용한 게시글 조회
  const { data: originalPost, isLoading: loading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost
  });

  // 게시글 데이터가 로드되면 폼 채우기
  useEffect(() => {
    if (originalPost) {
      // 태그 파싱하여 태그 리스트 설정
      const parsedTags = originalPost.tags ? JSON.parse(originalPost.tags) : [];
      setTagList(parsedTags);

      // 폼 데이터 설정
      setFormData({
        category: originalPost.category, // api.js에서 이미 한글 변환됨
        title: originalPost.title,
        content: originalPost.content,
        tags: originalPost.tags || JSON.stringify([]),
        attachments: []
      });
    }
  }, [originalPost]);

  // 에러 처리
  useEffect(() => {
    if (isError) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러오는데 실패했습니다.');
      navigate('/community');
    }
  }, [isError, error, navigate]);

  // 아이콘 회전 애니메이션
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % alcoholIcons.length);
    }, 200);

    return () => clearInterval(interval);
  }, [loading, alcoholIcons.length]);

  // 사용자 정보 로드
  useEffect(() => {
    const loadCurrentUser = async () => {
      const loggedIn = authService.isLoggedIn();
      if (loggedIn) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
        }
      }
    };
    loadCurrentUser().catch(console.error);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 기존 첨부파일 삭제
  const handleDeleteExistingFile = (attachmentId) => {
    setDeletedAttachments(prev => [...prev, attachmentId]);
  };


  // 태그 추가 함수
  const addTag = (tagText) => {
    const cleanTag = tagText.trim().replace(/^#+/, ''); // # 제거
    if (cleanTag && !tagList.includes(cleanTag)) {
      const newTagList = [...tagList, cleanTag];
      setTagList(newTagList);
      setFormData(prev => ({ ...prev, tags: JSON.stringify(newTagList) }));
    }
  };

  // 태그 제거 함수
  const removeTag = (tagToRemove) => {
    const newTagList = tagList.filter(tag => tag !== tagToRemove);
    setTagList(newTagList);
    setFormData(prev => ({ ...prev, tags: JSON.stringify(newTagList) }));
  };

  // 태그 입력 처리
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // IME 조합 중인지 확인
      if (e.isComposing || e.nativeEvent?.isComposing) {
        return;
      }
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
      }
    }
  };

  // 태그 입력 완료 (blur 시)
  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
      setTagInput('');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 카테고리 변환 (한글 -> 영문)

      const requestData = {
        title: formData.title,
        content: formData.content,
        category: getEnglishCategory(formData.category),
        tags: JSON.stringify(tagList),
        // 작성자 정보는 원본 게시글에서 가져옴
        authorId: originalPost.author_id || currentUser?.id, // author_id가 없으면 현재 사용자 ID 사용
        authorName: originalPost.author_name,
        isAnonymous: originalPost.is_anonymous,
        anonymousEmail: null,
        anonymousPassword: null
      };

      // 익명 게시글인 경우 PostDetail에서 전달받은 인증 정보 추가
      // location.state는 URL에 노출되지 않고, 브라우저 히스토리 객체에만 저장
      if (originalPost.is_anonymous && location.state) {
        requestData.anonymousEmail = location.state.anonymousEmail;
        requestData.anonymousPassword = location.state.anonymousPassword;
      }

      // 1. 게시글 수정 - api.js 함수 사용
      await updatePost({ postId: id, postData: requestData });

      // 2. 삭제된 파일들 처리 - api.js 함수 사용
      if (deletedAttachments.length > 0) {
        await Promise.all(deletedAttachments.map(attachmentId =>
          deleteAttachment(attachmentId).catch(error => {
            console.error(`첨부파일 삭제 실패 (ID: ${attachmentId}):`, error);
          })
        ));
      }

      // 3. 새 파일들 업로드 - api.js 함수 사용
      if (formData.attachments && formData.attachments.length > 0) {
        try {
          await uploadAttachments(id, formData.attachments);
        } catch (error) {
          console.error('파일 업로드 실패:', error);
          alert('게시글은 수정되었지만 새 파일 업로드에 실패했습니다.');
        }
      }

      alert('게시글이 성공적으로 수정되었습니다!');
      navigate(`/post/${id}`);
    } catch (error) {
      // 예상치 못한 에러 처리 (API 에러는 헬퍼 함수에서 처리됨)
      console.error('게시글 수정 처리 중 예상치 못한 오류:', error);
      alert('게시글 수정 처리 중 예상치 못한 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm mx-4">
          <div className="relative mb-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{alcoholIcons[currentIconIndex]}</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            게시글을 불러오는 중...
          </h2>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!originalPost) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <Link to="/community" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">게시글 수정</h1>
          <p className="text-lg">게시글 내용을 수정해보세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/community" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">커뮤니티</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to={`/post/${id}`} className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">게시글 상세</Link>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-medium">게시글 수정</span>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 콘텐츠 영역 */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
            {/* 작성자 정보 표시 (수정 불가) */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                작성자 정보
              </h3>
              <p className="text-blue-700">
                <strong>작성자:</strong> {originalPost.is_anonymous ? '익명' : originalPost.author_name}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                * 작성자 정보는 수정할 수 없습니다.
              </p>
            </div>

            {/* 게시글 정보 섹션 */}
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

                  {/* 태그 표시 영역 */}
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-gray-200 rounded-lg bg-gray-50">
                      {tagList.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {tagList.length === 0 && (
                        <span className="text-gray-400 text-sm">태그를 입력해보세요</span>
                      )}
                    </div>
                  </div>

                  {/* 태그 입력 필드 */}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={handleTagInputBlur}
                    placeholder="태그 입력 후 스페이스바 또는 엔터"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    태그를 입력하고 스페이스바나 엔터를 누르세요.
                    <span className="text-blue-600 ml-1">#{tagList.length > 0 ? tagList.join(', #') : '예시: 와인, 추천'}</span>
                  </p>
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
                  rows="15"
                  placeholder="주류에 대한 의견, 추천, 가격 정보, 매장 후기 등을 자유롭게 작성해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>
            </div>

            {/* 파일 업로드 섹션 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-camera text-primary mr-3"></i>
                파일 첨부 (선택)
              </h2>

              {/* 기존 첨부파일 */}
              {originalPost?.attachments && originalPost.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">기존 첨부파일</h3>
                  {(() => {
                    // 이미지와 일반 파일 분리 (삭제된 파일 제외)
                    const { images, files } = categorizeAttachments(originalPost.attachments, deletedAttachments);

                    return (
                      <div className="space-y-4">
                        {/* 기존 이미지들 - 가로로 나열 */}
                        {images.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {images.map((file) => (
                              <div key={file.index} className="relative group">
                                <img
                                  src={`http://localhost:8080${file.fileUrl}`}
                                  alt={file.originalFilename}
                                  className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(`http://localhost:8080${file.fileUrl}`, '_blank')}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExistingFile(file.postAttachmentId)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                  title="파일 삭제"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  {file.fileSize}KB
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 기존 일반 파일들 - 세로로 길게 */}
                        {files.map((file) => (
                          <div
                            key={file.index}
                            className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => window.open(`http://localhost:8080${file.fileUrl}`, '_blank')}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-file text-blue-600 text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-blue-800 font-medium truncate">{file.originalFilename}</p>
                                <p className="text-xs text-blue-600">{file.fileSize}KB</p>
                              </div>
                              <div className="flex-shrink-0">
                                <i className="fas fa-external-link-alt text-blue-500 text-xs"></i>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {previewImages.map(file => (
                    <div key={file.id} className="relative">
                      {file.url ? (
                        <img
                          src={file.url}
                          alt="미리보기"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <i className="fas fa-file text-2xl text-gray-400"></i>
                            <p className="text-xs text-gray-500 mt-1">{file.name}</p>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-center space-x-4">
              <Link
                to={`/post/${id}`}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
              >
                <i className="fas fa-save mr-2"></i>
                수정 완료
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

                {/* 수정 도움말 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <i className="fas fa-edit text-blue-500 mr-2"></i>
                    수정 도움말
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-info-circle text-blue-500 mt-1 text-xs"></i>
                      <span>제목과 내용을 자유롭게 수정할 수 있습니다</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-info-circle text-blue-500 mt-1 text-xs"></i>
                      <span>카테고리와 태그도 변경 가능합니다</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-paperclip text-orange-500 mt-1 text-xs"></i>
                      <span>새 파일 추가 시 기존 파일이 교체됩니다</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-trash text-red-500 mt-1 text-xs"></i>
                      <span>개별 첨부파일 삭제는 X 버튼을 클릭하세요</span>
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
                    <Link to={`/post/${id}`} className="block p-3 bg-secondary text-white rounded-lg hover:bg-orange-600 transition-colors text-center">
                      <i className="fas fa-eye mr-2"></i>
                      수정 취소하고 보기
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

export default PostEdit;