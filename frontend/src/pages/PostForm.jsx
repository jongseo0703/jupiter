import { useState } from 'react';
import { Link } from 'react-router-dom';

function PostForm() {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    author_name: '',
    anonymous_email: '',
    anonymous_pwd: '',
    tags: '',
    is_anonymous: false,
    attachments: []
  });

  const [previewImages, setPreviewImages] = useState([]);

  const categories = [
    '자유게시판',
    '가격정보',
    '술리뷰',
    '질문답변',
    '이벤트'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
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

  const removeImage = (id) => {
    setPreviewImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const postData = {
      category: formData.category,
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
      author: {
        is_anonymous: formData.is_anonymous,
        author_name: formData.is_anonymous ? null : formData.author_name,
        anonymous_email: formData.is_anonymous ? formData.anonymous_email : null,
        anonymous_pwd: formData.is_anonymous ? formData.anonymous_pwd : null
      },
      attachments: formData.attachments
    };

    console.log('게시글 데이터:', postData);
    alert('게시글이 성공적으로 작성되었습니다!');
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

        <div className="max-w-4xl mx-auto">
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
                <p className="text-sm text-gray-500 mt-1">최소 10자 이상 작성해주세요.</p>
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
                        onClick={() => removeImage(file.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      닉네임 *
                    </label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleInputChange}
                      placeholder="닉네임을 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required={!formData.is_anonymous}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 작성 가이드라인 */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                커뮤니티 가이드라인
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 건전하고 유익한 정보를 공유해주세요</li>
                <li>• 개인정보나 연락처는 공개하지 마세요</li>
                <li>• 광고성 게시물은 삭제될 수 있습니다</li>
                <li>• 다른 사용자를 존중하는 댓글을 작성해주세요</li>
                <li>• 허위 정보나 부적절한 내용은 신고될 수 있습니다</li>
              </ul>
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
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                게시글 등록
              </button>
            </div>
          </form>

          {/* 인기 게시글 미리보기 */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-fire text-red-500 mr-2"></i>
              인기 게시글 둘러보기
            </h3>
            <div className="space-y-3">
              {[
                { title: "소주 추천 - 처음처럼과 참이슬 비교", category: "주류 추천", comments: 23 },
                { title: "편의점 주류 할인 정보 모음", category: "이벤트/할인", comments: 15 },
                { title: "와인 초보자를 위한 가이드", category: "질문/답변", comments: 31 }
              ].map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{post.category}</span>
                    <span className="text-gray-800 hover:text-primary cursor-pointer">{post.title}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-comment mr-1"></i>
                    {post.comments}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostForm;