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
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
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
    saveTokens(accessToken, refreshToken, rememberMe = false) {
        if (rememberMe) {
            // 로그인 유지 시 localStorage 사용 (영구 저장)
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            // sessionStorage에서 토큰 제거 (중복 방지)
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
        } else {
            // 로그인 유지 안함 시 sessionStorage 사용 (브라우저 종료 시 삭제)
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);
            // localStorage에서 토큰 제거 (중복 방지)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    // 토큰 삭제
    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    }

    // 토큰 갱신
    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }

        // rememberMe 확인 (localStorage에 있으면 true, sessionStorage에 있으면 false)
        const rememberMe = !!localStorage.getItem('refreshToken');

        try {
            const response = await this.post('/auth/api/v1/auth/refresh', {}, {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                },
            });

            if (response.result === 'SUCCESS') {
                this.saveTokens(response.data.accessToken, response.data.refreshToken, rememberMe);
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
    const [_key, category, page, tag, search] = queryKey;

    const queryParams = new URLSearchParams();
    if (category !== '전체') {
        const englishCategory = getEnglishCategory(category);
        if (englishCategory) {
            queryParams.append('category', englishCategory);
        }
    }

    // 태그 검색
    if (tag && tag.trim()) {
        queryParams.append('tag', tag.trim());
    }

    // 키워드 검색
    if (search && search.trim()) {
        queryParams.append('search', search.trim());
    }

    queryParams.append('page', (page - 1).toString());
    queryParams.append('size', '10');

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

    return {
        posts: transformedPosts,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements || 0
    };
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
    queryParams.append('size', '10');
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
 * 좋아요순 인기 게시물 목록을 조회하는 API 함수 (React Query용) - 좋아요 순 정렬
 * @param {object} queryKey - React Query에서 제공하는 쿼리 키
 * @returns {Promise<Object>} - 변환된 좋아요순 게시물 목록과 페이지 정보
 */
export const fetchPopularPostsByLikes = async ({ queryKey }) => {
    const [_key, category, page] = queryKey;

    const queryParams = new URLSearchParams();
    if (category !== '전체') {
        const englishCategory = getEnglishCategory(category);
        if (englishCategory) {
            queryParams.append('category', englishCategory);
        }
    }
    queryParams.append('page', (page - 1).toString());
    queryParams.append('size', '10');
    queryParams.append('sort', 'likes');

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
 * @param {object} context - React Query context (meta 정보 포함)
 * @returns {Promise<Object>} - 변환된 게시물 상세 정보
 */
export const fetchPost = async ({ queryKey, meta }) => {
    const [_key, postId] = queryKey;

    // 로그인한 경우 Authorization 헤더 추가
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // meta에서 incrementView 값 확인 (기본값: true)
    const incrementView = meta?.incrementView !== false;
    const url = `${COMMUNITY_API_URL}/posts/${postId}${incrementView ? '' : '?incrementView=false'}`;

    const response = await fetch(url, {
        headers,
    });
    const postData = await handleQueryApiResponse(response);

    const transformedPost = {
        post_id: postData.postId,
        title: postData.title,
        content: postData.content,
        author_name: postData.authorName,
        author_id: postData.author_id, // PostEdit에서 필요한 author_id 추가
        category: getKoreanCategory(postData.category),
        created_at: new Date(postData.createdAt).toLocaleString('ko-KR'),
        updated_at: new Date(postData.updatedAt).toLocaleString('ko-KR'),
        views: postData.views || 0,
        likes: postData.likes || 0,
        is_liked_by_current_user: postData.isLikedByCurrentUser || false,
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
    // 1. 게시글 생성 API 호출 (Authorization 헤더 포함)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const createPostResponse = await fetch(`${COMMUNITY_API_URL}/posts`, {
        method: 'POST',
        headers,
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
 * 게시물에 좋아요를 추가하는 API 함수 (로그인 필수)
 * @param {string} postId - 게시물 ID
 * @returns {Promise<object>} 성공 응답
 */
export const likePost = async (postId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}/likes`, {
        method: 'POST',
        headers,
    });
    return handleQueryApiResponse(response);
};

/**
 * 게시물의 좋아요를 취소하는 API 함수 (로그인 필수)
 * @param {string} postId - 게시물 ID
 * @returns {Promise<object>} 성공 응답
 */
export const unlikePost = async (postId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}/likes`, {
        method: 'DELETE',
        headers,
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

/**
 * 게시글을 수정하는 API 함수
 * @param {object} param - 게시글 ID와 수정할 데이터
 * @returns {Promise<object>} 수정된 게시글 정보
 */
export const updatePost = async ({ postId, postData }) => {
    const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    });
    return handleQueryApiResponse(response);
};

/**
 * 첨부파일을 삭제하는 API 함수
 * @param {string} attachmentId - 삭제할 첨부파일 ID
 * @returns {Promise<object>} 삭제 성공 응답
 */
export const deleteAttachment = async (attachmentId) => {
    const response = await fetch(`${COMMUNITY_API_URL}/posts/attachments/${attachmentId}`, {
        method: 'DELETE',
    });
    return handleQueryApiResponse(response);
};

/**
 * 게시글에 새 첨부파일을 업로드하는 API 함수
 * @param {string} postId - 게시글 ID
 * @param {File[]} files - 업로드할 파일 배열
 * @returns {Promise<object>} 업로드 성공 응답
 */
export const uploadAttachments = async (postId, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await fetch(`${COMMUNITY_API_URL}/posts/${postId}/attachments`, {
        method: 'POST',
        body: formData,
    });
    return handleQueryApiResponse(response);
};

/**
 * 모든 태그 목록을 조회하는 API 함수
 * @returns {Promise<Array>} - 모든 태그 목록 (사용 빈도순)
 */
export const fetchAllTags = async () => {
    const response = await fetch(`${COMMUNITY_API_URL}/posts/tags`);
    return await handleQueryApiResponse(response);
};

/**
 * 특정 사용자가 좋아요한 게시물 목록을 조회하는 API 함수
 * @param {Object} params - 쿼리 파라미터
 * @param {Array} params.queryKey - React Query의 queryKey 배열 [키, 사용자ID, 페이지]
 * @returns {Promise<Object>} - 좋아요한 게시물 목록과 페이징 정보
 */
export const fetchUserLikedPosts = async ({ queryKey }) => {
    const [, userId, page] = queryKey;
    const size = 10; // 페이지 당 게시물 수

    const headers = {};
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${COMMUNITY_API_URL}/posts/users/${userId}/liked?page=${page - 1}&size=${size}&sort=createdAt,desc`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        }
    );

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

    return {
        posts: transformedPosts,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements || 0
    };
};

/**
 * 특정 사용자가 작성한 게시물 목록을 조회하는 API 함수
 * @param {Object} params - 쿼리 파라미터
 * @param {Array} params.queryKey - React Query의 queryKey 배열 [키, 사용자ID, 페이지]
 * @returns {Promise<Object>} - 작성한 게시물 목록과 페이징 정보
 */
export const fetchUserPosts = async ({ queryKey }) => {
    const [, userId, page] = queryKey;
    const size = 10; // 페이지 당 게시물 수

    const headers = {};
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${COMMUNITY_API_URL}/posts/users/${userId}/posts?page=${page - 1}&size=${size}&sort=createdAt,desc`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        }
    );

    return await handleQueryApiResponse(response);
};

//----상품정보 조회를 위한 API 정의 ----
const PRODUCT_API_URL = 'http://localhost:8080/product/api';

/**
 * 메인 페이지의 상품의 목록 API
 * @returns 메인 페이지의 상품들의 정보
 */
export const fetchMainProducts = async()=>{
    const response = await fetch(
        `${PRODUCT_API_URL}/main`,
        {
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    const data = await response.json();
    return data;
}

/**
 * 상품목록 페이지의 상품들의 목록 API
 * @param {boolean} includeInactive - 비활성 상품 포함 여부 (관리자용)
 * @returns 전체 상품 정보
 */
export const fetchProducts = async(includeInactive = false)=>{
    const url = includeInactive
        ? `${PRODUCT_API_URL}/list?includeInactive=true`
        : `${PRODUCT_API_URL}/list`;

    const response = await fetch(
        url,
        {
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    const data = await response.json();
    return data;
}
/**
 * 전체 카테고리 목록 API
 * @returns 상위 카테고리, 하위카테고리 목록
 */
export const fethCategory = async()=>{
    const response = await fetch(
        `${PRODUCT_API_URL}/category`,
        {
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    const data  = await response.json();
    return data;
}
/**
 * 특정 상품 정보 조회 API
 * @param {int} productId
 * @returns 상품 정보 및 전체 가격 목록 및 리뷰 목록
 */
export const fetchProduct = async(productId)=>{
    const response = await fetch(
        `${PRODUCT_API_URL}/${productId}`,{
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    const data = await response.json();
    return data;
}

//---- 즐겨찾기 API ----
const AUTH_API_URL = 'http://localhost:8080/auth/api/v1';

/**
 * 사용자의 즐겨찾기 목록 조회 API
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 즐겨찾기 목록
 */
export const fetchFavorites = async (userId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${AUTH_API_URL}/favorites/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });

    if (!response.ok) {
        throw new Error('즐겨찾기 목록을 불러오는데 실패했습니다.');
    }

    return await response.json();
};

/**
 * 즐겨찾기 추가 API
 * @param {number} userId - 사용자 ID
 * @param {number} productId - 상품 ID
 * @returns {Promise<Object>} - 추가된 즐겨찾기 정보
 */
export const addFavorite = async (userId, productId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${AUTH_API_URL}/favorites/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ productId })
    });

    if (!response.ok) {
        throw new Error('즐겨찾기 추가에 실패했습니다.');
    }

    return await response.json();
};

/**
 * 즐겨찾기 삭제 API
 * @param {number} userId - 사용자 ID
 * @param {number} productId - 상품 ID
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, productId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${AUTH_API_URL}/favorites/${userId}/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });

    if (!response.ok) {
        throw new Error('즐겨찾기 삭제에 실패했습니다.');
    }
};

/**
 * 가격 알림 설정 토글 API
 * @param {number} userId - 사용자 ID
 * @param {number} productId - 상품 ID
 * @param {boolean} enabled - 가격 알림 활성화 여부
 * @returns {Promise<Object>} - 업데이트된 즐겨찾기 정보
 */
export const togglePriceAlert = async (userId, productId, enabled) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${AUTH_API_URL}/favorites/${userId}/products/${productId}/price-alert?enabled=${enabled}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });

    if (!response.ok) {
        throw new Error('가격 알림 설정 변경에 실패했습니다.');
    }

    return await response.json();
};

//---- 관리자용 상품 관리 API ----
/**
 * 상품 활성화/비활성화 상태 변경 API (관리자 전용)
 * @param {number} productId - 상품 ID
 * @param {boolean} isAvailable - 활성화 여부
 * @returns {Promise<Object>} - 성공/실패 메시지
 */
export const updateProductAvailability = async (productId, isAvailable) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${PRODUCT_API_URL}/products/${productId}/availability`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ isAvailable })
    });

    if (!response.ok) {
        throw new Error('상품 활성화 상태 변경에 실패했습니다.');
    }

    return await response.json();
};

/**
 * 상품 정보 수정 API (관리자 전용)
 * @param {number} productId - 상품 ID
 * @param {Object} productData - 수정할 상품 정보
 * @returns {Promise<Object>} - 성공/실패 메시지
 */
export const updateProduct = async (productId, productData) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${PRODUCT_API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        throw new Error('상품 정보 수정에 실패했습니다.');
    }

    return await response.json();
};

/**
 * 상품 삭제 API (관리자 전용)
 * @param {number} productId - 상품 ID
 * @returns {Promise<Object>} - 성공/실패 메시지
 */
export const deleteProduct = async (productId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${PRODUCT_API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });

    if (!response.ok) {
        throw new Error('상품 삭제에 실패했습니다.');
    }

    return await response.json();
};

/**
 * 가격 정보 수정 API (관리자 전용)
 * @param {number} priceId - 가격 ID
 * @param {number} price - 새로운 가격
 * @returns {Promise<Object>} - 성공/실패 메시지
 */
export const updatePrice = async (priceId, price) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const response = await fetch(`${PRODUCT_API_URL}/prices/${priceId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ price })
    });

    if (!response.ok) {
        throw new Error('가격 정보 수정에 실패했습니다.');
    }

    return await response.json();
};

/**
 * 개인 맞춤 추천 상품 조회 API (로그인 사용자용)
 * JWT 토큰을 통해 사용자 인증 (Gateway에서 검증 후 userId 전달)
 * @returns {Promise<object>} 추천 상품 목록 (userBased, categoryBased)
 */
export const fetchPersonalizedRecommendations = async() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    if (!token) {
        throw new Error('로그인이 필요한 서비스입니다.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
        `${PRODUCT_API_URL}/recommendations/personalized`,{
            method:'GET',
            headers
        });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('로그인이 필요한 서비스입니다.');
        }
        throw new Error('추천 상품을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
};

/**
 * 인기 상품 조회 API (비로그인 사용자용)
 * @returns {Promise<object>} 인기 상품 목록
 */
export const fetchPopularProducts = async() => {
    const response = await fetch(
        `${PRODUCT_API_URL}/recommendations`,{
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    if (!response.ok) {
        throw new Error('인기 상품을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
};

/**
 * 설문 기반 추천 상품 조회 API (신규 회원용)
 * @param {number} subcategoryId - 사용자가 선호하는 서브카테고리 ID
 * @returns {Promise<object>} 카테고리 기반 추천 상품 목록
 */
export const fetchSurveyBasedRecommendations = async(subcategoryId) => {
    const response = await fetch(
        `${PRODUCT_API_URL}/recommendations?subcategoryId=${subcategoryId}`,{
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    if (!response.ok) {
        throw new Error('추천 상품을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
};

/**
 * 추천 상품 조회 (하위 호환성 유지)
 * @deprecated fetchPersonalizedRecommendations, fetchPopularProducts, fetchSurveyBasedRecommendations 사용 권장
 */
export const fetchRecommendedProducts = fetchPersonalizedRecommendations;