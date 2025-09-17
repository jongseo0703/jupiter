import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    content: '',
    author_name: '',
    anonymous_email: '',
    anonymous_pwd: '',
    is_anonymous: false
  });
  const [loading, setLoading] = useState(true);
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    action: '' // 'edit' or 'delete'
  });
  // TODO: 실제 로그인 상태를 가져오는 hook 또는 context 사용
  const [currentUser, setCurrentUser] = useState({
    user_id: 1,
    author_name: '위스키러버',
    is_logged_in: true // 임시상태
  }); // MOCK DATA - 실제로는 useAuth() hook에서 가져옴

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

할인 기간이 얼마 남지 않았으니 관심 있으신 분들은 서둘러주세요!

#위스키 #조니워커 #할인정보 #쿠팡`,
      author_name: '익명',
      category: '가격정보',
      created_at: '2024-01-15 14:30:00',
      updated_at: '2024-01-15 14:30:00',
      views: 152,
      likes: 23,
      tags: '#위스키 #할인 #쿠팡',
      is_anonymous: true,
      anonymous_email: 'test@example.com',
      anonymous_pwd: 'password123',
      attachments: []
    };

    // TODO: 실제 API 호출로 바꿀 것 - GET /api/comments?post_id={id}
    const mockComments = [
      {
        comment_id: 1,
        post_id: parseInt(id),
        content: '좋은 정보 감사합니다! 바로 주문했어요.',
        author_name: '위스키초보',
        created_at: '2024-01-15 15:00:00',
        is_anonymous: false
      },
      {
        comment_id: 2,
        post_id: parseInt(id),
        content: '가격이 정말 괜찮네요. 추천해주셔서 감사해요!',
        author_name: '익명',
        created_at: '2024-01-15 16:20:00',
        is_anonymous: true
      },
      {
        comment_id: 3,
        post_id: parseInt(id),
        content: '블루라벨은 정말 맛있죠. 특별한 날에 마시기 좋아요.',
        author_name: '스카치러버',
        created_at: '2024-01-15 18:45:00',
        is_anonymous: false
      }
    ];

    // TODO: 비동기 API 호출로 바꿀 것
    // const fetchPost = async () => {
    //   try {
    //     const postResponse = await fetch(`/api/posts/${id}`);
    //     const commentsResponse = await fetch(`/api/comments?post_id=${id}`);
    //     const postData = await postResponse.json();
    //     const commentsData = await commentsResponse.json();
    //     setPost(postData);
    //     setComments(commentsData);
    //   } catch (error) {
    //     console.error('Failed to fetch post:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchPost();

    setTimeout(() => {
      setPost(mockPost);
      setComments(mockComments);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleCommentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    // TODO: 실제 API 호출로 바꿀 것 - POST /api/comments
    // try {
    //   const response = await fetch('/api/comments', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}` // 회원인 경우
    //     },
    //     body: JSON.stringify({
    //       post_id: parseInt(id),
    //       content: commentForm.content,
    //       is_anonymous: commentForm.is_anonymous,
    //       anonymous_email: commentForm.anonymous_email,
    //       anonymous_pwd: commentForm.anonymous_pwd
    //     })
    //   });
    //   const newComment = await response.json();
    //   setComments(prev => [...prev, newComment]);
    // } catch (error) {
    //   console.error('Failed to create comment:', error);
    //   alert('댓글 등록에 실패했습니다.');
    //   return;
    // }

    const newComment = {
      comment_id: comments.length + 1,
      post_id: parseInt(id),
      content: commentForm.content,
      author_name: commentForm.is_anonymous ? '익명' : commentForm.author_name,
      created_at: new Date().toLocaleString('ko-KR'),
      is_anonymous: commentForm.is_anonymous
    };

    setComments(prev => [...prev, newComment]);
    setCommentForm({
      content: '',
      author_name: '',
      anonymous_email: '',
      anonymous_pwd: '',
      is_anonymous: false
    });

    alert('댓글이 등록되었습니다!');
  };

  const handleLike = async () => {
    // TODO: 실제 API 호출로 바꿀 것 - POST /api/likes
    // Redis를 사용하여 IP 기반 중복 방지 처리
    // try {
    //   const response = await fetch('/api/likes', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ post_id: parseInt(id) })
    //   });
    //   const result = await response.json();
    //   if (result.success) {
    //     setPost(prev => ({ ...prev, likes: result.newLikeCount }));
    //   } else {
    //     alert('이미 좋아요를 누르셨습니다.');
    //   }
    // } catch (error) {
    //   console.error('Failed to like post:', error);
    // }

    setPost(prev => ({
      ...prev,
      likes: prev.likes + 1
    }));
  };

  const canEditPost = () => {
    if (!post) return false;

    if (post.is_anonymous) {
      return true; // 익명 글은 인증 모달을 통해 확인
    } else {
      return currentUser.is_logged_in && currentUser.author_name === post.author_name;
    }
  };

  const handleEditClick = () => {
    if (post.is_anonymous) {
      setAuthForm({ email: '', password: '', action: 'edit' });
      setShowAuthModal(true);
    } else if (currentUser.is_logged_in && currentUser.author_name === post.author_name) {
      navigate(`/post/edit/${post.post_id}`);
      alert('수정 페이지로 이동합니다.');
    } else {
      alert('작성자만 수정할 수 있습니다.');
    }
  };

  const handleDeleteClick = () => {
    if (post.is_anonymous) {
      setAuthForm({ email: '', password: '', action: 'delete' });
      setShowAuthModal(true);
    } else if (currentUser.is_logged_in && currentUser.author_name === post.author_name) {
      if (window.confirm('정말로 삭제하시겠습니까?')) {
        // TODO: 실제 삭제 API 호출 - DELETE /api/posts/{id}
        // try {
        //   await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        //   navigate('/community');
        // } catch (error) {
        //   console.error('Failed to delete post:', error);
        // }
        alert('게시글이 삭제되었습니다.');
        navigate('/community');
      }
    } else {
      alert('작성자만 삭제할 수 있습니다.');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    // TODO: 실제 익명 인증 API 호출 - POST /api/auth
    // try {
    //   const response = await fetch('/api/auth', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       post_id: post.post_id,
    //       email: authForm.email,
    //       password: authForm.password
    //     })
    //   });
    //   const result = await response.json();
    //   if (!result.success) {
    //     alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    //     return;
    //   }
    // } catch (error) {
    //   console.error('Failed to authenticate:', error);
    //   return;
    // }

    // MOCK 인증 확인
    if (authForm.email === post.anonymous_email && authForm.password === post.anonymous_pwd) {
      if (authForm.action === 'edit') {
        navigate(`/post/edit/${post.post_id}`);
        alert('인증 완료! 수정 페이지로 이동합니다.');
      } else if (authForm.action === 'delete') {
        if (window.confirm('정말로 삭제하시겠습니까?')) {
          // TODO: 실제 삭제 API 호출 - DELETE /api/posts/{id}
          alert('게시글이 삭제되었습니다.');
          navigate('/community');
        }
      }
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', action: '' });
    } else {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-16 bg-white min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
          <div className="relative mb-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">
                  {alcoholIcons[currentIconIndex]}
                </span>
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

  if (!post) {
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
    <div className="py-16 bg-gray-50 min-h-screen">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">게시글 상세</h1>
          <p className="text-lg">커뮤니티 게시글을 확인하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* 브레드크럼 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">홈</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/community" className="hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer">커뮤니티</Link>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-medium">게시글 상세</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 게시글 내용 */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            {/* 게시글 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-secondary text-white text-sm px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">{post.created_at}</span>
              </div>

              {post.tags && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.split(' ').map((tag, index) => (
                    <span key={index} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <i className="fas fa-user mr-2"></i>
                    {post.is_anonymous ? '익명' : post.author_name}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-eye mr-2"></i>
                    조회 {post.views}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-comment mr-2"></i>
                    댓글 {comments.length}
                  </span>
                </div>

                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
                >
                  <i className="fas fa-heart"></i>
                  <span>{post.likes}</span>
                </button>
              </div>
            </div>

            {/* 게시글 본문 */}
            <div className="p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {post.content}
                </pre>
              </div>

              {/* 첨부파일 */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">첨부파일</h3>
                  <div className="space-y-2">
                    {post.attachments.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-file text-gray-400 mr-3"></i>
                        <span className="text-sm text-gray-700 flex-1">{file.original_filename}</span>
                        <span className="text-xs text-gray-500 mr-3">{(file.file_size / 1024).toFixed(1)}KB</span>
                        <button className="text-primary hover:text-blue-800 text-sm">
                          <i className="fas fa-download mr-1"></i>
                          다운로드
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 게시글 액션 */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <Link
                  to="/community"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <i className="fas fa-list mr-2"></i>
                  목록으로
                </Link>

                {canEditPost() && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      수정
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* 댓글 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                댓글 ({comments.length})
              </h3>
            </div>

            {/* 댓글 목록 */}
            <div className="divide-y divide-gray-200">
              {comments.map(comment => (
                <div key={comment.comment_id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-500"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {comment.is_anonymous ? '익명' : comment.author_name}
                        </p>
                        <p className="text-sm text-gray-500">{comment.created_at}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 ml-13">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* 댓글 작성 폼 */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">댓글 작성</h4>

              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <textarea
                    name="content"
                    value={commentForm.content}
                    onChange={handleCommentInputChange}
                    placeholder="댓글을 작성해주세요..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={commentForm.is_anonymous}
                    onChange={handleCommentInputChange}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <label className="text-gray-700">익명으로 작성</label>
                </div>

                {commentForm.is_anonymous ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="anonymous_email"
                      value={commentForm.anonymous_email}
                      onChange={handleCommentInputChange}
                      placeholder="이메일"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required={commentForm.is_anonymous}
                    />
                    <input
                      type="password"
                      name="anonymous_pwd"
                      value={commentForm.anonymous_pwd}
                      onChange={handleCommentInputChange}
                      placeholder="비밀번호"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required={commentForm.is_anonymous}
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-user mr-2"></i>
                      로그인된 사용자로 댓글을 작성합니다
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <i className="fas fa-comment mr-2"></i>
                    댓글 등록
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 익명 사용자 인증 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {authForm.action === 'edit' ? '게시글 수정' : '게시글 삭제'} 인증
            </h3>
            <p className="text-gray-600 mb-4">
              익명 게시글을 {authForm.action === 'edit' ? '수정' : '삭제'}하려면 작성 시 입력한 이메일과 비밀번호를 입력해주세요.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>테스트용 계정:</strong><br/>
                이메일: test@example.com<br/>
                비밀번호: password123
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  placeholder="작성 시 입력한 이메일"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  placeholder="작성 시 입력한 비밀번호"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthForm({ email: '', password: '', action: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    authForm.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary hover:bg-blue-800'
                  }`}
                >
                  {authForm.action === 'edit' ? '수정하기' : '삭제하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;