import apiService from './api';

class AuthService {
  constructor() {
    this.listeners = [];
  }

  // 이벤트 리스너 추가
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 이벤트 리스너 제거
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 이벤트 발생 (프로필 업데이트 시)
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // 일반 로그인
  async login(email, password, rememberMe = false) {
    try {
      const response = await apiService.post('/auth/api/v1/auth/login', {
        email,
        password,
        rememberMe,
      });

      if (response.result === 'SUCCESS') {
        // JWT 토큰 저장
        apiService.saveTokens(response.data.accessToken, response.data.refreshToken);
        return response;
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 회원가입
  async register(userData) {
    try {
      const response = await apiService.post('/auth/api/v1/auth/register', {
        username: userData.username || userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      });

      if (response.result === 'SUCCESS') {
        return response;
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // 로그아웃
  async logout() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await apiService.post('/auth/api/v1/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 토큰 삭제 (서버 요청 실패해도 클라이언트에서는 삭제)
      apiService.clearTokens();
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/api/v1/auth/me');
      if (response.result === 'SUCCESS') {
        return response.data;
      } else {
        throw new Error(response.message || '사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // OAuth 로그인 URL 생성
  getOAuthLoginUrl(provider) {
    return `${apiService.baseURL}/auth/api/v1/auth/oauth/login/${provider}`;
  }

  // 로그인 상태 확인
  isLoggedIn() {
    return !!localStorage.getItem('accessToken');
  }

  // 토큰 갱신
  async refreshToken() {
    return await apiService.refreshToken();
  }

  // 프로필 업데이트
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/auth/api/v1/auth/profile', {
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
      });

      if (response.result === 'SUCCESS') {
        // 프로필 업데이트 성공 시 헤더에 알림
        this.notifyListeners();
        return response.data;
      } else {
        throw new Error(response.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // 비밀번호 변경
  async changePassword(passwordData) {
    try {
      const response = await apiService.put('/auth/api/v1/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.result === 'SUCCESS') {
        return response.data;
      } else {
        throw new Error(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export default new AuthService();