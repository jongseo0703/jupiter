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