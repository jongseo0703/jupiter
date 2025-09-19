import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {fetchPost, likePost, createComment, updateComment, deleteComment, verifyAnonymousComment} from '../services/api';
import { categorizeAttachments } from '../utils/fileUtils';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [commentForm, setCommentForm] = useState({
    content: '',
    author_name: '',
    anonymous_email: '',
    anonymous_pwd: '',
    is_anonymous: false
  });
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showCommentAuthModal, setShowCommentAuthModal] = useState(false);
  const [commentAuthForm, setCommentAuthForm] = useState({
    email: '',
    password: '',
    action: '', // 'edit' or 'delete'
    commentId: null,
    comment: null
  });

  // 익명 댓글 수정을 위한 인증 정보 저장
  const [authenticatedAnonymousComment, setAuthenticatedAnonymousComment] = useState(null);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  const alcoholIcons = [
    '🍷', '🍺', '🍾', '🍶', '🥃', '🍻', '🥂', '🍸'
  ];
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    action: '' // 'edit' or 'delete'
  });
  // TODO: 실제 로그인 상태를 가져오는 hook 또는 context 사용
  const currentUser = {
    user_id: 1,
    author_name: '위스키러버',
    is_logged_in: true // 임시상태
  }; // MOCK DATA - 실제로는 useAuth() hook에서 가져옴

  // React Query를 사용하여 게시글 상세 정보 조회
  const { data: post, isLoading: loading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost
  });

  // React Query에서 댓글 데이터 직접 사용
  const comments = post?.comments || [];

  // 아이콘 회전 애니메이션
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % alcoholIcons.length);
    }, 200);

    return () => clearInterval(interval);
  }, [loading, alcoholIcons.length]);

  if (isError) {
    console.error('Failed to fetch post:', error);
    alert('게시글을 불러오는데 실패했습니다.');
    // 에러 발생 시 커뮤니티 페이지로 리디렉션
    navigate('/community');
    return null;
  }


  const handleCommentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    const commentData = {
      postId: parseInt(id),
      content: commentForm.content,
      isAnonymous: commentForm.is_anonymous,
      authorName: commentForm.author_name,
      anonymousEmail: commentForm.is_anonymous ? commentForm.anonymous_email : null,
      anonymousPassword: commentForm.is_anonymous ? commentForm.anonymous_pwd : null
    };

    createCommentMutation.mutate(commentData);
  };

  // 댓글 수정 시작
  const startEditComment = (comment) => {
    setEditingComment(comment.comment_id);
    setEditCommentContent(comment.content);
  };

  // 댓글 수정 취소
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentContent('');
    // 익명 댓글 인증 정보 초기화
    setAuthenticatedAnonymousComment(null);
  };

  // 댓글 수정 제출
  const handleEditComment = async (commentId) => {
    try {
      const comment = comments.find(c => c.comment_id === commentId);
      const requestData = {
        postId: parseInt(id),
        content: editCommentContent,
        authorName: comment.is_anonymous ? null : currentUser.author_name,
        isAnonymous: comment.is_anonymous,
        // 익명 댓글의 경우 인증된 정보 사용
        ...(comment.is_anonymous && authenticatedAnonymousComment && {
          anonymousEmail: authenticatedAnonymousComment.email,
          anonymousPassword: authenticatedAnonymousComment.password
        })
      };

      const response = await fetch(`http://localhost:8080/community/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        console.error('댓글 수정 실패:', response.status);
        alert('댓글 수정에 실패했습니다.');
        return;
      }

      const result = await response.json();
      const updatedComment = result.data;

      // 댓글 목록 업데이트
      setComments(prev => prev.map(comment =>
        comment.comment_id === commentId
          ? {
              ...comment,
              content: updatedComment.content,
              created_at: new Date(updatedComment.createdAt).toLocaleString('ko-KR')
            }
          : comment
      ));

      setEditingComment(null);
      setEditCommentContent('');
      // 익명 댓글 인증 정보 초기화
      setAuthenticatedAnonymousComment(null);
      alert('댓글이 수정되었습니다.');
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const requestData = {
        postId: parseInt(id),
        authorName: currentUser.author_name, // 임시로 현재 사용자 이름 사용
        isAnonymous: false
      };

      const response = await fetch(`http://localhost:8080/community/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        console.error('댓글 삭제 실패:', response.status);
        alert('댓글 삭제에 실패했습니다.');
        return;
      }

      // 댓글 목록에서 제거
      setComments(prev => prev.filter(comment => comment.comment_id !== commentId));
      alert('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 익명 댓글 수정 시작
  const handleAnonymousCommentEdit = (comment) => {
    setCommentAuthForm({
      email: '',
      password: '',
      action: 'edit',
      commentId: comment.comment_id,
      comment: comment
    });
    setShowCommentAuthModal(true);
  };

  // 익명 댓글 삭제 시작
  const handleAnonymousCommentDelete = (commentId) => {
    const comment = comments.find(c => c.comment_id === commentId);
    setCommentAuthForm({
      email: '',
      password: '',
      action: 'delete',
      commentId: commentId,
      comment: comment
    });
    setShowCommentAuthModal(true);
  };

  // 익명 댓글 인증 처리
  const handleCommentAuthSubmit = async (e) => {
    e.preventDefault();

    if (commentAuthForm.action === 'edit') {
      // 수정의 경우 인증 확인 API를 사용하여 편집 모드로 전환
      try {
        const requestData = {
          anonymousEmail: commentAuthForm.email,
          anonymousPassword: commentAuthForm.password
        };

        // 새로운 인증 전용 API 사용
        const response = await fetch(`http://localhost:8080/community/api/comments/${commentAuthForm.commentId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          if (response.status === 403) {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            return;
          }
          console.error('인증 실패:', response.status);
          alert('인증에 실패했습니다.');
          return;
        }

        // 인증 성공 시 편집 모드로 전환
        setEditingComment(commentAuthForm.commentId);
        setEditCommentContent(commentAuthForm.comment.content);

        // 인증 정보를 저장하여 나중에 수정 시 사용
        setAuthenticatedAnonymousComment({
          commentId: commentAuthForm.commentId,
          email: commentAuthForm.email,
          password: commentAuthForm.password
        });

        setShowCommentAuthModal(false);
        setCommentAuthForm({
          email: '',
          password: '',
          action: '',
          commentId: null,
          comment: null
        });
        alert('인증 완료! 댓글을 수정할 수 있습니다.');
      } catch (error) {
        console.error('Failed to authenticate comment:', error);
        alert('인증에 실패했습니다.');
      }
    } else if (commentAuthForm.action === 'delete') {
      // 삭제의 경우 바로 실행
      try {
        const requestData = {
          postId: parseInt(id),
          anonymousEmail: commentAuthForm.email,
          anonymousPassword: commentAuthForm.password,
          isAnonymous: true
        };

        const response = await fetch(`http://localhost:8080/community/api/comments/${commentAuthForm.commentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          if (response.status === 403) {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            return;
          }
          console.error('댓글 삭제 실패:', response.status);
          alert('댓글 삭제에 실패했습니다.');
          return;
        }

        // 댓글 목록에서 제거
        setComments(prev => prev.filter(comment => comment.comment_id !== commentAuthForm.commentId));
        setShowCommentAuthModal(false);
        setCommentAuthForm({
          email: '',
          password: '',
          action: '',
          commentId: null,
          comment: null
        });
        alert('댓글이 삭제되었습니다.');
      } catch (error) {
        console.error('Failed to delete anonymous comment:', error);
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  // 댓글 인증 폼 입력 처리
  const handleCommentAuthInputChange = (e) => {
    const { name, value } = e.target;
    setCommentAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { mutate: likeMutate } = useMutation({
    mutationFn: () => likePost(id),
    onMutate: async () => {
      // 진행중인 'post' 쿼리를 취소하여 이전 데이터와 충돌하지 않도록 함
      await queryClient.cancelQueries({ queryKey: ['post', id] });

      // 현재 캐시된 데이터의 스냅샷을 만듬
      const previousPost = queryClient.getQueryData(['post', id]);

      // UI를 즉시 업데이트 (낙관적 업데이트)
      queryClient.setQueryData(['post', id], (oldData) => ({
        ...oldData,
        likes: oldData.likes + 1,
      }));

      // 스냅샷을 반환하여 에러 발생 시 롤백에 사용
      return { previousPost };
    },
    onError: (err, variables, context) => {
      // 에러 발생 시 onMutate에서 만든 스냅샷으로 데이터 롤백
      if (context.previousPost) {
        queryClient.setQueryData(['post', id], context.previousPost);
      }
      console.error('Failed to like post:', err);
      alert('좋아요 처리에 실패했습니다.');
    },
    onSettled: () => {
      // 성공/실패 여부와 관계없이, 서버와 클라이언트의 상태를 동기화하기 위해 쿼리를 다시 실행
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  // 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onMutate: async (newCommentData) => {
      // 진행중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['post', id] });

      // 현재 데이터 스냅샷
      const previousPost = queryClient.getQueryData(['post', id]);

      // 낙관적 업데이트 - 새 댓글 추가
      queryClient.setQueryData(['post', id], (oldData) => {
        if (!oldData) return oldData;

        const newComment = {
          comment_id: Date.now(), // 임시 ID
          post_id: parseInt(id),
          content: newCommentData.content,
          author_name: newCommentData.authorName,
          created_at: new Date().toLocaleString('ko-KR'),
          is_anonymous: newCommentData.isAnonymous
        };

        return {
          ...oldData,
          comments: [...(oldData.comments || []), newComment]
        };
      });

      return { previousPost };
    },
    onSuccess: (createdComment) => {
      // 댓글 폼 초기화
      setCommentForm({
        content: '',
        author_name: '',
        anonymous_email: '',
        anonymous_pwd: '',
        is_anonymous: false
      });
    },
    onError: (err, variables, context) => {
      // 에러 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['post', id], context.previousPost);
      }
      console.error('Failed to create comment:', err);
      alert('댓글 등록에 실패했습니다.');
    },
    onSettled: () => {
      // 서버와 동기화
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    }
  });

  // 일반 회원 게시글 삭제
  const deletePost = async () => {
    try {
      const requestData = {
        authorName: currentUser.author_name
      };

      const response = await fetch(`http://localhost:8080/community/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        console.error('게시글 삭제 실패:', response.status);
        alert('게시글 삭제에 실패했습니다.');
        return;
      }

      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 익명 게시글 삭제
  const deletePostWithAuth = async (email, password) => {
    try {
      const requestData = {
        anonymousEmail: email,
        anonymousPassword: password,
        isAnonymous: true
      };

      const response = await fetch(`http://localhost:8080/community/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('이메일 또는 비밀번호가 일치하지 않습니다.');
          return;
        }
        console.error('게시글 삭제 실패:', response.status);
        alert('게시글 삭제에 실패했습니다.');
        return;
      }

      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', action: '' });
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const canEditPost = () => {
    if (!post) return false;

    // 익명 게시글은 항상 수정/삭제 버튼을 표시 (인증 모달로 확인)
    if (post.is_anonymous) {
      return true;
    } else {
      // 일반 게시글은 로그인한 사용자가 작성자인 경우만
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

  const handleDeleteClick = async () => {
    if (post.is_anonymous) {
      setAuthForm({ email: '', password: '', action: 'delete' });
      setShowAuthModal(true);
    } else if (currentUser.is_logged_in && currentUser.author_name === post.author_name) {
      if (window.confirm('정말로 삭제하시겠습니까?')) {
        await deletePost();
      }
    } else {
      alert('작성자만 삭제할 수 있습니다.');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authForm.action === 'edit') {
      // 수정의 경우 인증 확인 후 PostEdit 페이지로 이동
      try {
        const requestData = {
          anonymousEmail: authForm.email,
          anonymousPassword: authForm.password
        };

        // 새로운 인증 전용 API 사용
        console.log('인증 요청 데이터:', requestData);
        console.log('요청 URL:', `http://localhost:8080/community/api/posts/${post.post_id}/verify`);

        const response = await fetch(`http://localhost:8080/community/api/posts/${post.post_id}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        console.log('응답 상태:', response.status);
        console.log('응답 헤더:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('에러 응답:', errorText);
          if (response.status === 403) {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            return;
          }
          console.error('Authentication failed:', response.status, errorText);
          alert('인증에 실패했습니다. 다시 시도해주세요.');
          return;
        }

        const responseData = await response.json();
        console.log('인증 성공 응답:', responseData);

        // 인증 성공 시 수정 페이지로 이동 (인증 정보와 함께)
        console.log('수정 페이지로 이동:', `/post/edit/${post.post_id}`);
        navigate(`/post/edit/${post.post_id}`, {
          state: {
            anonymousEmail: authForm.email,
            anonymousPassword: authForm.password
          }
        });
        setShowAuthModal(false);
        setAuthForm({ email: '', password: '', action: '' });
        alert('인증 성공! 수정 페이지로 이동합니다.');
      } catch (error) {
        console.error('Failed to authenticate post:', error);
        alert('인증에 실패했습니다.');
      }
    } else if (authForm.action === 'delete') {
      // 삭제의 경우 바로 실행
      await deletePostWithAuth(authForm.email, authForm.password);
    }
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
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
                  onClick={() => likeMutate()}
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

                  {(() => {
                    // 이미지와 일반 파일 분리
                    const { images, files } = categorizeAttachments(post.attachments);

                    return (
                      <div className="space-y-4">
                        {/* 이미지들 - 가로로 나열 */}
                        {images.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {images.map((file) => (
                              <div key={file.index} className="relative group">
                                <img
                                  src={`http://localhost:8080${file.fileUrl}`}
                                  alt={file.originalFilename}
                                  className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(`http://localhost:8080${file.fileUrl}`, '_blank')}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.error('이미지 로드 실패:', file.fileUrl);
                                  }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  {file.fileSize}KB
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 일반 파일들 - 세로로 길게 */}
                        {files.map((file) => (
                          <div
                            key={file.index}
                            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => window.open(`http://localhost:8080${file.fileUrl}`, '_blank')}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-file text-gray-400 text-lg"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 font-medium">{file.originalFilename}</p>
                                <p className="text-xs text-gray-500">{file.fileSize}KB</p>
                              </div>
                              <div className="flex-shrink-0">
                                <i className="fas fa-external-link-alt text-gray-400 text-sm"></i>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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

                    {/* 댓글 수정/삭제 버튼 */}
                    {(comment.is_anonymous || (currentUser.is_logged_in && currentUser.author_name === comment.author_name)) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => comment.is_anonymous ? handleAnonymousCommentEdit(comment) : startEditComment(comment)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => comment.is_anonymous ? handleAnonymousCommentDelete(comment.comment_id) : handleDeleteComment(comment.comment_id)}
                          className="text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 댓글 내용 또는 수정 입력창 */}
                  {editingComment === comment.comment_id ? (
                    <div className="ml-13">
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows="3"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEditComment}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleEditComment(comment.comment_id)}
                          className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-blue-800 transition-colors"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 ml-13">{comment.content}</p>
                  )}
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

      {/* 익명 댓글 인증 모달 */}
      {showCommentAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              댓글 {commentAuthForm.action === 'edit' ? '수정' : '삭제'} 인증
            </h3>
            <p className="text-gray-600 mb-4">
              익명 댓글을 {commentAuthForm.action === 'edit' ? '수정' : '삭제'}하려면 작성 시 입력한 이메일과 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handleCommentAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={commentAuthForm.email}
                  onChange={handleCommentAuthInputChange}
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
                  value={commentAuthForm.password}
                  onChange={handleCommentAuthInputChange}
                  placeholder="작성 시 입력한 비밀번호"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentAuthModal(false);
                    setCommentAuthForm({
                      email: '',
                      password: '',
                      action: '',
                      commentId: null,
                      comment: null
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    commentAuthForm.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary hover:bg-blue-800'
                  }`}
                >
                  {commentAuthForm.action === 'edit' ? '확인' : '삭제하기'}
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