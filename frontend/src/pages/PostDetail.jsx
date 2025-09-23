import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {fetchPost, fetchPopularPosts, fetchPopularPostsByLikes, likePost, unlikePost, createComment, updateComment, deleteComment, verifyAnonymousComment, deletePost as deletePostAPI, verifyAnonymousPost} from '../services/api';
import { categorizeAttachments } from '../utils/fileUtils';
import { getCategoryStyle, getEnglishCategory } from '../utils/categoryUtils';
import authService from '../services/authService';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [popularTab, setPopularTab] = useState('views'); // 'views' 또는 'likes'

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
          // 로그인한 사용자는 익명 체크 해제
          setCommentForm(prev => ({ ...prev, is_anonymous: false }));
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
          // 토큰이 유효하지 않을 경우 로그아웃 처리
          await authService.logout();
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        // 비로그인 사용자는 무조건 익명으로 설정
        setCommentForm(prev => ({ ...prev, is_anonymous: true }));
        setCurrentUser(null);
      }
    };

    checkAuthStatus().catch(console.error);
  }, []);

  // React Query를 사용하여 게시글 상세 정보 조회
  const { data: post, isLoading: loading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost
  });

  // 인기 게시글 조회 (조회수 순)
  const { data: popularPostsData } = useQuery({
    queryKey: ['popularPosts', '전체', 1],
    queryFn: fetchPopularPosts,
    enabled: popularTab === 'views',
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  // 인기 게시글 조회 (좋아요 순)
  const { data: popularPostsByLikesData } = useQuery({
    queryKey: ['popularPostsByLikes', '전체', 1],
    queryFn: fetchPopularPostsByLikes,
    enabled: popularTab === 'likes',
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });

  const popularPosts = popularTab === 'views'
    ? (popularPostsData?.posts || [])
    : (popularPostsByLikesData?.posts || []);

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
      isAnonymous: !isLoggedIn, // 로그인한 사용자는 false, 비로그인은 true
      authorId: isLoggedIn ? currentUser?.id : null,
      authorName: isLoggedIn ? currentUser?.username : '익명',
      anonymousEmail: !isLoggedIn ? commentForm.anonymous_email : null,
      anonymousPassword: !isLoggedIn ? commentForm.anonymous_pwd : null
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
  const handleEditComment = (commentId) => {
    const comment = comments.find(c => c.comment_id === commentId);
    const commentData = {
      postId: parseInt(id),
      content: editCommentContent,
      authorId: comment.is_anonymous ? null : currentUser?.id,
      authorName: comment.is_anonymous ? null : currentUser?.username,
      isAnonymous: comment.is_anonymous,
      // 익명 댓글의 경우 인증된 정보 사용
      anonymousEmail: (comment.is_anonymous && authenticatedAnonymousComment) ? authenticatedAnonymousComment.email : null,
      anonymousPassword: (comment.is_anonymous && authenticatedAnonymousComment) ? authenticatedAnonymousComment.password : null
    };

    updateCommentMutation.mutate({ commentId, commentData });
  };

  // 댓글 삭제
  const handleDeleteComment = (commentId) => {
    if (!window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      return;
    }

    const requestData = {
      postId: parseInt(id),
      content: "", // 삭제 시에는 내용 불필요하지만 DTO 구조상 필요
      authorId: currentUser?.id, // 사용자 ID 전달
      authorName: currentUser?.username,
      isAnonymous: false,
      anonymousEmail: null,
      anonymousPassword: null
    };

    deleteCommentMutation.mutate({ commentId, requestData });
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
      const authData = {
        anonymousEmail: commentAuthForm.email,
        anonymousPassword: commentAuthForm.password
      };

      verifyAnonymousCommentMutation.mutate({
        commentId: commentAuthForm.commentId,
        authData
      });
    } else if (commentAuthForm.action === 'delete') {
      // 삭제의 경우 바로 실행
      const requestData = {
        postId: parseInt(id),
        anonymousEmail: commentAuthForm.email,
        anonymousPassword: commentAuthForm.password,
        isAnonymous: true
      };

      // 성공 시 모달 닫기를 위한 콜백 설정
      deleteCommentMutation.mutate(
        { commentId: commentAuthForm.commentId, requestData },
        {
          onSuccess: () => {
            setShowCommentAuthModal(false);
            setCommentAuthForm({
              email: '',
              password: '',
              action: '',
              commentId: null,
              comment: null
            });
          },
          onError: (error) => {
            if (error.message.includes('403')) {
              alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            }
          }
        }
      );
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

  // ===== 공통 mutation 헬퍼 함수들 =====

  /**
   * 낙관적 업데이트를 위한 공통 함수
   * - 진행 중인 쿼리를 취소하여 충돌 방지
   * - 현재 데이터의 스냅샷을 생성
   * - UI를 즉시 업데이트 (서버 응답 전에 미리 화면 변경)
   * @param {Function} updateFn - 데이터 업데이트 함수 (oldData) => newData
   * @returns {Object} 롤백용 이전 데이터 스냅샷
   */
  const createOptimisticUpdate = async (updateFn) => {
    // 1. 진행중인 post 쿼리 취소 (데이터 충돌 방지)
    await queryClient.cancelQueries({ queryKey: ['post', id] });

    // 2. 현재 캐시된 데이터의 스냅샷 생성 (에러시 롤백용)
    const previousPost = queryClient.getQueryData(['post', id]);

    // 3. UI 즉시 업데이트 (낙관적 업데이트)
    if (updateFn) {
      queryClient.setQueryData(['post', id], updateFn);
    }
    return { previousPost };
  };

  /**
   * Mutation 에러 발생 시 데이터 롤백 처리
   * - 낙관적 업데이트로 변경된 UI를 이전 상태로 되돌림
   * @param {Error} err - 발생한 에러
   * @param {Object} context - onMutate에서 반환한 컨텍스트 (스냅샷 포함)
   */
  const handleMutationError = (context) => {
    // 이전 데이터가 있으면 롤백 실행
    if (context?.previousPost) {
      queryClient.setQueryData(['post', id], context.previousPost);
    }
  };

  /**
   * 좋아요 관련해서는 서버 재조회 없이 낙관적 업데이트만 사용
   * - 조회수 증가 방지를 위해 쿼리 무효화 하지 않음
   */
  const invalidatePostQuery = () => {
    // 좋아요 관련은 낙관적 업데이트만 사용하므로 서버 재조회 안 함
    // 필요시에만 주석 해제
    // queryClient.invalidateQueries({ queryKey: ['post', id] }).catch(console.error);
  };

  // 좋아요 토글 함수 - 로그인 체크 후 좋아요/취소 결정
  const handleLikeToggle = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다. 로그인 후 좋아요를 눌러주세요.');
      return;
    }

    if (post.is_liked_by_current_user) {
      unlikeMutate();
    } else {
      likeMutate();
    }
  };

  // 좋아요 추가 mutation - 헬퍼 함수 사용으로 중복 코드 제거
  const { mutate: likeMutate } = useMutation({
    mutationFn: () => likePost(id),
    onMutate: () => createOptimisticUpdate((oldData) => ({
      ...oldData,
      likes: oldData.likes + 1, // 좋아요 수 1 증가
      is_liked_by_current_user: true, // 사용자가 좋아요 누른 상태로 변경
    })),
    onSuccess: () => {
      // 좋아요 성공 시 하트 애니메이션 트리거
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1600); // 1.6초 후 애니메이션 종료
    },
    onError: (err, context) => {
      handleMutationError(err, context); // 공통 에러 처리
      console.error('Failed to like post:', err);
      if (err.message.includes('401')) {
        alert('로그인이 필요합니다.');
      } else {
        alert('좋아요 처리에 실패했습니다.');
      }
    },
    onSettled: invalidatePostQuery, // 공통 쿼리 무효화
  });

  // 좋아요 취소 mutation - 헬퍼 함수 사용으로 중복 코드 제거
  const { mutate: unlikeMutate } = useMutation({
    mutationFn: () => unlikePost(id),
    onMutate: () => createOptimisticUpdate((oldData) => ({
      ...oldData,
      likes: oldData.likes - 1, // 좋아요 수 1 감소
      is_liked_by_current_user: false, // 사용자가 좋아요 취소한 상태로 변경
    })),
    onError: (err, context) => {
      handleMutationError(err, context); // 공통 에러 처리
      console.error('Failed to unlike post:', err);
      if (err.message.includes('401')) {
        alert('로그인이 필요합니다.');
      } else {
        alert('좋아요 취소에 실패했습니다.');
      }
    },
    onSettled: invalidatePostQuery, // 공통 쿼리 무효화
  });

  // 댓글 작성 mutation - 헬퍼 함수 사용으로 중복 코드 제거
  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onMutate: (newCommentData) => createOptimisticUpdate((oldData) => {
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
        comments: [...(oldData.comments || []), newComment] // 새 댓글 추가
      };
    }),
    onSuccess: () => {
      // 댓글 폼 초기화
      setCommentForm({
        content: '',
        author_name: '',
        anonymous_email: '',
        anonymous_pwd: '',
        is_anonymous: !isLoggedIn
      });
      alert('댓글이 성공적으로 등록되었습니다.');
    },
    onError: (err, context) => {
      handleMutationError(err, context); // 공통 에러 처리
      console.error('Failed to create comment:', err);
      alert('댓글 등록에 실패했습니다.');
    },
    onSettled: invalidatePostQuery, // 성공/실패 관계없이 서버 데이터로 동기화
  });

  // 댓글 수정 mutation - 헬퍼 함수 사용으로 중복 코드 제거
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onMutate: ({ commentId, commentData }) => createOptimisticUpdate((oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        comments: oldData.comments.map(comment =>
          comment.comment_id === commentId ? {
            ...comment,
            content: commentData.content, // 댓글 내용 수정
            created_at: new Date().toLocaleString('ko-KR')} : comment)};
    }),
    onSuccess: () => {
      // 편집 상태 초기화
      setEditingComment(null);
      setEditCommentContent('');
      setAuthenticatedAnonymousComment(null);
      alert('댓글이 성공적으로 수정되었습니다.');
    },
    onError: (err, context) => {
      handleMutationError(err, context); // 공통 에러 처리
      console.error('Failed to update comment:', err);
      alert('댓글 수정에 실패했습니다.');
    },
    onSettled: invalidatePostQuery, // 공통 쿼리 무효화
  });

  // 댓글 삭제 mutation - 헬퍼 함수 사용으로 중복 코드 제거
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: ({ commentId }) => createOptimisticUpdate((oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        comments: oldData.comments.filter(comment => comment.comment_id !== commentId) // 댓글 제거
      };
    }),
    onSuccess: () => {
      alert('댓글이 성공적으로 삭제되었습니다.');
    },
    onError: (err, context) => {
      handleMutationError(err, context); // 공통 에러 처리
      console.error('Failed to delete comment:', err);
      alert('댓글 삭제에 실패했습니다.');
    },
    onSettled: invalidatePostQuery, // 공통 쿼리 무효화
  });

  // 익명 댓글 인증 mutation
  const verifyAnonymousCommentMutation = useMutation({
    mutationFn: verifyAnonymousComment,
    onSuccess: () => {
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
    },
    onError: (error) => {
      console.error('Failed to authenticate comment:', error);
      if (error.message.includes('403')) {
        alert('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        alert('인증에 실패했습니다.');
      }
    }
  });

  // 게시글 삭제 mutation
  const deletePostMutation = useMutation({
    mutationFn: deletePostAPI,
    onSuccess: () => {
      // 성공 알림
      alert('게시글이 성공적으로 삭제되었습니다.');
      // 삭제 성공 시 커뮤니티 페이지로 이동
      navigate('/community');
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
      if (error.message.includes('403')) {
        alert('삭제 권한이 없습니다.');
      } else {
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  });

  // 익명 게시글 인증 mutation
  const verifyAnonymousPostMutation = useMutation({
    mutationFn: verifyAnonymousPost,
    onError: (error) => {
      console.error('Failed to verify anonymous post:', error);
      if (error.message.includes('403')) {
        alert('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        alert('인증에 실패했습니다.');
      }
    }
  });

  // 일반 회원 게시글 삭제
  const handleDeletePost = () => {
    if (!window.confirm('정말로 게시글을 삭제하시겠습니까?')) {
      return;
    }

    const requestData = {
      category: getEnglishCategory(post.category),
      title: post.title,
      content: post.content,
      tags: post.tags,
      authorId: currentUser?.id,
      authorName: currentUser?.username,
      isAnonymous: false,
      anonymousEmail: null,
      anonymousPassword: null
    };

    deletePostMutation.mutate({ postId: id, requestData });
  };

  // 익명 게시글 삭제
  const handleDeletePostWithAuth = (email, password) => {
    if (!window.confirm('정말로 게시글을 삭제하시겠습니까?')) {
      return;
    }

    const requestData = {
      anonymousEmail: email,
      anonymousPassword: password,
      isAnonymous: true
    };

    deletePostMutation.mutate(
      { postId: id, requestData },
      {
        onSuccess: () => {
          setShowAuthModal(false);
          setAuthForm({ email: '', password: '', action: '' });
        },
        onError: (error) => {
          if (error.message.includes('403')) {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
          }
        }
      }
    );
  };

  const canEditPost = () => {
    if (!post) return false;


    // 익명 게시글은 항상 수정/삭제 버튼을 표시 (인증 모달로 확인)
    if (post.is_anonymous) {
      return true;
    } else {
      // 권한 확인: username으로 비교 (안정적인 방법)
      // author_id가 정상적으로 오면 나중에 id 기반으로 변경 가능
      return !!(isLoggedIn && currentUser?.username && currentUser.username === post.author_name);
    }
  };

  const handleEditClick = () => {
    if (post.is_anonymous) {
      setAuthForm({ email: '', password: '', action: 'edit' });
      setShowAuthModal(true);
    } else if (isLoggedIn && currentUser?.username === post.author_name) {
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
    } else if (isLoggedIn && currentUser?.username === post.author_name) {
      handleDeletePost();
    } else {
      alert('작성자만 삭제할 수 있습니다.');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authForm.action === 'edit') {
      // 수정의 경우 인증 확인 후 PostEdit 페이지로 이동
      const authData = {
        anonymousEmail: authForm.email,
        anonymousPassword: authForm.password
      };

      verifyAnonymousPostMutation.mutate(
        { postId: post.post_id, authData },
        {
          onSuccess: () => {
            // 인증 성공 시 수정 페이지로 이동 (인증 정보와 함께)
            navigate(`/post/edit/${post.post_id}`, {
              state: {
                anonymousEmail: authForm.email,
                anonymousPassword: authForm.password
              }
            });
            setShowAuthModal(false);
            setAuthForm({ email: '', password: '', action: '' });
          }
        }
      );
    } else if (authForm.action === 'delete') {
      // 삭제의 경우 바로 실행
      handleDeletePostWithAuth(authForm.email, authForm.password);
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

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 영역 */}
          <div className="lg:col-span-2">
            {/* 게시글 내용 */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
            {/* 게시글 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                {(() => {
                  const categoryStyle = getCategoryStyle(post.category);
                  return (
                    <span className={`${categoryStyle.bgColor} ${categoryStyle.textColor} text-sm px-3 py-1 rounded-full flex items-center space-x-2 border ${categoryStyle.borderColor}`}>
                      <i className={`${categoryStyle.icon} ${categoryStyle.iconColor}`}></i>
                      <span>{post.category}</span>
                    </span>
                  );
                })()}
                <span className="text-sm text-gray-500">{post.created_at}</span>
              </div>

              {post.tags && (() => {
                try {
                  const parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
                  if (Array.isArray(parsedTags) && parsedTags.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {parsedTags.map((tag, index) => (
                          <span key={index} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    );
                  }
                } catch (e) {
                  // JSON 파싱 실패 시 빈 배열로 처리
                  return null;
                }
                return null;
              })()}

              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800 flex-1">{post.title}</h1>

                {/* 수정/삭제 버튼 */}
                {canEditPost() && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={handleEditClick}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      수정
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      삭제
                    </button>
                  </div>
                )}
              </div>

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

                <div className="relative">
                  <button
                    onClick={handleLikeToggle}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                      post.is_liked_by_current_user
                        ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title={isLoggedIn
                      ? (post.is_liked_by_current_user ? '좋아요 취소' : '좋아요')
                      : '로그인이 필요합니다'
                    }
                  >
                    <i className={`fas fa-heart text-xl ${
                      post.is_liked_by_current_user ? 'text-red-500' : 'text-gray-400'
                    } transition-all duration-200`}></i>
                    <span className="font-semibold">{post.likes}</span>
                  </button>

                  {/* 하트 애니메이션 */}
                  {showHeartAnimation && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${15 + i * 8}%`,
                            top: '50%',
                            animation: `heartFloat${i} 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                            animationDelay: `${i * 0.08}s`
                          }}
                        >
                          <i className={`fas fa-heart text-lg ${
                            i % 3 === 0 ? 'text-red-400' :
                            i % 3 === 1 ? 'text-pink-400' : 'text-red-300'
                          } opacity-90`}></i>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CSS 애니메이션 추가 */}
                <style>{`
                  @keyframes heartFloat0 {
                    0% { transform: translateY(0px) scale(0.8); opacity: 0.9; }
                    50% { transform: translateY(-40px) scale(1.2); opacity: 0.7; }
                    100% { transform: translateY(-100px) scale(0.6); opacity: 0; }
                  }
                  @keyframes heartFloat1 {
                    0% { transform: translateY(0px) translateX(-8px) scale(0.7); opacity: 0.9; }
                    50% { transform: translateY(-45px) translateX(-18px) scale(1.1); opacity: 0.6; }
                    100% { transform: translateY(-110px) translateX(-25px) scale(0.5); opacity: 0; }
                  }
                  @keyframes heartFloat2 {
                    0% { transform: translateY(0px) translateX(12px) scale(0.9); opacity: 0.9; }
                    50% { transform: translateY(-50px) translateX(20px) scale(1.3); opacity: 0.7; }
                    100% { transform: translateY(-120px) translateX(30px) scale(0.4); opacity: 0; }
                  }
                  @keyframes heartFloat3 {
                    0% { transform: translateY(0px) translateX(-5px) scale(0.6); opacity: 0.9; }
                    50% { transform: translateY(-35px) translateX(-12px) scale(1.0); opacity: 0.8; }
                    100% { transform: translateY(-95px) translateX(-18px) scale(0.7); opacity: 0; }
                  }
                  @keyframes heartFloat4 {
                    0% { transform: translateY(0px) translateX(8px) scale(0.8); opacity: 0.9; }
                    50% { transform: translateY(-55px) translateX(15px) scale(1.4); opacity: 0.6; }
                    100% { transform: translateY(-130px) translateX(22px) scale(0.3); opacity: 0; }
                  }
                  @keyframes heartFloat5 {
                    0% { transform: translateY(0px) translateX(-12px) scale(0.7); opacity: 0.9; }
                    50% { transform: translateY(-42px) translateX(-22px) scale(1.1); opacity: 0.7; }
                    100% { transform: translateY(-105px) translateX(-32px) scale(0.5); opacity: 0; }
                  }
                  @keyframes heartFloat6 {
                    0% { transform: translateY(0px) translateX(15px) scale(0.9); opacity: 0.9; }
                    50% { transform: translateY(-48px) translateX(25px) scale(1.2); opacity: 0.6; }
                    100% { transform: translateY(-115px) translateX(35px) scale(0.4); opacity: 0; }
                  }
                  @keyframes heartFloat7 {
                    0% { transform: translateY(0px) translateX(-3px) scale(0.8); opacity: 0.9; }
                    50% { transform: translateY(-38px) translateX(-8px) scale(1.0); opacity: 0.8; }
                    100% { transform: translateY(-98px) translateX(-12px) scale(0.6); opacity: 0; }
                  }
                `}</style>
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
                    {(comment.is_anonymous || (isLoggedIn && currentUser?.username === comment.author_name)) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => comment.is_anonymous ? handleAnonymousCommentEdit(comment) : startEditComment(comment)}
                          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          수정
                        </button>
                        <button
                          onClick={() => comment.is_anonymous ? handleAnonymousCommentDelete(comment.comment_id) : handleDeleteComment(comment.comment_id)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-trash mr-1"></i>
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

                {/* 로그인 상태에 따른 작성자 정보 표시 */}
                {isLoggedIn ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-user mr-2"></i>
                      {currentUser?.username || '사용자'}로 댓글을 작성합니다
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-4">
                      <p className="text-sm text-orange-800">
                        <i className="fas fa-user-secret mr-2"></i>
                        익명으로 댓글을 작성합니다
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="email"
                        name="anonymous_email"
                        value={commentForm.anonymous_email}
                        onChange={handleCommentInputChange}
                        placeholder="이메일 (수정/삭제 시 사용)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                      <input
                        type="password"
                        name="anonymous_pwd"
                        value={commentForm.anonymous_pwd}
                        onChange={handleCommentInputChange}
                        placeholder="비밀번호 (수정/삭제 시 사용)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </>
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

            {/* 사이드바 */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-8">
                {/* 인기 게시글 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <i className="fas fa-fire text-red-500 mr-2"></i>
                    인기 게시글
                  </h3>

                  {/* 탭 메뉴 */}
                  <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setPopularTab('views')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        popularTab === 'views'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <i className="fas fa-eye mr-1"></i>
                      조회수
                    </button>
                    <button
                      onClick={() => setPopularTab('likes')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        popularTab === 'likes'
                          ? 'bg-white text-red-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <i className="fas fa-heart mr-1"></i>
                      좋아요
                    </button>
                  </div>
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
                            {popularTab === 'views' ? (
                              <span><i className="fas fa-eye mr-1"></i>{post.views}회</span>
                            ) : (
                              <span><i className="fas fa-heart mr-1"></i>{post.likes}</span>
                            )}
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
                    <Link to="/community-form" className="block p-3 bg-secondary text-white rounded-lg hover:bg-orange-600 transition-colors text-center">
                      <i className="fas fa-pen mr-2"></i>
                      새 글 작성하기
                    </Link>
                  </div>
                </div>
              </div>
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