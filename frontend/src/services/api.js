// API 기본 설정
const API_BASE_URL = 'http://localhost:8080';

// API 클라이언트 생성
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // HTTP 요청 메서드
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // JWT 토큰이 있으면 Authorization 헤더 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // 401 에러 시 토큰 만료로 간주하고 로그아웃 처리
      if (response.status === 401) {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      const contentType = response.headers.get('Content-Type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET 요청
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST 요청
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 요청
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 요청
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // 토큰 저장
  saveTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // 토큰 삭제
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // 토큰 갱신
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    try {
      const response = await this.post('/auth/api/v1/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.result === 'SUCCESS') {
        this.saveTokens(response.data.accessToken, response.data.refreshToken);
        return response.data.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      this.clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }
}

export default new ApiService();

// --- React Query를 위한 API 함수들 ---

import { getKoreanCategory, getEnglishCategory } from '../utils/categoryUtils';

const COMMUNITY_API_URL = 'http://localhost:8080/community/api';

// API 응답을 처리하는 헬퍼 함수
const handleQueryApiResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'API request failed');
  }
  return result.data;
};

/**
 * 게시물 목록을 조회하는 API 함수 (React Query용)
 * @param {object} queryKey - React Query에서 제공하는 쿼리 키
 * @returns {Promise<Object>} - 변환된 게시물 목록과 페이지 정보
 */
export const fetchPosts = async ({ queryKey }) => {
  const [_key, category, page] = queryKey;

  const queryParams = new URLSearchParams();
  if (category !== '전체') {
    const englishCategory = getEnglishCategory(category);
    if (englishCategory) {
      queryParams.append('category', englishCategory);
    }
  }
  queryParams.append('page', (page - 1).toString());
  queryParams.append('size', '20');

  const response = await fetch(`${COMMUNITY_API_URL}/posts?${queryParams.toString()}`);
  const pageData = await handleQueryApiResponse(response);

  const transformedPosts = pageData.content.map(post => ({
    post_id: post.postId,
    title: post.title,
    content: post.content,
    author_name: post.authorName,
    category: getKoreanCategory(post.category),
    created_at: new Date(post.createdAt).toLocaleDateString('ko-KR'),
    views: post.views || 0,
    comments_count: post.commentsCount || 0,
    likes: post.likes || 0,
    tags: post.tags,
    is_anonymous: post.isAnonymous,
    has_attachments: post.hasAttachments || false // 백엔드에서 제공하는 hasAttachments 필드 사용
  }));

  return { posts: transformedPosts, totalPages: pageData.totalPages };
};

/**
 * 인기 게시물 목록을 조회하는 API 함수 (React Query용) - 조회수 순 정렬
 * @param {object} queryKey - React Query에서 제공하는 쿼리 키
 * @returns {Promise<Object>} - 변환된 인기 게시물 목록과 페이지 정보
 */
export const fetchPopularPosts = async ({ queryKey }) => {
  const [_key, category, page] = queryKey;

  const queryParams = new URLSearchParams();
  if (category !== '전체') {
    const englishCategory = getEnglishCategory(category);
    if (englishCategory) {
      queryParams.append('category', englishCategory);
    }
  }
  queryParams.append('page', (page - 1).toString());
  queryParams.append('size', '20');
  queryParams.append('sort', 'views');

  const response = await fetch(`${COMMUNITY_API_URL}/posts?${queryParams.toString()}`);
  const pageData = await handleQueryApiResponse(response);

  const transformedPosts = pageData.content.map(post => ({
    post_id: post.postId,
    title: post.title,
    content: post.content,
    author_name: post.authorName,
    category: getKoreanCategory(post.category),
    created_at: new Date(post.createdAt).toLocaleDateString('ko-KR'),
    views: post.views || 0,
    comments_count: post.commentsCount || 0,
    likes: post.likes || 0,
    tags: post.tags,
    is_anonymous: post.isAnonymous,
    has_attachments: post.hasAttachments || false
  }));

  return { posts: transformedPosts, totalPages: pageData.totalPages };
};

/**
 * 게시물 상세 정보를 조회하는 API 함수 (React Query용)
 * @param {object} queryKey - React Query에서 제공하는 쿼리 키
 * @returns {Promise<Object>} - 변환된 게시물 상세 정보
 */
export const fetchPost = async ({ queryKey }) => {
  const [_key, postId] = queryKey;

  const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}`);
  const postData = await handleQueryApiResponse(response);

  const transformedPost = {
    post_id: postData.postId,
    title: postData.title,
    content: postData.content,
    author_name: postData.authorName,
    category: getKoreanCategory(postData.category),
    created_at: new Date(postData.createdAt).toLocaleString('ko-KR'),
    updated_at: new Date(postData.updatedAt).toLocaleString('ko-KR'),
    views: postData.views || 0,
    likes: postData.likes || 0,
    tags: postData.tags,
    is_anonymous: postData.isAnonymous,
    attachments: postData.attachments || []
  };

  const transformedComments = postData.comments ? postData.comments.map(comment => ({
    comment_id: comment.commentId,
    post_id: comment.postId,
    content: comment.content,
    author_name: comment.authorName,
    created_at: new Date(comment.createdAt).toLocaleString('ko-KR'),
    is_anonymous: comment.isAnonymous
  })) : [];

  return { ...transformedPost, comments: transformedComments };
};

/**
 * 게시물을 생성하고, 파일이 있는 경우 이어서 업로드하는 함수
 * @param {{postData: object, files: File[]}} payload - 게시물 데이터와 파일 목록
 * @returns {Promise<object>} 생성된 게시물 정보
 */
export const createPostWithFiles = async ({ postData, files }) => {
  // 1. 게시글 생성 API 호출
  const createPostResponse = await fetch(`${COMMUNITY_API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  const createdPost = await handleQueryApiResponse(createPostResponse);

  // 2. 파일이 있다면 업로드
  if (files.length > 0) {
    const fileFormData = new FormData();
    files.forEach(file => {
      fileFormData.append('files', file);
    });

    const fileResponse = await fetch(`${COMMUNITY_API_URL}/posts/${createdPost.postId}/attachments`, {
      method: 'POST',
      body: fileFormData,
    });
    // 파일 업로드 실패 시 에러를 발생시켜 React Query의 onError에서 처리하도록 함
    if (!fileResponse.ok) {
      throw new Error('게시글은 작성되었지만 파일 업로드에 실패했습니다.');
    }
  }

  return createdPost;
};

/**
 * 게시물에 좋아요를 추가하는 API 함수
 * @param {string} postId - 게시물 ID
 * @returns {Promise<object>} 성공 응답
 */
export const likePost = async (postId) => {
  const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}/likes`, {
    method: 'POST',
  });
  return handleQueryApiResponse(response);
};

/**
 * 새로운 댓글을 생성하는 API 함수
 * @param {object} commentData - 생성할 댓글 데이터
 * @returns {Promise<object>} 생성된 댓글 정보
 */
export const createComment = async (commentData) => {
  const response = await fetch(`${COMMUNITY_API_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commentData),
  });
  return handleQueryApiResponse(response);
};

/**
 * 댓글을 수정하는 API 함수
 * @param {object} param - 댓글 ID와 수정할 데이터
 * @returns {Promise<object>} 수정된 댓글 정보
 */
export const updateComment = async ({ commentId, commentData }) => {
  const response = await fetch(`${COMMUNITY_API_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commentData),
  });
  return handleQueryApiResponse(response);
};

/**
 * 댓글을 삭제하는 API 함수
 * @param {object} param - 댓글 ID와 인증 데이터
 * @returns {Promise<object>} 삭제 성공 응답
 */
export const deleteComment = async ({ commentId, requestData }) => {
  const response = await fetch(`${COMMUNITY_API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  return handleQueryApiResponse(response);
};

/**
 * 익명 댓글 인증을 확인하는 API 함수
 * @param {object} param - 댓글 ID와 인증 데이터
 * @returns {Promise<object>} 인증 성공 응답
 */
export const verifyAnonymousComment = async ({ commentId, authData }) => {
  const response = await fetch(`${COMMUNITY_API_URL}/comments/${commentId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authData),
  });
  return handleQueryApiResponse(response);
};

/**
 * 게시글을 삭제하는 API 함수
 * @param {object} param - 게시글 ID와 인증 데이터
 * @returns {Promise<object>} 삭제 성공 응답
 */
export const deletePost = async ({ postId, requestData }) => {
  const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  return handleQueryApiResponse(response);
};

/**
 * 익명 게시글 인증을 확인하는 API 함수
 * @param {object} param - 게시글 ID와 인증 데이터
 * @returns {Promise<object>} 인증 성공 응답
 */
export const verifyAnonymousPost = async ({ postId, authData }) => {
  const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authData),
  });
  return handleQueryApiResponse(response);
};