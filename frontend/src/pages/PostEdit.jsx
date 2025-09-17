import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    tags: '',
    attachments: []
  });
  const [originalPost, setOriginalPost] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

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

  // TODO: 실제 로그인 상태를 가져오는 hook 또는 context 사용
  const currentUser = {
    user_id: 1,
    author_name: '익명',
    is_logged_in: false
  }; // MOCK DATA

  const categories = [
    '자유게시판',
    '가격정보',
    '술리뷰',
    '질문답변',
    '이벤트'
  ];

  // 아이콘 회전 애니메이션
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % alcoholIcons.length);
    }, 200);

    return () => clearInterval(interval);
  }, [loading, alcoholIcons.length]);

  useEffect(() => {
    // TODO: 실제 API 호출로 바꿀 것 - GET /api/posts/{id}
    const mockPost = {
      post_id: parseInt(id),
      title: '조니워커 블루라벨 할인 정보 공유',
      content: `쿠팡에서 조니워커 블루라벨이 20% 할인 중이에요!

평소에 너무 비싸서 구매를 망설였는데, 이번에 할인가로 구매했습니다.
정말 부드럽고 깊은 맛이 인상적이네요.

할인 기간이 얼마 남지 않았으니 관심 있으신 분들은 서둘러주세요!`,
      author_name: '익명',
      category: '가격정보',
      tags: '#위스키 #할인 #쿠팡',
      is_anonymous: false,
      attachments: []
    };

    // TODO: 권한 확인 - 작성자인지 체크
    // if (!currentUser.is_logged_in ||
    //     (!mockPost.is_anonymous && currentUser.author_name !== mockPost.author_name)) {
    //   alert('수정 권한이 없습니다.');
    //   navigate('/community');
    //   return;
    // }

    setTimeout(() => {
      setOriginalPost(mockPost);
      setFormData({
        category: mockPost.category,
        title: mockPost.title,
        content: mockPost.content,
        tags: mockPost.tags,
        attachments: []
      });
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    // TODO: 파일 사이즈 제한, 파일 타입 검증 추가
    // TODO: 이미지 미리보기 최적화 (원본 크기 유지)
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 5) {
      alert('최대 5개의 파일까지 업로드 가능합니다.');
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setPreviewImages(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (id) => {
    setPreviewImages(prev => prev.filter(file => file.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: 실제 API 호출로 바꿀 것 - PUT /api/posts/{id}
    // try {
    //   const response = await fetch(`/api/posts/${id}`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`
    //     },
    //     body: JSON.stringify({
    //       category: formData.category,
    //       title: formData.title,
    //       content: formData.content,
    //       tags: formData.tags
    //       // 작성자 정보는 수정하지 않음
    //     })
    //   });
    //
    //   if (response.ok) {
    //     navigate(`/post/${id}`);
    //   } else {
    //     alert('게시글 수정에 실패했습니다.');
    //   }
    // } catch (error) {
    //   console.error('Failed to update post:', error);
    //   alert('게시글 수정 중 오류가 발생했습니다.');
    // }

    console.log('수정된 게시글 데이터:', formData);
    alert('게시글이 성공적으로 수정되었습니다!');
    navigate(`/post/${id}`);
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

        <div className="max-w-4xl mx-auto">
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
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="예: #소주 #추천 #가격비교 (공백으로 구분)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
      </div>
    </div>
  );
}

export default PostEdit;